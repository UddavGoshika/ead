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
    X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import type { Message } from '../../../services/interactionService';
import type { Advocate } from '../../../types';

interface ChatPopupProps {
    advocate: Advocate;
    onClose: () => void;
    onSent?: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ advocate, onClose, onSent }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [interactionStatus, setInteractionStatus] = useState<'none' | 'interest' | 'superInterest'>('none');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user, refreshUser } = useAuth();

    useEffect(() => {
        if (user && advocate) {
            const currentUserId = String(user.id);
            const partnerUserId = String(advocate.userId || advocate.id); // Prefer User ID for matching

            const fetchMsgs = async () => {
                const msgs = await interactionService.getConversationMessages(currentUserId, partnerUserId);
                setMessages(msgs);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            };

            const fetchStatus = async () => {
                const activities = await interactionService.getAllActivities(currentUserId);
                const isSuper = activities.find((a: any) => a.receiver === partnerUserId && a.type === 'superInterest');
                if (isSuper) {
                    setInteractionStatus('superInterest');
                } else {
                    const isInt = activities.find((a: any) => a.receiver === partnerUserId && a.type === 'interest');
                    if (isInt) setInteractionStatus('interest');
                    else setInteractionStatus('none');
                }
            };

            fetchMsgs();
            fetchStatus();
        }
    }, [user, advocate]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const currentUserId = String(user?.id);
        const partnerUserId = String(advocate.userId || advocate.id);

        if (!messageText.trim() || !currentUserId || !partnerUserId) return;

        const sentMsg = await interactionService.sendMessage(currentUserId, partnerUserId, messageText);
        setMessages((prev: Message[]) => [...prev, sentMsg]);
        setMessageText("");

        // Record activity for "Real time" flow
        await interactionService.recordActivity('advocate', String(advocate.id), 'chat', currentUserId);

        if (onSent) onSent();
    };

    const handleSendInterest = async () => {
        const currentUserId = String(user?.id);
        const targetId = String(advocate.id);
        const action = interactionStatus === 'interest' ? 'superInterest' : 'interest';

        try {
            const res = await interactionService.recordActivity('advocate', targetId, action, currentUserId);
            if (res.success) {
                if (res.coins !== undefined) refreshUser({ coins: res.coins });
                setInteractionStatus(action);
                alert(`${action === 'superInterest' ? 'Super Interest' : 'Interest'} sent to ${advocate.name}`);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    const handleCall = () => {
        alert(`Calling ${advocate.name}...`);
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
                            <span className={styles.uniqueId}>
                                {advocate.isMasked ? (advocate.display_id || (advocate.unique_id && advocate.unique_id.substring(0, 2) + "...")) : advocate.unique_id}
                            </span>
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
                                            alert("Conversation deleted (feature coming soon)");
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
                        <div className={styles.detailItem}>{advocate.experience} Exp</div>
                        <div className={styles.detailItem}>{Array.isArray(advocate.specialties) ? advocate.specialties[0] : advocate.specialties}</div>
                        <div className={styles.detailItem}>{advocate.location}</div>
                        <div className={styles.detailItem}>Verified Professional</div>
                    </div>

                    <div className={styles.quickActionsRow}>
                        {interactionStatus !== 'superInterest' ? (
                            <button className={styles.sendInterestBtn} onClick={handleSendInterest}>
                                <Mail size={18} />
                                {interactionStatus === 'none' ? 'Send Interest' : 'Send Super Interest'}
                            </button>
                        ) : (
                            <button className={styles.sendInterestBtn} style={{ background: '#ef4444' }} onClick={async () => {
                                if (confirm("Withdraw your Super Interest? Tokens are non-refundable.")) {
                                    alert("Interest withdrawn");
                                    setInteractionStatus('interest'); // Fallback to normal interest for UI state
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
                        <button className={styles.callOptionBtn} onClick={() => alert('Starting video call...')}>
                            <Video size={18} />
                            <span>Video</span>
                        </button>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.chatArea}>
                    {messages.map(msg => (
                        <div key={msg.id} className={msg.senderId === String(user?.id) ? styles.myMsg : styles.theirMsg}>
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
