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
import styles from './AdvocateCard.module.css';
import type { Advocate } from '../../types';

interface AdvocateCardProps {
    advocate: Advocate;
    onAction?: (action: string, data?: string) => void;
    variant?: 'featured' | 'normal';
    isPremium?: boolean;
}

const AdvocateCard: React.FC<AdvocateCardProps> = ({ advocate, onAction, variant = 'normal', isPremium = false }) => {
    const [interactionStage, setInteractionStage] = useState<'none' | 'interest_sent' | 'chat_input' | 'chat_active'>('none');
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm'>('none');
    const [message, setMessage] = useState('');

    const maskName = (name: string) => {
        if (isPremium || variant === 'normal') return name;
        if (!name) return "**";
        // Show first 2 characters, mask the rest
        return name.substring(0, 2) + "**";
    };

    const maskId = (id: string) => {
        if (isPremium || variant === 'normal') return id;
        if (!id) return "****";
        // Show first 2 or 3 characters based on length
        const prefix = id.length > 5 ? id.substring(0, 3) : id.substring(0, 2);
        return prefix + "****";
    };

    const handleInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('interest_upgrade');
        onAction?.('interest_initiated');
    };

    const handleUpgradeToSuper = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none');
        setInteractionStage('chat_input'); // Matches "closeAndShowChatInput" logic after action
        onAction?.('super_interest_sent');
    };

    const handleSuperInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('super_interest_confirm');
    };

    const confirmSuperInterest = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none');
        setInteractionStage('chat_input');
        onAction?.('super_interest_sent');
    };

    const handleShortlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setInteractionStage('chat_input');
        onAction?.('shortlisted');
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

    const cardClass = `${styles.card} ${variant === 'featured' ? styles.cardFeatured : styles.cardNormal}`;
    const shouldBlur = !isPremium && variant === 'featured';

    return (
        <div className={cardClass}>
            <div className={styles.avatarSection}>
                <div className={styles.imageContainer}>
                    {advocate.image_url ? (
                        <img
                            src={advocate.image_url.startsWith('http') ? advocate.image_url : `${advocate.image_url}`}
                            alt={advocate.name}
                            className={`${styles.advocateImg} ${shouldBlur ? styles.blurredImage : ''}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1556157382-97dee2dcb9d9?q=80&w=400&auto=format&fit=crop`;
                            }}
                        />
                    ) : (
                        <div className={`${styles.bgInitial} ${shouldBlur ? styles.blurredImage : ''}`}>{advocate.name.charAt(0)}</div>
                    )}
                    <div className={styles.imageOverlay}></div>
                </div>

                {/* Featured Star Badge */}
                {variant === 'featured' && advocate.isFeatured && (
                    <div className={styles.featuredBadge}>
                        <Star size={24} fill="#facc15" color="#facc15" className={styles.glossyStar} />
                    </div>
                )}

                {/* Unified Verified ID Badge - Top Right */}
                <div className={styles.verifiedBadgeGroup}>
                    <div className={styles.topIdBadge}>
                        <span className={styles.topIdText}>{maskId(advocate.unique_id)}</span>
                        <div className={styles.badgeDivider}></div>
                        {variant === 'featured' ? (
                            <div className={styles.premiumVerified}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Bold Round Outer Glow/Base */}
                                    <circle cx="12" cy="12" r="11" fill="url(#blue_grad_bold)" />
                                    {/* Thicker Checkmark */}
                                    <path
                                        d="M7.5 12.5L10.5 15.5L16.5 8.5"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <defs>
                                        <linearGradient id="blue_grad_bold" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#38bdf8" />
                                            <stop offset="0.5" stopColor="#0ea5e9" />
                                            <stop offset="1" stopColor="#0284c7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        ) : (
                            <CheckCircle2 size={16} fill="#22c55e" color="white" />
                        )}
                    </div>
                </div>

                {/* Info Overlay - Bottom Left */}
                <div className={styles.profileTextOverlay}>
                    <h3 className={styles.overlayName}>{maskName(advocate.name)}, {advocate.age || 27}</h3>
                    <div className={styles.overlayDetails}>
                        <p>{advocate.location}</p>
                        <p>{advocate.experience} experience</p>
                    </div>
                </div>

                {/* Right Side Badge Stack - Bottom Right */}
                <div className={styles.rightBadgeStack}>
                    <div className={styles.overlayDepartmentBadge}>
                        {Array.isArray(advocate.specialties) ? advocate.specialties[0] : (advocate.specialties || 'General')}
                    </div>
                    <div className={styles.idBadge}>
                        <Shield size={14} fill="currentColor" stroke="currentColor" />
                        <span className={styles.idText}>{maskId(advocate.bar_council_id || 'TS/1428/5256')}</span>
                    </div>
                </div>
            </div>

            {/* Interaction Layer */}
            <div className={styles.interactionLayer}>
                {interactionStage === 'chat_input' ? (
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
                        <button className={styles.sendIconBtn} onClick={(e) => { e.stopPropagation(); onAction?.('message_sent', message); }}>
                            <Send size={20} />
                        </button>
                    </div>
                ) : (
                    <div className={`${styles.actions} ${interactionStage === 'interest_sent' ? styles.actionsSliding : ''}`}>
                        <button className={styles.actionBtn} onClick={handleInterestClick}>
                            <Handshake size={22} />
                            <span>Interest</span>
                        </button>
                        <button className={styles.actionBtn} onClick={handleSuperInterestClick}>
                            {variant === 'featured' ? <Star size={22} /> : <Zap size={22} />}
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

            {/* Glassmorphism Modals based on popupType */}
            {popupType !== 'none' && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupCard}>
                        <button className={styles.popupCloseBtn} onClick={(e) => { e.stopPropagation(); setPopupType('none'); }}>
                            <X size={18} />
                        </button>

                        <div className={styles.popupContent}>
                            {popupType === 'interest_upgrade' && (
                                <>
                                    <h4 className={styles.popupTitle}>Interest Sent</h4>
                                    <p className={styles.popupMsg}>Boost your visibility with Super Interest?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.upgradeBtn} onClick={handleUpgradeToSuper}>
                                            Upgrade to Super Interest
                                        </button>
                                        <button className={styles.noThanksBtn} onClick={(e) => { e.stopPropagation(); setPopupType('none'); setInteractionStage('chat_input'); }}>
                                            No Thanks
                                        </button>
                                    </div>
                                </>
                            )}

                            {popupType === 'super_interest_confirm' && (
                                <>
                                    <h4 className={styles.popupTitle}>Confirm Super Interest</h4>
                                    <p className={styles.popupMsg}>Proceed with Super Interest?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.confirmBtn} onClick={confirmSuperInterest}>Confirm</button>
                                        <button className={styles.cancelBtn} onClick={(e) => { e.stopPropagation(); setPopupType('none'); }}>Cancel</button>
                                    </div>
                                </>
                            )}

                            {popupType === 'chat_confirm' && (
                                <>
                                    <h4 className={styles.popupTitle}>Initiate Chat</h4>
                                    <p className={styles.popupMsg}>2 coins will be deducted. Continue?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.confirmBtn} onClick={confirmChat}>Proceed</button>
                                        <button className={styles.cancelBtn} onClick={(e) => { e.stopPropagation(); setPopupType('none'); }}>Cancel</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvocateCard;
