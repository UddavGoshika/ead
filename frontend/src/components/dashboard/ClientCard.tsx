import React, { useState } from 'react';
import {
    User,
    MapPin,
    MessageCircle,
    CheckCircle2,
    Ban,
    Handshake,
    Send,
    X,
    Zap,
    Bookmark,
    Star,
    Check,
    Scale,
    FileText
} from 'lucide-react';
import api from '../../services/api';
import styles from './AdvocateCard.module.css'; // Reuse styles for consistency
import type { Client } from '../../types';
import { formatImageUrl } from '../../utils/imageHelper';
import { useRelationshipStore } from '../../store/useRelationshipStore.ts';
import { useAuth } from '../../context/AuthContext';

interface ClientCardProps {
    client: Client;
    onAction?: (action: string, data?: any) => void;
    variant?: 'featured' | 'normal';
    isPremium?: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onAction, variant = 'normal', isPremium = false }) => {
    const { user } = useAuth();
    // Robust ID extraction handling both string IDs and populated objects
    const clientPartnerId = String(
        (client.userId && (client.userId as any)._id)
            ? (client.userId as any)._id
            : (client.userId || client.id || (client as any)._id)
    );

    const relState = useRelationshipStore((s: any) => s.relationships[clientPartnerId] || client.relationship_state || 'NONE');
    const setRelationship = useRelationshipStore((s: any) => s.setRelationship);

    const [interactionStage, setInteractionStage] = useState<'none' | 'processing' | 'chat_input' | 'completed'>('none');
    const [popupType, setPopupType] = useState<'none' | 'super_interest_choice' | 'super_interest_confirm'>('none');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

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

        // Show popup immediately after interest succeeds
        setPopupType('super_interest_choice');
        setLoading(false);
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
            // Send message via parent's onAction handler for consistency
            console.log('[ClientCard] Sending message:', message);
            await onAction?.('message_sent', message);
            setMessage('');
            setInteractionStage('completed');
            setTimeout(() => {
                console.log('[ClientCard] Message sent successfully, triggering interaction_complete');
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
        console.log('[ClientCard] Closing chat input, triggering interaction_complete');
        onAction?.('interaction_complete');
    };

    const handleProfileClick = () => {
        onAction?.('view_profile', client);
    };

    const handleShortlistClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading) return;
        setLoading(true);
        try {
            const newState = isShortlisted ? 'NONE' : 'SHORTLISTED';
            setRelationship(clientPartnerId, newState, 'sender');
            onAction?.('shortlist', client);
        } catch (err) {
            console.error("Shortlist Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        if (loading) return;
        setLoading(true);
        try {
            if (action === 'accept') {
                setRelationship(clientPartnerId, 'ACCEPTED', 'receiver');
                await api.post('/relationships/interest/accept', { sender_id: clientPartnerId });
                onAction?.('accept');
            } else if (action === 'decline') {
                setRelationship(clientPartnerId, 'DECLINED', 'receiver');
                await api.post('/relationships/interest/decline', { sender_id: clientPartnerId });
                onAction?.('decline');
            } else if (action === 'chat') {
                onAction?.('openFullChatPage', client);
            }
        } catch (err) {
            console.error("Action error:", err);
        } finally {
            setLoading(false);
        }
    };

    const cardClass = `${styles.card} ${variant === 'featured' ? styles.cardFeatured : styles.cardNormal} ${popupType !== 'none' ? styles.cardWithPopup : ''}`;
    const shouldBlur = IS_MASKED;

    return (
        <div className={cardClass}>
            <div className={`${styles.avatarSection} ${popupType !== 'none' ? styles.blurredArea : ''}`} onClick={handleProfileClick}>
                <div className={styles.imageContainer}>
                    {(client.image_url || client.profilePicPath) ? (
                        <img
                            src={formatImageUrl(client.image_url || client.profilePicPath)}
                            alt={client.name || 'Client'}
                            className={`${styles.advocateImg} ${shouldBlur ? styles.blurredImage : ''}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop`;
                            }}
                        />
                    ) : (
                        <div className={`${styles.bgInitial} ${shouldBlur ? styles.blurredImage : ''}`}>{(client.name || 'C').charAt(0)}</div>
                    )}
                </div>

                {variant === 'featured' && (client as any).isFeatured && (
                    <div className={styles.featuredBadge}>
                        <Star size={24} fill="#facc15" color="#facc15" className={styles.glossyStar} />
                    </div>
                )}

                <div className={styles.verifiedBadgeGroup}>
                    <div className={styles.topIdBadge}>
                        <span className={styles.topIdText}>{maskId(String(client.unique_id || client.id))}</span>
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
                    <h3 className={styles.overlayName}>
                        <User size={20} className="text-yellow-400" fill="#facc15" stroke="none" />
                        {maskName(client.name || 'Client')}
                    </h3>
                    <div className={styles.overlayDetails}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#38bdf8" />
                            {client.location ? (typeof client.location === 'object' ? `${client.location.city || ''}` : client.location) : 'Location N/A'}
                        </p>
                    </div>
                </div>

                <div className={styles.rightBadgeStack}>
                    {(client.legalHelp?.category || client.legalHelp?.specialization) && (
                        <div className={styles.overlayDepartmentBadge} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Scale size={14} color="#a78bfa" />
                            {client.legalHelp?.category || client.legalHelp?.specialization || 'FAMILY LAWYER'}
                        </div>
                    )}
                    {client.legalHelp?.subDepartment && (
                        <div className={styles.idBadge}>
                            <FileText size={14} fill="currentColor" stroke="currentColor" />
                            <span className={styles.idText}>
                                {client.legalHelp.subDepartment}
                            </span>
                        </div>
                    )}
                </div>

            </div>

            <div className={styles.interactionLayer}>
                {interactionStage === 'completed' ? (
                    <div className={styles.interestSentSuccess}>
                        <CheckCircle2 size={24} color="#10b981" />
                        <span>Message Sent! Removing profile...</span>
                    </div>
                ) : interactionStage === 'chat_input' ? (
                    <div className={styles.chatInputContainer}>
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
                        {(() => {
                            const state = typeof relState === 'string' ? relState : relState.state;
                            const role = typeof relState === 'string' ? 'sender' : (relState as any).role;

                            if (state === 'INTEREST' && role === 'receiver') {
                                return (
                                    <>
                                        <button className={styles.actionBtn} onClick={() => handleAction('accept')}>
                                            <CheckCircle2 size={22} color="#10b981" />
                                            <span>Accept</span>
                                        </button>
                                        <button className={styles.actionBtn} onClick={() => handleAction('decline')} disabled={loading}>
                                            <Ban size={22} color="#f43f5e" />
                                            <span>Ignore</span>
                                        </button>
                                    </>
                                );
                            }

                            return (
                                <>
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

                                    <button className={styles.actionBtn} onClick={() => handleAction('chat')} style={{ opacity: isConnected ? 1 : 0.8 }}>
                                        <MessageCircle size={22} />
                                        <span>Chat</span>
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* POPUPS - Moved to root for top-level z-index and visibility */}
            {popupType === 'super_interest_choice' && (
                <div className={styles.popupOverlay} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.popupTitle}>Interest Sent!</h3>
                        <p className={styles.popupMsg}>Would you like to upgrade to a Super Interest for 2 coins? Your profile will be highlighted at the top.</p>
                        <div className={styles.popupActions}>
                            <button className={styles.upgradeBtn} onClick={handleSuperInterestChoice}>
                                <Zap size={18} /> Send Super Interest
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

export default ClientCard;
