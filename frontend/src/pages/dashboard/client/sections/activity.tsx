import { useEffect, useState } from "react";
import styles from "./activity.module.css";
import { interactionService } from "../../../../services/interactionService";
import { useAuth } from "../../../../context/AuthContext";
import { Clock, CheckCircle, Eye, Send, Inbox, Star, UserCheck, Bookmark, Zap, Trash2, X } from "lucide-react";

const Activity = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        visits: 0,
        sent: 0,
        received: 0,
        accepted: 0,
        shortlists: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<any>(null);

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [statsData, activitiesData] = await Promise.all([
                interactionService.getActivityStats(String(user.id)),
                interactionService.getAllActivities(String(user.id))
            ]);
            // Calculate shortlists count if not provided by backend
            const shortlistCount = activitiesData.filter((a: any) => a.type === 'shortlist' && a.isSender).length;
            setStats({ ...statsData, shortlists: shortlistCount });
            setActivities(activitiesData);
        } catch (err) {
            console.error("Error fetching activity data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleDelete = async (activityId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Delete this activity log?")) return;
        try {
            await interactionService.deleteActivity(activityId);
            setActivities(prev => prev.filter(a => a._id !== activityId));
            // Refresh stats too
            const statsData = await interactionService.getActivityStats(String(user?.id));
            setStats(prev => ({ ...prev, ...statsData }));
        } catch (err) {
            console.error("Failed to delete activity:", err);
            alert("Failed to delete activity.");
        }
    };

    const handleProfileClick = (act: any) => {
        setSelectedPartner({
            name: act.partnerName,
            unique_id: act.partnerUniqueId,
            img: act.partnerImg,
            location: act.partnerLocation,
            type: act.type
        });
    };

    const statItems = [
        { label: "Profile Visits", value: stats.visits, icon: <Eye size={22} />, color: "#3b82f6", type: 'visit' },
        { label: "Interests", value: stats.sent, icon: <Send size={22} />, color: "#facc15", type: 'sent' },
        { label: "Shortlisted", value: stats.shortlists, icon: <Bookmark size={22} />, color: "#10b981", type: 'shortlist' },
        { label: "Accepted", value: stats.accepted, icon: <Star size={22} />, color: "#f43f5e", type: 'accepted' }
    ];

    const filteredActivities = activities.filter(act => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'visit') return act.type === 'visit' && act.isSender;
        if (activeFilter === 'sent') return ['interest', 'superInterest'].includes(act.type) && act.isSender;
        if (activeFilter === 'shortlist') return act.type === 'shortlist' && act.isSender;
        if (activeFilter === 'received') return ['interest', 'superInterest'].includes(act.type) && !act.isSender;
        if (activeFilter === 'accepted') return act.status === 'accepted';
        return true;
    });

    return (
        <div className={styles.dashboard}>
            {/* Stats */}
            <div className={styles.statsRow}>
                {statItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`${styles.statCard} ${activeFilter === item.type ? styles.activeCard : ''}`}
                        onClick={() => setActiveFilter(activeFilter === item.type ? 'all' : item.type)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.statIcon} style={{ background: `${item.color}20`, color: item.color }}>
                            {item.icon}
                        </div>
                        <div className={styles.statValue}>{item.value}</div>
                        <p className={styles.statLabel}>{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Interactions List */}
            <div className={styles.interests}>
                <div className={styles.interestsHeader}>
                    <h2>{activeFilter === 'all' ? 'Recent Interactions' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Logs`}</h2>
                    <span className={styles.viewAll} onClick={() => setActiveFilter('all')}>Show All</span>
                </div>

                <div className={styles.activityList}>
                    {loading ? (
                        <div className={styles.emptyMsg}>Loading activities...</div>
                    ) : filteredActivities.length > 0 ? (
                        filteredActivities.map((act) => (
                            <div key={act._id} className={styles.activityItem} onClick={() => handleProfileClick(act)} style={{ cursor: 'pointer' }}>
                                <div className={styles.activityIcon}>
                                    {act.type === 'visit' ? <Eye size={18} /> :
                                        act.type === 'interest' ? <Send size={18} /> :
                                            act.type === 'superInterest' ? <Zap size={18} /> :
                                                act.type === 'shortlist' ? <Bookmark size={18} /> :
                                                    act.status === 'accepted' ? <UserCheck size={18} /> : <CheckCircle size={18} />}
                                </div>
                                <div className={styles.activityDetails}>
                                    <p className={styles.activityText}>
                                        {act.status === 'accepted' ? (
                                            <>Connection <strong>accepted</strong> with <strong>{act.partnerName}</strong></>
                                        ) : (
                                            <><strong>{act.type.toUpperCase()}</strong> {act.isSender ? 'sent to' : 'received from'} <strong>{act.partnerName}</strong></>
                                        )}
                                        {act.partnerUniqueId && <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>({act.partnerUniqueId})</span>}
                                    </p>
                                    <span className={styles.activityTime}>
                                        {new Date(act.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className={styles.activityStatus}>
                                    <span className={styles.statusBadge} style={{
                                        color: act.status === 'accepted' ? '#10b981' : act.status === 'declined' ? '#f43f5e' : '#facc15',
                                        borderColor: act.status === 'accepted' ? '#10b98140' : act.status === 'declined' ? '#f43f5e40' : '#facc1540'
                                    }}>
                                        {act.status === 'accepted' ? 'ACTIVE' : act.status.toUpperCase()}
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={(e) => handleDelete(act._id, e)} title="Delete Log">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyMsg}>
                            <p>No logged activities found for this category.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Popup */}
            {selectedPartner && (
                <div className={styles.overlay} onClick={() => setSelectedPartner(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Interactee Profile</h3>
                            <button onClick={() => setSelectedPartner(null)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.profileHeader}>
                                <img src={selectedPartner.img} alt="Profile" className={styles.avatar} />
                                <div>
                                    <h4>{selectedPartner.name}</h4>
                                    <p className={styles.uid}>{selectedPartner.unique_id}</p>
                                </div>
                            </div>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>Location</label>
                                    <p>{selectedPartner.location}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Last Action</label>
                                    <p>{selectedPartner.type.toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Activity;
