import React, { useState, useEffect, useRef } from "react";
import styles from "./Messenger.module.css";
import {
    Send,
    Paperclip,
    ArrowLeft,
    MessageSquare,
    X,
    Trash2
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { interactionService } from "../../../services/interactionService";
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
    const [activeTab, setActiveTab] = useState<'accepted' | 'sent' | 'received'>('accepted');
    const [messages, setMessages] = useState<Message[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
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
                a.status !== 'accepted' &&
                ['interest', 'superInterest', 'chat'].includes(a.type)
            );
            setSentInterests(sent);

            // Filter for Received Tab: Things I received that aren't accepted yet
            setReceivedInterests(activities.filter((a: any) =>
                !a.isSender &&
                a.status !== 'accepted' &&
                ['interest', 'superInterest'].includes(a.type)
            ));

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

        } catch (error) {
            console.error("Error fetching messenger data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 4000);
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
        try {
            await interactionService.respondToActivity(activityId, status);
            // If accepted, maybe send a greeting? (Optional)
            fetchData(); // Refresh lists
        } catch (error) {
            console.error("Failed to respond:", error);
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
                                    onClick={(e) => handleClientClick(String(conv.advocate.id), e)}
                                />
                                <div className={styles.convDetails} onClick={(e) => handleClientClick(String(conv.advocate.id), e)}>
                                    <div className={styles.convTitleRow}>
                                        <h4>{conv.advocate.name}</h4>
                                        <span className={styles.convTime}>
                                            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span>{conv.advocate.unique_id || 'ID: N/A'}</span>
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
                            <div key={act._id} className={styles.convItem}>
                                <img
                                    src={act.partnerImg}
                                    className={styles.convAvatar}
                                    alt={act.partnerName}
                                    onClick={(e) => handleClientClick(act.advocateId || act.receiver, e)}
                                />
                                <div className={styles.convDetails} onClick={(e) => handleClientClick(act.advocateId || act.receiver, e)}>
                                    <div className={styles.convTitleRow}>
                                        <h4>{act.partnerName}</h4>
                                        <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span>{act.partnerUniqueId}</span>
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
                        {receivedInterests.map(act => (
                            <div key={act._id} className={styles.convItem} style={{ cursor: 'default' }}>
                                <img
                                    src={act.partnerImg}
                                    className={styles.convAvatar}
                                    alt={act.partnerName}
                                    onClick={(e) => handleClientClick(act.clientId || act.sender, e)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div className={styles.convDetails} onClick={(e) => handleClientClick(act.clientId || act.sender, e)}>
                                    <div className={styles.convTitleRow}>
                                        <h4 style={{ cursor: 'pointer' }}>{act.partnerName}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                            <button className={styles.deleteBtn} onClick={(e) => handleDeleteActivity(act._id, e)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span>{act.partnerUniqueId}</span>
                                        <span>•</span>
                                        <span style={{ color: '#38bdf8' }}>{act.type.toUpperCase()}</span>
                                    </div>
                                    <div className={styles.actButtons}>
                                        <button className={styles.acceptBtn} onClick={(e) => handleResponse(act._id, 'accepted', e)}>Accept</button>
                                        <button className={styles.declineBtn} onClick={(e) => handleResponse(act._id, 'declined', e)}>Ignore</button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
};

export default Messenger;
