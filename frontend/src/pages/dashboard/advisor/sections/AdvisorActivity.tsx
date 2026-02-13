import { useEffect, useState } from "react";
import styles from "./AdvisorActivity.module.css";
import { interactionService } from "../../../../services/interactionService";
import { useAuth } from "../../../../context/AuthContext";
import { Clock, CheckCircle, Eye, Send, Inbox, Star, UserCheck, MessageSquare, X } from "lucide-react";
import api from "../../../../services/api";

const AdvisorActivity = () => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const shouldMask = !isPremium;

    const [stats, setStats] = useState({
        visits: 0,
        sent: 0,
        received: 0,
        accepted: 0,
        messages: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [popupLoading, setPopupLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const [statsData, activitiesData] = await Promise.all([
                        interactionService.getActivityStats(String(user.id)),
                        interactionService.getAllActivities(String(user.id))
                    ]);
                    setStats({ ...statsData, messages: statsData.messages || 0 });
                    setActivities(activitiesData);
                } catch (err) {
                    console.error("Error fetching activity data:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const statItems = [
        { label: "Profile Visits", value: stats.visits, icon: <Eye size={22} />, color: "#3b82f6", type: 'visit' },
        { label: "Interests Sent", value: stats.sent, icon: <Send size={22} />, color: "#facc15", type: 'sent' },
        { label: "Interests Received", value: stats.received, icon: <Inbox size={22} />, color: "#10b981", type: 'received' },
        { label: "Shortlisted", value: stats.accepted, icon: <UserCheck size={22} />, color: "#f43f5e", type: 'accepted' },
        { label: "Messages", value: stats.messages, icon: <MessageSquare size={22} />, color: "#8b5cf6", type: 'message' }
    ];

    const filteredActivities = activities.filter(act => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'visit') return act.type === 'visit' && act.isSender;
        if (activeFilter === 'sent') return ['interest', 'superInterest'].includes(act.type) && act.isSender;
        if (activeFilter === 'received') return ['interest', 'superInterest'].includes(act.type) && !act.isSender;
        if (activeFilter === 'accepted') return act.status === 'accepted';
        if (activeFilter === 'message') return act.type === 'message' || act.type === 'chat_initiated';
        return true;
    });

    const handleClientClick = async (partnerId: string) => {
        try {
            setPopupLoading(true);
            const response = await api.get(`/client/${partnerId}`);
            if (response.data.success) {
                setSelectedClient(response.data.client);
            } else {
                alert("Could not fetch client details.");
            }
        } catch (error) {
            console.error("Error fetching client details:", error);
            alert("Error fetching client details.");
        } finally {
            setPopupLoading(false);
        }
    };

    const maskContactInfo = (info: string) => {
        if (!info) return "N/A";
        if (info.length <= 2) return info;
        return info.substring(0, 2) + "888" + "*".repeat(Math.max(0, info.length - 5));
    };

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
                    <h2>{activeFilter === 'all' ? 'Activity Log' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} History`}</h2>
                    <span className={styles.viewAll} onClick={() => setActiveFilter('all')}>Show All</span>
                </div>

                <div className={styles.activityList}>
                    {loading ? (
                        <div className={styles.emptyMsg}>Syncing professional activities...</div>
                    ) : filteredActivities.length > 0 ? (
                        filteredActivities.map((act) => {
                            const isIncoming = !act.isSender;
                            const showService = act.metadata?.service || act.service;

                            return (
                                <div
                                    key={act._id}
                                    className={styles.activityItem}
                                    onClick={() => isIncoming && handleClientClick(act.isSender ? act.sender : act.receiver)}
                                >
                                    <img
                                        src={act.partnerImg}
                                        alt={act.partnerName}
                                        className={`${styles.activityAvatar} ${(act.isBlur || shouldMask) ? styles.blurred : ''}`}
                                    />
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityHeader}>
                                            <span className={styles.activityName}>
                                                {shouldMask && act.partnerName ? act.partnerName.substring(0, 2) + "*****" : act.partnerName}
                                            </span>
                                            <span className={styles.activityDate}>
                                                {new Date(act.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className={styles.activitySub}>
                                            <span>
                                                {shouldMask && (act.partnerUniqueId || act.partnerId)
                                                    ? (act.partnerUniqueId || act.partnerId || '').substring(0, 2) + "*****"
                                                    : (act.partnerUniqueId || 'ID: N/A')}
                                            </span>
                                            {act.partnerLocation && act.partnerLocation !== 'N/A' && (
                                                <>
                                                    <span>•</span>
                                                    <span>{act.partnerLocation}</span>
                                                </>
                                            )}
                                            {showService && (
                                                <>
                                                    <span>•</span>
                                                    <span style={{ color: '#3b82f6' }}>{showService}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.activityMessage}>
                                            {act.status === 'accepted' ? (
                                                <span style={{ color: '#10b981' }}>Client shortlisted you for their case.</span>
                                            ) : act.type === 'message' || act.type === 'chat_initiated' ? (
                                                <span>New message {act.isSender ? 'sent' : 'received'}</span>
                                            ) : (
                                                <span>{act.isSender ? 'Interest Sent' : 'Interest Received'}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Optional Badge */}
                                    {act.status !== 'none' && (
                                        <div
                                            className={styles.statusBadge}
                                            style={{
                                                color: act.status === 'accepted' ? '#10b981' : act.status === 'declined' ? '#f43f5e' : '#facc15',
                                                background: act.status === 'accepted' ? '#10b98120' : act.status === 'declined' ? '#f43f5e20' : '#facc1520',
                                            }}
                                        >
                                            {act.status.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.emptyMsg}>
                            <p>No activity records available.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Client Details Popup */}
            {selectedClient && (
                <div className={styles.overlay} onClick={() => setSelectedClient(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Client Details</h3>
                            <button onClick={() => setSelectedClient(null)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.profileHeader}>
                                <img src={selectedClient.img || "https://uia-avatars.com/api/?name=" + selectedClient.firstName} alt="Profile" className={`${styles.avatar} ${(selectedClient.isBlur || shouldMask) ? styles.blurred : ''}`} />
                                <div>
                                    <h4>
                                        {shouldMask ? selectedClient.firstName.substring(0, 2) + "*****" : `${selectedClient.firstName} ${selectedClient.lastName}`}
                                    </h4>
                                    <p className={styles.uid}>
                                        {shouldMask ? (selectedClient.unique_id || '').substring(0, 2) + "*****" : selectedClient.unique_id}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>Email</label>
                                    <p>{maskContactInfo(selectedClient.email)}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Mobile</label>
                                    <p>{maskContactInfo(selectedClient.mobile)}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Location</label>
                                    <p>{selectedClient.location?.city || 'N/A'}, {selectedClient.location?.state || 'N/A'}</p>
                                </div>
                            </div>

                            {selectedClient.legalHelp && (
                                <div className={styles.legalSection}>
                                    <h5>Legal Requirement</h5>
                                    <div className={styles.tagContainer}>
                                        <span className={styles.tag}>{selectedClient.legalHelp.category}</span>
                                        <span className={styles.tag}>{selectedClient.legalHelp.specialization}</span>
                                        {selectedClient.legalHelp.subDepartment && <span className={styles.tag}>{selectedClient.legalHelp.subDepartment}</span>}
                                    </div>
                                    {selectedClient.legalHelp.issueDescription && (
                                        <div className={styles.descBox}>
                                            <label>Issue Description:</label>
                                            <p>{selectedClient.legalHelp.issueDescription}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvisorActivity;
