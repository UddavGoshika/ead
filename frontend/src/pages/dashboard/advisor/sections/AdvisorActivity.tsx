import { useEffect, useState } from "react";
import styles from "./AdvisorActivity.module.css";
import { interactionService } from "../../../../services/interactionService";
import { useAuth } from "../../../../context/AuthContext";
import { Clock, CheckCircle, Eye, Send, Inbox, Star, UserCheck, MessageSquare, X } from "lucide-react";
import api from "../../../../services/api";
import DetailedProfileEnhanced from "../../shared/DetailedProfileEnhanced";

interface AdvisorActivityProps {
    onNavigate?: (page: string) => void;
    onChatSelect?: (partner: any) => void;
}

const AdvisorActivity: React.FC<AdvisorActivityProps> = ({ onNavigate, onChatSelect }) => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const shouldMask = false;

    const [stats, setStats] = useState({
        visits: 0,
        sent: 0,
        received: 0,
        accepted: 0,
        messages: 0,
        consultations: 0,
        blocked: 0
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
                    setStats({
                        ...statsData,
                        messages: statsData.messages || 0,
                        consultations: statsData.consultations || statsData.meet_request || 0,
                        blocked: statsData.blocked || 0
                    });
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
        { label: "Accepted", value: stats.accepted, icon: <UserCheck size={22} />, color: "#f43f5e", type: 'accepted' },
        { label: "Messages", value: stats.messages, icon: <MessageSquare size={22} />, color: "#8b5cf6", type: 'message' },
        { label: "Consultations", value: stats.consultations, icon: <Clock size={22} />, color: "#daa520", type: 'consultation' },
        { label: "Blocked", value: stats.blocked, icon: <X size={22} />, color: "#64748b", type: 'blocked' }
    ];

    const filteredActivities = activities.filter(act => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'visit') return act.type === 'visit' && act.isSender;
        if (activeFilter === 'sent') return ['interest', 'superInterest', 'meet_request'].includes(act.type) && act.isSender;
        if (activeFilter === 'received') return (['interest', 'superInterest', 'meet_request'].includes(act.type) && !act.isSender);
        if (activeFilter === 'accepted') return act.status === 'accepted';
        if (activeFilter === 'message') return act.type === 'message' || act.type === 'chat_initiated';
        if (activeFilter === 'consultation') return act.type === 'meet_request' || act.type === 'consultation';
        if (activeFilter === 'blocked') return act.type === 'block' && act.isSender;
        return true;
    });

    const dedupedActivities = filteredActivities.reduce((acc: any[], current) => {
        // For chats, we only want the LATEST message from/to a specific partner in the log
        if (current.type === 'chat' || current.type === 'message' || current.type === 'chat_initiated') {
            const existingChat = acc.find(item =>
                (item.type === 'chat' || item.type === 'message' || item.type === 'chat_initiated') &&
                ((item.sender === current.sender && item.receiver === current.receiver) ||
                    (item.sender === current.receiver && item.receiver === current.sender))
            );
            if (!existingChat) {
                return acc.concat([current]);
            } else if (new Date(current.timestamp).getTime() > new Date(existingChat.timestamp).getTime()) {
                // Keep the newer one
                return acc.filter(i => i !== existingChat).concat([current]);
            }
            return acc;
        }

        // For interests/consultations, show the latest state for that pair
        const isInterest = ['interest', 'superInterest', 'meet_request', 'consultation'].includes(current.type);
        if (isInterest) {
            const existingInterest = acc.find(item =>
                ['interest', 'superInterest', 'meet_request', 'consultation'].includes(item.type) &&
                item.sender === current.sender &&
                item.receiver === current.receiver
            );
            if (!existingInterest) {
                return acc.concat([current]);
            } else if (new Date(current.timestamp).getTime() > new Date(existingInterest.timestamp).getTime()) {
                return acc.filter(i => i !== existingInterest).concat([current]);
            }
            return acc;
        }

        // Default: add if not exact duplicate
        const x = acc.find(item =>
            item.sender === current.sender &&
            item.receiver === current.receiver &&
            item.type === current.type &&
            item.status === current.status
        );
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    const handleClientClick = async (partnerId: string, role: string = 'client') => {
        try {
            setPopupLoading(true);
            const endpoint = (role === 'advocate' || role === 'legal_provider') ? `/advocate/${partnerId}` : `/client/${partnerId}`;
            const response = await api.get(endpoint);
            if (response.data.success) {
                const data = response.data.client || response.data.advocate;
                console.log("[DEBUG] Profile Data Loaded:", data);

                // DetailedProfileEnhanced prefers the record ID or userId string
                const resolvedId = data.userId?._id || data.userId || data._id || data.id;

                setSelectedClient({
                    ...data,
                    resolvedId: resolvedId,
                    role: role,
                    firstName: data.firstName || data.name?.split(' ')[0] || 'User',
                    lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
                    img: data.img || data.profilePic || data.profilePicPath,
                    unique_id: data.unique_id || data.display_id || 'ID-PENDING'
                });
            } else {
                console.error("Fetch Failed:", response.data);
                alert("Could not fetch profile details: " + (response.data.error || 'Unknown error'));
            }
        } catch (error: any) {
            console.error("Error fetching profile details:", error);
            alert("Error: " + (error.response?.data?.error || error.message));
        } finally {
            setPopupLoading(false);
        }
    };

    const handleResponse = async (activityId: string, status: 'accepted' | 'declined', e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await interactionService.respondToActivity(activityId, status);
            alert(`Request ${status}`);
            // Refresh counts and list
            const [statsData, activitiesData] = await Promise.all([
                interactionService.getActivityStats(String(user?.id)),
                interactionService.getAllActivities(String(user?.id))
            ]);
            setStats({
                ...statsData,
                messages: statsData.messages || 0,
                consultations: statsData.consultations || statsData.meet_request || 0,
                blocked: statsData.blocked || 0
            });
            setActivities(activitiesData);
        } catch (err) {
            console.error("Failed to respond:", err);
            alert("Failed to update status.");
        }
    };

    const maskContactInfo = (info: string) => {
        return info || "N/A";
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
                    ) : dedupedActivities.length > 0 ? (
                        dedupedActivities.map((act) => {
                            const isIncoming = !act.isSender;
                            const showService = act.metadata?.service || act.service;
                            const canRespond = isIncoming && act.status === 'pending' && ['interest', 'superInterest', 'meet_request'].includes(act.type);

                            return (
                                <div
                                    key={act._id}
                                    className={styles.activityItem}
                                    onClick={() => {
                                        // Row click -> Open Chat Popup (floating)
                                        if (onChatSelect) {
                                            onChatSelect({
                                                id: act.partnerId,
                                                partnerUserId: act.partnerId,
                                                name: act.partnerName,
                                                profilePic: act.partnerImg,
                                                role: act.partnerRole || 'client',
                                                unique_id: act.partnerUniqueId
                                            });
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={act.partnerImg}
                                        alt={act.partnerName}
                                        className={`${styles.activityAvatar} ${(act.isBlur || shouldMask) ? styles.blurred : ''}`}
                                    />
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityHeader}>
                                            <span
                                                className={styles.activityName}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClientClick(act.partnerId, act.partnerRole || 'client');
                                                }}
                                                title="View Profile"
                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                {act.partnerName}
                                            </span>
                                            <span className={styles.activityDate}>
                                                {new Date(act.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className={styles.activitySub}>
                                            <span>
                                                {act.partnerUniqueId || act.partnerId || 'ID: N/A'}
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
                                                <span style={{ color: '#10b981' }}>Connected (Accepted)</span>
                                            ) : act.type === 'message' || act.type === 'chat_initiated' ? (
                                                <span>New message {act.isSender ? 'sent' : 'received'}</span>
                                            ) : act.type === 'meet_request' || act.type === 'consultation' ? (
                                                <span style={{ color: '#daa520' }}>Meeting request {act.isSender ? 'sent' : 'received'}</span>
                                            ) : (
                                                <span style={{ color: act.isSender ? '#94a3b8' : '#facc15' }}>
                                                    {act.isSender ? 'Interest Sent' : 'Interest Received (New Enquiry)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {canRespond && (
                                        <div className={styles.actionRow} onClick={e => e.stopPropagation()}>
                                            <button
                                                className={styles.acceptBtn}
                                                onClick={(e) => handleResponse(act._id, 'accepted', e)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className={styles.declineBtn}
                                                onClick={(e) => handleResponse(act._id, 'declined', e)}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}

                                    {/* Optional Badge */}
                                    {!canRespond && act.status !== 'none' && act.status !== 'pending' && (
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

                                    {act.status === 'accepted' && (
                                        <button
                                            className={styles.chatActionBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onChatSelect) {
                                                    onChatSelect({
                                                        id: act.partnerId,
                                                        partnerUserId: act.partnerId,
                                                        name: act.partnerName,
                                                        profilePic: act.partnerImg,
                                                        role: act.partnerRole || 'client',
                                                        unique_id: act.partnerUniqueId
                                                    });
                                                }
                                            }}
                                        >
                                            Chat
                                        </button>
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

            {/* Client Details Popup - Premium UI */}
            {selectedClient && (
                <DetailedProfileEnhanced
                    profileId={selectedClient.resolvedId}
                    isModal={true}
                    onClose={() => setSelectedClient(null)}
                    backToProfiles={() => setSelectedClient(null)}
                    partnerRole={selectedClient.role === 'advocate' || selectedClient.role === 'legal_provider' ? 'advocate' : 'client'}
                    onSelectForChat={(p) => {
                        onChatSelect?.(p);
                        onNavigate?.('messenger');
                        setSelectedClient(null); // Close modal when navigating to chat
                    }}
                />
            )}
        </div>
    );
};

export default AdvisorActivity;
