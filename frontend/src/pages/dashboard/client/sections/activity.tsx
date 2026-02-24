import { useEffect, useState } from "react";
import styles from "./activity.module.css";
import { interactionService } from "../../../../services/interactionService";
import { useAuth } from "../../../../context/AuthContext";
import { Clock, CheckCircle, Eye, Send, Inbox, Star, UserCheck, Bookmark, Zap, Trash2, X, ThumbsDown, Ban, ChevronRight, Octagon } from "lucide-react";
import DetailedProfileEnhanced from "../../shared/DetailedProfileEnhanced";
import { useRelationshipStore } from "../../../../store/useRelationshipStore";

const Activity = ({ onSelectForChat, showToast }: { onSelectForChat?: (partner: any) => void, showToast?: (msg: string) => void }) => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const shouldMask = !isPremium;

    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State for modal navigation
    const [modalState, setModalState] = useState<{
        category: string;
        activeTab: 'sent' | 'received';
        currentIndex: number;
    } | null>(null);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const allData = await interactionService.getAllActivities(String(user.id));
                    setActivities(allData);
                } catch (err) {
                    console.error("Error fetching activity data:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);


    const relationships = useRelationshipStore((state: any) => state.relationships);

    // Priority: Accepted > Received > Sent > Shortlisted > Declined > Blocked > Ignored
    const deduplicateActivities = (allActivities: any[]) => {
        const profileMap = new Map<string, { activity: any; priority: number; category: string }>();

        const getPriorityFromStatus = (status: string, isSender: boolean): { priority: number; category: string } => {
            const s = status.toLowerCase();
            if (s === 'accepted' || s === 'super_accepted') return { priority: 1, category: 'accepted' };
            if (s === 'interest_received' || s === 'super_interest_received') return { priority: 2, category: 'received' };
            if (s === 'interest_sent' || s === 'super_interest_sent' || s === 'interest' || s === 'superinterest') return { priority: 3, category: 'sent' };
            if (s === 'shortlist' || s === 'shortlisted' || s === 'shortlisted_sent') return { priority: 4, category: 'shortlisted' };
            if (s === 'shortlisted_received') return { priority: 999, category: 'removed' }; // Hide from receiver
            if (s === 'declined') return { priority: 5, category: 'declined' };
            if (s === 'blocked') return { priority: 6, category: 'blocked' };
            if (s === 'ignored') return { priority: 7, category: 'ignored' };
            if (s === 'meet_request') return isSender ? { priority: 3, category: 'sent' } : { priority: 2, category: 'received' };
            if (['removed', 'cancelled', 'shortlist_removed', 'unblocked'].includes(s)) return { priority: 999, category: 'removed' };
            return { priority: 999, category: 'other' };
        };

        // 1. First, populate from relationship store (High Priority - local state)
        Object.keys(relationships).forEach(pid => {
            const relData = relationships[pid];
            const status = typeof relData === 'string' ? relData : relData.state;
            const isSender = typeof relData === 'string' ? true : relData.role === 'sender';

            const { priority, category } = getPriorityFromStatus(status, isSender);
            if (priority < 999) {
                // Find existing activity or create a minimal placeholder
                const existingActivity = allActivities.find(a =>
                    a.partnerUserId === pid || (a.isSender ? a.receiver : a.sender) === pid
                );

                profileMap.set(pid, {
                    activity: existingActivity || {
                        partnerId: pid,
                        partnerUserId: pid,
                        partnerUniqueId: `TP-EAD-${pid.slice(-6).toUpperCase()}`,
                        type: status.toLowerCase(),
                        status: status.toLowerCase(),
                        isSender: isSender,
                        partnerName: 'User Profile',
                        partnerImg: '',
                    },
                    priority,
                    category
                });
            }
        });

        // 2. Then, fill in/override from backend activities if higher priority
        allActivities.forEach(activity => {
            const partnerId = activity.partnerUserId || (activity.isSender ? activity.receiver : activity.sender);

            if (!partnerId) return;

            const existing = profileMap.get(partnerId);
            const { priority, category } = getPriorityFromStatus(activity.status || activity.type, activity.isSender);

            if (!existing || priority < existing.priority) {
                profileMap.set(partnerId, { activity, priority, category });
            } else if (existing && !existing.activity.partnerImg && activity.partnerImg) {
                // Supplement with metadata
                profileMap.set(partnerId, {
                    activity: { ...activity, status: existing.activity.status, type: existing.activity.type },
                    priority: existing.priority,
                    category: existing.category
                });
            }
        });

        return profileMap;
    };

    // Apply deduplication
    const deduplicatedMap = deduplicateActivities(activities);

    // Categorize Activities (deduplicated)
    const acceptedInterests = Array.from(deduplicatedMap.values())
        .filter(item => item.category === 'accepted')
        .map(item => item.activity);

    const receivedInterests = Array.from(deduplicatedMap.values())
        .filter(item => item.category === 'received')
        .map(item => item.activity);

    const sentInterests = Array.from(deduplicatedMap.values())
        .filter(item => item.category === 'sent')
        .map(item => item.activity);

    // Non-exclusive Shortlist: Show anyone who is shortlisted, even if they have other activities
    const shortlistedRaw = Array.from(new Set([
        ...Array.from(deduplicatedMap.values()).filter(i => i.category === 'shortlisted').map(i => i.activity),
        ...activities.filter(a => a.type === 'shortlist' || a.status === 'shortlisted')
    ]));

    // De-dupe shortlisted by partnerUserId
    const shortlistedMap = new Map();
    shortlistedRaw.forEach(act => {
        const pid = act.partnerUserId || (act.isSender ? act.receiver : act.sender);
        // Check if locally updated to NONE (unshortlisted)
        const localRel = relationships[pid];
        const localState = (typeof localRel === 'string' ? localRel : localRel?.state);
        // If explicitly NONE, skip adding to map
        if (localState === 'NONE') return;

        if (pid) shortlistedMap.set(pid, act);
    });
    // Add people who are shortlisted in the local relationship store but might not have a backend activity yet
    Object.keys(relationships).forEach(pid => {
        const rel = relationships[pid];
        const state = (typeof rel === 'string' ? rel : rel.state || '').toUpperCase();
        if ((state === 'SHORTLISTED' || state === 'SHORTLISTED_SENT') && !shortlistedMap.has(pid)) {
            const existingActivity = activities.find(a => (a.partnerUserId || (a.isSender ? a.receiver : a.sender)) === pid);
            shortlistedMap.set(pid, existingActivity || {
                partnerUserId: pid,
                partnerUniqueId: `TP-EAD-${pid.slice(-6).toUpperCase()}`,
                type: 'shortlist',
                status: 'shortlisted',
                isSender: true,
                partnerName: 'User Profile'
            });
        }
    });

    const shortlisted = Array.from(shortlistedMap.values());

    const declined = Array.from(deduplicatedMap.values())
        .filter(item => item.category === 'declined')
        .map(item => item.activity);

    const blocked = Array.from(deduplicatedMap.values())
        .filter(item => item.category === 'blocked')
        .map(item => item.activity);

    const ignored = Array.from(deduplicatedMap.values())
        .filter(item => item.category === 'ignored')
        .map(item => item.activity);

    // For "This might interest you" - using Visits (not deduplicated)
    const visits = activities.filter(a => a.type === 'visit');

    // Expandable State for Visits
    const [expandedVisits, setExpandedVisits] = useState(false);

    // Helper to get counts for tabs
    const getTabCounts = (category: string) => {
        if (category === 'Interests') return { sent: sentInterests.length, received: receivedInterests.length };
        if (category === 'Declined') return { sent: declined.filter(a => a.isSender).length, received: declined.filter(a => !a.isSender).length };
        if (category === 'Shortlisted') return { sent: shortlisted.length, received: 0 };
        if (category === 'Blocked') return { sent: blocked.length, received: 0 };
        if (category === 'Ignored') return { sent: ignored.length, received: 0 };
        return { sent: 0, received: 0 };
    };

    // Derived Lists for Modal
    const getModalItems = () => {
        if (!modalState) return [];
        const { category, activeTab } = modalState;

        switch (category) {
            case 'Interests':
                return activeTab === 'sent' ? sentInterests : receivedInterests;
            case 'Declined':
                const declinedSent = declined.filter(a => a.isSender);
                const declinedReceived = declined.filter(a => !a.isSender);
                return activeTab === 'sent' ? declinedSent : declinedReceived;
            case 'Shortlisted':
                return shortlisted;
            case 'Blocked':
                return blocked;
            case 'Ignored':
                return ignored;
            case 'Accepted':
                return acceptedInterests;
            case 'Visits':
                return visits;
            default:
                return [];
        }
    };

    const openCategory = (category: string, initialTab: 'sent' | 'received' = 'sent', index: number = 0) => {
        setModalState({ category, activeTab: initialTab, currentIndex: index });
    };

    const statItems = [
        { label: "Accepted Interests", value: acceptedInterests.length, items: acceptedInterests, icon: <CheckCircle size={20} />, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
        { label: "Interests Received", value: receivedInterests.length, items: receivedInterests, icon: <Inbox size={20} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
        { label: "Interests Sent", value: sentInterests.length, items: sentInterests, icon: <Send size={20} />, color: "#facc15", bg: "rgba(250, 204, 21, 0.1)" },
        { label: "Shortlisted Profiles", value: shortlisted.length, items: shortlisted, icon: <Bookmark size={20} />, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
        { label: "Declined Profiles", value: declined.length, items: declined, icon: <ThumbsDown size={20} />, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
        { label: "Blocked Profiles", value: blocked.length, items: blocked, icon: <Ban size={20} />, color: "#64748b", bg: "rgba(100, 116, 139, 0.1)" },
        { label: "Ignored Profiles", value: ignored.length, items: ignored, icon: <Octagon size={20} />, color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)" }
    ];

    const handleDeleteActivity = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!window.confirm("Are you sure you want to remove this from your activity?")) return;
        try {
            await interactionService.deleteActivity(id);
            setActivities(prev => prev.filter(a => (a._id || a.id) !== id));
            if (modalState && getModalItems()[modalState.currentIndex]?._id === id) {
                setModalState(null);
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Failed to delete activity");
        }
    };

    const renderProfileCard = (act: any, idx: number, category: string, tab: 'sent' | 'received') => {
        const partnerName = act.partnerName || 'Unknown User';
        const partnerImg = act.partnerImg || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';
        const partnerId = act.partnerUniqueId || 'N/A';
        const age = act.partnerAge || '28';
        const activityId = act._id || act.id;

        const maskString = (str: string) => {
            if (!str || !shouldMask) return str;
            if (str.includes('*****')) return str;
            return str.substring(0, 2) + "*****";
        };

        const maskedName = maskString(partnerName);
        const maskedId = maskString(partnerId);

        return (
            <div
                key={activityId || idx}
                className={styles.profileCard}
                onClick={() => openCategory(category, tab, idx)}
            >
                <div className={styles.cardHeader}>
                    <img src={partnerImg} alt={partnerName} className={`${styles.cardAvatar} ${(act.isBlur || shouldMask) ? styles.blurred : ''}`} />
                    <button
                        className={styles.cardMenuBtn}
                        onClick={(e) => handleDeleteActivity(activityId, e)}
                        title="Delete Activity"
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </button>
                </div>
                <div className={styles.cardInfo}>
                    <h4 className={styles.cardName}>{maskedName}, {age}</h4>
                    <span className={styles.cardId}>ID - {maskedId}</span>
                    <span className={styles.cardLocation}>{act.partnerLocation || 'Agartala, India'}</span>
                </div>
            </div>
        );
    };

    const renderSection = (title: string, category: string, tab: 'sent' | 'received', items: any[]) => {
        const categoryClass = category.toLowerCase().replace(' ', '');
        return (
            <div className={`${styles.sectionContainer} ${styles[categoryClass]}`}>
                <div className={styles.sectionHeader}>
                    <h3>{title}{<span className={styles.countBadge}> ({items.length})</span>}</h3>
                    <ChevronRight size={20} className={styles.arrowIcon} />
                </div>
                {items.length > 0 ? (
                    <div className={styles.sectionGrid}>
                        {items.map((item, idx) => renderProfileCard(item, idx, category, tab))}
                    </div>
                ) : (
                    <div className={styles.emptyGridState}>
                        No profiles found in this category
                    </div>
                )}
            </div>
        );
    };

    const cleanupBroken = async () => {
        const broken = activities.filter(a => !a.partnerUniqueId && a.type !== 'visit');
        if (broken.length === 0) {
            alert("No broken records found.");
            return;
        }
        if (!window.confirm(`Found ${broken.length} broken profile records. These are profiles that are no longer active. Delete them all?`)) return;

        try {
            for (const act of broken) {
                await interactionService.deleteActivity(act._id || act.id).catch(() => { });
            }
            setActivities(prev => prev.filter(a => a.partnerUniqueId || a.type === 'visit'));
            alert("Cleanup complete.");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={styles.dashboard} style={{ paddingBottom: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#fff' }}>Activity Overview</h2>
                <button
                    onClick={cleanupBroken}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Trash2 size={14} />
                    Cleanup Broken
                </button>
            </div>

            {/* 7 Grid Stats - Click Handling Updated */}
            <div className={styles.statsGrid}>
                {statItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`${styles.gridCard} ${item.value > 0 ? styles.gridCardActive : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (item.value === 0) return;
                            // Map labels to categories
                            if (item.label === 'Accepted Interests') openCategory('Accepted', 'sent');
                            else if (item.label === 'Interests Received') openCategory('Interests', 'received');
                            else if (item.label === 'Interests Sent') openCategory('Interests', 'sent');
                            else if (item.label === 'Shortlisted Profiles') openCategory('Shortlisted', 'sent');
                            else if (item.label === 'Declined Profiles') openCategory('Declined', 'sent');
                            else if (item.label === 'Blocked Profiles') openCategory('Blocked', 'sent');
                            else if (item.label === 'Ignored Profiles') openCategory('Ignored', 'sent');
                        }}
                    >
                        <div className={styles.gridIcon} style={{ background: item.bg, color: item.color }}>
                            {item.icon}
                        </div>
                        <div className={styles.gridContent}>
                            <span className={styles.gridValue}>{String(item.value).padStart(2, '0')}</span>
                            <span className={styles.gridLabel}>{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className={styles.loadingState}>Loading activity data...</div>
            ) : (
                <div className={styles.sectionsWrapper}>
                    {/* "This might interest you" - Expandable Logic */}
                    {visits.length > 0 && (
                        <div className={styles.sectionContainer}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>This might interest you</h3>
                                    <p className={styles.subHeader}>We've curated some insights that you might like</p>
                                </div>
                                {expandedVisits && (
                                    <button
                                        onClick={() => setExpandedVisits(false)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#94a3b8',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <X size={16} /> Close
                                    </button>
                                )}
                            </div>

                            {!expandedVisits ? (
                                <div className={styles.carouselContainer}>
                                    <div
                                        className={styles.visitSummaryCard}
                                        onClick={() => setExpandedVisits(true)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.visitAvatars}>
                                            {visits.slice(0, 3).map((v, i) => (
                                                <img key={i} src={v.partnerImg || 'https://via.placeholder.com/40'} className={`${styles.miniAvatar} ${(v.isBlur || shouldMask) ? styles.blurred : ''}`} />
                                            ))}
                                        </div>
                                        <div className={styles.visitText}>
                                            <h4>{visits.length} Profiles Visited</h4>
                                            <span>by You</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.sectionGrid} style={{ animation: 'fadeIn 0.3s' }}>
                                    {visits.map((item, idx) => renderProfileCard(item, idx, 'Visits', 'sent'))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 7 Main Sections - Ordered by Priority */}
                    {renderSection("Accepted Interests", 'Accepted', 'sent', acceptedInterests)}
                    {renderSection("Interests Received", 'Interests', 'received', receivedInterests)}
                    {renderSection("Interests Sent", 'Interests', 'sent', sentInterests)}
                    {renderSection("Shortlisted Profiles", 'Shortlisted', 'sent', shortlisted)}
                    {renderSection("Declined Profiles", 'Declined', 'sent', declined)}
                    {renderSection("Blocked Profiles", 'Blocked', 'sent', blocked)}
                    {renderSection("Ignored Profiles", 'Ignored', 'sent', ignored)}
                </div>
            )}

            {modalState && (
                <DetailedProfileEnhanced
                    key={(() => {
                        const items = getModalItems();
                        const act = items[modalState.currentIndex];
                        return (act?._id || act?.id || 'empty') + '-' + modalState.currentIndex;
                    })()}
                    profileId={(() => {
                        const items = getModalItems();
                        if (!items || modalState.currentIndex === undefined) return null;
                        const act = items[modalState.currentIndex];
                        if (!act) return null;

                        // 1. Prioritize partnerUserId (the MongoDB hex ID) - Most reliable for fetching
                        if (act.partnerUserId) {
                            console.log('[Activity] Using partnerUserId:', act.partnerUserId);
                            return String(act.partnerUserId);
                        }

                        // 2. Fallback to partnerUniqueId (e.g., TP-EAD-XXXXXX)
                        if (act.partnerUniqueId && act.partnerUniqueId !== 'N/A' && act.partnerUniqueId !== 'null') {
                            // Check if it's the hex fallback from frontend dummy activity
                            if (act.partnerUniqueId.startsWith('TP-EAD-') || act.partnerUniqueId.length < 20) {
                                console.log('[Activity] Using partnerUniqueId:', act.partnerUniqueId);
                                return String(act.partnerUniqueId);
                            }
                        }

                        // 3. Fallback to specific IDs if available
                        if (act.advocateId) return String(act.advocateId);
                        if (act.clientId) return String(act.clientId);

                        // 4. Final fallback: use the partner's User ID from sender/receiver fields
                        const pid = act.isSender ? act.receiver : act.sender;
                        if (!pid || typeof pid === 'object') return null;
                        console.log('[Activity] Using absolute fallback ID (sender/receiver):', pid);
                        return String(pid);
                    })()}
                    isModal={true}
                    onClose={() => setModalState(null)}
                    backToProfiles={() => setModalState(null)}
                    items={getModalItems()}
                    currentIndex={modalState.currentIndex}
                    onNavigate={(newIndex: number) => setModalState({ ...modalState, currentIndex: newIndex })}
                    listTitle={modalState.category}
                    showToast={showToast}
                    tabs={['Interests', 'Declined', 'Shortlisted', 'Blocked', 'Ignored'].includes(modalState.category) ? [
                        {
                            label: modalState.category === 'Interests' ? 'Interested In Me' :
                                modalState.category === 'Declined' ? 'Declined Me' :
                                    modalState.category === 'Shortlisted' ? 'Shortlisted Me' :
                                        modalState.category === 'Blocked' ? 'Blocked Me' :
                                            modalState.category === 'Ignored' ? 'Ignored Me' : 'Received',
                            active: modalState.activeTab === 'received',
                            count: getTabCounts(modalState.category).received,
                            onClick: () => setModalState({ ...modalState, activeTab: 'received', currentIndex: 0 })
                        },
                        {
                            label: modalState.category === 'Interests' ? 'My Interests' :
                                modalState.category === 'Declined' ? 'I Declined' :
                                    modalState.category === 'Shortlisted' ? 'I Shortlisted' :
                                        modalState.category === 'Blocked' ? 'I Blocked' :
                                            modalState.category === 'Ignored' ? 'I Ignored' : 'Sent',
                            active: modalState.activeTab === 'sent',
                            count: getTabCounts(modalState.category).sent,
                            onClick: () => setModalState({ ...modalState, activeTab: 'sent', currentIndex: 0 })
                        }
                    ] : undefined}
                    onSelectForChat={onSelectForChat}
                    partnerRole={(() => {
                        const items = getModalItems();
                        const act = items[modalState.currentIndex];
                        return act?.partnerRole;
                    })()}
                />
            )}
        </div>
    );
};

export default Activity;
