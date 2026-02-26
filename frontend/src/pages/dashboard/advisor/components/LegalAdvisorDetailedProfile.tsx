import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { Advocate } from '../../../../types';
import { formatImageUrl } from '../../../../utils/imageHelper';
import { useRelationshipStore } from '../../../../store/useRelationshipStore';
import { interactionService } from '../../../../services/interactionService';
import {
    Loader2, ArrowLeft, Star, Bookmark, MapPin, Briefcase, Scale, Shield,
    CheckCircle, Phone, Mail, Clock, MessageCircle, Video, Send,
    Sparkles, Award, BookOpen, Users, ChevronRight, ThumbsDown, Ban, X, UserCheck, Lock
} from 'lucide-react';
import styles from './LegalAdvisorDetailedProfile.module.css';
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
    partnerRole?: 'advocate' | 'client';
    initialRelationshipState?: string;
}

const LegalAdvisorDetailedProfile: React.FC<DetailedProfileProps> = ({
    profileId,
    backToProfiles,
    onSelectForChat,
    showToast,
    items = [],
    currentIndex = 0,
    onNavigate,
    onClose,
    isModal = false,
    partnerRole: propPartnerRole,
    initialRelationshipState
}) => {
    const { user } = useAuth();
    const { handleInteraction } = useInteractions(showToast);
    const [advocate, setAdvocate] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { initiateCall } = useCall();

    const isPremium = checkIsPremium(user);
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || (user?.role as string) === 'super_admin';
    const shouldMask = false; // Advisors see all details

    const relationships = useRelationshipStore((state: any) => state.relationships);
    const setRelationship = useRelationshipStore((state: any) => state.setRelationship);

    const initialRole = propPartnerRole || (user?.role.toLowerCase() === 'advocate' ? 'client' : 'advocate');
    const [actualRole, setActualRole] = useState<'advocate' | 'client'>(initialRole as any);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId || !user) return;
            setLoading(true);
            setAdvocate(null);
            setError(null);

            const tryFetch = async (role: 'advocate' | 'client') => {
                const endpoint = role === 'client' ? `/client/${profileId}` : `/advocates/${profileId}`;
                const res = await api.get(endpoint);
                if (res.data.success) {
                    const data = role === 'client' ? res.data.client : res.data.advocate;
                    if (data) return { data, role };
                }
                return null;
            };

            try {
                // Try initial role first
                let result = await tryFetch(initialRole as any).catch(() => null);

                // If failed, try the other role as a fallback
                if (!result) {
                    const otherRole = initialRole === 'client' ? 'advocate' : 'client';
                    result = await tryFetch(otherRole).catch(() => null);
                }

                if (result) {
                    let profileData = result.data;
                    // Priority Sync for "Self" view
                    const isSelf = String(profileId) === String(user.unique_id) || String(profileId) === String(user.id);
                    if (isSelf && (user as any).legalHelp) {
                        profileData = { ...profileData, legalHelp: (user as any).legalHelp };
                    }

                    setAdvocate(profileData);
                    setActualRole(result.role);

                    if (result.data.relationship_state) {
                        const pid = result.data.userId?._id || result.data.userId || result.data.id || result.data._id;
                        const newState = result.data.relationship_state;

                        // Only override if not 'NONE', or if we don't have a more specific state already
                        if (pid && (newState !== 'NONE' || !initialRelationshipState)) {
                            setRelationship(String(pid), newState, result.role === 'client' ? 'receiver' : 'sender');
                        }
                    }
                } else {
                    setError('Profile not found in our records. It may have been deleted.');
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
    }, [profileId, user, propPartnerRole, initialRole]);

    if (!profileId) return null;

    if (loading) {
        return (
            <div className={styles.modalWrapper} onClick={onClose || backToProfiles}>
                <div className={styles.modalContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.loadingBox}>
                        <Loader2 className="animate-spin" size={40} color="#facc15" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !advocate) {
        return (
            <div className={styles.modalWrapper} onClick={onClose || backToProfiles}>
                <div className={styles.modalContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.errorContainer}>
                        <p>{error || 'Profile not found'}</p>
                        <button onClick={onClose || backToProfiles} className={styles.backButton}>Back</button>
                    </div>
                </div>
            </div>
        );
    }

    const advocatePartnerId = advocate.userId?._id
        ? String(advocate.userId._id)
        : String(advocate.userId || advocate.id || '');

    const relData = relationships[advocatePartnerId] || initialRelationshipState || (advocate as any)?.relationship_state || 'NONE';
    const state = (typeof relData === 'string' ? relData : relData.state || 'NONE').toUpperCase();

    const isInterested = state === 'INTEREST' || state === 'INTEREST_SENT' || state === 'SUPER_INTEREST' || state === 'SUPER_INTEREST_SENT';
    const isSuperInterested = state === 'SUPER_INTEREST' || state === 'SUPER_INTEREST_SENT';
    const isShortlisted = state === 'SHORTLISTED';
    const isAccepted = state === 'ACCEPTED' || state === 'SUPER_ACCEPTED' || state === 'CONNECTED';
    const isDeclined = state === 'DECLINED' || state === 'REJECTED';
    const isBlocked = state === 'BLOCKED';
    const isReceived = state === 'INTEREST_RECEIVED' || state === 'SUPER_INTEREST_RECEIVED' || (typeof relData === 'object' && relData.role === 'receiver' && (relData.state === 'INTEREST' || relData.state === 'SUPER_INTEREST'));

    const performAction = async (action: string, data?: any) => {
        if (actionLoading || !user || !advocate) return;
        setActionLoading(true);
        try {
            const profileWithRole = { ...advocate, role: actualRole };
            return await handleInteraction(profileWithRole, action, data);
        } catch (err) {
            console.error("Action failed", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleInterest = () => performAction('interest');
    const handleSuperInterest = () => performAction('superInterest');
    const handleShortlist = () => performAction('shortlist');
    const handleAccept = () => performAction('accept');
    const handleDecline = () => performAction('decline');
    const handleBlock = () => {
        if (confirm('Are you sure you want to block this user?')) performAction('block');
    };
    const handleCancelInterest = () => performAction('withdraw');
    const handleUpgradeSuper = () => performAction('upgrade_super');
    const handleRemoveShortlist = () => performAction('shortlist');
    const handleUnblock = () => performAction('unblock');

    const handleChat = () => {
        if (onSelectForChat && advocate) {
            onSelectForChat({ ...advocate, partnerUserId: advocatePartnerId } as any);
        }
    };

    const handleVoiceCall = async () => {
        if (!advocate) return;
        try {
            await initiateCall(advocatePartnerId, 'audio');
        } catch (err) {
            showToast?.('Failed to start call');
        }
    };

    const handleVideoCall = async () => {
        if (!advocate) return;
        try {
            await initiateCall(advocatePartnerId, 'video');
        } catch (err) {
            showToast?.('Failed to start call');
        }
    };

    const handleMeet = () => performAction('meet_request');

    const rawImg = advocate.image_url || advocate.profileImage || advocate.profilePicPath || (advocate as any).img || (advocate as any).profilePic || (advocate as any).image;
    const coverImageUrl = rawImg ? formatImageUrl(rawImg) : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';

    const displayName = shouldMask && advocate.name ? (advocate.name.substring(0, 2) + '*****') : (advocate.name || 'User');
    const displayId = shouldMask ? (advocate.display_id || advocate.unique_id || '').substring(0, 2) + '*****' : (advocate.display_id || advocate.unique_id || 'ID-UNKNOWN');

    return (
        <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
            {items.length > 1 && onNavigate && (
                <>
                    <button className={styles.navArrowLeft} onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1); }}>
                        <ArrowLeft size={32} />
                    </button>
                    <button className={styles.navArrowRight} onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0); }}>
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
                            <span className={styles.lastSeen}>Last seen on 10-Feb-24</span>
                            <h1 className={styles.heroName}>
                                {shouldMask && advocate.name ? advocate.name.substring(0, 2) + '*****' : (advocate.name || 'User')}
                            </h1>
                            <span className={styles.heroId}>
                                {shouldMask && (advocate.display_id || advocate.unique_id)
                                    ? (advocate.display_id || advocate.unique_id || '').substring(0, 2) + '*****'
                                    : (advocate.display_id || advocate.unique_id || 'ID-UNKNOWN')}
                            </span>
                        </div>
                        <div className={styles.specSection}>
                            <div className={styles.specTitle}><Scale size={14} /> {actualRole === 'client' ? 'Required Legal Help' : 'Expertise & Specializations'}</div>

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
                                            {actualRole !== 'client' && (
                                                <div className={styles.serviceGroup}>
                                                    <div className={styles.groupTitle}>Primary Specialization</div>
                                                    <div className={styles.groupGrid}>
                                                        {advocate.specialization && <span className={styles.tagItem}>{advocate.specialization}</span>}
                                                        {advocate.subSpecialization && <span className={styles.tagItem}>{advocate.subSpecialization}</span>}
                                                    </div>
                                                </div>
                                            )}
                                            {actualRole === 'client' && (
                                                <div className={styles.serviceGroup}>
                                                    <div className={styles.groupTitle}>Current Case Type</div>
                                                    <div className={styles.groupGrid}>
                                                        {advocate.legalHelp?.category && <span className={styles.tagItem}>{advocate.legalHelp.category}</span>}
                                                        {advocate.legalHelp?.specialization && <span className={styles.tagItem}>{advocate.legalHelp.specialization}</span>}
                                                        {advocate.legalHelp?.subDepartment && <span className={styles.tagItem}>{advocate.legalHelp.subDepartment}</span>}
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
                            <button className={styles.commBtn} onClick={handleMeet}><MapPin size={18} /> Consultation</button>
                        </div>
                    </div>
                    <div className={styles.heroRight}>
                        <img src={coverImageUrl} alt="Cover" className={`${styles.coverImage} ${shouldMask ? styles.blurredImage : ''}`} />
                        <div className={styles.imageOverlay}></div>
                    </div>
                </div>

                <div className={styles.contentContainer}>
                    <div className={styles.mainColumn}>
                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}><Users size={20} color="#facc15" />
                                <h3>{actualRole === 'client' ? 'Case Description' : `About ${advocate.name?.split(' ')[0] || 'User'}`}</h3>
                            </div>
                            <p className={styles.aboutText}>{actualRole === 'client' ? (advocate.legalHelp?.issueDescription || "No case description provided.") : (advocate.bio || "No biography provided.")}</p>
                        </div>
                        {actualRole === 'advocate' && (
                            <div className={styles.statsRow}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}><Briefcase size={24} /></div>
                                    <div className={styles.statInfo}><div className={styles.statVal}>{advocate.experience || 'N/A'}</div><div className={styles.statLbl}>Experience</div></div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}><Award size={24} /></div>
                                    <div className={styles.statInfo}><div className={styles.statVal}>150+</div><div className={styles.statLbl}>Cases Won</div></div>
                                </div>
                            </div>
                        )}
                        <div className={styles.contentSection}>
                            <div className={styles.sectionHeader}><Briefcase size={20} color="#facc15" /><h3>{actualRole === 'client' ? 'Requested Mode' : 'Experience & Track Record'}</h3></div>
                            <div className={styles.timelineBox}>
                                {actualRole === 'client' ? (
                                    <div className={styles.timelineItem}><div className={styles.tDot}></div><span className={styles.tYear}>Preferred</span><h4 className={styles.tRole}>{advocate.legalHelp?.mode || 'Online Consultation'}</h4><p className={styles.tDesc}>Client requested {advocate.legalHelp?.mode?.toLowerCase() || 'online'} support.</p></div>
                                ) : (
                                    <div className={styles.timelineItem}><div className={styles.tDot}></div><span className={styles.tYear}>Current</span><h4 className={styles.tRole}>Senior Specialist</h4><p className={styles.tDesc}>Providing expert legal guidance.</p></div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebarColumn}>
                        <div className={styles.contactCard} style={{ marginBottom: '20px' }}>
                            <div className={styles.contactTitle}><Phone size={20} color="#facc15" /> Contact Details</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                    <Phone size={18} color="#facc15" />
                                    <div className={styles.statInfo}>
                                        <div style={{ color: '#fff' }}>
                                            {(advocate.mobile || advocate.contactInfo?.mobile || advocate.phone || advocate.userId?.phone || 'Not Provided')}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Mobile Number</div>
                                    </div>
                                </div>
                                <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                    <Mail size={18} color="#facc15" />
                                    <div className={styles.statInfo}>
                                        <div style={{ color: '#fff' }}>
                                            {(advocate.email || advocate.contactInfo?.email || advocate.userId?.email || 'Not Provided')}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Email Address</div>
                                    </div>
                                </div>

                                {actualRole === 'advocate' && (
                                    <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                        <Shield size={18} color="#facc15" />
                                        <div className={styles.statInfo}>
                                            <div style={{ color: '#fff' }}>
                                                {advocate.licenseId || advocate.unique_id || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>License / ID</div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.statCard} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                    <MapPin size={18} color="#facc15" />
                                    <div className={styles.statInfo}>
                                        <div style={{ color: '#fff' }}>
                                            {actualRole === 'client'
                                                ? `${advocate.location?.city || advocate.address?.city || advocate.city || 'Tirupati'}, ${advocate.location?.state || advocate.address?.state || advocate.state || 'AP'}`
                                                : `${advocate.location?.city || advocate.city || 'Tirupati'}, ${advocate.location?.state || advocate.state || 'AP'}`
                                            }
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Location</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isAccepted && !isInterested && !isReceived && (
                            <div className={styles.contactCard}>
                                <div className={styles.contactTitle}><Shield size={20} color="#facc15" /> Connect Now</div>
                                <button className={styles.cBtn} onClick={handleInterest}>Send Interest <Send size={16} /></button>
                            </div>
                        )}
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
                        {isAccepted && (
                            <>
                                <div className={`${styles.quickActionItem} ${styles.chat}`} onClick={handleChat}>
                                    <div className={styles.quickActionIcon}><MessageCircle size={20} /></div>
                                    <span className={styles.quickActionLabel}>Message</span>
                                </div>
                                <div className={styles.quickActionItem} onClick={handleVoiceCall}>
                                    <div className={styles.quickActionIcon}><Phone size={20} /></div>
                                    <span className={styles.quickActionLabel}>Voice</span>
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

export default LegalAdvisorDetailedProfile;
