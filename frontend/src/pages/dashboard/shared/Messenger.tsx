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
    Info,
    MoreVertical,
    Star,
    Mail,
    Bookmark
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useCall } from "../../../context/CallContext";
import { useInteractions } from "../../../hooks/useInteractions";
import { interactionService } from "../../../services/interactionService";
import { callService } from "../../../services/callService";
import type { Message, Conversation } from "../../../services/interactionService";
import type { Advocate } from "../../../types";
import DetailedProfileEnhanced from "./DetailedProfileEnhanced";
import { formatImageUrl } from "../../../utils/imageHelper";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface MessengerProps {
    view?: 'list' | 'chat';
    selectedAdvocate?: Advocate | null;
    onBack?: () => void;
    onSelectForChat?: (advocate: Advocate) => void;
}

const Messenger: React.FC<MessengerProps> = ({ view = 'list', selectedAdvocate, onBack, onSelectForChat }) => {
    const { user } = useAuth();
    const plan = (user?.plan || 'Free').toLowerCase();
    const isPremium = !!(user?.isPremium || (plan !== 'free' && ['lite', 'pro', 'ultra'].some((p) => plan.includes(p))));
    const canShowFull = isPremium || user?.role === 'legal_provider';
    const queryClient = useQueryClient();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messageText, setMessageText] = useState("");
    const [activeTab, setActiveTab] = useState<'accepted' | 'sent' | 'received' | 'calls'>('accepted');
    const [callsSubTab, setCallsSubTab] = useState<'sent' | 'received' | 'all'>('received');
    const [callsFilter, setCallsFilter] = useState<'all' | 'audio' | 'video'>('all');
    const [receivedFilter, setReceivedFilter] = useState<'all' | 'message' | 'chats'>('all');
    const [messages, setMessages] = useState<Message[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { initiateCall } = useCall();

    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [showDetailedProfile, setShowDetailedProfile] = useState(false);
    const [selectedCallPartnerId, setSelectedCallPartnerId] = useState<string | null>(null);
    const [partnerCallHistory, setPartnerCallHistory] = useState<any[]>([]);
    const [popupLoading, setPopupLoading] = useState(false);

    // Queries
    const { data: allActivities = [], isLoading: isLoadingActivities } = useQuery({
        queryKey: ['activities', user?.id],
        queryFn: () => interactionService.getAllActivities(String(user?.id)),
        enabled: !!user?.id
    });

    const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: () => interactionService.getConversations(String(user?.id)),
        enabled: !!user?.id
    });

    const { data: callHistory = [], isLoading: isLoadingCalls } = useQuery({
        queryKey: ['callHistory', user?.id],
        queryFn: () => callService.getCallHistory(String(user?.id)),
        enabled: !!user?.id
    });

    // Merge logic (helper for filtering)
    const mergeActivities = (list: any[]) => {
        const map = new Map();
        list.forEach(item => {
            const partnerId = item.isSender ? item.receiver : item.sender;
            const key = partnerId;

            if (!map.has(key)) {
                map.set(key, { ...item, _mergedTypes: [item.type], _msgs: [] });
            }

            const existing = map.get(key);
            if (new Date(item.timestamp) > new Date(existing.timestamp)) {
                existing.timestamp = item.timestamp;
            }
            if (!existing._mergedTypes.includes(item.type)) {
                existing._mergedTypes.push(item.type);
            }
            const text = item.text || item.details || item.message || item.metadata?.text;
            if (text && item.type === 'chat') {
                existing._msgs.push({ text, ts: item.timestamp });
            }
        });

        return Array.from(map.values()).map((item: any) => {
            let finalType = 'chat';
            if (item._mergedTypes.includes('superInterest')) finalType = 'superInterest';
            else if (item._mergedTypes.includes('super-interest')) finalType = 'superInterest';
            else if (item._mergedTypes.includes('interest')) finalType = 'interest';

            item._msgs.sort((a: any, b: any) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
            const displayMsg = item._msgs.length > 0 ? item._msgs[0].text : (finalType !== 'chat' ? `${finalType === 'superInterest' ? 'Super Interest' : 'Interest'} Sent` : 'Message sent');

            return {
                ...item,
                type: finalType,
                lastMessage: { text: displayMsg }
            };
        });
    };

    const sentInterests = React.useMemo(() => {
        // Partners who have a pending interest OR just a chat activity sent to them
        const activePartnerIds = new Set(allActivities
            .filter((a: any) => a.isSender && (a.status === 'pending' || a.type === 'chat'))
            .map((a: any) => String(a.receiver))
        );

        // Partners who are already accepted (should not show in Sent tab anymore)
        const acceptedPartnerIds = new Set(allActivities
            .filter((a: any) => a.status === 'accepted')
            .map((a: any) => a.isSender ? String(a.receiver) : String(a.sender))
        );

        return mergeActivities(allActivities.filter((a: any) =>
            a.isSender &&
            activePartnerIds.has(String(a.receiver)) &&
            !acceptedPartnerIds.has(String(a.receiver)) &&
            ['interest', 'superInterest', 'chat'].includes(a.type)
        ));
    }, [allActivities]);

    const receivedInterests = React.useMemo(() => {
        // Partners who have sent a pending interest OR a chat message to me
        const activePartnerIds = new Set(allActivities
            .filter((a: any) => !a.isSender && (a.status === 'pending' || a.type === 'chat'))
            .map((a: any) => String(a.sender))
        );

        // Partners who are already accepted (should not show in Received tab anymore)
        const acceptedPartnerIds = new Set(allActivities
            .filter((a: any) => a.status === 'accepted')
            .map((a: any) => a.isSender ? String(a.receiver) : String(a.sender))
        );

        return mergeActivities(allActivities.filter((a: any) =>
            !a.isSender &&
            activePartnerIds.has(String(a.sender)) &&
            !acceptedPartnerIds.has(String(a.sender)) &&
            ['interest', 'superInterest', 'chat'].includes(a.type)
        ));
    }, [allActivities]);

    const acceptedConversations = React.useMemo(() => {
        const acceptedPartners = new Set(allActivities.filter((a: any) => a.status === 'accepted').map((a: any) => a.isSender ? String(a.receiver) : String(a.sender)));
        const list = conversations.filter((c: Conversation) => acceptedPartners.has(String(c.advocate.id)));

        allActivities.filter((a: any) => a.status === 'accepted').forEach((act: any) => {
            const partnerId = act.isSender ? String(act.receiver) : String(act.sender);
            if (!list.some(c => String(c.advocate.id) === partnerId)) {
                list.push({
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
        return list;
    }, [allActivities, conversations]);

    const handleDeleteActivity = async (activityId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activityId || activityId === 'undefined') {
            console.error("Cannot delete: Invalid Activity ID");
            return;
        }

        if (!window.confirm("Are you sure you want to remove this interaction?")) return;

        try {
            await interactionService.deleteActivity(activityId);
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        } catch (error) {
            console.error("Failed to delete activity:", error);
            alert("Failed to delete interaction.");
        }
    };

    const { handleInteraction } = useInteractions(); // Toast handled by hook

    const handleResponse = async (activityId: string, status: 'accepted' | 'declined', e: React.MouseEvent) => {
        e.stopPropagation();

        if (!activityId || activityId === 'undefined') {
            alert("Error: Invalid interaction ID. Please refresh.");
            return;
        }

        const activity = allActivities.find((a: any) => (a._id || a.id) === activityId);
        if (!activity) {
            console.error("Activity not found locally", activityId);
            return;
        }

        const partnerId = String(activity.clientId || activity.sender);
        const partnerRole = activity.partnerRole || 'client'; // Fallback, but should be there
        const partner = { id: partnerId, role: partnerRole, name: activity.partnerName };

        try {
            console.log(`Responding to ${activityId} via hook with ${status}`);
            await handleInteraction(partner, status === 'accepted' ? 'accept' : 'decline');
            // Queries invalidated by hook
        } catch (error: any) {
            console.error("Failed to respond via hook:", error);
            // Alert handled optionally by hook if toast provided, otherwise we might see console error
        }
    };

    useEffect(() => {
        if (user && (selectedConversation || selectedAdvocate)) {
            const currentUserId = String(user.id);
            const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);

            const fetchMsgs = async () => {
                const msgs = await interactionService.getConversationMessages(currentUserId, partnerId, currentUserId);
                setMessages(msgs);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

                // Mark as read
                await interactionService.markAsRead(currentUserId, partnerId);
                // Refresh conversations to clear unread count badge
                queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
            };
            fetchMsgs();
        }
    }, [user, selectedConversation, selectedAdvocate]);

    // REAL-TIME SOCKET LISTENER
    useEffect(() => {
        const handleSocketMessage = (e: any) => {
            const data = e.detail;
            const currentUserId = String(user?.id);
            const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);

            console.log('[Messenger] Socket event received:', {
                currentUserId,
                partnerId,
                senderId: data.senderId,
                msgSender: data.message?.sender
            });

            // 1. If we are in the chat with this person, add message to UI
            if (partnerId !== "undefined" && (String(data.senderId) === partnerId || (String(data.message.sender) === partnerId))) {
                console.log('[Messenger] Updating current chat thread');
                const newMsg = {
                    id: data.message._id || data.message.id,
                    senderId: String(data.message.sender),
                    receiverId: String(data.message.receiver),
                    text: data.message.text,
                    timestamp: new Date(data.message.timestamp).getTime()
                };

                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });

                if (String(data.message.receiver) === currentUserId) {
                    interactionService.markAsRead(currentUserId, partnerId);
                }
            }

            // 2. Refresh lists regardless to update "latest message" and unread counts
            console.log('[Messenger] Invalidating conversations query');
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
        };

        window.addEventListener('socket-message', handleSocketMessage);
        return () => window.removeEventListener('socket-message', handleSocketMessage);
    }, [user?.id, selectedConversation, selectedAdvocate]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.status === 'Pending') {
            alert("Your profile is still under verification. Chatting will be enabled once your account is verified.");
            return;
        }

        // ... existing send message logic ... 
        // We keep this manual for now to get the returned message object for optimistic UI
        const currentUserId = String(user?.id);
        const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);

        if (!messageText.trim() || !currentUserId || !partnerId) return;

        const sentMsg = await interactionService.sendMessage(currentUserId, partnerId, messageText);
        setMessages(prev => [...prev, sentMsg]);
        setMessageText("");

        queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
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
                id: String(partner.id || partner._id || partner.partnerId || partner.receiver || partner.sender),
                unique_id: partner.unique_id || partner.partnerUniqueId,
                name: partner.name || partner.partnerName,
                profilePic: partner.profilePic || partner.img || partner.partnerImg
            } as any,
            unreadCount: 0
        };
        setSelectedConversation(conv);
    };

    const handleBlock = async (partnerId: string, displayName: string) => {
        if (!confirm(`Block ${displayName}? They will no longer be able to contact you.`)) return;
        try {
            const partner = { id: partnerId, role: (selectedConversation?.advocate as any)?.role || 'advocate', name: displayName };
            await handleInteraction(partner, 'block');
            setSelectedConversation(null);
            // queries invalidated by hook
        } catch (e) {
            // error handled
        }
    };

    const handleReport = async (partnerId: string) => {
        const reason = prompt("Please provide a reason for reporting this user:");
        if (!reason) return;
        try {
            const partner = { id: partnerId, role: (selectedConversation?.advocate as any)?.role || 'advocate' };
            await handleInteraction(partner, 'report', { reason });
            setIsMoreOpen(false);
        } catch (e) {
            // error handled
        }
    };

    const handleAddContact = async (partnerId: string, displayName: string) => {
        try {
            const partner = { id: partnerId, role: (selectedConversation?.advocate as any)?.role || 'advocate', name: displayName };
            await handleInteraction(partner, 'shortlist');
        } catch (e) {
            // error handled
        }
    };

    const handleDeleteChat = async () => {
        if (!confirm("Remove this conversation from your list? This won't delete it for the other person.")) return;
        // Logic to clear conversation locally or via activity
        setSelectedConversation(null);
    };

    const handleViewCallHistory = async (partnerId: string) => {
        setPopupLoading(true);
        setSelectedCallPartnerId(partnerId);
        try {
            const history = await callService.getCallHistory(partnerId); // This might fetch all history for that person, let's filter or ask service for partner history
            // Better: Filter existing callHistory if it's already there or fetch specifically for this relationship
            // For now, let's assume getCallHistory(myId) was already called, but we want partner specific.
            // Let's refine the API or filter here.
            const partnerHistory = callHistory.filter((c: any) =>
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
        const rawName = activeConv?.advocate.name || selectedAdvocate?.name || 'User';
        const rawId = activeConv?.advocate.unique_id || selectedAdvocate?.unique_id || '---';
        const displayName = canShowFull ? rawName : maskContactInfo(rawName);
        const displayId = canShowFull ? rawId : maskContactInfo(rawId);

        return (
            <div className={styles.fullChatContainer}>
                <header className={styles.chatHeader}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backBtn} onClick={handleBack}>
                            <ArrowLeft size={20} />
                        </button>
                        <div className={styles.profileClickArea} onClick={() => setSelectedProfileId(String(activeConv?.advocate.id || selectedAdvocate?.id))}>
                            <div className={styles.avatarMini}>
                                {rawName.charAt(0)}
                            </div>
                            <div className={styles.headerInfo}>
                                <h3>{displayName}</h3>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {displayId}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <button className={styles.headerActionBtn} onClick={() => handleCall(String(activeConv?.advocate.id || selectedAdvocate?.id), 'audio')} title="Voice Call">
                            <Phone size={18} />
                        </button>
                        <button className={styles.headerActionBtn} onClick={() => handleCall(String(activeConv?.advocate.id || selectedAdvocate?.id), 'video')} title="Video Call">
                            <Video size={18} />
                        </button>

                        <div className={styles.moreWrapper}>
                            <button className={styles.headerActionBtn} onClick={() => setIsMoreOpen(!isMoreOpen)}>
                                <MoreVertical size={18} />
                            </button>

                            {isMoreOpen && (
                                <div className={styles.dropdown}>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Profile link copied!');
                                        setIsMoreOpen(false);
                                    }}>Share Profile</button>
                                    <button onClick={() => handleAddContact(String(activeConv?.advocate.id || selectedAdvocate?.id), displayName)}>Add to Contacts</button>
                                    <button onClick={handleDeleteChat}>Delete Chat</button>
                                    <button onClick={() => handleBlock(String(activeConv?.advocate.id || selectedAdvocate?.id), displayName)} className={styles.blockBtn}>Block User</button>
                                    <button onClick={() => handleReport(String(activeConv?.advocate.id || selectedAdvocate?.id))}>Report User</button>
                                </div>
                            )}
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
                return acceptedConversations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3>No active chats</h3>
                        <p>When you start messaging, they will appear here.</p>
                    </div>
                ) : (
                    <div className={styles.conversationList}>
                        {acceptedConversations.map(conv => (
                            <div
                                key={conv.advocate.unique_id}
                                className={styles.convItem}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <img
                                    src={formatImageUrl((conv.advocate as any).profilePic || (conv.advocate as any).img)}
                                    alt={conv.advocate.name}
                                    className={`${styles.convAvatar} ${conv.advocate.isBlur ? styles.blurredAvatar : ''}`}
                                />
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(String(conv.advocate.id), e); }} style={{ cursor: 'pointer' }}>
                                            {canShowFull ? conv.advocate.name : maskContactInfo(conv.advocate.name || '')}
                                        </h4>
                                        <span className={styles.convTime}>
                                            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span onClick={(e) => { e.stopPropagation(); handleClientClick(String(conv.advocate.id), e); }} style={{ cursor: 'pointer' }}>
                                            {canShowFull ? (conv.advocate.unique_id || 'ID: N/A') : maskContactInfo(conv.advocate.unique_id || 'N/A')}
                                        </span>
                                        {conv.advocate.location && conv.advocate.location !== 'N/A' && (
                                            <>
                                                <span>•</span>
                                                <span>{conv.advocate.location}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className={styles.convMsgRow}>
                                        <p className={styles.lastMsg}>{conv.lastMessage?.text || 'Chat active'}</p>
                                        {conv.unreadCount > 0 && (
                                            <div className={styles.unreadBadge}>
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
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
                                    src={formatImageUrl(act.partnerImg)}
                                    className={`${styles.convAvatar} ${act.isBlur ? styles.blurredAvatar : ''}`}
                                    alt={act.partnerName}
                                />
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(act.advocateId || act.receiver, e); }} style={{ cursor: 'pointer' }}>
                                            {canShowFull ? act.partnerName : maskContactInfo(act.partnerName || '')}
                                        </h4>
                                        <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.convSub}>
                                        <span onClick={(e) => { e.stopPropagation(); handleClientClick(act.advocateId || act.receiver, e); }} style={{ cursor: 'pointer' }}>
                                            {canShowFull ? act.partnerUniqueId : maskContactInfo(act.partnerUniqueId || '')}
                                        </span>
                                        <span>•</span>
                                        <span style={{ color: act.type === 'superInterest' ? '#facc15' : '#38bdf8', fontWeight: 'bold' }}>
                                            {act.type === 'superInterest' ? 'SUPER INTEREST' : act.type.toUpperCase()}
                                        </span>
                                    </div>
                                    {act.lastMessage?.text && (
                                        <p className={styles.lastMsg} style={{ color: '#e2e8f0', marginTop: '4px' }}>
                                            {act.lastMessage.text}
                                        </p>
                                    )}
                                </div>
                                <button className={styles.deleteBtn} onClick={(e) => handleDeleteActivity(act._id, e)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'received':
                let listToRender: any[] = [];
                let isRequestList = true;

                if (receivedFilter === 'chats') {
                    listToRender = acceptedConversations;
                    isRequestList = false;
                } else {
                    // Show all pending requests for 'All' or 'Interest with Message'
                    // This fixes the issue where items were disappearing due to missing message bubbles
                    listToRender = receivedInterests;
                }

                return (
                    <div className={styles.receivedSection}>
                        <div className={styles.filterBarRow}>
                            <div className={styles.controlGroup}>
                                <button
                                    className={`${styles.filterBtn} ${receivedFilter === 'all' ? styles.filterBtnActive : ''}`}
                                    onClick={() => setReceivedFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${receivedFilter === 'message' ? styles.filterBtnActive : ''}`}
                                    onClick={() => setReceivedFilter('message')}
                                >
                                    Interest with Message
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${receivedFilter === 'chats' ? styles.filterBtnActive : ''}`}
                                    onClick={() => setReceivedFilter('chats')}
                                >
                                    Chats
                                </button>
                            </div>
                        </div>

                        {listToRender.length === 0 ? (
                            <div className={styles.emptyState}>
                                <MessageSquare size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                                <h3>No matching {receivedFilter === 'chats' ? 'chats' : 'requests'}</h3>
                                <p>{receivedFilter === 'chats' ? 'Accepted chats will appear here.' : 'Try changing your filter settings.'}</p>
                            </div>
                        ) : (
                            <div className={styles.conversationList}>
                                {listToRender.map((item: any) => {
                                    if (receivedFilter === 'chats') {
                                        // Render like Accepted Chat
                                        const conv = item as Conversation;
                                        const partnerId = String(conv.advocate.id || (conv.advocate as any)._id);
                                        return (
                                            <div
                                                key={conv.advocate.unique_id || partnerId}
                                                className={styles.convItem}
                                                onClick={() => handleSelectConversation(conv)}
                                            >
                                                <img
                                                    src={formatImageUrl((conv.advocate as any).profilePic || (conv.advocate as any).img)}
                                                    alt={conv.advocate.name}
                                                    className={`${styles.convAvatar} ${conv.advocate.isBlur ? styles.blurredAvatar : ''}`}
                                                />
                                                <div className={styles.convDetails}>
                                                    <div className={styles.convTitleRow}>
                                                        <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(partnerId, e); }} style={{ cursor: 'pointer' }}>
                                                            {canShowFull ? conv.advocate.name : maskContactInfo(conv.advocate.name || '')}
                                                        </h4>
                                                        <span className={styles.convTime}>
                                                            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                    <div className={styles.convSub}>
                                                        <span onClick={(e) => { e.stopPropagation(); handleClientClick(partnerId, e); }} style={{ cursor: 'pointer' }}>
                                                            {canShowFull ? (conv.advocate.unique_id || 'ID: N/A') : maskContactInfo(conv.advocate.unique_id || 'N/A')}
                                                        </span>
                                                        <span>•</span>
                                                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>ACCEPTED CHAT</span>
                                                    </div>
                                                    <div className={styles.convMsgRow}>
                                                        <p className={styles.lastMsg}>{conv.lastMessage?.text || 'Chat active'}</p>
                                                        {conv.unreadCount > 0 && (
                                                            <div className={styles.unreadBadge}>
                                                                {conv.unreadCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Render like Pending Request
                                        const act = item;
                                        const actId = String(act._id || act.id);
                                        if (!actId || actId === 'undefined') return null;

                                        return (
                                            <div key={actId} className={styles.convItem} onClick={() => handleOpenChat({
                                                id: act.clientId || act.sender,
                                                unique_id: act.partnerUniqueId,
                                                name: act.partnerName,
                                                img: act.partnerImg,
                                                role: act.partnerRole
                                            })}>
                                                <img
                                                    src={formatImageUrl(act.partnerImg)}
                                                    className={`${styles.convAvatar} ${act.isBlur ? styles.blurredAvatar : ''}`}
                                                    alt={act.partnerName}
                                                />
                                                <div className={styles.convDetails}>
                                                    <div className={styles.convTitleRow}>
                                                        <h4 onClick={(e) => { e.stopPropagation(); handleClientClick(act.clientId || act.sender, e); }} style={{ cursor: 'pointer' }}>
                                                            {canShowFull ? act.partnerName : maskContactInfo(act.partnerName || '')}
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
                                                            {canShowFull ? act.partnerUniqueId : maskContactInfo(act.partnerUniqueId || '')}
                                                        </span>
                                                        <span>•</span>
                                                        <span style={{ color: act.type === 'super-interest' ? '#facc15' : '#38bdf8', fontWeight: 'bold' }}>
                                                            {act.type === 'super-interest' ? 'SUPER INTEREST' : act.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    {act.lastMessage?.text && (
                                                        <p className={styles.lastMsg} style={{ color: '#e2e8f0', marginTop: '4px' }}>
                                                            {act.lastMessage.text}
                                                        </p>
                                                    )}
                                                    <div className={styles.actButtons}>
                                                        <button className={styles.acceptBtn} onClick={(e) => { e.stopPropagation(); handleResponse(actId, 'accepted', e); }}>Accept</button>
                                                        <button className={styles.declineBtn} onClick={(e) => { e.stopPropagation(); handleResponse(actId, 'declined', e); }}>Ignore</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                    </div>
                );
            case 'calls':
                const filteredCalls = callHistory.filter((call: any) => {
                    const matchesTab = callsSubTab === 'all' ? true : (callsSubTab === 'sent' ? call.isSender : !call.isSender);
                    const matchesFilter = callsFilter === 'all' || call.type === callsFilter;
                    return matchesTab && matchesFilter;
                });

                return (
                    <div className={styles.callsSection}>
                        <div className={styles.callsControlsRow}>
                            <div className={styles.controlGroup}>
                                <button
                                    className={`${styles.subTab} ${callsSubTab === 'all' ? styles.subTabActive : ''}`}
                                    onClick={() => setCallsSubTab('all')}
                                >
                                    All
                                </button>
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
                                {filteredCalls.map((call: any) => (
                                    <div key={call._id} className={styles.convItem}>
                                        <img
                                            src={formatImageUrl(call.partnerDetails.image_url)}
                                            className={styles.convAvatar}
                                            alt={call.partnerDetails.name}
                                            onClick={(e) => handleClientClick(String(call.partnerDetails._id), e)}
                                        />
                                        <div className={styles.convDetails} onClick={(e) => handleClientClick(String(call.partnerDetails._id), e)}>
                                            <div className={styles.convTitleRow}>
                                                <h4>{isPremium ? call.partnerDetails.name : maskContactInfo(call.partnerDetails.name || '')}</h4>
                                                <span className={styles.convTime}>{new Date(call.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className={styles.convSub}>
                                                <span>{isPremium ? call.partnerDetails.unique_id : maskContactInfo(call.partnerDetails.unique_id || '')}</span>
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
                <DetailedProfileEnhanced
                    profileId={selectedProfileId}
                    onClose={() => setSelectedProfileId(null)}
                    backToProfiles={() => setSelectedProfileId(null)}
                    items={(() => {
                        if (activeTab === 'sent') return sentInterests;
                        if (activeTab === 'received') {
                            return receivedFilter === 'chats' ? acceptedConversations : receivedInterests;
                        }
                        return activeTab === 'accepted' ? acceptedConversations : undefined;
                    })()}
                    currentIndex={(() => {
                        let list: any[] = [];
                        if (activeTab === 'sent') list = sentInterests;
                        else if (activeTab === 'received') list = receivedFilter === 'chats' ? acceptedConversations : receivedInterests;
                        else if (activeTab === 'accepted') list = acceptedConversations;

                        if (!list.length) return undefined;
                        return list.findIndex(item => {
                            // Unified ID check
                            const pid = item.advocate ? String(item.advocate.id) : (item.clientId || item.sender || item.advocateId || item.receiver);
                            return String(pid) === String(selectedProfileId);
                        });
                    })()}
                    onNavigate={(idx) => {
                        let list: any[] = [];
                        if (activeTab === 'sent') list = sentInterests;
                        else if (activeTab === 'received') list = receivedFilter === 'chats' ? acceptedConversations : receivedInterests;
                        else if (activeTab === 'accepted') list = acceptedConversations;

                        if (list && list[idx]) {
                            const item = list[idx];
                            // Unified ID extraction
                            const pid = item.advocate ? String(item.advocate.id) : (item.clientId || item.sender || item.advocateId || item.receiver);
                            if (pid) setSelectedProfileId(String(pid));
                        }
                    }}
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
                                    {partnerCallHistory.map((call: any, idx: number) => (
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
