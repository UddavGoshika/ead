import React, { useState, useEffect, useRef } from "react";
import styles from "./Messenger.module.css";
import {
    Send,
    Paperclip,
    ArrowLeft,
    MessageSquare,
    X,
    Trash2,
    Phone,
    Video,
    PhoneIncoming,
    PhoneOutgoing,
    History,
    Info
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useCall } from "../../../context/CallContext";
import { interactionService } from "../../../services/interactionService";
import { callService } from "../../../services/callService";
import type { Message, Conversation } from "../../../services/interactionService";
import type { Advocate } from "../../../types";
import DetailedProfile from "./DetailedProfile";

interface MessengerProps {
    view?: 'list' | 'chat';
    selectedAdvocate?: Advocate | null;
    onBack?: () => void;
    onSelectForChat?: (advocate: Advocate) => void;
}

const Messenger: React.FC<MessengerProps> = ({ view = 'list', selectedAdvocate, onBack, onSelectForChat }) => {
    const { user } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messageText, setMessageText] = useState("");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeTab, setActiveTab] = useState<'accepted' | 'sent' | 'received' | 'calls'>('accepted');
    const [callHistory, setCallHistory] = useState<any[]>([]);
    const [callsSubTab, setCallsSubTab] = useState<'sent' | 'received'>('received');
    const [callsFilter, setCallsFilter] = useState<'all' | 'audio' | 'video'>('all');
    const [messages, setMessages] = useState<Message[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { initiateCall } = useCall();

    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [selectedCallPartnerId, setSelectedCallPartnerId] = useState<string | null>(null);
    const [partnerCallHistory, setPartnerCallHistory] = useState<any[]>([]);
    const [popupLoading, setPopupLoading] = useState(false);

    // Filtered lists for tabs
    const [sentInterests, setSentInterests] = useState<any[]>([]);
    const [receivedInterests, setReceivedInterests] = useState<any[]>([]);

    // If an advocate is passed (e.g. from FeaturedProfiles), set it as selected
    useEffect(() => {
        if (selectedAdvocate) {
            setSelectedConversation({
                advocate: selectedAdvocate,
                lastMessage: undefined,
                unreadCount: 0
            });
        }
    }, [selectedAdvocate]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const myId = String(user.id);
            // 1. Get All Activities (Interests/Requests/Chats)
            const activities = await interactionService.getAllActivities(myId);
            setAllActivities(activities);

            // 2. Get Active Conversations (from Messages)
            const convs = await interactionService.getConversations(myId);

            // Filter for Sent Tab: Things I sent that aren't accepted yet
            // Includes both Interests and those I've messaged but aren't accepted
            const sent = activities.filter((a: any) =>
                a.isSender &&
                a.status === 'pending' &&
                ['interest', 'superInterest', 'chat'].includes(a.type)
            );
            setSentInterests(sent);

            // Filter for Received Tab: Things I received that aren't accepted/declined yet
            const rawReceived = activities.filter((a: any) =>
                !a.isSender &&
                a.status === 'pending' &&
                ['interest', 'superInterest'].includes(a.type)
            );

            // Client-side cleanup: Deduplicate multiple pending requests from same person
            // This handles "ghosts" where older duplicates might still exist in DB
            const uniqueReceivedMap = new Map();
            rawReceived.forEach((item: any) => {
                // Key by sender ID + type to ensure unique card
                const key = `${item.sender}-${item.type}`;
                // We keep the LATEST one (assuming sorted by timestamp desc)
                if (!uniqueReceivedMap.has(key)) {
                    uniqueReceivedMap.set(key, item);
                }
            });
            setReceivedInterests(Array.from(uniqueReceivedMap.values()));


            // 3. Accepted Conversations: Only those where status is 'accepted'
            const acceptedPartners = new Set(activities.filter((a: any) => a.status === 'accepted').map((a: any) => a.isSender ? String(a.receiver) : String(a.sender)));

            const acceptedConvs = convs.filter(c => acceptedPartners.has(String(c.advocate.id)));

            // Also add partners who are accepted but we haven't messaged yet
            activities.filter((a: any) => a.status === 'accepted').forEach((act: any) => {
                const partnerId = act.isSender ? String(act.receiver) : String(act.sender);
                if (!acceptedConvs.some(c => String(c.advocate.id) === partnerId)) {
                    acceptedConvs.push({
                        advocate: {
                            id: partnerId,
                            unique_id: act.partnerUniqueId,
                            name: act.partnerName,
                            profilePic: act.partnerImg,
                            location: act.partnerLocation
                        } as any,
                        lastMessage: {
                            id: `act-${act._id}`,
                            senderId: act.sender,
                            receiverId: act.receiver,
                            text: 'Request accepted. Start chatting!',
                            timestamp: act.timestamp
                        },
                        unreadCount: 0
                    });
                }
            });

            setConversations(acceptedConvs);

            // 4. Get Call History
            const calls = await callService.getCallHistory(myId);
            setCallHistory(calls);

        } catch (error) {
            console.error("Error fetching messenger data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s is safer for performance
        return () => clearInterval(interval);
    }, [user]);

    const handleDeleteActivity = async (activityId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Delete this interaction?")) return;
        try {
            await interactionService.deleteActivity(activityId);
            fetchData();
        } catch (error) {
            console.error("Failed to delete activity:", error);
        }
    };

    const handleResponse = async (activityId: string, status: 'accepted' | 'declined', e: React.MouseEvent) => {
        e.stopPropagation();

        if (user?.status === 'Pending') {
            alert("Your profile is still under verification. You can respond to requests once approved.");
            return;
        }

        // Optimistic Update: Immediately remove from list
        setReceivedInterests(prev => prev.filter(item => item._id !== activityId));

        try {
            console.log(`Responding to ${activityId} with ${status}`);
            await interactionService.respondToActivity(activityId, status);
            // If accepted, maybe send a greeting? (Optional)
            fetchData(); // Refresh lists to move to accepted tab
        } catch (error: any) {
            console.error("Failed to respond:", error);
            alert(`Failed to update status: ${error.message || 'Server Error'}`);
            fetchData(); // Revert/Refresh on error
        }
    };

    useEffect(() => {
        if (user && (selectedConversation || selectedAdvocate)) {
            const currentUserId = String(user.id);
            const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);

            const fetchMsgs = async () => {
                const msgs = await interactionService.getConversationMessages(currentUserId, partnerId);
                setMessages(msgs);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            };
            fetchMsgs();
        }
    }, [user, selectedConversation, selectedAdvocate]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.status === 'Pending') {
            alert("Your profile is still under verification. Chatting will be enabled once your account is verified.");
            return;
        }

        const currentUserId = String(user?.id);
        const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);

        if (!messageText.trim() || !currentUserId || !partnerId) return;

        const sentMsg = await interactionService.sendMessage(currentUserId, partnerId, messageText);
        setMessages(prev => [...prev, sentMsg]);
        setMessageText("");
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            setSelectedConversation(null);
        }
    };

    const handleSelectConversation = (conv: Conversation) => {
        if (onSelectForChat) {
            onSelectForChat(conv.advocate);
        } else {
            setSelectedConversation(conv);
        }
    };

    const handleClientClick = async (partnerId: string | undefined, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!partnerId) return;
        setSelectedProfileId(partnerId);
    };

    const maskContactInfo = (info: string) => {
        if (!info) return "N/A";
        if (info.length <= 2) return info;
        return info.substring(0, 2) + "888" + "*".repeat(Math.max(0, info.length - 5));
    };

    const handleCall = async (targetUserId: string, type: 'audio' | 'video') => {
        if (user?.status === 'Pending') {
            alert(`Your profile is currently under verification. ${type === 'video' ? 'Video' : 'Voice'} calls will be available once approved.`);
            return;
        }
        try {
            await initiateCall(targetUserId, type);
        } catch (err) {
            console.error("Call failed:", err);
        }
    };

    const handleOpenChat = (partner: any) => {
        if (user?.status === 'Pending') {
            alert("Your profile is still under verification. Chatting will be enabled once your account is verified.");
            return;
        }

        const conv: Conversation = {
            advocate: {
                id: partner.id || partner._id || partner.partnerId,
                unique_id: partner.unique_id || partner.partnerUniqueId,
                name: partner.name || partner.partnerName,
                profilePic: partner.profilePic || partner.img || partner.partnerImg
            } as any,
            unreadCount: 0
        };
        setSelectedConversation(conv);
    };

    const handleViewCallHistory = async (partnerId: string) => {
        setPopupLoading(true);
        setSelectedCallPartnerId(partnerId);
        try {
            const history = await callService.getCallHistory(partnerId); // This might fetch all history for that person, let's filter or ask service for partner history
            // Better: Filter existing callHistory if it's already there or fetch specifically for this relationship
            // For now, let's assume getCallHistory(myId) was already called, but we want partner specific.
            // Let's refine the API or filter here.
            const partnerHistory = callHistory.filter(c =>
                (String(c.caller) === String(user?.id) && String(c.receiver) === String(partnerId)) ||
                (String(c.receiver) === String(user?.id) && String(c.caller) === String(partnerId))
            );
            setPartnerCallHistory(partnerHistory);
        } catch (err) {
            console.error("Error fetching partner call history:", err);
        } finally {
            setPopupLoading(false);
        }
    };

    const renderActionButtons = (partnerId: string, partnerDetails: any) => {
        return (
            <div className={styles.convActions}>
                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleCall(partnerId, 'audio'); }} title="Voice Call">
                    <Phone size={16} />
                </button>
                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleCall(partnerId, 'video'); }} title="Video Call">
                    <Video size={16} />
                </button>
                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleOpenChat(partnerDetails); }} title="Open Chat">
                    <MessageSquare size={16} />
                </button>

                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleViewCallHistory(partnerId); }} title="Call History">
                    <History size={16} />
                </button>
                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleClientClick(partnerId); }} title="View Profile Info">
                    <Info size={16} />
                </button>
            </div>
        );
    };

    const formatDuration = (start?: string, end?: string) => {
        if (!start || !end) return "N/A";
        const durationMs = new Date(end).getTime() - new Date(start).getTime();
        const seconds = Math.floor((durationMs / 1000) % 60);
        const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
        const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);
        return parts.length > 0 ? parts.join(' ') : '0s';
    };

    if (selectedConversation || view === 'chat') {
        const activeConv = selectedConversation;
        const displayName = activeConv?.advocate.name || selectedAdvocate?.name || 'User';
        const displayId = activeConv?.advocate.unique_id || selectedAdvocate?.unique_id || '---';

        return (
            <div className={styles.fullChatContainer} style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
                <header className={styles.chatHeader}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backBtn} onClick={handleBack}>
                            <ArrowLeft size={20} />
                        </button>
                        <div className={styles.avatarMini}>
                            {displayName.charAt(0)}
                        </div>
                        <div className={styles.headerInfo}>
                            <h3>{displayName}</h3>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {displayId}</span>
                        </div>
                    </div>
                </header>

                <div className={styles.chatArea}>
                    {messages.map(msg => (
                        <div key={msg.id} className={msg.senderId === String(user?.id) ? styles.myMsg : styles.theirMsg}>
                            <div className={styles.msgBubble}>
                                {msg.text}
                                <span className={styles.msgTime}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
                    <button type="button" className={styles.attachBtn}>
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        placeholder="Type your response..."
                        className={styles.msgInput}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!messageText.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        );
    }

    const renderList = () => {
        switch (activeTab) {
            case 'accepted':
                return conversations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3>No active chats</h3>
                        <p>When you start messaging, they will appear here.</p>
                    </div>
                ) : (
                    <div className={styles.conversationList}>
                        {conversations.map(conv => (
                            <div
                                key={conv.advocate.unique_id}
                                className={styles.convItem}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <img
                                    src={(conv.advocate as any).profilePic || (conv.advocate as any).img || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'}
                                    alt={conv.advocate.name}
                                    className={styles.convAvatar}
                                />
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(String(conv.advocate.id), e); }} style={{ cursor: 'pointer' }}>
                                            {conv.advocate.name}
                                        </h4>
                                        <span className={styles.convTime}>
                                            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span onClick={(e) => { e.stopPropagation(); handleClientClick(String(conv.advocate.id), e); }} style={{ cursor: 'pointer' }}>
                                            {conv.advocate.unique_id || 'ID: N/A'}
                                        </span>
                                        {conv.advocate.location && conv.advocate.location !== 'N/A' && (
                                            <>
                                                <span>•</span>
                                                <span>{conv.advocate.location}</span>
                                            </>
                                        )}
                                    </div>
                                    <p className={styles.lastMsg}>{conv.lastMessage?.text || 'Chat active'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'sent':
                return sentInterests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Send size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3>No sent interests</h3>
                        <p>Requests you've sent will appear here until accepted.</p>
                    </div>
                ) : (
                    <div className={styles.conversationList}>
                        {sentInterests.map(act => (
                            <div key={act._id} className={styles.convItem} onClick={() => handleOpenChat({
                                id: act.advocateId || act.receiver,
                                unique_id: act.partnerUniqueId,
                                name: act.partnerName,
                                img: act.partnerImg
                            })}>
                                <img
                                    src={act.partnerImg}
                                    className={styles.convAvatar}
                                    alt={act.partnerName}
                                />
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(act.advocateId || act.receiver, e); }} style={{ cursor: 'pointer' }}>
                                            {act.partnerName}
                                        </h4>
                                        <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span onClick={(e) => { e.stopPropagation(); handleClientClick(act.advocateId || act.receiver, e); }} style={{ cursor: 'pointer' }}>
                                            {act.partnerUniqueId}
                                        </span>
                                        <span>•</span>
                                        <span style={{ color: '#facc15', fontWeight: 'bold' }}>PENDING</span>
                                    </div>
                                    <p className={styles.lastMsg}>Interaction: {act.type}</p>
                                </div>
                                <button className={styles.deleteBtn} onClick={(e) => handleDeleteActivity(act._id, e)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'received':
                return receivedInterests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3>No received interests</h3>
                        <p>Requests from others will appear here for your response.</p>
                    </div>
                ) : (
                    <div className={styles.conversationList}>
                        {receivedInterests.map(act => {
                            const actId = String(act._id || act.id);
                            if (!actId || actId === 'undefined') return null;

                            return (
                                <div key={actId} className={styles.convItem} onClick={() => handleOpenChat({
                                    id: act.clientId || act.sender,
                                    unique_id: act.partnerUniqueId,
                                    name: act.partnerName,
                                    img: act.partnerImg
                                })}>
                                    <img
                                        src={act.partnerImg}
                                        className={styles.convAvatar}
                                        alt={act.partnerName}
                                    />
                                    <div className={styles.convDetails}>
                                        <div className={styles.convTitleRow}>
                                            <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(act.clientId || act.sender, e); }} style={{ cursor: 'pointer' }}>
                                                {act.partnerName}
                                            </h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                                <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDeleteActivity(actId, e); }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.convSub}>
                                            <span onClick={(e) => { e.stopPropagation(); handleClientClick(act.clientId || act.sender, e); }} style={{ cursor: 'pointer' }}>
                                                {act.partnerUniqueId}
                                            </span>
                                            <span>•</span>
                                            <span style={{ color: '#38bdf8' }}>{act.type.toUpperCase()}</span>
                                        </div>
                                        <div className={styles.actButtons}>
                                            <button className={styles.acceptBtn} onClick={(e) => { e.stopPropagation(); handleResponse(actId, 'accepted', e); }}>Accept</button>
                                            <button className={styles.declineBtn} onClick={(e) => { e.stopPropagation(); handleResponse(actId, 'declined', e); }}>Ignore</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            case 'calls':
                const filteredCalls = callHistory.filter(call => {
                    const matchesTab = callsSubTab === 'sent' ? call.isSender : !call.isSender;
                    const matchesFilter = callsFilter === 'all' || call.type === callsFilter;
                    return matchesTab && matchesFilter;
                });

                return (
                    <div className={styles.callsSection}>
                        <div className={styles.callsControlsRow}>
                            <div className={styles.controlGroup}>
                                <button
                                    className={`${styles.subTab} ${callsSubTab === 'received' ? styles.subTabActive : ''}`}
                                    onClick={() => setCallsSubTab('received')}
                                >
                                    Received
                                </button>
                                <button
                                    className={`${styles.subTab} ${callsSubTab === 'sent' ? styles.subTabActive : ''}`}
                                    onClick={() => setCallsSubTab('sent')}
                                >
                                    Sent
                                </button>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.controlGroup}>
                                <label className={styles.filterLabel}>Type:</label>
                                <button className={`${styles.filterBtn} ${callsFilter === 'all' ? styles.filterBtnActive : ''}`} onClick={() => setCallsFilter('all')}>All</button>
                                <button className={`${styles.filterBtn} ${callsFilter === 'audio' ? styles.filterBtnActive : ''}`} onClick={() => setCallsFilter('audio')}>Voice</button>
                                <button className={`${styles.filterBtn} ${callsFilter === 'video' ? styles.filterBtnActive : ''}`} onClick={() => setCallsFilter('video')}>Video</button>
                            </div>
                        </div>

                        {filteredCalls.length === 0 ? (
                            <div className={styles.emptyState}>
                                <History size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                                <h3>No calls found</h3>
                                <p>Call history will appear here.</p>
                            </div>
                        ) : (
                            <div className={styles.conversationList}>
                                {filteredCalls.map(call => (
                                    <div key={call._id} className={styles.convItem}>
                                        <img
                                            src={call.partnerDetails.image_url}
                                            className={styles.convAvatar}
                                            alt={call.partnerDetails.name}
                                            onClick={(e) => handleClientClick(String(call.partnerDetails._id), e)}
                                        />
                                        <div className={styles.convDetails} onClick={(e) => handleClientClick(String(call.partnerDetails._id), e)}>
                                            <div className={styles.convTitleRow}>
                                                <h4>{call.partnerDetails.name}</h4>
                                                <span className={styles.convTime}>{new Date(call.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className={styles.convSub}>
                                                <span>{call.partnerDetails.unique_id}</span>
                                                <span>•</span>
                                                <div className={`${styles.callIndicator} ${call.isSender ? styles.outgoing : styles.incoming}`}>
                                                    {call.isSender ? <PhoneOutgoing size={12} /> : <PhoneIncoming size={12} />}
                                                    {call.isSender ? 'OUTGOING' : 'INCOMING'}
                                                </div>
                                            </div>
                                            <p className={styles.lastMsg}>
                                                {call.type === 'video' ? <Video size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> : <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                                                {call.type.toUpperCase()} CALL - {call.status.toUpperCase()}
                                            </p>
                                        </div>
                                        {renderActionButtons(String(call.partnerDetails._id), call.partnerDetails)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Messenger</h1>

            <div className={styles.tabBar}>
                <button
                    className={`${styles.tab} ${activeTab === 'accepted' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('accepted')}
                >
                    Accepted
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'sent' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('sent')}
                >
                    Sent
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'received' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    Received
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'calls' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('calls')}
                >
                    Calls
                </button>
            </div>

            {renderList()}

            {/* Full Depth Detailed Profile Popup */}
            {selectedProfileId && (
                <DetailedProfile
                    profileId={selectedProfileId}
                    isModal={true}
                    onClose={() => setSelectedProfileId(null)}
                    backToProfiles={() => setSelectedProfileId(null)}
                />
            )}

            {/* Call History Modal */}
            {selectedCallPartnerId && (
                <div className={styles.overlay} onClick={() => setSelectedCallPartnerId(null)}>
                    <div className={styles.modal} style={{ maxWidth: '600px', height: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className={styles.avatarMini} style={{ width: '40px', height: '40px' }}>
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>Call History</h3>
                                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                                        {partnerCallHistory.length > 0 ? partnerCallHistory[0].partnerDetails.name : 'No history found'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCallPartnerId(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {popupLoading ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.loadingSpinner} />
                                    <p>Loading history...</p>
                                </div>
                            ) : partnerCallHistory.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <History size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                                    <h3>No Calls Yet</h3>
                                    <p>Log of calls with this person will appear here.</p>
                                </div>
                            ) : (
                                <div className={styles.historyTimeline}>
                                    {partnerCallHistory.map((call, idx) => (
                                        <div key={call._id || idx} className={styles.timelineItem}>
                                            <div className={styles.timelineIcon} style={{ background: call.isSender ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
                                                {call.isSender ?
                                                    <PhoneOutgoing size={18} color="#3b82f6" /> :
                                                    <PhoneIncoming size={18} color="#22c55e" />
                                                }
                                            </div>
                                            <div className={styles.timelineContent}>
                                                <div className={styles.timelineHeader}>
                                                    <span className={styles.callTypeLabel}>
                                                        {call.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
                                                        {call.type.toUpperCase()} CALL
                                                    </span>
                                                    <span className={styles.timelineTime}>
                                                        {new Date(call.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                <div className={styles.timelineDetails}>
                                                    <div className={styles.detailRow}>
                                                        <label>Status:</label>
                                                        <span style={{ color: call.status === 'missed' || call.status === 'rejected' ? '#ef4444' : '#22c55e' }}>
                                                            {call.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className={styles.detailRow}>
                                                        <label>Duration:</label>
                                                        <span>{formatDuration(call.startTime, call.endTime)}</span>
                                                    </div>
                                                    {call.startTime && (
                                                        <div className={styles.detailRow}>
                                                            <label>Started at:</label>
                                                            <span>{new Date(call.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messenger;
