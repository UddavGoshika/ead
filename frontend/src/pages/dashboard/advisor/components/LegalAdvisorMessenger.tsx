import React, { useState, useEffect, useRef } from "react";
import styles from "./LegalAdvisorMessenger.module.css";
import {
    Send,
    Paperclip,
    ArrowLeft,
    MessageSquare,
    X,
    Trash2,
    Phone,
    Video,
    History,
    Info,
    MoreVertical,
    CreditCard
} from "lucide-react";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { useCall } from "../../../../context/CallContext";
import { useInteractions } from "../../../../hooks/useInteractions";
import { interactionService } from "../../../../services/interactionService";
import { callService } from "../../../../services/callService";
import type { Message, Conversation } from "../../../../services/interactionService";
import type { Advocate } from "../../../../types";
import LegalAdvisorDetailedProfile from "./LegalAdvisorDetailedProfile";
import { formatImageUrl } from "../../../../utils/imageHelper";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface MessengerProps {
    view?: 'list' | 'chat';
    selectedAdvocate?: Advocate | null;
    onBack?: () => void;
    onSelectForChat?: (advocate: Advocate) => void;
}

const LegalAdvisorMessenger: React.FC<MessengerProps> = ({ view = 'list', selectedAdvocate, onBack, onSelectForChat }) => {
    const { user } = useAuth();
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

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

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
        const activePartnerIds = new Set(allActivities
            .filter((a: any) => a.isSender && (a.status === 'pending' || a.type === 'chat'))
            .map((a: any) => String(a.receiver))
        );
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
        const activePartnerIds = new Set(allActivities
            .filter((a: any) => !a.isSender && (a.status === 'pending' || a.type === 'chat'))
            .map((a: any) => String(a.sender))
        );
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

    const { handleInteraction } = useInteractions();

    useEffect(() => {
        if (user && (selectedConversation || selectedAdvocate)) {
            const currentUserId = String(user.id);
            const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);
            const fetchMsgs = async () => {
                const msgs = await interactionService.getConversationMessages(currentUserId, partnerId, currentUserId);
                setMessages(msgs);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                await interactionService.markAsRead(currentUserId, partnerId);
                queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
            };
            fetchMsgs();
        }
    }, [user, selectedConversation, selectedAdvocate]);

    useEffect(() => {
        const handleSocketMessage = (e: any) => {
            const data = e.detail;
            const currentUserId = String(user?.id);
            const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);
            if (partnerId !== "undefined" && (String(data.senderId) === partnerId || (String(data.message.sender) === partnerId))) {
                const newMsg = {
                    id: data.message._id || data.message.id,
                    senderId: String(data.message.sender),
                    receiverId: String(data.message.receiver),
                    text: data.message.text,
                    timestamp: new Date(data.message.timestamp).getTime()
                };
                setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                if (String(data.message.receiver) === currentUserId) interactionService.markAsRead(currentUserId, partnerId);
            }
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
        };
        window.addEventListener('socket-message', handleSocketMessage);
        return () => window.removeEventListener('socket-message', handleSocketMessage);
    }, [user?.id, selectedConversation, selectedAdvocate]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
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
        if (onBack) onBack(); else setSelectedConversation(null);
    };

    const handleSelectConversation = (conv: Conversation) => {
        if (onSelectForChat) onSelectForChat(conv.advocate); else setSelectedConversation(conv);
    };

    const handleCall = async (targetUserId: string, type: 'audio' | 'video') => {
        try { await initiateCall(targetUserId, type); } catch (err) { console.error("Call failed:", err); }
    };

    const handleSendPaymentRequest = async () => {
        const amt = parseFloat(paymentAmount);
        if (isNaN(amt) || amt <= 0) return;
        const net = amt * 0.81;
        const fee = amt * 0.19;

        const msgText = `[PAYMENT_REQUEST] Amount: ₹${amt.toFixed(2)} | Platform Fee (19%): ₹${fee.toFixed(2)} | Net to Advisor: ₹${net.toFixed(2)} | Please proceed to pay.`;

        const currentUserId = String(user?.id);
        const partnerId = String(selectedConversation?.advocate.id || selectedAdvocate?.id);
        if (!currentUserId || !partnerId) return;

        const sentMsg = await interactionService.sendMessage(currentUserId, partnerId, msgText);
        setMessages(prev => [...prev, sentMsg]);

        setShowPaymentModal(false);
        setPaymentAmount('');
        queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    };

    const renderContent = () => {
        if (selectedConversation || view === 'chat') {
            const activeConv = selectedConversation;
            const displayName = activeConv?.advocate.name || selectedAdvocate?.name || 'User';
            const displayId = activeConv?.advocate.unique_id || selectedAdvocate?.unique_id || '---';

            return (
                <div className={styles.fullChatContainer}>
                    <header className={styles.chatHeader}>
                        <div className={styles.headerLeft}>
                            <button className={styles.backBtn} onClick={handleBack}><ArrowLeft size={20} /></button>
                            <div className={styles.profileClickArea} onClick={() => { setSelectedProfileId(String(activeConv?.advocate.id || selectedAdvocate?.id)); setShowDetailedProfile(true); }}>
                                <div className={styles.avatarMini}>{displayName.charAt(0)}</div>
                                <div className={styles.headerInfo}>
                                    <h3>{displayName}</h3>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {displayId}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <button className={styles.headerActionBtn} onClick={() => handleCall(String(activeConv?.advocate.id || selectedAdvocate?.id), 'audio')}><Phone size={18} /></button>
                            <button className={styles.headerActionBtn} onClick={() => handleCall(String(activeConv?.advocate.id || selectedAdvocate?.id), 'video')}><Video size={18} /></button>
                            <button className={styles.headerActionBtn} onClick={() => setIsMoreOpen(!isMoreOpen)}><MoreVertical size={18} /></button>
                        </div>
                    </header>
                    <div className={styles.chatArea}>
                        {messages.map(msg => (
                            <div key={msg.id} className={msg.senderId === String(user?.id) ? styles.myMsg : styles.theirMsg}>
                                <div className={styles.msgBubble}>
                                    {msg.text}
                                    <span className={styles.msgTime}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
                        <button type="button" className={styles.attachBtn} onClick={() => setShowPaymentModal(true)} title="Request Payment"><CreditCard size={20} /></button>
                        <button type="button" className={styles.attachBtn}><Paperclip size={20} /></button>
                        <input type="text" placeholder="Type your response..." className={styles.msgInput} value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                        <button type="submit" className={styles.sendBtn} disabled={!messageText.trim()}><Send size={20} /></button>
                    </form>
                </div>
            );
        }

        return (
            <div className={styles.container}>
                <div className={styles.tabBar}>
                    {['accepted', 'sent', 'received', 'calls'].map(tab => (
                        <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab as any)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'accepted' && (
                    <div className={styles.conversationList}>
                        {acceptedConversations.length === 0 ? (
                            <div className={styles.emptyState}><MessageSquare size={48} color="#facc15" /><h3>No active chats</h3></div>
                        ) : (
                            acceptedConversations.map(conv => (
                                <div key={conv.advocate.id} className={styles.convItem} onClick={() => handleSelectConversation(conv)}>
                                    <img src={formatImageUrl((conv.advocate as any).profilePic || (conv.advocate as any).img)} className={styles.convAvatar} alt={conv.advocate.name} />
                                    <div className={styles.convDetails}>
                                        <div className={styles.convTitleRow}>
                                            <h4 onClick={(e) => { e.stopPropagation(); setSelectedProfileId(String(conv.advocate.id)); setShowDetailedProfile(true); }}>{conv.advocate.name}</h4>
                                            <span className={styles.convTime}>{conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        </div>
                                        <div className={styles.convSub}><span>{conv.advocate.unique_id}</span><span>•</span><span>{conv.advocate.location}</span></div>
                                        <p className={styles.lastMsg}>{conv.lastMessage?.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'received' && (
                    <div className={styles.conversationList}>
                        {receivedInterests.map(act => (
                            <div key={act._id} className={styles.convItem} onClick={() => handleSelectConversation({ advocate: { id: act.sender, name: act.partnerName, unique_id: act.partnerUniqueId, profilePic: act.partnerImg } as any, unreadCount: 0 })}>
                                <img src={formatImageUrl(act.partnerImg)} className={styles.convAvatar} alt={act.partnerName} />
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}><h4>{act.partnerName}</h4><span>{new Date(act.timestamp).toLocaleDateString()}</span></div>
                                    <div className={styles.convSub}><span>{act.partnerUniqueId}</span><span>•</span><span style={{ color: '#facc15' }}>INTEREST RECEIVED</span></div>
                                    <div className={styles.actButtons}>
                                        <button className={styles.acceptBtn} onClick={(e) => { e.stopPropagation(); handleInteraction({ id: act.sender, name: act.partnerName, role: act.partnerRole || 'client' }, 'accept'); }}>Accept</button>
                                        <button className={styles.declineBtn} onClick={(e) => { e.stopPropagation(); handleInteraction({ id: act.sender, role: act.partnerRole || 'client' }, 'decline'); }}>Decline</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ height: '100%', position: 'relative' }}>
            {renderContent()}

            {showDetailedProfile && selectedProfileId && (
                <LegalAdvisorDetailedProfile
                    profileId={selectedProfileId}
                    backToProfiles={() => { setSelectedProfileId(null); setShowDetailedProfile(false); }}
                    onClose={() => { setSelectedProfileId(null); setShowDetailedProfile(false); }}
                    onSelectForChat={onSelectForChat}
                />
            )}

            {showPaymentModal && (
                <div className={styles.overlay} onClick={() => setShowPaymentModal(false)}>
                    <div className={styles.paymentModal} onClick={e => e.stopPropagation()}>
                        <h3>Request Payment <CreditCard size={18} /></h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>Enter the total amount to collect.</p>
                        <input
                            type="number"
                            className={styles.msgInput}
                            placeholder="Amount in ₹"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px' }}
                        />
                        {paymentAmount && parseFloat(paymentAmount) > 0 && (
                            <div style={{ fontSize: '13px', background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>Requested Amount:</span>
                                    <span>₹{parseFloat(paymentAmount).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#ef4444' }}>
                                    <span>Platform Fee (19%):</span>
                                    <span>₹{(parseFloat(paymentAmount) * 0.19).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#10b981', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #e2e8f0' }}>
                                    <span>Net Payable to You:</span>
                                    <span>₹{(parseFloat(paymentAmount) * 0.81).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className={styles.declineBtn} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className={styles.acceptBtn} onClick={handleSendPaymentRequest} disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}>Send Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LegalAdvisorMessenger;
