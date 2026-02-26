import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { Advocate } from '../../../../types';
import { formatImageUrl } from '../../../../utils/imageHelper';
import { useRelationshipStore } from '../../../../store/useRelationshipStore';
import { interactionService } from '../../../../services/interactionService';
import {
    Loader2, ArrowLeft, Bookmark, MapPin, Briefcase, Scale, Shield,
    CheckCircle, Phone, Mail, Clock, MessageCircle, Video, Send,
    Sparkles, Award, BookOpen, Users, ChevronRight, ThumbsDown, Ban, X, UserCheck, Lock, Star
} from 'lucide-react';
import styles from './ClientAdvocateDetailedProfile.module.css';
import { useAuth } from '../../../../context/AuthContext';
import { useCall } from '../../../../context/CallContext';
import { useInteractions } from '../../../../hooks/useInteractions';
import { checkIsPremium } from '../../../../utils/planHelper';

interface DetailedProfileProps {
    profileId: string | null;
    backToProfiles: () => void;
    onSelectForChat?: (adv: Advocate) => void;
    showToast?: (msg: string) => void;
    isModal?: boolean;
    items?: any[];
    currentIndex?: number;
    onNavigate?: (index: number) => void;
    onClose?: () => void;
}

const ClientAdvocateDetailedProfile: React.FC<DetailedProfileProps> = ({
    profileId,
    backToProfiles,
    onSelectForChat,
    showToast,
    items = [],
    currentIndex = 0,
    onNavigate,
    onClose,
    isModal = false
}) => {
    const { user, refreshUser } = useAuth();
    const { handleInteraction } = useInteractions(showToast);
    const [advocate, setAdvocate] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { initiateCall } = useCall();

    const isPremium = checkIsPremium(user);
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || (user?.role as string) === 'super_admin';

    // STRICTOR MASKING: 
    // If NOT premium AND NOT admin AND server says isMasked !== false -> MASK IT.
    const shouldMask = !isPremium && !isAdmin && (advocate?.isMasked !== false);

    const relationships = useRelationshipStore((state: any) => state.relationships);
    const setRelationship = useRelationshipStore((state: any) => state.setRelationship);

    const actualRole = 'client';

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId || !user) return;
            setLoading(true);
            setAdvocate(null);
            try {
                const endpoint = `/client/${profileId}`;
                const res = await api.get(endpoint);

                if (res.data.success) {
                    let profileData = res.data.client;
                    if (profileData) {
                        // Priority Sync for "Self" view
                        const isSelf = String(profileId) === String(user.unique_id) || String(profileId) === String(user.id);
                        if (isSelf && (user as any).legalHelp) {
                            profileData = { ...profileData, legalHelp: (user as any).legalHelp };
                        }

                        setAdvocate(profileData);
                        const pid = profileData.userId?._id || profileData.userId || profileData.id || profileData._id;
                        if (pid && profileData.relationship_state) {
                            setRelationship(String(pid), profileData.relationship_state, 'receiver');
                        }
                    } else {
                        setError('Client profile data is empty');
                    }
                } else {
                    setError('Failed to load profile');
                }
            } catch (err: any) {
                setError(`Error loading profile: ${err.response?.data?.error || err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId, user]);

    if (!profileId) return null;

    if (loading) {
        return (
            <div className={styles.loadingBox}>
                <Loader2 className="animate-spin" size={40} color="#facc15" />
            </div>
        );
    }

    if (error || !advocate) {
        return (
            <div className={styles.errorContainer}>
                <p>{error || 'Profile not found'}</p>
                <button onClick={onClose || backToProfiles} className={styles.backButton}>Back</button>
            </div>
        );
    }

    const advocatePartnerId = advocate.userId?._id
        ? String(advocate.userId._id)
        : String(advocate.userId || advocate.id || '');

    const relData = relationships[advocatePartnerId] || (advocate as any)?.relationship_state || 'NONE';
    const state = (typeof relData === 'string' ? relData : relData.state || 'NONE').toUpperCase();

    const isInterested = state === 'INTEREST' || state === 'INTEREST_SENT' || state === 'SUPER_INTEREST' || state === 'SUPER_INTEREST_SENT';
    const isSuperInterested = state === 'SUPER_INTEREST' || state === 'SUPER_INTEREST_SENT';
    const isShortlisted = state === 'SHORTLISTED';
    const isAccepted = state === 'ACCEPTED' || state === 'SUPER_ACCEPTED' || state === 'CONNECTED';
    const isDeclined = state === 'DECLINED' || state === 'REJECTED';
    const isBlocked = state === 'BLOCKED';
    const isReceived = state === 'INTEREST_RECEIVED' || state === 'SUPER_INTEREST_RECEIVED';

    const performAction = async (action: string, data?: any) => {
        if (actionLoading || !user || !advocate) return;
        setActionLoading(true);
        try {
            const profileWithRole = { ...advocate, role: actualRole };
            return await handleInteraction(profileWithRole, action, data);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnlock = async () => {
        if (!user) return;
        if ((user?.coins || 0) < 1) {
            showToast?.('Insufficient coins. Please top up.');
            return;
        }
        if (!confirm(`Spending 1 coin will permanently reveal mobile and email for this profile. Proceed?`)) return;

        const res = await performAction('unlock_contact');
        if (res && res.success && res.contact) {
            setAdvocate((prev: any) => prev ? ({
                ...prev,
                contactInfo: res.contact,
                mobile: res.contact.mobile,
                email: res.contact.email,
                isMasked: false
            }) : null);
            if (res.coins !== undefined) {
                refreshUser({ coins: res.coins });
            }
        }
    };

    const handleInterest = () => performAction('interest');
    const handleSuperInterest = () => performAction('superInterest');
    const handleShortlist = () => performAction('shortlist');
    const handleAccept = () => performAction('accept');
    const handleDecline = () => performAction('decline');
    const handleBlock = () => { if (confirm('Block this user?')) performAction('block'); };
    const handleUnblock = () => performAction('unblock');
    const handleCancelInterest = () => performAction('withdraw');
    const handleRemoveShortlist = () => performAction('shortlist');
    const handleUpgradeSuper = () => performAction('upgrade_super');

    const handleChat = () => {
        if (onSelectForChat && advocate) {
            onSelectForChat({ ...advocate, partnerUserId: advocatePartnerId } as any);
        }
    };

    const handleVoiceCall = async () => {
        if (!isPremium) return showToast?.('Upgrade to Premium to call');
        try { await initiateCall(advocatePartnerId, 'audio'); } catch { showToast?.('Failed to start call'); }
    };

    const handleVideoCall = async () => {
        if (!isPremium) return showToast?.('Upgrade to Premium for Video Call');
        try { await initiateCall(advocatePartnerId, 'video'); } catch { showToast?.('Failed to start call'); }
    };

    const rawImg = advocate.image_url || advocate.profileImage || (advocate as any).img;
    const coverImageUrl = rawImg ? formatImageUrl(rawImg) : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';

    const displayName = shouldMask ? (advocate.name?.substring(0, 2) + '*****') : (advocate.name || 'Client');
    const displayId = shouldMask ? (advocate.display_id || advocate.unique_id || '').substring(0, 2) + '*****' : (advocate.display_id || advocate.unique_id || 'ID-UNKNOWN');

    return (
        <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
            {items.length > 1 && onNavigate && (
                <>
                    <button className={styles.navArrowLeft} onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1)}>
                        <ArrowLeft size={32} />
                    </button>
                    <button className={styles.navArrowRight} onClick={() => onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0)}>
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            <div className={styles.modalContent}>
                <div className={styles.heroSection}>
                    {items.length > 0 && (
                        <div className={styles.profileCounter}>
                            <span className={styles.counterCurrent}>{currentIndex + 1}</span> of {items.length} Profiles
                        </div>
                    )}

                    <div className={styles.heroLeft}>
                        <div className={styles.heroHeaderRow}>
                            <button onClick={(e) => { e.stopPropagation(); (onClose || backToProfiles)(); }} className={styles.backBtn}>
                                <ArrowLeft size={20} />
                            </button>
                        </div>

                        <div className={styles.profileIdentity}>
                            <span className={styles.lastSeen}>Active Client</span>
                            <h1 className={styles.heroName}>{displayName}</h1>
                            <span className={styles.heroId}>{displayId}</span>
                        </div>

                        <div className={styles.specSection}>
                            <div className={styles.specTitle}><Scale size={14} /> Legal Help Required</div>

                            <div className={styles.serviceGroups}>
                                {(() => {
                                    const serviceGrouping: Record<string, string[]> = {
                                        'Agreements Drafting': [
                                            'Agency Agreement', 'Arbitration Agreement', 'Business Transfer Agreement', 'Consultancy Agreement',
                                            'Co-founder Agreement', 'Distribution Agreement', 'Development Agreement', 'Exclusivity Agreement',
                                            'Franchise Agreement', 'Independent Contractor Agreement', 'Joint Venture Agreement', 'Partnership Deed',
                                            'Shareholders Agreement', 'Supply Agreement', 'Vendor Agreement', 'Retainer Agreement', 'Service Level Agreement (SLA)',
                                            'Employment Agreement', 'Non-Compete Agreement', 'Confidentiality Agreement', 'Non-Disclosure Agreement (NDA)',
                                            'Builder–Buyer Agreement', 'Lease Agreement (Residential)', 'Lease Agreement (Commercial)', 'Rental Agreement',
                                            'Purchase Agreement', 'Gift Deed (Agreement Format)', 'Intellectual Property Assignment Agreement',
                                            'Licensing Agreement', 'Technology Transfer Agreement', 'Trademark Licensing Agreement',
                                            'Memorandum of Understanding (MoU)', 'Settlement Agreement', 'Indemnity Agreement', 'Guarantee Agreement'
                                        ],
                                        'Affidavits': [
                                            'Address Proof Affidavit', 'Age Proof Affidavit', 'Birth Certificate Correction Affidavit', 'Change of Name Affidavit',
                                            'Character Certificate Affidavit', 'Date of Birth Correction Affidavit', 'Education / Qualification Affidavit',
                                            'Financial Status Affidavit', 'Heirship Affidavit', 'Income Affidavit', 'Loss of Documents Affidavit',
                                            'Marriage Affidavit', 'Nationality Affidavit', 'Ownership Declaration Affidavit', 'Passport Related Affidavit',
                                            'Relationship Proof Affidavit', 'Single Status Affidavit', 'Service Record Affidavit', 'Vehicle Ownership Affidavit',
                                            'Court Proceedings Affidavit', 'Government Submission Affidavit', 'Bank / Financial Institution Affidavit'
                                        ],
                                        'Legal Notices': [
                                            'Breach of Contract Notice', 'Consumer Complaint Notice', 'Divorce Legal Notice', 'Eviction Notice',
                                            'Fraud & Misrepresentation Notice', 'Loan Recovery Notice', 'Money Recovery Notice', 'Property Dispute Notice',
                                            'Rent Arrears Notice', 'Service Deficiency Notice', 'Termination of Contract Notice', 'Workplace Harassment Representation',
                                            'Cheque Bounce Notice (NI Act)', 'Reply to Legal Notice', 'Cease and Desist Notice'
                                        ],
                                        'Legal Document Services': [
                                            'Will Drafting', 'Codicil to Will', 'Power of Attorney (General)', 'Power of Attorney (Special)', 'Gift Deed',
                                            'Trust Deed', 'Lease Deed', 'Rental Agreement', 'Indemnity Bond', 'Declaration & Undertaking', 'Authorization Letter',
                                            'Property Declarations', 'Statutory Forms & Applications', 'Government Representations', 'Regulatory Filings'
                                        ]
                                    };

                                    const selectedServices = advocate.legalHelp?.featuredServices || [];
                                    const categorized: Record<string, string[]> = {};

                                    selectedServices.forEach((service: string) => {
                                        let found = false;
                                        for (const [cat, list] of Object.entries(serviceGrouping)) {
                                            if (list.includes(service)) {
                                                if (!categorized[cat]) categorized[cat] = [];
                                                categorized[cat].push(service);
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            if (!categorized['Other Services']) categorized['Other Services'] = [];
                                            categorized['Other Services'].push(service);
                                        }
                                    });

                                    return (
                                        <>
                                            {(advocate.legalHelp?.category || advocate.specialization) && (
                                                <div className={styles.serviceGroup}>
                                                    <div className={styles.groupTitle}>Core Requirements</div>
                                                    <div className={styles.groupGrid}>
                                                        {advocate.legalHelp?.category && <span className={styles.tagItem}>{advocate.legalHelp.category}</span>}
                                                        {advocate.legalHelp?.specialization && <span className={styles.tagItem}>{advocate.legalHelp.specialization}</span>}
                                                        <span className={styles.tagItem}>High Priority</span>
                                                    </div>
                                                </div>
                                            )}
                                            {Object.entries(categorized).map(([category, services]) => (
                                                <div key={category} className={styles.serviceGroup}>
                                                    <div className={styles.groupTitle}>{category}</div>
                                                    <div className={styles.groupGrid}>
                                                        {services.map(service => (
                                                            <span key={service} className={`${styles.tagItem} ${styles.featuredTag}`}>
                                                                {service}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className={styles.heroActionsFull}>
                            <button className={styles.commBtn} onClick={handleChat}><MessageCircle size={18} /> Chat</button>
                            <button className={styles.commBtn} onClick={handleVoiceCall}><Phone size={18} /> Voice</button>
                            <button className={styles.commBtn} onClick={handleVideoCall}><Video size={18} /> Video</button>
                            <button className={styles.commBtn} onClick={() => showToast?.('Premium Required')}><MapPin size={18} /> Consulting</button>
                        </div>
                    </div>

                    <div className={styles.heroRight}>
                        <img src={coverImageUrl} alt="Cover" className={`${styles.coverImage} ${shouldMask ? styles.blurredImage : ''}`} />
                        {shouldMask && (
                            <div className={styles.maskOverlay}>
                                <div className={styles.maskContent}>
                                    <Lock size={30} color="#facc15" />
                                    <span>Premium Feature</span>
                                    <p>Upgrade to view full client profile</p>
                                </div>
                            </div>
                        )}
                        <div className={styles.imageOverlay}></div>
                    </div>
                </div>

                <div className={styles.contentContainer}>
                    <div className={styles.mainColumn}>
                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}>
                                <Users size={20} color="#facc15" />
                                <h3>About {shouldMask ? 'Client' : (advocate.firstName || advocate.name?.split(' ')[0])}</h3>
                            </div>
                            <p className={styles.aboutText}>{advocate.bio || advocate.legalHelp?.issueDescription || "Looking for professional legal assistance."}</p>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}><Briefcase size={24} /></div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statVal}>Active</div>
                                    <div className={styles.statLbl}>Status</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}><Award size={24} /></div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statVal}>Immediate</div>
                                    <div className={styles.statLbl}>Requirement</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}><Star size={24} /></div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statVal}>Verified</div>
                                    <div className={styles.statLbl}>User</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}>
                                <Clock size={20} color="#facc15" />
                                <h3>Request History</h3>
                            </div>
                            <div className={styles.timelineBox}>
                                <div className={styles.timelineItem}>
                                    <div className={styles.tDot}></div>
                                    <span className={styles.tYear}>Current</span>
                                    <h4 className={styles.tRole}>{advocate.legalHelp?.category || 'Legal Inquiry'}</h4>
                                    <p className={styles.tDesc}>Initial inquiry submitted for legal evaluation.</p>
                                </div>
                                <div className={styles.timelineItem}>
                                    <div className={styles.tDot}></div>
                                    <span className={styles.tYear}>Awaiting</span>
                                    <h4 className={styles.tRole}>Response</h4>
                                    <p className={styles.tDesc}>Waiting for legal expert to connect.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}>
                                <Scale size={20} color="#facc15" />
                                <h3>Required Services</h3>
                            </div>
                            <div className={styles.servGrid}>
                                <div className={styles.servCard}><BookOpen size={18} color="#facc15" /> Consultation</div>
                                <div className={styles.servCard}><Shield size={18} color="#facc15" /> Doc Drafting</div>
                                <div className={styles.servCard}><Scale size={18} color="#facc15" /> Case Advice</div>
                                <div className={styles.servCard}><Users size={18} color="#facc15" /> Case Prep</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebarColumn}>
                        <div className={styles.contactCard} style={{ marginBottom: '20px' }}>
                            <div className={styles.contactTitle}><Phone size={20} color="#facc15" /> Contact Channels</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                    <Phone size={18} color="#facc15" />
                                    <div className={styles.statInfo}>
                                        <div className={shouldMask ? styles.blurText : ''}>
                                            {shouldMask ? '+91 9XXXX XXXXX' : (advocate.mobile || advocate.contactInfo?.mobile || 'N/A')}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                    <Mail size={18} color="#facc15" />
                                    <div className={styles.statInfo}>
                                        <div className={shouldMask ? styles.blurText : ''}>
                                            {shouldMask ? 'exa***@gmail.com' : (advocate.email || advocate.contactInfo?.email || 'N/A')}
                                        </div>
                                    </div>
                                </div>

                                {shouldMask && (
                                    <button onClick={handleUnlock} className={styles.unlockSmallBtn} style={{ marginTop: '5px', width: '100%', padding: '12px' }}>
                                        <Lock size={14} /> Unlock Mobile & Email (1 Coin)
                                    </button>
                                )}

                                <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                    <MapPin size={18} color="#facc15" />
                                    <div className={styles.statInfo}>
                                        <div>{advocate.city || advocate.location?.city || 'Tirupati'}, {advocate.state || advocate.location?.state || 'AP'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.contactCard} style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                            <div className={styles.contactTitle} style={{ justifyContent: 'center' }}>
                                {isAccepted ? <UserCheck size={20} color="#10b981" /> : <Clock size={20} color="#facc15" />}
                                {isAccepted ? 'Connected' : 'Waiting for You'}
                            </div>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Connect with this client to start discussed the matter in detail.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.quickActionsWrap}>
                    <div className={styles.quickActionsBar}>
                        {!isAccepted && !isReceived && !isDeclined && !isBlocked && (
                            <div className={`${styles.quickActionItem} ${isInterested ? styles.active : ''}`} onClick={isInterested ? handleCancelInterest : handleInterest}>
                                <div className={styles.quickActionIcon}>{isInterested ? <X size={20} /> : <Send size={20} />}</div>
                                <span className={styles.quickActionLabel}>{isInterested ? 'Cancel' : 'Interest'}</span>
                            </div>
                        )}
                        {!isAccepted && !isReceived && !isDeclined && !isBlocked && (
                            <div className={`${styles.quickActionItem} ${isSuperInterested ? styles.active : ''}`} onClick={isSuperInterested ? undefined : (isInterested ? handleUpgradeSuper : handleSuperInterest)}>
                                <div className={styles.quickActionIcon}><Sparkles size={20} /></div>
                                <span className={styles.quickActionLabel}>Super</span>
                            </div>
                        )}
                        {!isAccepted && !isDeclined && !isBlocked && (
                            <div className={`${styles.quickActionItem} ${isShortlisted ? styles.active : ''}`} onClick={isShortlisted ? handleRemoveShortlist : handleShortlist}>
                                <div className={styles.quickActionIcon}><Bookmark size={20} fill={isShortlisted ? '#facc15' : 'none'} /></div>
                                <span className={styles.quickActionLabel}>Save</span>
                            </div>
                        )}
                        {isAccepted && (
                            <div className={`${styles.quickActionItem} ${styles.chat}`} onClick={handleChat}>
                                <div className={styles.quickActionIcon}><MessageCircle size={20} /></div>
                                <span className={styles.quickActionLabel}>Chat</span>
                            </div>
                        )}
                        {isReceived && !isAccepted && (
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
                        <div className={`${styles.quickActionItem} ${isBlocked ? styles.active : ''} ${styles.block}`} onClick={isBlocked ? handleUnblock : handleBlock}>
                            <div className={styles.quickActionIcon}><Ban size={20} /></div>
                            <span className={styles.quickActionLabel}>{isBlocked ? 'Blocked' : 'Block'}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ClientAdvocateDetailedProfile;
