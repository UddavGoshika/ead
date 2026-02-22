import React, { useState, useEffect, useRef } from 'react';
import styles from './LegalAdvisorChatPopup.module.css';
import {
    ChevronLeft,
    MoreVertical,
    Phone,
    UserPlus,
    Send,
    Video,
    MapPin,
    Lock,
    Shield
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { advocateService, clientService } from '../../../../services/api';
import { interactionService } from '../../../../services/interactionService';
import { useCall } from '../../../../context/CallContext';
import { useInteractions } from '../../../../hooks/useInteractions';
import type { Message } from '../../../../services/interactionService';
import { formatImageUrl } from '../../../../utils/imageHelper';
import LegalAdvisorDetailedProfile from './LegalAdvisorDetailedProfile';
import SocialShareModal from '../../../../components/shared/SocialShareModal';

interface ChatPopupProps {
    advocate: any;
    onClose: () => void;
    onSent?: () => void;
}

const resolveUserId = (entity: any) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    const uid = entity.partnerUserId || entity.userId?._id || entity.userId || entity.partnerId || entity._id || entity.id;
    return uid ? String(uid) : null;
};

const LegalAdvisorChatPopup: React.FC<ChatPopupProps> = ({ advocate: initialAdvocate, onClose, onSent }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [advocate, setAdvocate] = useState<any>(initialAdvocate);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [showDetailedProfile, setShowDetailedProfile] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();
    const { handleInteraction: performInteraction } = useInteractions((msg) => alert(msg));

    const currentUserId = String(user?.id);
    const partnerUserId = resolveUserId(advocate);

    useEffect(() => {
        if (initialAdvocate) setAdvocate(initialAdvocate);
    }, [initialAdvocate]);

    useEffect(() => {
        const fetchFullProfile = async () => {
            if (!partnerUserId || isLoadingProfile) return;
            const needsFetch = !advocate.experience || !advocate.location;
            if (needsFetch) {
                setIsLoadingProfile(true);
                try {
                    let foundData = null;
                    try {
                        const res = await advocateService.getAdvocateById(partnerUserId);
                        if (res.data.success && res.data.advocate) foundData = res.data.advocate;
                    } catch (e) { }
                    if (!foundData) {
                        try {
                            const cRes = await clientService.getClientById(partnerUserId);
                            if (cRes.data.success && cRes.data.client) foundData = { ...cRes.data.client, role: 'client' };
                        } catch (e) { }
                    }
                    if (foundData) setAdvocate(foundData);
                } catch (e) {
                    console.error('[AdvisorChat] Profile fetch error', e);
                } finally {
                    setIsLoadingProfile(false);
                }
            }
        };
        fetchFullProfile();
    }, [partnerUserId, advocate.experience, advocate.location]);

    useEffect(() => {
        if (currentUserId && partnerUserId) {
            const fetchMsgs = async () => {
                const msgs = await interactionService.getConversationMessages(currentUserId, partnerUserId, currentUserId);
                setMessages(msgs);
                interactionService.markAsRead(currentUserId, partnerUserId);
            };
            fetchMsgs();

            const handleSocketMessage = (e: any) => {
                const data = e.detail;
                if (String(data.senderId) === partnerUserId || String(data.message.sender) === partnerUserId) {
                    const newMsg = {
                        id: data.message._id || data.message.id,
                        senderId: String(data.message.sender),
                        receiverId: String(data.message.receiver),
                        text: data.message.text,
                        timestamp: new Date(data.message.timestamp).getTime()
                    };
                    setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                    if (String(data.message.receiver) === currentUserId) interactionService.markAsRead(currentUserId, partnerUserId);
                }
            };
            window.addEventListener('socket-message', handleSocketMessage);
            return () => window.removeEventListener('socket-message', handleSocketMessage);
        }
    }, [currentUserId, partnerUserId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageText.trim() || !currentUserId || !partnerUserId || isSending) return;
        setIsSending(true);
        try {
            const sentMsg = await interactionService.sendMessage(currentUserId, partnerUserId, messageText);
            setMessages(prev => [...prev, sentMsg]);
            setMessageText("");
            if (onSent) onSent();
        } catch (error) {
            console.error('[AdvisorChat] Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleCall = (type: 'audio' | 'video') => {
        if (!partnerUserId) return;
        initiateCall(partnerUserId, type);
    };

    const handleBlock = async () => {
        if (!confirm(`Block ${displayName}?`)) return;
        try {
            await performInteraction({ ...advocate, id: partnerUserId }, 'block');
            onClose();
        } catch (e) { }
    };

    const handleAddContact = async () => {
        try { await performInteraction({ ...advocate, id: partnerUserId }, 'shortlist'); } catch (e) { }
    };

    const displayName = advocate.name || (advocate.firstName ? `${advocate.firstName} ${advocate.lastName}` : "User");
    const displayId = advocate.unique_id || advocate.partnerUniqueId || "N/A";
    const displayImage = formatImageUrl(advocate.image_url || advocate.profilePic || advocate.img || "/default-avatar.png");
    const isClient = advocate.role === 'client' || !!advocate.legalHelp;
    const locationStr = isClient ? (advocate.location?.city || advocate.location || 'N/A') : (advocate.location || 'N/A');
    const specStr = isClient ? (advocate.legalHelp?.specialization || 'General') : (Array.isArray(advocate.specialties) ? advocate.specialties[0] : (advocate.specialties || 'General'));

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={onClose}><ChevronLeft size={24} /></button>
                    <div className={styles.profileClickArea} onClick={() => setShowDetailedProfile(true)}>
                        <img src={displayImage} alt={displayName} className={styles.avatar} />
                        <div className={styles.titleInfo}>
                            <h3>{displayName}</h3>
                            <div className={styles.idStatusRow}>
                                <span className={styles.uniqueId}>{displayId}</span>
                                <span className={styles.status} style={{ color: '#10b981' }}>• Online</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn} onClick={handleAddContact} title="Add to Contacts"><UserPlus size={18} /></button>
                        <div className={styles.moreWrapper}>
                            <button className={styles.actionBtn} onClick={() => setIsMoreOpen(!isMoreOpen)}><MoreVertical size={18} /></button>
                            {isMoreOpen && (
                                <div className={styles.dropdown}>
                                    <button onClick={() => { setShowShareModal(true); setIsMoreOpen(false); }}>Share Profile</button>
                                    <button onClick={handleBlock} className={styles.blockBtn}>Block User</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <SocialShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    url={window.location.host + '/profile/' + displayId}
                    title={`Legal Advisor sharing profile: ${displayName}`}
                />

                <div className={styles.detailsSection}>
                    <div className={styles.detailsRow}>
                        <div className={styles.detailsList}>
                            {(!isClient && advocate.experience) && <div className={styles.detailItem}>{advocate.experience} Exp</div>}
                            <div className={styles.detailItem}>{specStr}</div>
                            <div className={styles.detailItem}><MapPin size={10} /> {locationStr}</div>
                        </div>
                        <div className={styles.headerCallActions}>
                            <button className={styles.miniCallBtn} onClick={() => handleCall('audio')} title="Audio Call"><Phone size={14} /> <span>Audio</span></button>
                            <button className={styles.miniCallBtn} onClick={() => handleCall('video')} title="Video Call"><Video size={14} /> <span>Video</span></button>
                        </div>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.chatArea}>
                    {messages.length === 0 && <p className={styles.emptyNotice}>Start a professional conversation.</p>}
                    {messages.map(msg => (
                        <div key={msg.id} className={msg.senderId === currentUserId ? styles.myMsg : styles.theirMsg}>
                            <div className={styles.msgBubble}>
                                <p className={styles.msgText}>{msg.text}</p>
                                <span className={styles.msgTime}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.inputArea}>
                    <p className={styles.tipText}>Direct Advisor Workspace Communication</p>
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
                </div>
            </div>

            {showDetailedProfile && (
                <LegalAdvisorDetailedProfile
                    profileId={partnerUserId}
                    backToProfiles={() => setShowDetailedProfile(false)}
                    onClose={() => setShowDetailedProfile(false)}
                />
            )}
        </div>
    );
};

export default LegalAdvisorChatPopup;
