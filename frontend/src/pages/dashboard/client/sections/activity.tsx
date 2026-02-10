import { useEffect, useState } from "react";
import styles from "./activity.module.css";
import { interactionService } from "../../../../services/interactionService";
import { useAuth } from "../../../../context/AuthContext";
import { Clock, CheckCircle, Eye, Send, Inbox, Star, UserCheck, Bookmark, Zap, Trash2, X, ThumbsDown, Ban, ChevronRight, Octagon } from "lucide-react";
import DetailedProfile from "../../shared/DetailedProfile";

const Activity = ({ onSelectForChat }: { onSelectForChat?: (partner: any) => void }) => {
    const { user } = useAuth();
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

    // Categorize Activities
    const sentInterests = activities.filter(a => ['interest', 'superInterest'].includes(a.type) && a.isSender);
    const receivedInterests = activities.filter(a => ['interest', 'superInterest'].includes(a.type) && !a.isSender);
    const shortlisted = activities.filter(a => a.type === 'shortlist' && a.isSender);
    const declined = activities.filter(a => a.status === 'declined');
    const blocked = activities.filter(a => a.status === 'blocked');
    const ignored = activities.filter(a => a.status === 'ignored');
    const acceptedInterests = activities.filter(a => a.status === 'accepted');

    // For "This might interest you" - using Visits
    const visits = activities.filter(a => a.type === 'visit');

    // Expandable State for Visits
    const [expandedVisits, setExpandedVisits] = useState(false);

    // Helper to get counts for tabs
    const getTabCounts = (category: string) => {
        if (category === 'Interests') return { sent: sentInterests.length, received: receivedInterests.length };
        if (category === 'Declined') return { sent: declined.filter(a => a.isSender).length, received: declined.filter(a => !a.isSender).length };
        if (category === 'Shortlisted') return { sent: shortlisted.length, received: 0 }; // Usually no received shortlisted
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

        return (
            <div
                key={activityId || idx}
                className={styles.profileCard}
                onClick={() => openCategory(category, tab, idx)}
            >
                <div className={styles.cardHeader}>
                    <img src={partnerImg} alt={partnerName} className={styles.cardAvatar} />
                    <button
                        className={styles.cardMenuBtn}
                        onClick={(e) => handleDeleteActivity(activityId, e)}
                        title="Delete Activity"
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </button>
                </div>
                <div className={styles.cardInfo}>
                    <h4 className={styles.cardName}>{partnerName}, {age}</h4>
                    <span className={styles.cardId}>ID - {partnerId}</span>
                    <span className={styles.cardLocation}>{act.partnerLocation || 'Agartala, India'}</span>
                </div>
            </div>
        );
    };

    const renderSection = (title: string, category: string, tab: 'sent' | 'received', items: any[]) => {
        if (items.length === 0) return null;
        const categoryClass = category.toLowerCase().replace(' ', '');
        return (
            <div className={`${styles.sectionContainer} ${styles[categoryClass]}`}>
                <div className={styles.sectionHeader}>
                    <h3>{title}{<span className={styles.countBadge}> ({items.length})</span>}</h3>
                    <ChevronRight size={20} className={styles.arrowIcon} />
                </div>
                <div className={styles.carouselContainer}>
                    {items.map((item, idx) => renderProfileCard(item, idx, category, tab))}
                </div>
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
        <div className={styles.dashboard}>
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
                                                <img key={i} src={v.partnerImg || 'https://via.placeholder.com/40'} className={styles.miniAvatar} />
                                            ))}
                                        </div>
                                        <div className={styles.visitText}>
                                            <h4>{visits.length} Profiles Visited</h4>
                                            <span>by You</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.carouselContainer} style={{ animation: 'fadeIn 0.3s' }}>
                                    {visits.map((item, idx) => renderProfileCard(item, idx, 'Visits', 'sent'))}
                                </div>
                            )}
                        </div>
                    )}

                    {renderSection("Interests Sent", 'Interests', 'sent', sentInterests)}
                    {renderSection("Interests Received", 'Interests', 'received', receivedInterests)}
                    {renderSection("Shortlisted Profiles", 'Shortlisted', 'sent', shortlisted)}
                    {renderSection("Declined Profiles", 'Declined', 'sent', declined)}
                    {renderSection("Blocked Profiles", 'Blocked', 'sent', blocked)}
                    {renderSection("Ignored Profiles", 'Ignored', 'sent', ignored)}
                </div>
            )}

            {modalState && (
                <DetailedProfile
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

                        // Prioritize partnerUniqueId as it's best for fetching
                        if (act.partnerUniqueId && act.partnerUniqueId !== 'N/A' && act.partnerUniqueId !== 'null') {
                            return String(act.partnerUniqueId);
                        }

                        // Fallback to specific IDs if available (unlocked by services)
                        if (act.advocateId) return String(act.advocateId);
                        if (act.clientId) return String(act.clientId);

                        // Final fallback: use the partner's User ID
                        const pid = act.isSender ? act.receiver : act.sender;
                        if (!pid || typeof pid === 'object') return null;
                        return String(pid);
                    })()}
                    isModal={true}
                    onClose={() => setModalState(null)}
                    backToProfiles={() => setModalState(null)}
                    items={getModalItems()}
                    currentIndex={modalState.currentIndex}
                    onNavigate={(newIndex) => setModalState({ ...modalState, currentIndex: newIndex })}
                    listTitle={modalState.category}
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
                />
            )}
        </div>
    );
};

export default Activity;
