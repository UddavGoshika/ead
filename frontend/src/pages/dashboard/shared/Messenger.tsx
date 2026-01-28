import React, { useState, useEffect, useRef } from "react";
import styles from "./Messenger.module.css";
import {
    Send,
    Paperclip,
    ArrowLeft,
    MessageSquare
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { interactionService } from "../../../services/interactionService";
import type { Message, Conversation } from "../../../services/interactionService";
import type { Advocate } from "../../../types";

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

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const myId = String(user.id); // Use MongoDB ID for backend
                    // 1. Get Conversations (Accepted/Ongoing)
                    const convs = await interactionService.getConversations(myId);

                    // Filter to only those with real messages for "Accepted"
                    const acceptedConvs = convs.filter(c => c.lastMessage && !c.lastMessage.id.startsWith('act-'));
                    setConversations(acceptedConvs);

                    // 2. Get Interests (Sent/Received)
                    // We can reuse getActivities here
                    const myRole = user.role;
                    const activities = await interactionService.getActivities(myRole, myId);

                    if (myRole === 'advocate') {
                        setReceivedInterests(activities.filter(a => a.type === 'interest' || a.type === 'super-interest'));
                        setSentInterests(activities.filter(a => a.type === 'message_sent'));
                    } else {
                        setSentInterests(activities.filter(a => a.type === 'interest' || a.type === 'super-interest'));
                        setReceivedInterests(activities.filter(a => a.type === 'message_sent'));
                    }

                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            fetchData();
            const interval = setInterval(fetchData, 4000);
            return () => clearInterval(interval);
        }
    }, [user]);

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
                        <div key={msg.id} className={msg.senderId === String(user?.unique_id) ? styles.myMsg : styles.theirMsg}>
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
                        <h3>No accepted chats</h3>
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
                                <div className={styles.convAvatar}>{conv.advocate.name?.charAt(0) || 'U'}</div>
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4>{conv.advocate.name}</h4>
                                        <span className={styles.convTime}>
                                            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleDateString() : ''}
                                        </span>
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
                    </div>
                ) : (
                    <div className={styles.conversationList}>
                        {sentInterests.map(act => (
                            <div key={act.id} className={styles.convItem}>
                                <div className={styles.convAvatar}>{act.advocateName.charAt(0)}</div>
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4>{act.advocateName}</h4>
                                        <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className={styles.lastMsg}>Type: {act.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'received':
                return receivedInterests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} color="#facc15" style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3>No received interests</h3>
                    </div>
                ) : (
                    <div className={styles.conversationList}>
                        {receivedInterests.map(act => (
                            <div key={act.id} className={styles.convItem}>
                                <div className={styles.convAvatar}>{act.clientName.charAt(0)}</div>
                                <div className={styles.convDetails}>
                                    <div className={styles.convTitleRow}>
                                        <h4>{act.clientName}</h4>
                                        <span className={styles.convTime}>{new Date(act.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className={styles.lastMsg}>Type: {act.type}</p>
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
        </div>
    );
};

export default Messenger;
