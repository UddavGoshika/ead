import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPopup.module.css';
import {
    ChevronLeft,
    MoreVertical,
    Phone,
    UserPlus,
    Send,
    Mail,
    Video
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import { WebRTCService } from '../../../services/WebRTCService';
import type { Message } from '../../../services/interactionService';
import type { Advocate } from '../../../types';

interface ChatPopupProps {
    advocate: Advocate;
    onClose: () => void;
    onSent?: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ advocate, onClose, onSent }) => {
    const { user } = useAuth();
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && advocate) {
            const currentUserId = String(user.id);
            const partnerId = String(advocate.id); // Use MongoDB ID

            const fetchMsgs = async () => {
                const msgs = await interactionService.getConversationMessages(currentUserId, partnerId);
                setMessages(msgs);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            };
            fetchMsgs();
        }
    }, [user, advocate]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const currentUserId = String(user?.id);
        const partnerId = String(advocate.id);

        if (!messageText.trim() || !currentUserId || !partnerId) return;

        const sentMsg = await interactionService.sendMessage(currentUserId, partnerId, messageText);
        setMessages(prev => [...prev, sentMsg]);
        setMessageText("");

        // Record activity for "Real time" flow
        await interactionService.recordActivity('advocate', partnerId, 'chat', currentUserId);

        if (onSent) onSent();
    };

    const handleSendInterest = async () => {
        const currentUserId = String(user?.id);
        const targetId = String(advocate.id);
        await interactionService.recordActivity('advocate', targetId, 'interest', currentUserId);
        alert('Interest sent to ' + advocate.name);
    };

    const handleCall = async (type: 'voice' | 'video') => {
        try {
            const service = new WebRTCService();
            const streams = await service.startLocalStream(type === 'video');

            // For now, we use the advocate's Mongo ID as the target signal ID
            const targetId = String(advocate.id);
            const callerName = user?.name || "Eadvocate User";

            await service.createCall(targetId, callerName, type);
            // The global CallOverlay will handle the UI if we emit an event or state
            // But for the caller, we might want to show they are calling
            alert(`Calling ${advocate.name}... WebRTC session initiated.`);
        } catch (err) {
            console.error("Call failed:", err);
            alert("Could not start call. Please check camera/mic permissions.");
        }
    };

    const handleAddContact = () => {
        alert(`${advocate.name} added to contacts.`);
    };

    const handleBlock = () => {
        if (confirm(`Are you sure you want to block ${advocate.name}?`)) {
            alert(`${advocate.name} has been blocked.`);
            onClose();
        }
        setIsMoreOpen(false);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={onClose}>
                        <ChevronLeft size={24} />
                    </button>
                    <img src={advocate.image_url || "/default-avatar.png"} alt={advocate.name} className={styles.avatar} />
                    <div className={styles.titleInfo}>
                        <h3>{advocate.name}</h3>
                        <div className={styles.idStatusRow}>
                            <span className={styles.uniqueId}>{advocate.unique_id}</span>
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
                                    <button onClick={handleBlock} className={styles.blockBtn}>Block User</button>
                                    <button onClick={() => alert('Reported')}>Report User</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className={styles.detailsSection}>
                    <div className={styles.detailsList}>
                        <div className={styles.detailItem}>{advocate.experience} Exp</div>
                        <div className={styles.detailItem}>{Array.isArray(advocate.specialties) ? advocate.specialties[0] : advocate.specialties}</div>
                        <div className={styles.detailItem}>{advocate.location}</div>
                        <div className={styles.detailItem}>Verified Professional</div>
                    </div>

                    <div className={styles.quickActionsRow}>
                        <button className={styles.sendInterestBtn} onClick={handleSendInterest}>
                            <Mail size={18} />
                            Send Interest
                        </button>
                        <button className={styles.callOptionBtn} onClick={() => handleCall('voice')}>
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
                    {messages.map(msg => (
                        <div key={msg.id} className={msg.senderId === String(user?.unique_id || user?.id) ? styles.myMsg : styles.theirMsg}>
                            {msg.text}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.inputArea}>
                    <p className={styles.tipText}>Sending message will also send this member your interest</p>
                    <form className={styles.inputWrapper} onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Write here ..."
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                        />
                        <button type="submit" className={styles.sendBtn}>
                            <Send size={18} />➤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
