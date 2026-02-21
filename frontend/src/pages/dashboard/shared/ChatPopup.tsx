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
    Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { advocateService, clientService } from '../../../services/api'; // Added this line
import { interactionService } from '../../../services/interactionService';
import { useCall } from '../../../context/CallContext';
import { useInteractions } from '../../../hooks/useInteractions';
import type { Message } from '../../../services/interactionService';
import type { Advocate } from '../../../types';

import PremiumTryonModal from './PremiumTryonModal';
import DetailedProfileEnhanced from './DetailedProfileEnhanced';
import { formatImageUrl } from '../../../utils/imageHelper';

import SocialShareModal from '../../../components/shared/SocialShareModal';

interface ChatPopupProps {
    advocate: any; // Relaxed type to handle both Advocate and Client profiles efficiently
    onClose: () => void;
    onSent?: () => void;
}

// Robust helper to extract the correct User ID for signaling/sockets
const resolveUserId = (entity: any) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;

    // Ordered by reliability for these partial activity/messenger objects
    const uid =
        entity.partnerUserId ||
        entity.userId?._id ||
        entity.userId ||
        entity.partnerId ||
        entity._id ||
        entity.id;

    if (!uid || String(uid) === 'undefined' || String(uid) === 'null') return null;
    return String(uid);
};

const ChatPopup: React.FC<ChatPopupProps> = ({ advocate: initialAdvocate, onClose, onSent }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [advocate, setAdvocate] = useState<any>(initialAdvocate);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // Sync state with props if they change (e.g. if key remount failed or wasn't used)
    useEffect(() => {
        if (initialAdvocate) {
            setAdvocate(initialAdvocate);
        }
    }, [initialAdvocate]);

    const [showTrialModal, setShowTrialModal] = useState(false);
    const [interactionStatus, setInteractionStatus] = useState<'none' | 'interest' | 'superInterest'>('none');
    const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [showDetailedProfile, setShowDetailedProfile] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();

    // Plan check – same logic as client dashboard (Free = masked; Lite/Pro/Ultra = premium)
    const plan = (user?.plan || 'Free');
    const planLower = plan.toLowerCase();
    const isPremium = true; // Always allow chat features for free members as per request

    const currentUserId = String(user?.id);
    const partnerUserId = resolveUserId(advocate);
    const isOwner = currentUserId === partnerUserId;

    // Fetch Full Profile if missing data (like exp or if it's a placeholder)
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (!partnerUserId || partnerUserId === 'undefined' || partnerUserId === 'null') {
                console.warn('[ChatPopup] Cannot fetch: Invalid partnerUserId', partnerUserId);
                return;
            }

            // If it looks like a placeholder ID or is missing experience/location, fetch full
            const needsFetch = !advocate.experience || !advocate.location || advocate.unique_id === 'ADV-100001';

            if (needsFetch && !isLoadingProfile) {
                console.log('[ChatPopup] Triggering full profile fetch for:', partnerUserId);
                setIsLoadingProfile(true);
                try {
                    let foundData = null;
                    setProfileError(null);

                    // 1. Try advocate first
                    try {
                        const res = await advocateService.getAdvocateById(partnerUserId);
                        if (res.data.success && res.data.advocate) {
                            foundData = res.data.advocate;
                        }
                    } catch (e) {
                        console.log('[ChatPopup] Advocate record not found, trying client...', partnerUserId);
                    }

                    // 2. Try client if advocate failed
                    if (!foundData) {
                        try {
                            const cRes = await clientService.getClientById(partnerUserId);
                            if (cRes.data.success && cRes.data.client) {
                                foundData = { ...cRes.data.client, role: 'client' };
                            }
                        } catch (e) {
                            console.log('[ChatPopup] Client record not found either', partnerUserId);
                        }
                    }

                    // 3. Final Verification and State Update
                    if (foundData) {
                        const verifiedId = resolveUserId(foundData);
                        if (verifiedId === partnerUserId) {
                            console.log('[ChatPopup] Successfully fetched and verified profile:', foundData.name);
                            setAdvocate(foundData);
                        } else {
                            console.error('[ChatPopup] ID Mismatch in fetched data! Intended:', partnerUserId, 'Fetched:', verifiedId);
                            setProfileError('Security mismatch: Profile ID does not match request');
                        }
                    } else {
                        console.warn('[ChatPopup] No profile found for ID in either collection');
                        setProfileError('User profile details not found in system');
                    }
                } catch (e) {
                    console.error('[ChatPopup] Global Profile fetch crash', e);
                    setProfileError('System error loading profile details');
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
            // Mark as read when opening
            if (partnerUserId) {
                interactionService.markAsRead(currentUserId, partnerUserId);
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
                else setInteractionStatus('interest'); // Treat chat/other as 'active' to hide buttons
            } else {
                setInteractionStatus('none');
            }
        } catch (error) {
            console.error('[ChatPopup] Error fetching status:', error);
        }
    };

    useEffect(() => {
        if (user && partnerUserId) {
            fetchMsgs();
            fetchStatus();

            const handleSocketMessage = (e: any) => {
                const data = e.detail;
                if (String(data.senderId) === partnerUserId || (String(data.message.sender) === partnerUserId)) {
                    // Update messages instantly
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

                    // Mark as read
                    if (String(data.message.receiver) === currentUserId) {
                        interactionService.markAsRead(currentUserId, partnerUserId);
                    }
                }
            };

            window.addEventListener('socket-message', handleSocketMessage);
            return () => window.removeEventListener('socket-message', handleSocketMessage);
        }
    }, [user, partnerUserId]);

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


    const { handleInteraction } = useInteractions(); // Toast handled by hook if passed, but here we might want custom alerts?
    // ChatPopup uses alerts mostly. useInteractions uses showToast if provided.
    // Let's pass a wrapper for alert? or just use hook's toast if we can get it?
    // ChatPopup doesn't receive showToast prop.
    // We can use a local wrapper or just rely on the hook's return and alert locally?
    // The hook swallows errors if showToast is NOT provided? No, it re-throws.
    // Let's pass a dummy toast that logs or alerts?
    // Better: Refactor ChatPopup to use a toast context if available, or just alert.
    // For now, let's pass a simple alert wrapper to useInteractions.

    const showToastWrapper = (msg: string) => alert(msg);
    const { handleInteraction: performInteraction } = useInteractions(showToastWrapper);

    const handleWithdrawInterest = async () => {
        if (!partnerUserId) return;
        if (!confirm("Are you sure you want to withdraw or delete this interest?")) return;

        try {
            // Ensure role is present
            const profileWithRole = { ...advocate, id: partnerUserId };
            await performInteraction(profileWithRole, 'withdraw');
            setInteractionStatus('none');
            setActiveActivityId(null);
        } catch (e) {
            // Alert handled by hook wrapper
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
            const profileWithRole = { ...advocate, id: partnerUserId };
            await performInteraction(profileWithRole, 'block');
            onClose();
        } catch (e) {
            // Alert handled by hook wrapper
        }
    };

    const handleReport = async () => {
        const reason = prompt("Please provide a reason for reporting this user:");
        if (!reason) return;
        try {
            const profileWithRole = { ...advocate, id: partnerUserId };
            await performInteraction(profileWithRole, 'report', { reason });
            setIsMoreOpen(false);
        } catch (e) {
            // Alert handled by hook wrapper
        }
    };

    const handleAddContact = async () => {
        try {
            const profileWithRole = { ...advocate, id: partnerUserId };
            await performInteraction(profileWithRole, 'shortlist');
        } catch (e) {
            // Alert handled by hook wrapper
        }
    };

    const handleDeleteChat = async () => {
        if (!confirm("Remove this conversation from your list? This won't delete it for the other person.")) return;
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
    const rawName = advocate.name || (advocate.firstName ? `${advocate.firstName} ${advocate.lastName}` : "Member");
    const rawId = advocate.unique_id || advocate.partnerUniqueId || "---";
    const displayName = rawName || "Member";
    const displayId = rawId || "---";
    const displayImage = advocate.image_url || advocate.profilePic || advocate.img || "/default-avatar.png";
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
                    <div
                        className={styles.profileClickArea}
                        onClick={() => (isPremium ? setShowDetailedProfile(true) : setShowTrialModal(true))}
                    >
                        <img
                            src={formatImageUrl(displayImage)}
                            alt={displayName}
                            className={`${styles.avatar} ${!isPremium ? styles.blurredAvatar : ''}`}
                            onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60")}
                        />
                        <div className={styles.titleInfo}>
                            <h3 title={isPremium ? displayName : undefined} className={!isPremium ? styles.blurredText : ''}>
                                {displayName}
                            </h3>
                            <div className={styles.idStatusRow}>
                                <span className={`${styles.uniqueId} ${!isPremium ? styles.blurredText : ''}`}>{displayId}</span>
                                <span className={styles.status} style={{ color: profileError ? '#ef4444' : '#10b981' }}>
                                    • {profileError || 'Online'}
                                </span>
                            </div>
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
                                        setShowShareModal(true);
                                        setIsMoreOpen(false);
                                    }}>Share Profile</button>
                                    {/* <button onClick={handleDeleteChat}>Delete Chat</button> */}
                                    <button onClick={handleBlock} className={styles.blockBtn}>Block User</button>
                                    {/* <button onClick={handleReport}>Report User</button> */}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <SocialShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    url={window.location.host + '/profile/' + displayId} // Construct a shareable profile URL
                    title={`Check out ${displayName}'s profile on e-Advocate`}
                />

                <div className={styles.detailsSection}>
                    <div className={styles.detailsRow}>
                        <div className={`${styles.detailsList} ${!isPremium ? styles.blurredText : ''}`}>
                            {expStr && <div className={styles.detailItem}>{expStr} Exp</div>}
                            <div className={styles.detailItem}>{specStr}</div>
                            <div className={styles.detailItem}>
                                <MapPin size={10} className={styles.mapPinIcon} />
                                {locationStr}
                            </div>
                        </div>


                        <div className={styles.headerCallActions}>
                            <button className={styles.miniCallBtn} onClick={() => handleCall('audio')} title="Audio Call">
                                <Phone size={14} />
                                <span>Audio</span>
                            </button>
                            <button className={styles.miniCallBtn} onClick={() => handleCall('video')} title="Video Call">
                                <Video size={14} />
                                <span>Video</span>
                            </button>
                        </div>
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
                                <div className={styles.msgBubble}>
                                    <p className={styles.msgText}>{msg.text}</p>
                                    <span className={styles.msgTime}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.inputArea}>
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
                </div>
            </div >
            {showTrialModal && (
                <PremiumTryonModal onClose={() => setShowTrialModal(false)} />
            )}
            {showDetailedProfile && (
                <DetailedProfileEnhanced
                    profileId={partnerUserId}
                    backToProfiles={() => setShowDetailedProfile(false)}
                    onClose={() => setShowDetailedProfile(false)}
                    listTitle="Messenger"
                />
            )}
        </div >
    );
};

export default ChatPopup;
