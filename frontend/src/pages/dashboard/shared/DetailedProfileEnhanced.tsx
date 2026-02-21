import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import type { Advocate } from '../../../types';
import { formatImageUrl } from '../../../utils/imageHelper';
import { useRelationshipStore } from '../../../store/useRelationshipStore';
import { interactionService } from '../../../services/interactionService';
import {
    Loader2, ArrowLeft, Star, Bookmark, MapPin, Briefcase, Scale, Shield,
    CheckCircle, Phone, Mail, Clock, MessageCircle, Video, Send,
    Sparkles, Award, BookOpen, Users, ChevronRight, ThumbsDown, Ban, X, UserCheck, Lock
} from 'lucide-react';
import styles from './DetailedProfile.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useCall } from '../../../context/CallContext';
import { useInteractions } from '../../../hooks/useInteractions';
import { checkIsPremium } from '../../../utils/planHelper';


interface DetailedProfileProps {
    profileId: string | null;
    backToProfiles: () => void;
    onSelectForChat?: (adv: Advocate) => void;
    showToast?: (msg: string) => void;
    isModal?: boolean;
    items?: any[];
    currentIndex?: number;
    onNavigate?: (index: number) => void;
    listTitle?: string;
    onClose?: () => void;
    tabs?: any[];
    partnerRole?: 'advocate' | 'client';
}

const DetailedProfileEnhanced: React.FC<DetailedProfileProps> = ({
    profileId,
    backToProfiles,
    onSelectForChat,
    showToast,
    items = [],
    currentIndex = 0,
    onNavigate,
    listTitle,
    onClose,
    isModal = false,
    partnerRole: propPartnerRole
}) => {
    const { user, refreshUser } = useAuth();
    const { handleInteraction } = useInteractions(showToast);
    const [advocate, setAdvocate] = useState<Advocate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { initiateCall } = useCall();

    const isPremium = checkIsPremium(user);
    const plan = user?.plan || 'Free';


    // Safety check: if we're in the advisor dashboard, we ARE an advisor.
    const isDashboardAdvisor = typeof window !== 'undefined' && window.location.href.includes('/dashboard/advisor');
    const isAdvisor = user?.role === 'legal_provider' || user?.role === 'advocate' || isDashboardAdvisor;
    const shouldMask = (advocate?.isMasked !== false) && !isAdvisor;

    const relationships = useRelationshipStore((state: any) => state.relationships);
    const setRelationship = useRelationshipStore((state: any) => state.setRelationship);

    // Reliability fix: use prop role if available, otherwise assume opposite role
    const actualRole = propPartnerRole || (user?.role.toLowerCase() === 'advocate' ? 'client' : 'advocate');
    const partnerRole = actualRole; // For backward compatibility within this file

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId || !user) return;
            setLoading(true);
            setAdvocate(null); // CRITICAL: Clear stale data immediately to prevent mis-clicks or snaps to old profiles
            try {
                const endpoint = actualRole === 'client' ? `/client/${profileId}` : `/advocates/${profileId}`;
                console.log(`[DetailedProfile] Fetching profile: ${endpoint} (propRole: ${propPartnerRole}, userRole: ${user.role})`);

                const res = await api.get(endpoint);

                if (res.data.success) {
                    const profileData = actualRole === 'client' ? res.data.client : res.data.advocate;

                    // STRICT VERIFICATION: Ensure the returned profile matches the requested ID
                    if (profileData) {
                        const returnedUniqueId = String(profileData.unique_id);
                        const returnedUserId = String(profileData.userId?._id || profileData.userId || '');
                        const returnedRecordId = String(profileData.id || profileData._id || '');

                        const isMatch = (profileId === returnedUniqueId) ||
                            (profileId === returnedUserId) ||
                            (profileId === returnedRecordId);

                        if (!isMatch) {
                            console.error(`[DetailedProfile] ID MISMATCH! Requested: ${profileId}, Found: [U:${returnedUniqueId}] [User:${returnedUserId}] [Rec:${returnedRecordId}]`);
                            setError('Critical Error: Profile ID mismatch. Please try again.');
                            return;
                        }

                        setAdvocate(profileData);

                        // Sync the server-reported relationship state to the global store immediately
                        if (profileData && profileData.relationship_state) {
                            const pid = profileData.userId?._id || profileData.userId || profileData.id || profileData._id;
                            if (pid) {
                                setRelationship(String(pid), profileData.relationship_state, actualRole === 'client' ? 'receiver' : 'sender');
                            }
                        }
                    } else {
                        setError('Profile data is empty');
                    }
                } else {
                    setError('Failed to load profile');
                }
            } catch (err: any) {
                console.error("Error fetching detailed profile", err);
                const apiError = err.response?.data?.error || err.message;
                setError(`Error loading profile: ${apiError}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [profileId, user, propPartnerRole]);



    if (!profileId) return null;

    if (loading) {
        const loadingContent = (
            <div className={styles.loadingBox}>
                <Loader2 className="animate-spin" size={40} color="#facc15" />
            </div>
        );
        return isModal ? (
            <div className={styles.modalWrapper} onClick={onClose || backToProfiles}>
                <div className={styles.modalContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {loadingContent}
                </div>
            </div>
        ) : loadingContent;
    }

    if (error || !advocate) {
        const errorContent = (
            <div className={styles.errorContainer}>
                <p>{error || 'Profile not found'}</p>
                <button onClick={onClose || backToProfiles} className={styles.backButton}>Back</button>
            </div>
        );
        return isModal ? (
            <div className={styles.modalWrapper} onClick={onClose || backToProfiles}>
                <div className={styles.modalContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {errorContent}
                </div>
            </div>
        ) : errorContent;
    }

    // Robust ID extraction: handles both populated object and string ID
    const advocatePartnerId = advocate.userId?._id
        ? String(advocate.userId._id)
        : String(advocate.userId || advocate.id || '');

    const relData = relationships[advocatePartnerId] || (advocate as any)?.relationship_state || 'NONE';
    const state = (typeof relData === 'string' ? relData : relData.state || 'NONE').toUpperCase();

    const isInterested = state === 'INTEREST' || state === 'INTEREST_SENT' || state === 'SUPER_INTEREST' || state === 'SUPER_INTEREST_SENT';
    const isSuperInterested = state === 'SUPER_INTEREST' || state === 'SUPER_INTEREST_SENT';

    // STRICT SERVER-DRIVEN STATUS (No more listTitle or local assumption logic)
    const isShortlisted = state === 'SHORTLISTED';
    const isAccepted = state === 'ACCEPTED' || state === 'SUPER_ACCEPTED' || state === 'CONNECTED';
    const isDeclined = state === 'DECLINED' || state === 'REJECTED';
    const isBlocked = state === 'BLOCKED';
    const isIgnored = state === 'IGNORED';
    const isReceived = state === 'INTEREST_RECEIVED' || state === 'SUPER_INTEREST_RECEIVED' || (typeof relData === 'object' && relData.role === 'receiver' && (relData.state === 'INTEREST' || relData.state === 'SUPER_INTEREST'));

    // Use centralized hook


    const performAction = async (action: string, data?: any) => {
        if (actionLoading || !user || !advocate) return;
        setActionLoading(true);
        try {
            // Ensure advocate object has the correct role for the hook
            const profileWithRole = { ...advocate, role: actualRole };
            const result = await handleInteraction(profileWithRole, action, data);

            // Special handling for actions that might need modal closure or specific UI updates
            if (action === 'block' || action === 'remove_connection') {
                // behaviors handled by hook's state updates, but if we need to close modal:
                // onClose?.(); 
            }
            return result;
        } catch (err) {
            // Error handling is done in hook, but we stop loading here
        } finally {
            setActionLoading(false);
        }
    };

    const handleInterest = () => performAction('interest');
    const handleSuperInterest = () => performAction('superInterest');
    const handleShortlist = () => performAction('shortlist');
    const handleAccept = () => performAction('accept');
    const handleDecline = () => performAction('decline');

    const handleBlock = async () => {
        if (!confirm('Are you sure you want to block this user?')) return;
        performAction('block');
    };

    const handleWithdraw = () => performAction('withdraw');
    const handleRemoveConnection = () => performAction('remove_connection');
    const handleSuperAccept = () => performAction('super_accept'); // Note: Hook needs 'super_accept' mapping if different
    const handleCancelInterest = () => performAction('withdraw'); // Corrected hook mapping
    const handleUpgradeSuper = () => performAction('upgrade_super'); // Check hook mapping
    const handleRemoveShortlist = () => performAction('shortlist');
    const handleUnblock = () => performAction('unblock');

    const handleUnlock = async () => {
        if (!user) return;
        if ((user?.coins || 0) < 1) {
            showToast?.('Insufficient coins. Please top up.');
            return;
        }
        const itemsToUnlock = actualRole === 'advocate' ? 'Mobile, Email and License ID' : 'Mobile and Email';
        if (!confirm(`Spending 1 coin will permanently reveal ${itemsToUnlock}. Proceed?`)) return;

        const res = await performAction('unlock_contact');
        if (res && res.success && res.contact) {
            // Update local state without reload
            setAdvocate(prev => prev ? ({
                ...prev,
                contactInfo: res.contact,
                licenseId: res.contact.licenseId || prev.licenseId,
                mobile: res.contact.mobile,
                email: res.contact.email,
                isMasked: false,
                isBlur: false
            }) : null);
        }
    };

    const handleMeet = async () => {
        if (!user) return;
        if (!advocate?.allowMeet && !isPremium) {
            showToast?.('Upgrade to Premium to book a meet');
            return;
        }
        performAction('meet_request');
    };

    const handleChat = () => {
        if (onSelectForChat && advocate) {
            // Ensure we pass an object that has the ID correctly set for ChatPopup's resolveUserId
            const chatPartner = {
                ...advocate,
                partnerUserId: advocatePartnerId // Explicitly set the ID we resolved
            };
            onSelectForChat(chatPartner);
        }
    };

    const handleVoiceCall = async () => {
        if (!advocate) return;
        if (!advocate.allowCall && !isPremium) {
            showToast?.('Upgrade to Premium to call');
            return;
        }
        try {
            await initiateCall(advocatePartnerId, 'audio');
        } catch (err) {
            showToast?.('Failed to start call');
        }
    };

    const handleVideoCall = async () => {
        if (!advocate) return;
        if (!advocate.allowVideo && !isPremium) {
            showToast?.('Upgrade to Premium for Video Call');
            return;
        }
        try {
            await initiateCall(advocatePartnerId, 'video');
        } catch (err) {
            showToast?.('Failed to start call');
        }
    };

    // Robust Image Logic
    const rawImg = advocate.image_url || advocate.profileImage || advocate.profilePicPath || (advocate as any).img || (advocate as any).profilePic || (advocate as any).image;
    const coverImageUrl = rawImg
        ? formatImageUrl(rawImg)
        : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';

    return (
        <div className={styles.modalWrapper}>
            {/* Navigation Buttons - Floating on Sides of the Screen */}
            {items.length > 1 && onNavigate && (
                <>
                    <button
                        className={styles.navArrowLeft}
                        onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1); }}
                        title="Previous"
                    >
                        <ArrowLeft size={32} />
                    </button>
                    <button
                        className={styles.navArrowRight}
                        onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0); }}
                        title="Next"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            <div className={styles.modalContent}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    {/* Profile Counter - Top Right Corner of Modal Content */}
                    {items.length > 0 && (
                        <div className={styles.profileCounter}>
                            <span className={styles.counterCurrent}>{currentIndex + 1}</span> of {items.length} Profiles
                        </div>
                    )}

                    <div className={styles.heroLeft}>
                        <div className={styles.heroHeaderRow}>
                            <button onClick={onClose || backToProfiles} className={styles.backBtn}>
                                <ArrowLeft size={20} />
                            </button>
                        </div>

                        <div className={styles.profileIdentity}>
                            <span className={styles.lastSeen}>Last seen on 10-Feb-24</span>
                            <h1 className={styles.heroName}>
                                {shouldMask && advocate.name ? advocate.name.substring(0, 2) + '*****' : (advocate.name || 'Advocate')}
                            </h1>
                            <span className={styles.heroId}>
                                {shouldMask && (advocate.display_id || advocate.unique_id)
                                    ? (advocate.display_id || advocate.unique_id || '').substring(0, 2) + '*****'
                                    : (advocate.display_id || advocate.unique_id || 'ID-UNKNOWN')}
                            </span>
                        </div>

                        {/* Specializations */}
                        <div className={styles.specSection}>
                            <div className={styles.specTitle}>
                                <Scale size={14} />
                                Expertise & Specializations
                            </div>
                            <div className={styles.tagsGrid}>
                                {advocate.specialization && (
                                    <span className={styles.tagItem}>
                                        {advocate.specialization}
                                    </span>
                                )}
                                {advocate.subSpecialization && (
                                    <span className={styles.tagItem}>
                                        {advocate.subSpecialization}
                                    </span>
                                )}
                                <span className={styles.tagItem}>Criminal</span>
                            </div>
                        </div>

                        {/* Communication Actions */}
                        <div className={styles.heroActionsFull}>
                            <button className={styles.commBtn} onClick={handleChat}>
                                <MessageCircle size={18} />
                                Chat
                            </button>
                            <button className={styles.commBtn} onClick={handleVoiceCall}>
                                <Phone size={18} />
                                Voice
                            </button>
                            <button className={styles.commBtn} onClick={handleVideoCall}>
                                <Video size={18} />
                                Video
                            </button>
                            <button className={styles.commBtn} onClick={handleMeet}>
                                <MapPin size={18} />
                                In-Person Consultation
                            </button>
                        </div>
                    </div>

                    <div className={styles.heroRight}>
                        <img src={coverImageUrl} alt="Cover" className={`${styles.coverImage} ${(advocate.isBlur || shouldMask) ? styles.blurredImage : ''}`} />
                        <div className={styles.imageOverlay}></div>
                    </div>
                </div>

                {/* Content Section */}
                <div className={styles.contentContainer}>
                    {/* Main Column */}
                    <div className={styles.mainColumn}>
                        {/* About Section */}
                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}>
                                <Users size={20} color="#facc15" />
                                <h3>About {shouldMask && advocate.name ? advocate.name.substring(0, 2) + '*****' : (advocate.firstName || advocate.name?.split(' ')[0] || 'User')}</h3>
                            </div>
                            <p className={styles.aboutText}>
                                {advocate.bio || "Hi"}
                            </p>
                        </div>

                        {/* Stats Row */}
                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <Briefcase size={24} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statVal}>
                                        {advocate.experience || '0-2'}
                                    </div>
                                    <div className={styles.statLbl}>Experience</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <Award size={24} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statVal}>150+</div>
                                    <div className={styles.statLbl}>Cases Won</div>
                                </div>
                            </div>
                            {/* <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <Star size={24} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statVal}>4.8</div>
                                    <div className={styles.statLbl}>Rating</div>
                                </div>
                            </div> */}
                        </div>

                        {/* Experience & Track Record */}
                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}>
                                <Briefcase size={20} color="#facc15" />
                                <h3>Experience & Track Record</h3>
                            </div>
                            <div className={styles.timelineBox}>
                                <div className={styles.timelineItem}>
                                    <div className={styles.tDot}></div>
                                    <span className={styles.tYear}>Current</span>
                                    <h4 className={styles.tRole}>Senior Legal Consultant</h4>
                                    <p className={styles.tDesc}>
                                        Leading corporate advisory and litigation of E-Advocate Services.
                                    </p>
                                </div>
                                <div className={styles.timelineItem}>
                                    <div className={styles.tDot}></div>
                                    <span className={styles.tYear}>2018 - 2023</span>
                                    <h4 className={styles.tRole}>Associate Partner</h4>
                                    <p className={styles.tDesc}>
                                        Specialized in Family Law and Civil Dispute Resolution.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Legal Services */}
                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}>
                                <Scale size={20} color="#facc15" />
                                <h3>Legal Services</h3>
                            </div>
                            <div className={styles.servGrid}>
                                <div className={styles.servCard}>
                                    <BookOpen size={18} color="#facc15" />
                                    Legal Consultation
                                </div>
                                <div className={styles.servCard}>
                                    <Shield size={18} color="#facc15" />
                                    Doc Review
                                </div>
                                <div className={styles.servCard}>
                                    <Scale size={18} color="#facc15" />
                                    Litigation
                                </div>
                                <div className={styles.servCard}>
                                    <Award size={18} color="#facc15" />
                                    Arbitration
                                </div>
                                <div className={styles.servCard}>
                                    <Briefcase size={18} color="#facc15" />
                                    Corporate Law
                                </div>
                                <div className={styles.servCard}>
                                    <Users size={18} color="#facc15" />
                                    Property Law
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className={styles.sidebarColumn}>
                        {/* Contact Info */}
                        <div className={styles.contactGrid}>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <Phone size={18} />
                                </div>
                                <div className={styles.contactInfo}>
                                    <div className={styles.contactValue}>
                                        {advocate.contactInfo?.mobile ? (
                                            advocate.contactInfo.mobile
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                                <span className={styles.blurText} style={{ userSelect: 'none' }}>+91 9XXXX XXXXX</span>
                                                <button className={styles.unlockSmallBtn} onClick={handleUnlock}>
                                                    <Lock size={12} /> Unlock Details (1 Coin)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <Mail size={18} />
                                </div>
                                <div className={styles.contactInfo}>
                                    <div className={styles.contactLabel}>Email Address</div>
                                    <div className={styles.contactValue}>
                                        {advocate.contactInfo?.email ? (
                                            advocate.contactInfo.email
                                        ) : (
                                            <span className={styles.blurText} style={{ userSelect: 'none' }}>exa***@gmail.com</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {actualRole === 'advocate' && (
                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}>
                                        <Shield size={18} />
                                    </div>
                                    <div className={styles.contactInfo}>
                                        <div className={styles.contactLabel}>License ID</div>
                                        <div className={styles.contactValue}>
                                            <span className={(!advocate.contactInfo && advocate.isMasked) ? styles.blurText : ''}>
                                                {advocate.licenseId || 'XXXXXXXXXX'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <MapPin size={18} />
                                </div>
                                <div className={styles.contactInfo}>
                                    <div className={styles.contactLabel}>Main Office</div>
                                    <div className={styles.contactValue}>
                                        {advocate.city || 'Tirupati'}, {advocate.state || 'Andhra Pradesh'}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}>
                                    <Clock size={18} />
                                </div>
                                <div className={styles.contactInfo}>
                                    <div className={styles.contactLabel}>Office Hours</div>
                                    <div className={styles.contactValue}>10:00 AM - 07:00 PM</div>
                                </div>
                            </div>
                        </div>

                        {/* Connect Now Form (Hidden if already connected or interest sent/received) */}
                        {!isAccepted && !isInterested && !isReceived && (
                            <div className={styles.contactCard}>
                                <div className={styles.contactTitle}>
                                    <Shield size={20} color="#facc15" />
                                    Connect Now
                                </div>
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    className={styles.cInput}
                                    defaultValue={user?.name}
                                />
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    className={styles.cInput}
                                    defaultValue={user?.phone}
                                />
                                <textarea
                                    placeholder="Briefly describe your case..."
                                    className={styles.cInput}
                                    rows={3}
                                />
                                <button className={styles.cBtn} onClick={handleInterest}>
                                    Send Interest <Send size={16} />
                                </button>
                            </div>
                        )}

                        {/* Status Display if connected/pending */}
                        {(isAccepted || isInterested || isReceived) && (
                            <div className={styles.contactCard} style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                                <div className={styles.contactTitle} style={{ justifyContent: 'center' }}>
                                    {isAccepted ? <UserCheck size={20} color="#10b981" /> : <Clock size={20} color="#facc15" />}
                                    {isAccepted ? 'Connected' : 'Request Pending'}
                                </div>
                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                                    {isAccepted
                                        ? 'You are now connected. You can start messaging from the action bar below.'
                                        : isInterested
                                            ? 'You have sent an interest. Waiting for their response.'
                                            : 'This user has sent you an interest. You can Accept or Reject below.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Bottom Bar */}
                <div className={styles.quickActionsWrap}>
                    <div className={styles.quickActionsBar}>
                        {/* 1. INTEREST / CANCEL BUTTON */}
                        {!isAccepted && !isReceived && !isDeclined && !isBlocked && (
                            <div
                                className={`${styles.quickActionItem} ${isInterested ? styles.active : ''} ${actionLoading ? styles.disabled : ''}`}
                                onClick={actionLoading ? undefined : (isInterested ? handleCancelInterest : handleInterest)}
                            >
                                <div className={styles.quickActionIcon}>
                                    {isInterested ? <X size={20} /> : <Send size={20} />}
                                </div>
                                <span className={styles.quickActionLabel}>
                                    {isInterested ? 'Cancel Interest' : 'Interest'}
                                </span>
                            </div>
                        )}

                        {/* 2. SUPER INTEREST / UPGRADE BUTTON */}
                        {!isAccepted && !isReceived && !isDeclined && !isBlocked && (
                            <div
                                className={`${styles.quickActionItem} ${isSuperInterested ? styles.active : ''} ${actionLoading ? styles.disabled : ''}`}
                                onClick={actionLoading ? undefined : (isSuperInterested ? undefined : (isInterested ? handleUpgradeSuper : handleSuperInterest))}
                            >
                                <div className={styles.quickActionIcon}>
                                    <Sparkles size={20} />
                                </div>
                                <span className={styles.quickActionLabel}>
                                    {isSuperInterested ? 'Super Interested' : (isInterested ? 'Upgrade' : 'Super Interest')}
                                </span>
                            </div>
                        )}

                        {/* 3. SHORTLIST BUTTON */}
                        {!isAccepted && !isDeclined && !isBlocked && (
                            <div
                                className={`${styles.quickActionItem} ${isShortlisted ? styles.active : ''} ${actionLoading ? styles.disabled : ''}`}
                                onClick={actionLoading ? undefined : (isShortlisted ? handleRemoveShortlist : handleShortlist)}
                            >
                                <div className={styles.quickActionIcon}>
                                    <Bookmark size={20} fill={isShortlisted ? '#facc15' : 'none'} />
                                </div>
                                <span className={styles.quickActionLabel}>
                                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                                </span>
                            </div>
                        )}

                        {/* 4. CHAT / MESSAGE / VOICE BUTTON (Shown if Accepted) */}
                        {isAccepted && (
                            <>
                                <div className={`${styles.quickActionItem} ${styles.chat}`} onClick={handleChat}>
                                    <div className={styles.quickActionIcon}>
                                        <MessageCircle size={20} />
                                    </div>
                                    <span className={styles.quickActionLabel}>Message</span>
                                </div>
                                <div className={`${styles.quickActionItem}`} onClick={handleVoiceCall}>
                                    <div className={styles.quickActionIcon}>
                                        <Phone size={20} />
                                    </div>
                                    <span className={styles.quickActionLabel}>Voice Call</span>
                                </div>
                            </>
                        )}

                        {/* 5. ACCEPT / REJECT (Shown if Interest Received) */}
                        {isReceived && !isAccepted && !isDeclined && !isBlocked && (
                            <>
                                <div className={`${styles.quickActionItem} ${styles.accept}`} onClick={handleAccept}>
                                    <div className={styles.quickActionIcon}><CheckCircle size={20} /></div>
                                    <span className={styles.quickActionLabel}>Accept</span>
                                </div>
                                <div className={`${styles.quickActionItem} ${styles.decline}`} onClick={handleDecline}>
                                    <div className={styles.quickActionIcon}><ThumbsDown size={20} /></div>
                                    <span className={styles.quickActionLabel}>Reject</span>
                                </div>
                            </>
                        )}

                        {/* 6. BLOCK / UNBLOCK BUTTON (Always available at the end) */}
                        <div
                            className={`${styles.quickActionItem} ${isBlocked ? styles.active : ''} ${styles.block}`}
                            onClick={isBlocked ? handleUnblock : handleBlock}
                        >
                            <div className={styles.quickActionIcon}>
                                <Ban size={20} color={isBlocked ? '#ef4444' : 'currentColor'} />
                            </div>
                            <span className={styles.quickActionLabel}>
                                {isBlocked ? 'Blocked' : 'Block'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Official Support Button */}
            <button
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    background: '#2563eb',
                    color: '#fff',
                    padding: '14px 24px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
                    zIndex: 100001,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)';
                }}
            >
                <MessageCircle size={18} />
                Lexi
            </button>
        </div>
    );
};

export default DetailedProfileEnhanced;
