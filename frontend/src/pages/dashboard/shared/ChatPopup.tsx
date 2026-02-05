import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPopup.module.css';
import {
    ChevronLeft,
    MoreVertical,
    Phone,
    UserPlus,
    Send,
    Mail,
    Video,
    X,
    Shield,
    MapPin
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import { useCall } from '../../../context/CallContext';
import type { Message } from '../../../services/interactionService';
import type { Advocate } from '../../../types';

interface ChatPopupProps {
    advocate: any; // Relaxed type to handle both Advocate and Client profiles efficiently
    onClose: () => void;
    onSent?: () => void;
}

// Robust helper to extract the correct User ID for signaling/sockets
const resolveUserId = (entity: any) => {
    if (!entity) return null;
    // If populated user object with _id
    if (typeof entity.userId === 'object' && entity.userId?._id) return entity.userId._id;
    // If string userId
    if (typeof entity.userId === 'string') return entity.userId;
    // Fallback to direct id if it mimics user id (less reliable but possible)
    if (entity.id) return entity.id;
    return null;
};

const ChatPopup: React.FC<ChatPopupProps> = ({ advocate, onClose, onSent }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [interactionStatus, setInteractionStatus] = useState<'none' | 'interest' | 'superInterest'>('none');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();

    // Plan check
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    useEffect(() => {
        if (user && advocate) {
            const currentUserId = String(user.id);
            const partnerUserId = resolveUserId(advocate);

            console.log('[ChatPopup] Initializing chat with:', advocate.name);
            console.log('[ChatPopup] Resolved Partner UserID:', partnerUserId);

            if (!partnerUserId) {
                console.error('[ChatPopup] Failed to resolve partner User ID');
                return;
            }

            const fetchMsgs = async () => {
                try {
                    const msgs = await interactionService.getConversationMessages(currentUserId, partnerUserId);
                    setMessages(msgs);
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                } catch (error) {
                    console.error('[ChatPopup] Error fetching messages:', error);
                }
            };

            const fetchStatus = async () => {
                try {
                    const activities = await interactionService.getAllActivities(currentUserId);
                    const isSuper = activities.find((a: any) => a.receiver === partnerUserId && a.type === 'superInterest');
                    if (isSuper) {
                        setInteractionStatus('superInterest');
                    } else {
                        const isInt = activities.find((a: any) => a.receiver === partnerUserId && a.type === 'interest');
                        if (isInt) setInteractionStatus('interest');
                        else setInteractionStatus('none');
                    }
                } catch (error) {
                    console.error('[ChatPopup] Error fetching status:', error);
                }
            };

            fetchMsgs();
            fetchStatus();
        }
    }, [user, advocate]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const currentUserId = String(user?.id);
        const partnerUserId = resolveUserId(advocate);

        if (!messageText.trim() || !currentUserId || !partnerUserId) return;

        try {
            const sentMsg = await interactionService.sendMessage(currentUserId, partnerUserId, messageText);
            setMessages((prev: Message[]) => [...prev, sentMsg]);
            setMessageText("");
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

            // Record activity for stats
            const targetRole = advocate.role === 'client' ? 'client' : 'advocate';
            // Use profile ID for activity recording if available, else fallback
            const targetProfileId = String(advocate.id);

            const res = await interactionService.recordActivity(targetRole, targetProfileId, 'chat', currentUserId);

            if (res && res.coins !== undefined) {
                refreshUser({
                    coins: res.coins,
                    coinsUsed: res.coinsUsed,
                    coinsReceived: res.coinsReceived
                });
            }

            if (onSent) onSent();
        } catch (error) {
            console.error('[ChatPopup] Error sending message:', error);
            alert('Failed to send message.');
        }
    };

    const handleSendInterest = async () => {
        const currentUserId = String(user?.id);
        const targetProfileId = String(advocate.id);
        const action = interactionStatus === 'interest' ? 'superInterest' : 'interest';
        const targetRole = advocate.role === 'client' ? 'client' : 'advocate';

        try {
            const res = await interactionService.recordActivity(targetRole, targetProfileId, action, currentUserId);
            if (res) {
                if (res.coins !== undefined) {
                    refreshUser({
                        coins: res.coins,
                        coinsUsed: res.coinsUsed,
                        coinsReceived: res.coinsReceived
                    });
                }
                setInteractionStatus(action);
                alert(`${action === 'superInterest' ? 'Super Interest' : 'Interest'} sent!`);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };


    const handleCall = () => {
        const partnerUserId = resolveUserId(advocate);
        if (!partnerUserId) {
            alert("Cannot initiate call: User ID not found.");
            return;
        }
        initiateCall(partnerUserId, 'audio');
    };

    const handleVideoCall = () => {
        const partnerUserId = resolveUserId(advocate);
        if (!partnerUserId) {
            alert("Cannot initiate call: User ID not found.");
            return;
        }
        initiateCall(partnerUserId, 'video');

    };

    const handleAddContact = () => {
        alert(`${advocate.name || 'User'} added to contacts.`);
    };

    const handleBlock = () => {
        if (confirm(`Are you sure you want to block ${advocate.name || 'this user'}?`)) {
            alert(`${advocate.name || 'User'} has been blocked.`);
            onClose();
        }
        setIsMoreOpen(false);
    };

    // Safe extraction of display fields
    const displayName = !isPremium ? "Premium User" : (advocate.name || `${advocate.firstName || ''} ${advocate.lastName || ''}`.trim() || 'User');
    const displayImage = !isPremium ? "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60" : (advocate.image_url || "/default-avatar.png");
    const displayId = advocate.isMasked || !isPremium
        ? (advocate.display_id || (advocate.unique_id && advocate.unique_id.substring(0, 2) + "..."))
        : advocate.unique_id;

    const isClient = advocate.role === 'client';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={onClose}>
                        <ChevronLeft size={24} />
                    </button>
                    <img
                        src={displayImage}
                        alt={displayName}
                        className={`${styles.avatar} ${!isPremium ? styles.blurredAvatar : ''}`}
                        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60")}
                    />
                    <div className={styles.titleInfo}>
                        <h3>{displayName}</h3>
                        <div className={styles.idStatusRow}>
                            <span className={styles.uniqueId}>{displayId}</span>
                            <span className={styles.status}>• Online</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn} onClick={handleAddContact} title="Add Contact">
                            <UserPlus size={18} />
                        </button>
                        <div className={styles.moreWrapper}>
                            <button className={styles.actionBtn} onClick={() => setIsMoreOpen(!isMoreOpen)}>
                                <MoreVertical size={18} />
                            </button>
                            {isMoreOpen && (
                                <div className={styles.dropdown}>
                                    <button onClick={() => alert('Profile shared')}>Share Profile</button>
                                    <button onClick={async () => {
                                        if (confirm("Delete this conversation?")) {
                                            alert("Conversation deleted.");
                                            onClose();
                                        }
                                    }}>Delete Chat</button>
                                    <button onClick={handleBlock} className={styles.blockBtn}>Block User</button>
                                    <button onClick={() => alert('Reported')}>Report User</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className={styles.detailsSection}>
                    <div className={styles.detailsList}>
                        {!isClient && (
                            <>
                                <div className={styles.detailItem}>{advocate.experience || 'N/A'} Exp</div>
                                <div className={styles.detailItem}>
                                    {Array.isArray(advocate.specialties) ? advocate.specialties[0] : (advocate.specialties || 'General')}
                                </div>
                            </>
                        )}
                        {isClient && (
                            <>
                                <div className={styles.detailItem}>
                                    <Shield size={10} style={{ marginRight: 4 }} />
                                    {advocate.legalHelp?.specialization || 'General Legal'}
                                </div>
                                <div className={styles.detailItem}>
                                    {advocate.legalHelp?.category || 'Legal Assistance'}
                                </div>
                            </>
                        )}
                        <div className={styles.detailItem}>
                            <MapPin size={10} style={{ marginRight: 4 }} />
                            {isClient
                                ? (advocate.location?.city || advocate.location || 'Unknown')
                                : (advocate.location || 'Unknown')}
                        </div>
                    </div>

                    <div className={styles.quickActionsRow}>
                        {interactionStatus !== 'superInterest' ? (
                            <button className={styles.sendInterestBtn} onClick={handleSendInterest}>
                                <Mail size={18} />
                                {interactionStatus === 'none' ? 'Send Interest' : 'Send Super Interest'}
                            </button>
                        ) : (
                            <button className={styles.sendInterestBtn} style={{ background: '#ef4444' }} onClick={async () => {
                                if (confirm("Withdraw your Super Interest?")) {
                                    alert("Interest withdrawn");
                                    setInteractionStatus('interest');
                                }
                            }}>
                                <X size={18} />
                                Delete
                            </button>
                        )}

                        <button className={styles.callOptionBtn} onClick={handleCall}>
                            <Phone size={18} />
                            <span>Audio</span>
                        </button>

                        <button className={styles.callOptionBtn} onClick={handleVideoCall}>
                            <Video size={18} />
                            <span>Video</span>
                        </button>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.chatArea}>
                    {messages.length === 0 && <p className={styles.emptyNotice}>No messages yet. Send a message to start.</p>}
                    {messages.map(msg => {
                        const isMine = msg.senderId === String(user?.id);
                        const showLocked = msg.isLocked && !isPremium && !isMine;

                        return (
                            <div key={msg.id} className={isMine ? styles.myMsg : styles.theirMsg}>
                                {showLocked ? (
                                    <span className={styles.lockedMsg}>Message locked. Upgrade to view.</span>
                                ) : msg.text}
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.inputArea}>
                    {isPremium ? (
                        <>
                            <p className={styles.tipText}>Secure, end-to-end encrypted messaging.</p>
                            <form className={styles.inputWrapper} onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Write a message..."
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                />
                                <button type="submit" className={styles.sendBtn}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={styles.upgradeNotice}>
                            <p>Upgrade to Premium to reply and view full content.</p>
                            <button className={styles.miniUpgradeBtn} onClick={() => window.location.href = '/dashboard?page=upgrade'}>Upgrade Now</button>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default ChatPopup;
