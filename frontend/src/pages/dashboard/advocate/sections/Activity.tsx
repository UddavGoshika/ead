import { useEffect, useState } from "react";
import styles from "./Activity.module.css";
import { interactionService } from "../../../../services/interactionService";
import { useAuth } from "../../../../context/AuthContext";
import { Clock, CheckCircle, Eye, Send, Inbox, Star, UserCheck, ThumbsDown, Ban, ChevronRight, Bookmark, Octagon } from "lucide-react";
import DetailedProfile from "../../shared/DetailedProfile";

const Activity = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfileIndex, setSelectedProfileIndex] = useState<{ items: any[], index: number, title?: string } | null>(null);

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

    const statItems = [
        { label: "Accepted Interests", value: acceptedInterests.length, items: acceptedInterests, icon: <CheckCircle size={20} />, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
        { label: "Interests Received", value: receivedInterests.length, items: receivedInterests, icon: <Inbox size={20} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
        { label: "Interests Sent", value: sentInterests.length, items: sentInterests, icon: <Send size={20} />, color: "#facc15", bg: "rgba(250, 204, 21, 0.1)" },
        { label: "Shortlisted Profiles", value: shortlisted.length, items: shortlisted, icon: <Bookmark size={20} />, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
        { label: "Declined Profiles", value: declined.length, items: declined, icon: <ThumbsDown size={20} />, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
        { label: "Blocked Profiles", value: blocked.length, items: blocked, icon: <Ban size={20} />, color: "#64748b", bg: "rgba(100, 116, 139, 0.1)" },
        { label: "Ignored Profiles", value: ignored.length, items: ignored, icon: <Octagon size={20} />, color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)" }
    ];

    const openProfile = (items: any[], index: number, title?: string) => {
        setSelectedProfileIndex({ items, index, title });
    };

    const renderProfileCard = (act: any, items: any[], index: number, title?: string) => {
        const partnerName = act.partnerName || 'Unknown User';
        const partnerImg = act.partnerImg || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';
        const partnerId = act.partnerUniqueId || 'N/A';
        const age = act.partnerAge || '28';

        return (
            <div
                key={act._id}
                className={styles.profileCard}
                onClick={() => openProfile(items, index, title)}
            >
                <div className={styles.cardHeader}>
                    <img src={partnerImg} alt={partnerName} className={styles.cardAvatar} />
                    <button className={styles.cardMenuBtn}>
                        <div className={styles.dots} />
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

    const renderSection = (title: string, items: any[], showCount = false) => {
        if (items.length === 0) return null;
        return (
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h3>{title}{showCount && <span className={styles.countBadge}> ({items.length})</span>}</h3>
                    <ChevronRight size={20} className={styles.arrowIcon} />
                </div>
                <div className={styles.carouselContainer}>
                    {items.map((item, idx) => renderProfileCard(item, items, idx, title))}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.dashboard}>
            {/* 7 Grid Stats */}
            <div className={styles.statsGrid}>
                {statItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`${styles.gridCard} ${item.value > 0 ? styles.gridCardActive : ''}`}
                        onClick={() => item.value > 0 && openProfile(item.items, 0, item.label)}
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
                    {/* "This might interest you" */}
                    {visits.length > 0 && (
                        <div className={styles.sectionContainer}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>This might interest you</h3>
                                    <p className={styles.subHeader}>We've curated some insights that you might like</p>
                                </div>
                            </div>
                            <div className={styles.carouselContainer}>
                                <div className={styles.visitSummaryCard}>
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
                                {visits.map((item, idx) => renderProfileCard(item, visits, idx, "Recent Visits"))}
                            </div>
                        </div>
                    )}

                    {renderSection("Interests Sent", sentInterests, true)}
                    {renderSection("Interests Received", receivedInterests, true)}
                    {renderSection("Shortlisted Profiles", shortlisted, true)}
                    {renderSection("Declined Profiles", declined, true)}
                    {renderSection("Blocked Profiles", blocked, true)}
                    {renderSection("Ignored Profiles", ignored, true)}
                </div>
            )}

            {selectedProfileIndex && (
                <DetailedProfile
                    profileId={(() => {
                        const act = selectedProfileIndex.items[selectedProfileIndex.index];
                        const pid = act.isSender ? act.receiver : act.sender;
                        return String(pid || act.partnerId || (act.partnerDetails?._id));
                    })()}
                    isModal={true}
                    onClose={() => setSelectedProfileIndex(null)}
                    backToProfiles={() => setSelectedProfileIndex(null)}
                    // Pass navigation props
                    items={selectedProfileIndex.items}
                    currentIndex={selectedProfileIndex.index}
                    onNavigate={(newIndex) => setSelectedProfileIndex({ ...selectedProfileIndex, index: newIndex })}
                    // Pass title for header
                    listTitle={selectedProfileIndex.title}
                />
            )}
        </div>
    );
};

export default Activity;
