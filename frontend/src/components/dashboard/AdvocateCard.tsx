import React, { useState } from 'react';
import {
    Shield,
    MessageCircle,
    Handshake,
    Bookmark,
    Star,
    CheckCircle2,
    Check,
    Send,
    X,
    Zap,
    MapPin,
    Briefcase,
    Scale,
    User,
    Share2
} from 'lucide-react';
import api from '../../services/api';

import styles from './AdvocateCard.module.css';
import type { Advocate } from '../../types';
import { formatImageUrl } from '../../utils/imageHelper';
import { useRelationshipStore } from '../../store/useRelationshipStore.ts';
import { useAuth } from '../../context/AuthContext';

interface AdvocateCardProps {
    advocate: Advocate;
    onAction?: (action: string, data?: string | Advocate) => void;
    variant?: 'featured' | 'normal';
    isPremium?: boolean;
}

const AdvocateCard: React.FC<AdvocateCardProps> = ({ advocate, onAction, variant = 'normal', isPremium = false }) => {
    const { user } = useAuth();
    // Robust ID extraction handling both string IDs and populated objects
    const advocatePartnerId = String(
        (advocate.userId && (advocate.userId as any)._id)
            ? (advocate.userId as any)._id
            : (advocate.userId || advocate.id || (advocate as any)._id)
    );

    const relState = useRelationshipStore((s: any) => s.relationships[advocatePartnerId] || advocate.relationship_state || 'NONE');
    const setRelationship = useRelationshipStore((s: any) => s.setRelationship);

    const [interactionStage, setInteractionStage] = useState<'none' | 'processing' | 'chat_input' | 'completed'>('none');
    const [popupType, setPopupType] = useState<'none' | 'super_interest_choice' | 'super_interest_confirm'>('none');
    const [message, setMessage] = useState('');
    const [shareCount] = useState(advocate.shares || 0);
    const [loading, setLoading] = useState(false);

    const IS_MASKED = !isPremium;

    const maskName = (name: string) => {
        if (!IS_MASKED) return name;
        if (!name) return "*****";
        if (name.includes('*****')) return name;
        return name.substring(0, 2) + "*****";
    };

    const maskId = (id: string) => {
        if (!IS_MASKED) return id;
        if (!id) return "*****";
        if (id.includes('*****')) return id;
        return id.substring(0, 2) + "*****";
    };

    const isConnected = relState?.state === 'ACCEPTED' || relState?.state === 'CONNECTED';
    const isInterested = relState === 'INTEREST' || relState?.state === 'INTEREST' || relState?.state === 'INTEREST_SENT';
    const isSuperInterested = relState === 'SUPER_INTEREST' || relState?.state === 'SUPER_INTEREST' || relState?.state === 'SUPER_INTEREST_SENT';
    const isShortlisted = relState === 'SHORTLISTED' || relState?.state === 'SHORTLISTED' || (relState as any)?.isShortlisted;

    const handleInterestClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading || isInterested || isConnected) return;

        setLoading(true);
        try {
            // Send regular interest first
            await onAction?.('interest');
        } catch (err: any) {
            console.error("Interest Error:", err);
            setLoading(false);
            return; // Stop here if interest fails
        }

        // Keep loading=true while popup is shown
        // Show popup immediately after interest succeeds
        setPopupType('super_interest_choice');
        setLoading(false); // Now safe to set loading false
    };

    const handleSuperInterestChoice = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        setPopupType('none'); // Close popup immediately

        try {
            // Send super interest
            await onAction?.('superInterest');
        } catch (err: any) {
            console.error("Super Interest Error:", err);
            // Continue to chat input even if super interest fails
        }

        // Immediately show chat input (no delays)
        setLoading(false);
        setInteractionStage('chat_input');
    };

    const handleNoThanks = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none'); // Close popup immediately
        // Interest was already sent, so open chat input now
        setInteractionStage('chat_input');
    };

    const handleSuperInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading || isConnected || isSuperInterested) return;
        setPopupType('super_interest_confirm');
    };

    const handleSuperInterest = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        setPopupType('none'); // Close popup immediately

        try {
            // Call parent's onAction to handle the backend call
            await onAction?.('superInterest');
        } catch (err: any) {
            console.error("Super Interest Error:", err);
            // Continue to chat input even if fails
        }

        // Immediately show chat input (no delays)
        setLoading(false);
        setInteractionStage('chat_input');
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            // Send message via parent's onAction handler
            console.log('[AdvocateCard] Sending message:', message);
            await onAction?.('message_sent', message);
            setMessage('');
            setInteractionStage('completed');
            setTimeout(() => {
                console.log('[AdvocateCard] Message sent successfully, triggering interaction_complete');
                onAction?.('interaction_complete');
            }, 1000);
        } catch (err) {
            console.error("Message Error:", err);
            alert("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseChatInput = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('[AdvocateCard] Closing chat input, triggering interaction_complete');
        onAction?.('interaction_complete');
    };

    const handleShortlistClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading) return;
        setLoading(true);
        try {
            const newState = isShortlisted ? 'NONE' : 'SHORTLISTED';
            setRelationship(advocatePartnerId, newState, 'sender');
            onAction?.('shortlist', advocate);
        } catch (err) {
            console.error("Shortlist Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAction?.('openFullChatPage', advocate);
    };

    const handleProfileClick = () => {
        onAction?.('view_profile', advocate);
    };

    const cardClass = `${styles.card} ${variant === 'featured' ? styles.cardFeatured : styles.cardNormal} ${popupType !== 'none' ? styles.cardWithPopup : ''}`;
    const shouldBlur = IS_MASKED;

    const getLocationString = () => {
        const loc = advocate.location as any;
        if (typeof loc === 'object' && loc !== null) {
            return `${loc.city || ''}, ${loc.state || ''}`;
        }
        return String(loc || 'India');
    };

    return (
        <div className={cardClass}>
            {shareCount > 0 && (
                <div className={styles.topShareBadge}>
                    <Share2 size={12} />
                    <span>{shareCount} Shares</span>
                </div>
            )}

            <div className={`${styles.avatarSection} ${popupType !== 'none' ? styles.blurredArea : ''}`} onClick={handleProfileClick}>
                <div className={styles.imageContainer}>
                    {(advocate.image_url || (advocate as any).img) ? (
                        <img
                            src={formatImageUrl(advocate.image_url || (advocate as any).img)}
                            alt={advocate.name}
                            className={`${styles.advocateImg} ${shouldBlur ? styles.blurredImage : ''}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1556157382-97dee2dcb9d9?q=80&w=400&auto=format&fit=crop`;
                            }}
                        />
                    ) : (
                        <div className={`${styles.bgInitial} ${shouldBlur ? styles.blurredImage : ''}`}>{advocate.name?.charAt(0) || 'A'}</div>
                    )}
                    <div className={styles.imageOverlay}></div>
                </div>

                {variant === 'featured' && advocate.isFeatured && (
                    <div className={styles.featuredBadge}>
                        <Star size={24} fill="#facc15" color="#facc15" className={styles.glossyStar} />
                    </div>
                )}

                <div className={styles.verifiedBadgeGroup}>
                    <div className={styles.topIdBadge}>
                        <span className={styles.topIdText}>{maskId(advocate.unique_id)}</span>
                        {variant === 'featured' && (
                            <div className={styles.metaBadgeContainer}>
                                <div className={styles.metaBadge}>
                                    <Check size={16} color="white" strokeWidth={4} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${styles.profileTextOverlay} ${shouldBlur ? styles.blurredText : ''}`}>
                    <h3 className={styles.overlayName} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={20} className="text-yellow-400" fill="#facc15" stroke="none" />
                        {maskName(advocate.name)}
                        {advocate.age ? <span style={{ fontSize: '0.8em', opacity: 0.8, fontWeight: 400 }}>, {advocate.age}</span> : ''}
                    </h3>

                    <div className={styles.overlayDetails} style={{ marginTop: '4px' }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#38bdf8" />
                            {getLocationString()}
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Briefcase size={14} color="#4ade80" />
                            {advocate.experience || '0'} Years Experience
                        </p>
                    </div>
                </div>

                <div className={styles.rightBadgeStack}>
                    <div className={styles.overlayDepartmentBadge} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Scale size={14} color="#a78bfa" />
                        {Array.isArray(advocate.specialties) && advocate.specialties.length > 0
                            ? advocate.specialties[0]
                            : (typeof advocate.specialties === 'string' ? advocate.specialties : 'General')
                        }
                    </div>
                    <div className={styles.idBadge}>
                        <Shield size={14} fill="currentColor" stroke="currentColor" />
                        <span className={styles.idText}>
                            {(() => {
                                const realId = advocate.bar_council_id || (advocate as any).barCouncilId;
                                const displayId = realId || 'N/A';
                                return (variant === 'featured' || isPremium) ? displayId : maskId(displayId);
                            })()}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.interactionLayer}>
                {interactionStage === 'completed' ? (
                    <div className={styles.interestSentSuccess}>
                        <CheckCircle2 size={24} color="#10b981" />
                        <span>Message Sent! Removing profile...</span>
                    </div>
                ) : interactionStage === 'chat_input' ? (
                    <div className={styles.chatInputContainer} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.chatCloseBtn} onClick={handleCloseChatInput} title="Close & Remove Profile">
                            <X size={20} />
                        </button>
                        <input
                            type="text"
                            className={styles.chatInput}
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            autoFocus
                        />
                        <button className={styles.sendIconBtn} onClick={handleSendMessage} disabled={loading || !message.trim()}>
                            <Send size={20} color="#facc15" />
                        </button>
                    </div>
                ) : (
                    <div className={`${styles.actions} ${interactionStage === 'processing' ? styles.actionsExit : ''}`}>
                        <button
                            className={styles.actionBtn}
                            onClick={handleInterestClick}
                            disabled={isInterested || isConnected || loading}
                            title="Send Interest"
                        >
                            <Handshake
                                size={22}
                                color={isInterested || isConnected ? "#facc15" : "currentColor"}
                                className={isInterested || isConnected ? styles.activeIcon : ''}
                            />
                            <span>{isConnected ? 'Accepted' : (isInterested ? 'Interested' : 'Interest')}</span>
                        </button>

                        <button
                            className={styles.actionBtn}
                            onClick={handleSuperInterestClick}
                            disabled={isSuperInterested || isConnected || loading}
                            title="Send Super Interest"
                        >
                            <Zap
                                size={22}
                                color={isSuperInterested ? "#facc15" : "#eab308"}
                                fill={isSuperInterested ? "#facc15" : "none"}
                            />
                            <span>{isSuperInterested ? 'Super Sent' : 'Super Interest'}</span>
                        </button>

                        <button
                            className={styles.actionBtn}
                            onClick={handleShortlistClick}
                            disabled={loading || isConnected}
                            title="Add to Shortlist"
                        >
                            <Bookmark
                                size={22}
                                color={isShortlisted ? "#facc15" : "currentColor"}
                                fill={isShortlisted ? "#facc15" : "none"}
                            />
                            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                        </button>

                        <button className={styles.actionBtn} onClick={handleChatClick} style={{ opacity: isConnected ? 1 : 0.8 }}>
                            <MessageCircle size={22} />
                            <span>Chat</span>
                        </button>
                    </div>
                )}
            </div>

            {/* POPUPS - Moved to root for z-index layering */}
            {popupType === 'super_interest_choice' && (
                <div className={styles.popupOverlay} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.popupTitle}>Interest Sent!</h3>
                        <p className={styles.popupMsg}>Would you like to send a Super Interest for 2 coins? Your profile will be highlighted at the top.</p>
                        <div className={styles.popupActions}>
                            <button className={styles.upgradeBtn} onClick={handleSuperInterestChoice}>
                                <Zap size={18} /> OK
                            </button>
                            <button className={styles.noThanksBtn} onClick={handleNoThanks}>
                                No Thanks
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {popupType === 'super_interest_confirm' && (
                <div className={styles.popupOverlay} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.popupTitle}>Confirm Super Interest</h3>
                        <p className={styles.popupMsg}>This will deduct 2 coins from your balance. Proceed?</p>
                        <div className={styles.popupActions}>
                            <button className={styles.confirmBtn} onClick={handleSuperInterest}>Yes, Send</button>
                            <button className={styles.noThanksBtn} onClick={() => setPopupType('none')}>No Thanks</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvocateCard;
