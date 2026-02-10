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
    MapPin,
    Lock,
    Star
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { advocateService, clientService } from '../../../services/api'; // Added this line
import { interactionService } from '../../../services/interactionService';
import { useCall } from '../../../context/CallContext';
import type { Message } from '../../../services/interactionService';
import type { Advocate } from '../../../types';

import PremiumTryonModal from './PremiumTryonModal';
import { formatImageUrl } from '../../../utils/imageHelper';

interface ChatPopupProps {
    advocate: any; // Relaxed type to handle both Advocate and Client profiles efficiently
    onClose: () => void;
    onSent?: () => void;
}

// Robust helper to extract the correct User ID for signaling/sockets
const resolveUserId = (entity: any) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    const uid = entity.userId?._id || entity.userId || entity._id || entity.id;
    return String(uid);
};

const ChatPopup: React.FC<ChatPopupProps> = ({ advocate: initialAdvocate, onClose, onSent }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [advocate, setAdvocate] = useState<any>(initialAdvocate);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);
    const [interactionStatus, setInteractionStatus] = useState<'none' | 'interest' | 'superInterest'>('none');
    const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();

    // Plan check
    const plan = (user?.plan || 'Free').toLowerCase();
    const isPremium = user?.isPremium || (plan !== 'free' && plan !== '');

    const currentUserId = String(user?.id);
    const partnerUserId = resolveUserId(advocate);
    const isOwner = currentUserId === partnerUserId;

    // Fetch Full Profile if missing data (like exp or if it's a placeholder)
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (!partnerUserId) return;

            // If it looks like a placeholder ID or is missing experience/location, fetch full
            const needsFetch = !advocate.experience || !advocate.location || advocate.unique_id === 'ADV-100001';

            if (needsFetch && !isLoadingProfile) {
                setIsLoadingProfile(true);
                try {
                    console.log('[ChatPopup] Fetching full profile for:', partnerUserId);
                    // Try advocate first
                    const res = await advocateService.getAdvocateById(partnerUserId);
                    if (res.data.success && res.data.advocate) {
                        setAdvocate(res.data.advocate);
                    } else {
                        // Try client
                        const cRes = await clientService.getClientById(partnerUserId);
                        if (cRes.data.success && cRes.data.client) {
                            setAdvocate({ ...cRes.data.client, role: 'client' });
                        }
                    }
                } catch (e) {
                    console.error('[ChatPopup] Profile fetch failed', e);
                } finally {
                    setIsLoadingProfile(false);
                }
            }
        };

        fetchFullProfile();
    }, [partnerUserId, advocate.experience, advocate.location, advocate.unique_id, isLoadingProfile]); // Added dependencies

    const fetchMsgs = async (silent = false) => {
        if (!currentUserId || !partnerUserId) return;
        try {
            const msgs = await interactionService.getConversationMessages(currentUserId, partnerUserId, currentUserId);
            // Only update if length changed to prevent flicker, or if last message is different
            if (msgs.length !== messages.length || (msgs.length > 0 && msgs[msgs.length - 1].text !== messages[messages.length - 1]?.text)) {
                setMessages(msgs);
                if (!silent) {
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            }
        } catch (error) {
            console.error('[ChatPopup] Error fetching messages:', error);
        }
    };

    const fetchStatus = async () => {
        if (!currentUserId || !partnerUserId) return;
        try {
            const activities = await interactionService.getAllActivities(currentUserId);
            // Find activity with this partner
            const act = activities.find((a: any) =>
                (a.receiver === partnerUserId || a.sender === partnerUserId) &&
                ['interest', 'superInterest', 'super-interest', 'shortlist', 'chat'].includes(a.type)
            );

            if (act) {
                setActiveActivityId(act._id || act.id);
                if (act.type.includes('super')) setInteractionStatus('superInterest');
                else if (act.type === 'interest') setInteractionStatus('interest');
            } else {
                setInteractionStatus('none');
            }
        } catch (error) {
            console.error('[ChatPopup] Error fetching status:', error);
        }
    };

    useEffect(() => {
        if (user && advocate) {
            fetchMsgs();
            fetchStatus();

            // REAL-TIME POLLING: refresh every 3 seconds
            const interval = setInterval(() => fetchMsgs(true), 3000);
            return () => clearInterval(interval);
        }
    }, [user, partnerUserId]); // Changed dependency from advocate to partnerUserId

    useEffect(() => {
        // Scroll to bottom when messages update
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageText.trim() || !currentUserId || !partnerUserId || isSending) return;

        setIsSending(true);
        try {
            // 1. Send Message
            const sentMsg = await interactionService.sendMessage(currentUserId, partnerUserId, messageText);
            setMessages((prev: Message[]) => [...prev, sentMsg]);
            setMessageText("");

            // 2. Record activity (silent)
            const targetRole = advocate.role === 'client' ? 'client' : 'advocate';
            const targetProfileId = String(advocate.id || advocate._id);
            interactionService.recordActivity(targetRole, targetProfileId, 'chat', currentUserId)
                .then(res => {
                    if (res && res.coins !== undefined) {
                        refreshUser({ coins: res.coins, coinsUsed: res.coinsUsed, coinsReceived: res.coinsReceived });
                    }
                })
                .catch(err => console.warn('[ChatPopup] Activity recording failed', err));

            if (onSent) onSent();
        } catch (error) {
            console.error('[ChatPopup] Error sending message:', error);
            alert('Message delivery failed. Please check your connection.');
        } finally {
            setIsSending(false);
        }
    };

    const handleSendInterest = async () => {
        const action = interactionStatus === 'interest' ? 'superInterest' : 'interest';
        const targetRole = advocate.role === 'client' ? 'client' : 'advocate';
        const targetProfileId = String(advocate.id || advocate._id);

        try {
            const res = await interactionService.recordActivity(targetRole, targetProfileId, action, currentUserId);
            if (res) {
                if (res.coins !== undefined) {
                    refreshUser({ coins: res.coins, coinsUsed: res.coinsUsed, coinsReceived: res.coinsReceived });
                }
                setInteractionStatus(action);
                fetchStatus(); // Refresh to get the activity ID
                alert(`${action === 'superInterest' ? 'Super Interest' : 'Interest'} sent successfully!`);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleWithdrawInterest = async () => {
        if (!activeActivityId) return;
        if (!confirm("Are you sure you want to withdraw or delete this interest?")) return;

        try {
            await interactionService.deleteActivity(activeActivityId);
            setInteractionStatus('none');
            setActiveActivityId(null);
            alert("Interaction removed."); // Changed alert message
        } catch (e) {
            alert("Failed to remove interaction."); // Changed alert message
        }
    };

    const handleCall = (type: 'audio' | 'video') => {
        if (!isPremium) {
            setShowTrialModal(true);
            return;
        }
        if (!partnerUserId) return alert("User unreachable");
        initiateCall(partnerUserId, type);
    };

    const handleBlock = async () => {
        if (!confirm(`Block ${displayName}? They will no longer be able to contact you.`)) return;
        try {
            const targetProfileId = String(advocate.id || advocate._id);
            const targetRole = advocate.role === 'client' ? 'client' : 'advocate';
            await interactionService.recordActivity(targetRole, targetProfileId, 'block', currentUserId);
            alert("User blocked successfully."); // Changed alert message
            onClose();
        } catch (e) {
            alert("Block failed. Please try again."); // Changed alert message
        }
    };

    const handleReport = async () => {
        const reason = prompt("Please provide a reason for reporting this user:");
        if (!reason) return;
        try {
            const targetProfileId = String(advocate.id || advocate._id);
            const targetRole = advocate.role === 'client' ? 'client' : 'advocate';
            await interactionService.recordActivity(targetRole, targetProfileId, 'report', currentUserId);
            alert("User reported. Our team will investigate.");
            setIsMoreOpen(false);
        } catch (e) {
            alert("Report failed.");
        }
    };

    const handleAddContact = async () => {
        try {
            const targetProfileId = String(advocate.id || advocate._id);
            const targetRole = advocate.role === 'client' ? 'client' : 'advocate';
            await interactionService.recordActivity(targetRole, targetProfileId, 'shortlist', currentUserId);
            alert(`${displayName} added to your contacts/shortlist.`);
        } catch (e) {
            alert("Failed to add contact.");
        }
    };

    const handleDeleteChat = async () => {
        if (!confirm("Remove this conversation from your list? This won't delete it for the other person.")) return;
        // Currently we delete the 'chat' activity if it exists
        if (activeActivityId) {
            try {
                await interactionService.deleteActivity(activeActivityId);
                onClose();
            } catch (e) { alert("Failed to delete."); }
        } else {
            onClose();
        }
    };

    // Safe extraction of display fields
    const displayName = advocate.name || (advocate.firstName ? `${advocate.firstName} ${advocate.lastName}` : "Member");
    const displayImage = advocate.image_url || advocate.profilePic || advocate.img || "/default-avatar.png";
    const displayId = advocate.unique_id || advocate.partnerUniqueId || "---";
    const isClient = advocate.role === 'client' || !!advocate.legalHelp;

    const locationStr = isClient
        ? (advocate.location?.city || advocate.location || 'Location N/A')
        : (advocate.location || 'Location N/A');

    const expStr = !isClient ? (advocate.experience || 'N/A') : null;
    const specStr = isClient
        ? (advocate.legalHelp?.specialization || 'General')
        : (Array.isArray(advocate.specialties) ? advocate.specialties[0] : (advocate.specialties || 'General'));

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={onClose}>
                        <ChevronLeft size={24} />
                    </button>
                    <img
                        src={formatImageUrl(displayImage)}
                        alt={displayName}
                        className={`${styles.avatar} ${!isPremium ? styles.blurredAvatar : ''}`}
                        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60")}
                    />
                    <div className={styles.titleInfo}>
                        <h3 title={displayName}>{displayName}</h3>
                        <div className={styles.idStatusRow}>
                            <span className={`${styles.uniqueId} ${!isPremium ? styles.blurredText : ''}`}>{displayId}</span>
                            <span className={styles.status} style={{ color: '#10b981' }}>• Online</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn} onClick={handleAddContact} title="Add to Contacts">
                            <UserPlus size={18} />
                        </button>
                        <div className={styles.moreWrapper}>
                            <button className={styles.actionBtn} onClick={() => setIsMoreOpen(!isMoreOpen)}>
                                <MoreVertical size={18} />
                            </button>
                            {isMoreOpen && (
                                <div className={styles.dropdown}>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Profile link copied!');
                                        setIsMoreOpen(false);
                                    }}>Share Profile</button>
                                    <button onClick={handleDeleteChat}>Delete Chat</button>
                                    <button onClick={handleBlock} className={styles.blockBtn}>Block User</button>
                                    <button onClick={handleReport}>Report User</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className={styles.detailsSection}>
                    <div className={styles.detailsList}>
                        {expStr && <div className={styles.detailItem}>{expStr} Exp</div>}
                        <div className={styles.detailItem}>{specStr}</div>
                        <div className={styles.detailItem}>
                            <MapPin size={10} style={{ marginRight: 4 }} />
                            {locationStr}
                        </div>
                    </div>

                    <div className={styles.quickActionsRow}>
                        {interactionStatus !== 'superInterest' ? (
                            <button className={styles.sendInterestBtn} onClick={handleSendInterest}>
                                <Mail size={18} />
                                {interactionStatus === 'none' ? 'Send Interest' : 'Send Super Interest'}
                            </button>
                        ) : (
                            <button className={styles.sendInterestBtn} style={{ background: '#ef4444' }} onClick={handleWithdrawInterest}>
                                <X size={18} />
                                Delete Interest
                            </button>
                        )}

                        <button className={styles.callOptionBtn} onClick={() => handleCall('audio')}>
                            <Phone size={18} />
                            <span>Audio</span>
                        </button>

                        <button className={styles.callOptionBtn} onClick={() => handleCall('video')}>
                            <Video size={18} />
                            <span>Video</span>
                        </button>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.chatArea}>
                    {messages.length === 0 && <p className={styles.emptyNotice}>No messages yet. Say hello!</p>}
                    {messages.map(msg => {
                        const isMine = msg.senderId === currentUserId;
                        const showLocked = msg.isLocked && !isPremium && !isMine;

                        return (
                            <div key={msg.id} className={isMine ? styles.myMsg : styles.theirMsg}>
                                {showLocked ? (
                                    <div className={styles.msgBubble} onClick={() => setShowTrialModal(true)} style={{ cursor: 'pointer' }}>
                                        <div className={styles.blurredMsgWrapper}>
                                            <div className={styles.blurredText}>████████████████</div>
                                            <div className={styles.lockOverlay}>
                                                <Lock size={12} />
                                                <span>Click to unlock</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.msgBubble}>
                                        <p className={styles.msgText}>{msg.text}</p>
                                        <span className={styles.msgTime}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.inputArea}>
                    {!advocate.allowChat && !isOwner ? (
                        <div className={styles.upgradeNotice} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <Lock size={16} color="#ef4444" />
                            <p style={{ color: '#ef4444' }}>Messaging has been disabled by this user.</p>
                        </div>
                    ) : isPremium ? (
                        <>
                            <p className={styles.tipText}>Secure, end-to-end encrypted messaging.</p>
                            <form className={styles.inputWrapper} onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Write a message..."
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    disabled={isSending}
                                />
                                <button type="submit" className={styles.sendBtn} disabled={!messageText.trim() || isSending}>
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
            {showTrialModal && (
                <PremiumTryonModal onClose={() => setShowTrialModal(false)} />
            )}
        </div >
    );
};

export default ChatPopup;
