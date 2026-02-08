import React, { useState } from 'react';
import {
    Shield,
    Bookmark,
    MessageCircle,
    Handshake,
    Star,
    CheckCircle2,
    Send,
    X,
    Zap
} from 'lucide-react';
import styles from './AdvocateCard.module.css'; // Reuse advocate card styles for consistency
import type { Client } from '../../types';
import { formatImageUrl } from '../../utils/imageHelper';

interface ClientCardProps {
    client: Client;
    onAction?: (action: string, data?: string) => void;
    variant?: 'featured' | 'normal';
    isPremium?: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onAction, variant = 'normal', isPremium = false }) => {
    const [interactionStage, setInteractionStage] = useState<'none' | 'interest_sent' | 'chat_input' | 'chat_active'>('none');
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm' | 'need_interest'>('none');
    const [interestSent, setInterestSent] = useState(false);
    const [message, setMessage] = useState('');

    const IS_MASKED = !isPremium;

    const maskName = (name: string) => {
        if (!IS_MASKED) return name;
        if (!name) return "***";
        if (name.includes('...')) return name;
        return name.substring(0, 2) + "...";
    };

    const maskId = (id: string) => {
        if (!IS_MASKED) return id;
        if (!id) return "***";
        if (id.includes('...')) return id;
        return id.substring(0, 2) + "...";
    };

    const handleInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setInterestSent(true);
        onAction?.('interest');
        setPopupType('interest_upgrade');
    };

    const handleSuperInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('super_interest_confirm');
    };

    const confirmSuperInterest = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none');
        setInterestSent(true);
        setInteractionStage('chat_input');
        onAction?.('superInterest');
    };

    const handleShortlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAction?.('shortlist');
    };

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('chat_confirm');
    };

    const confirmChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none');
        onAction?.('openFullChatPage');
    };

    const handleSendMessage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!message.trim()) return;
        onAction?.('message_sent', message);
        setMessage('');
        setInteractionStage('none');
    };

    const handleUpgradeToSuper = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none');
        setInteractionStage('chat_input');
        onAction?.('superInterest');
    };

    const cardClass = `${styles.card} ${variant === 'featured' ? styles.cardFeatured : styles.cardNormal}`;
    const shouldBlur = IS_MASKED;

    const clientName = client.name || `${client.firstName} ${client.lastName}`.trim() || 'Client';

    return (
        <div className={cardClass}>
            {/* Unified Popups */}
            {popupType !== 'none' && (
                <div className={styles.popupOverlay} onClick={() => setPopupType('none')}>
                    <div className={styles.popupCard} onClick={e => e.stopPropagation()}>
                        <button className={styles.popupCloseBtn} onClick={() => setPopupType('none')}>
                            <X size={18} />
                        </button>
                        <div className={styles.popupContent}>
                            {popupType === 'need_interest' && (
                                <>
                                    <h4 className={styles.popupTitle}>Send Interest First</h4>
                                    <p className={styles.popupMsg}>You must express interest in this client before you can start a chat.</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.confirmBtn} onClick={() => setPopupType('none')}>Got it</button>
                                    </div>
                                </>
                            )}

                            {popupType === 'super_interest_confirm' && (
                                <>
                                    <h4 className={styles.popupTitle}>Confirm Super Interest</h4>
                                    <p className={styles.popupMsg}>Prioritize your profile for a more direct connection. Continue?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                                        <button className={styles.confirmBtn} onClick={confirmSuperInterest}>Send Super Interest</button>
                                    </div>
                                </>
                            )}

                            {popupType === 'chat_confirm' && (
                                <>
                                    <h4 className={styles.popupTitle}>Initiate Chat</h4>
                                    <p className={styles.popupMsg}>Open a secure chat connection with this client?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                                        <button className={styles.confirmBtn} onClick={confirmChat}>Open Chat</button>
                                    </div>
                                </>
                            )}

                            {popupType === 'interest_upgrade' && (
                                <>
                                    <h4 className={styles.popupTitle}>Interest Sent</h4>
                                    <p className={styles.popupMsg}>Boost your visibility with Super Interest?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.upgradeBtn} onClick={handleUpgradeToSuper}>
                                            Upgrade to Super Interest
                                        </button>
                                        <button className={styles.noThanksBtn} onClick={() => { setPopupType('none'); setInteractionStage('chat_input'); }}>
                                            No Thanks
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.avatarSection}>
                <div className={styles.imageContainer}>
                    {client.image_url ? (
                        <img
                            src={formatImageUrl(client.image_url)}
                            alt={clientName}
                            className={`${styles.advocateImg} ${shouldBlur ? styles.blurredImage : ''}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop`;
                            }}
                        />
                    ) : (
                        <div className={`${styles.bgInitial} ${shouldBlur ? styles.blurredImage : ''}`}>{clientName.charAt(0) || 'C'}</div>
                    )}
                    <div className={styles.imageOverlay}></div>
                </div>

                <div className={styles.verifiedBadgeGroup}>
                    <div className={styles.topIdBadge}>
                        <span className={styles.topIdText}>{maskId(client.unique_id)}</span>
                        <div className={styles.badgeDivider}></div>
                        <CheckCircle2 size={16} fill="#22c55e" color="white" />
                    </div>
                </div>

                <div className={`${styles.profileTextOverlay} ${shouldBlur ? styles.blurredText : ''}`}>
                    <h3 className={styles.overlayName}>{maskName(clientName)}</h3>
                    <div className={styles.overlayDetails}>
                        <p>{(client.location?.city && client.location?.state) ? `${client.location.city}, ${client.location.state}` : (client.location?.state || 'N/A')}</p>
                        <p>{client.legalHelp?.category || 'Seeking Legal Help'}</p>
                    </div>
                </div>

                <div className={styles.rightBadgeStack}>
                    <div className={styles.overlayDepartmentBadge}>
                        {client.legalHelp?.specialization || 'General'}
                    </div>
                </div>
            </div>

            <div className={styles.interactionLayer}>
                {interactionStage === 'interest_sent' ? (
                    <div className={styles.interestSentSuccess}>
                        <CheckCircle2 size={24} color="#10b981" />
                        <span>Interest Sent Successfully!</span>
                    </div>
                ) : interactionStage === 'chat_input' ? (
                    <div className={styles.chatInputContainer}>
                        <button className={styles.chatCloseBtn} onClick={(e) => { e.stopPropagation(); setInteractionStage('none'); }}>
                            <X size={18} />
                        </button>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className={styles.chatInput}
                            value={message}
                            onChange={(e) => { e.stopPropagation(); setMessage(e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button className={styles.sendIconBtn} onClick={handleSendMessage}>
                            <Send size={20} />
                        </button>
                    </div>
                ) : (
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={handleInterestClick} disabled={interestSent}>
                            <Handshake size={22} className={interestSent ? styles.activeIcon : ''} />
                            <span>{interestSent ? 'Interested' : 'Interest'}</span>
                        </button>
                        <button className={styles.actionBtn} onClick={handleSuperInterestClick}>
                            <Zap size={22} />
                            <span>Super Interest</span>
                        </button>
                        <button className={styles.actionBtn} onClick={handleShortlistClick}>
                            <Bookmark size={22} />
                            <span>Shortlist</span>
                        </button>
                        <button className={styles.actionBtn} onClick={handleChatClick}>
                            <MessageCircle size={22} />
                            <span>Chat</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientCard;
