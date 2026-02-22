import React, { useState, useEffect, useRef } from 'react';
import styles from './ClientAdvocateChatPopup.module.css';
import {
    ChevronLeft,
    MoreVertical,
    Phone,
    UserPlus,
    Send,
    Video,
    MapPin,
    Lock
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { interactionService } from '../../../../services/interactionService';
import { useCall } from '../../../../context/CallContext';
import { useInteractions } from '../../../../hooks/useInteractions';
import type { Message } from '../../../../services/interactionService';
import { formatImageUrl } from '../../../../utils/imageHelper';
import { checkIsPremium } from '../../../../utils/planHelper';
import ClientAdvocateDetailedProfile from './ClientAdvocateDetailedProfile';
import SocialShareModal from '../../../../components/shared/SocialShareModal';

interface ChatPopupProps {
    advocate: any; // Client profile in this context
    onClose: () => void;
    onSent?: () => void;
}

const resolveUserId = (entity: any) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    const uid = entity.partnerUserId || entity.userId?._id || entity.userId || entity.partnerId || entity._id || entity.id;
    return uid ? String(uid) : null;
};

const ClientAdvocateChatPopup: React.FC<ChatPopupProps> = ({ advocate: initialAdvocate, onClose, onSent }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [advocate, setAdvocate] = useState<any>(initialAdvocate);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showDetailedProfile, setShowDetailedProfile] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { initiateCall } = useCall();
    const { handleInteraction: performInteraction } = useInteractions((msg) => alert(msg));

    const isPremium = checkIsPremium(user);
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || (user?.role as string) === 'super_admin';
    const currentUserId = String(user?.id);
    const partnerUserId = resolveUserId(advocate);
    const shouldMask = (advocate?.isMasked !== false) && !isPremium && !isAdmin;

    useEffect(() => {
        if (initialAdvocate) setAdvocate(initialAdvocate);
    }, [initialAdvocate]);

    const fetchMsgs = async () => {
        if (!currentUserId || !partnerUserId) return;
        try {
            const msgs = await interactionService.getConversationMessages(currentUserId, partnerUserId, currentUserId);
            setMessages(msgs);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            interactionService.markAsRead(currentUserId, partnerUserId);
        } catch (error) { console.error('Error fetching messages:', error); }
    };

    useEffect(() => {
        if (user && partnerUserId) {
            fetchMsgs();
            const handleSocketMessage = (e: any) => {
                const data = e.detail;
                if (String(data.senderId) === partnerUserId || String(data.message.sender) === partnerUserId) {
                    fetchMsgs();
                }
            };
            window.addEventListener('socket-message', handleSocketMessage);
            return () => window.removeEventListener('socket-message', handleSocketMessage);
        }
    }, [user, partnerUserId]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageText.trim() || !currentUserId || !partnerUserId || isSending) return;
        setIsSending(true);
        try {
            const sentMsg = await interactionService.sendMessage(currentUserId, partnerUserId, messageText);
            setMessages(prev => [...prev, sentMsg]);
            setMessageText("");
            interactionService.recordActivity('client', partnerUserId, 'chat', currentUserId);
            if (onSent) onSent();
        } catch (error) { alert('Message delivery failed.'); } finally { setIsSending(false); }
    };

    const handleCall = (type: 'audio' | 'video') => {
        if (!isPremium) return alert("Premium Required");
        if (!partnerUserId) return;
        initiateCall(partnerUserId, type);
    };

    const handleBlock = async () => {
        if (!confirm(`Block this user?`)) return;
        await performInteraction({ ...advocate, id: partnerUserId, role: 'client' }, 'block');
        onClose();
    };

    const displayName = shouldMask && advocate.name ? (advocate.name.substring(0, 2) + '*****') : (advocate.name || "Client");
    const displayId = shouldMask ? (advocate.unique_id || "---").substring(0, 2) + '*****' : (advocate.unique_id || "---");
    const displayImage = advocate.image_url || advocate.profilePic || "/default-avatar.png";

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={onClose}><ChevronLeft size={24} /></button>
                    <div className={styles.profileClickArea} onClick={() => setShowDetailedProfile(true)}>
                        <img
                            src={formatImageUrl(displayImage)}
                            alt={displayName}
                            className={`${styles.avatar} ${shouldMask ? styles.blurredAvatar : ''}`}
                        />
                        <div className={styles.titleInfo}>
                            <h3 className={shouldMask ? styles.blurredText : ''}>{displayName}</h3>
                            <div className={styles.idStatusRow}>
                                <span className={`${styles.uniqueId} ${shouldMask ? styles.blurredText : ''}`}>{displayId}</span>
                                <span className={styles.status}>• Online</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn} onClick={() => performInteraction({ ...advocate, id: partnerUserId, role: 'client' }, 'shortlist')} title="Save"><UserPlus size={18} /></button>
                        <div className={styles.moreWrapper}>
                            <button className={styles.actionBtn} onClick={() => setIsMoreOpen(!isMoreOpen)}><MoreVertical size={18} /></button>
                            {isMoreOpen && (
                                <div className={styles.dropdown}>
                                    <button onClick={() => { setShowShareModal(true); setIsMoreOpen(false); }}>Share Profile</button>
                                    <button onClick={handleBlock} style={{ color: '#ef4444' }}>Block User</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <SocialShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    url={window.location.host + '/profile/' + (advocate.unique_id || displayId)}
                    title={`Inquiry from ${displayName}`}
                />

                <div className={styles.detailsSection}>
                    <div className={styles.detailsRow}>
                        <div className={`${styles.detailsList} ${shouldMask ? styles.blurredText : ''}`}>
                            <div className={styles.detailItem}>{advocate.legalHelp?.category || advocate.specialization || 'General'}</div>
                            <div className={styles.detailItem}><MapPin size={10} /> {advocate.city || advocate.location?.city || 'Location N/A'}</div>
                        </div>
                        <div className={styles.headerCallActions}>
                            <button className={styles.miniCallBtn} onClick={() => handleCall('audio')} title="Audio Call"><Phone size={14} /> <span>Audio</span></button>
                            <button className={styles.miniCallBtn} onClick={() => handleCall('video')} title="Video Call"><Video size={14} /> <span>Video</span></button>
                        </div>
                    </div>
                </div>

                <div className={styles.chatArea}>
                    {messages.length === 0 && <p className={styles.emptyNotice}>No messages yet. Say hello!</p>}
                    {messages.map(msg => (
                        <div key={msg.id} className={msg.senderId === currentUserId ? styles.myMsg : styles.theirMsg}>
                            <div className={styles.msgBubble}>
                                <p className={styles.msgText}>{msg.text}</p>
                                <span className={styles.msgTime}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.inputArea}>
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
                        <button type="submit" className={styles.sendBtn} disabled={!messageText.trim() || isSending}><Send size={18} /></button>
                    </form>
                </div>
            </div>

            {showDetailedProfile && (
                <ClientAdvocateDetailedProfile
                    profileId={partnerUserId}
                    backToProfiles={() => setShowDetailedProfile(false)}
                    onClose={() => setShowDetailedProfile(false)}
                />
            )}
        </div>
    );
};

export default ClientAdvocateChatPopup;
