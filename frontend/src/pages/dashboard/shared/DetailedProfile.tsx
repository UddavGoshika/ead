import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Heart, Briefcase, UserCheck, Star,
    X, Phone, CheckCircle, Handshake, Bookmark, MessageCircle, Send,
    AlertCircle, Loader2, Video, PlusCircle
} from 'lucide-react';
import { advocateService, clientService } from '../../../services/api';
import { interactionService } from '../../../services/interactionService';
import { useAuth } from '../../../context/AuthContext';
import { useCall } from '../../../context/CallContext';
import type { Advocate } from '../../../types';
import TokenTopupModal from '../../../components/dashboard/shared/TokenTopupModal';
import PremiumTryonModal from './PremiumTryonModal';
import styles from './DetailedProfile.module.css';

interface Props {
    profileId: string | null;
    backToProfiles: () => void;
    isModal?: boolean;
    onClose?: () => void;
    onSelectForChat?: (partner: any) => void;
}

const DetailedProfile: React.FC<Props> = ({ profileId, backToProfiles, isModal, onClose, onSelectForChat }) => {
    const [activeTab, setActiveTab] = useState('About Me');
    const [interactionStage, setInteractionStage] = useState<'none' | 'interest_sent' | 'chat_input' | 'chat_active'>('none');
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm' | 'contact_confirm'>('none');
    const [message, setMessage] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState<{ email?: string, mobile?: string, whatsapp?: string } | null>(null);
    const [showTopup, setShowTopup] = useState(false);
    const [showTryonModal, setShowTryonModal] = useState(false);

    // Visibility settings (could be dynamic later)
    const [visibilitySettings] = useState<Record<string, boolean>>({
        "Education": true,
        "Connections": true,
        "Family": true,
        "Looking For": true
    });

    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();
    const plan = (user?.plan || 'Free').toLowerCase();
    const isPremium = user?.isPremium || (plan !== 'free' && plan !== '');
    const isPro = user?.role === 'advocate' || plan.toLowerCase().includes('pro') || plan.toLowerCase().includes('lite');
    const isUltra = user?.role === 'advocate' || plan.toLowerCase().includes('ultra');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return;
            try {
                setLoading(true);
                let fetchedProfile = null;
                let profileRole = '';

                // Try fetching as advocate first
                try {
                    const response = await advocateService.getAdvocateById(profileId);
                    if (response.data.success) {
                        const adv = response.data.advocate;
                        setProfile({ ...adv, role: 'advocate' });
                        if (adv.contactInfo) setContactInfo(adv.contactInfo);
                        if (user && adv.id) {
                            interactionService.recordActivity('advocate', String(adv.id), 'visit', String(user.id));
                        }
                        return; // Done
                    }
                } catch (e) { }

                // Try fetching as client
                try {
                    const clientRes = await clientService.getClientById(profileId);
                    if (clientRes.data.success) {
                        const client = clientRes.data.client;
                        const formattedClient = {
                            ...client,
                            role: 'client',
                            id: client.id,
                            userId: client.userId,
                            name: client.name || `${client.firstName} ${client.lastName}`,
                            image_url: client.image_url || client.img,
                            location: typeof client.location === 'object' ? `${client.location.city}, ${client.location.state}` : client.location,
                            experience: 'Client',
                            specialties: client.legalHelp ? [client.legalHelp.category, client.legalHelp.specialization].filter(Boolean) : [],
                            bio: client.legalHelp?.issueDescription || 'Legal client looking for assistance.'
                        };
                        setProfile(formattedClient);
                        if (client.contactInfo) setContactInfo(client.contactInfo);
                        if (user && formattedClient.id) {
                            interactionService.recordActivity('client', String(formattedClient.id), 'visit', String(user.id));
                        }
                    }
                } catch (e) { }
            } catch (err) {
                console.error("Error fetching profile as both advocate and client:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId, user]);

    const handleAction = async (action: string) => {
        if (!user || !profile?.id) return;
        try {
            // Determine target role based on profile type
            const targetRole = profile.role === 'client' ? 'client' : 'advocate';
            const res = await interactionService.recordActivity(targetRole, String(profile.id), action, String(user.id)) as any;

            if (res && res.coins !== undefined) {
                refreshUser({
                    coins: res.coins,
                    coinsUsed: res.coinsUsed,
                    coinsReceived: res.coinsReceived
                });
            }

            if (action === 'view_contact' && res.contact) {
                setContactInfo(res.contact);
            }

            return res;
        } catch (err: any) {
            const errorCode = err.response?.data?.error;
            if (errorCode === 'INTERACTION_LIMIT') {
                alert("You’ve reached the interaction limit for this profile (Max 3)");
            } else if (errorCode === 'ZERO_COINS' || errorCode === 'INSUFFICIENT_COINS') {
                setShowTopup(true);
            } else if (errorCode === 'UPGRADE_REQUIRED') {
                alert("Upgrade to premium to perform this action.");
            } else {
                alert(err.response?.data?.message || 'Action failed');
            }
            throw err;
        }
    };

    const handleInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleAction('interest');
        setPopupType('interest_upgrade');
    };

    const handleUpgradeToSuper = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await handleAction('superInterest');
            setPopupType('none');
            setInteractionStage('chat_input');
        } catch (err) { }
    };

    const handleSuperInterestClick = (e: React.MouseEvent) => { e.stopPropagation(); setPopupType('super_interest_confirm'); };
    const confirmSuperInterest = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('superInterest'); setPopupType('none'); setInteractionStage('chat_input'); } catch (err) { } };
    const handleShortlistClick = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('shortlist'); } catch (err) { } };
    const handleChatClick = (e: React.MouseEvent) => { e.stopPropagation(); setPopupType('chat_confirm'); };
    const confirmChat = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await handleAction('chat');
            setPopupType('none');
            // Trigger global chat popup instead of local input
            if (onSelectForChat && profile) {
                onSelectForChat(profile);
            }
        } catch (err) { }
    };
    const handleViewContact = (e: React.MouseEvent) => { e.stopPropagation(); setPopupType('contact_confirm'); };
    const confirmViewContact = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('view_contact'); setPopupType('none'); } catch (err) { } };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isPremium) {
            setShowTryonModal(true);
            return;
        }
        if (!profile) return;
        const targetId = typeof profile.userId === 'object' ? profile.userId._id : (profile.userId || profile.id);
        initiateCall(String(targetId), 'audio');
    };

    const handleVideoCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isPremium) {
            setShowTryonModal(true);
            return;
        }
        if (!profile) return;
        const targetId = typeof profile.userId === 'object' ? profile.userId._id : (profile.userId || profile.id);
        initiateCall(String(targetId), 'video');
    };

    const handleStartCase = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!profile) return;

        // Premium Check: Only advocates with premium plan can initiate cases
        const isUserPremium = user?.isPremium || (user?.plan && user.plan.toLowerCase() !== 'free');
        if (!isUserPremium && user?.role === 'advocate') {
            alert("To initiate a new case, please upgrade to a Premium Plan.");
            window.location.href = '/dashboard?page=upgrade';
            return;
        }

        // Navigate to my-cases and open initiate modal
        if (isModal && onClose) onClose();

        const initiationData = {
            clientId: profile.unique_id,
            title: `Legal Assistance - ${profile.legalHelp?.specialization || profile.name}`,
            category: profile.legalHelp?.category || 'Civil',
            description: profile.legalHelp?.issueDescription || ''
        };

        // Dispatch events to change page and open modal in MyCases
        window.dispatchEvent(new CustomEvent('change-tab', { detail: 'my-cases' }));
        window.dispatchEvent(new CustomEvent('open-initiate-case', { detail: initiationData }));

        // Brief delay if navigation takes time
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('change-tab', { detail: 'my-cases' }));
            window.dispatchEvent(new CustomEvent('open-initiate-case', { detail: initiationData }));
        }, 300);
    };

    const renderInternals = () => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <Loader2 className="animate-spin" size={48} color="#facc15" />
                    <p>Loading Profile Details...</p>
                </div>
            );
        }

        if (!profile) {
            return (
                <div className={styles.errorContainer}>
                    <h2>Profile Not Found</h2>
                    <p>The profile you are looking for does not exist or has been deactivated.</p>
                    <button onClick={backToProfiles} className={styles.backBtnLabel} style={{ marginTop: '20px', padding: '10px 20px', background: '#facc15', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Back to Search
                    </button>
                </div>
            );
        }

        // Rule 3 & 6: Visibility Logic
        const isPremiumViewer = isPremium;
        const isRestricted = !isPremiumViewer && profile.isFeatured;
        const displayId = profile.isMasked ? (profile.display_id || profile.unique_id.substring(0, 2) + "...") : profile.unique_id;
        const displayName = profile.name;
        const imageUrl = profile.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400";

        return (
            <>
                <div className={styles.topBar}>
                    <button className={styles.backBtn} onClick={isModal ? onClose : backToProfiles}>
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className={styles.header}>
                    <img
                        src={imageUrl}
                        alt={profile.name}
                        className={`${styles.bannerImage} ${profile.isMasked ? styles.blurredImage : ''}`}
                    />
                    <div className={styles.headerOverlay}>
                        {!profile.isMasked && <p className={styles.lastSeen}>Recently Active</p>}
                        <h1 className={styles.profileName}>
                            {displayName}
                            {!profile.isMasked && profile.age ? `, ${profile.age}` : ''}
                            <span className={styles.verifiedCheck}><CheckCircle size={14} color="#000" strokeWidth={3} /></span>
                        </h1>
                        <p className={styles.profileId}>ID - {displayId}</p>
                        <p className={styles.managedBy}>
                            {profile.role === 'client' ? 'Client Profile - Seeking Legal Assistance' : 'Profile managed by Professional Advocate'}
                        </p>
                    </div>
                </div>

                <div className={styles.tabs}>
                    {['About Me', profile.role === 'client' ? 'Legal Help' : 'Professional', 'Gallery'].map(tab => (
                        <div
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? (activeTab === 'About Me' ? styles.activeTab : (activeTab === 'Gallery' ? styles.activeTab : styles.activeTab)) : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className={styles.content}>
                    {isRestricted && (
                        <div className={styles.premiumOverlay} style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
                            background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
                        }}>
                            <div className={styles.premiumLockCard}>
                                <Star size={48} fill="#facc15" color="#facc15" className={styles.pulseIcon} style={{ marginBottom: '20px' }} />
                                <h1 className={styles.sectionHeading}>Featured Expert Locked</h1>
                                <p className={styles.popupMsg}>This is a top-tier Professional profile. Unlock full details to view experience, education, and contact options.</p>
                                <div className={styles.popupActions}>
                                    <button className={styles.confirmBtn} onClick={() => window.location.href = '/dashboard?page=upgrade'}>
                                        Upgrade to Premium
                                    </button>
                                    <button className={styles.cancelBtn} onClick={backToProfiles}>
                                        Cancel & Go Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.tabContent}>
                        {activeTab === 'About Me' && (
                            <>
                                <div className={styles.quickInfoGrid}>
                                    <div className={styles.quickInfoItem}>
                                        <div className={styles.quickInfoIcon}><Briefcase size={20} /></div>
                                        <div className={styles.quickInfoText}>
                                            <span className={styles.quickInfoValue}>{profile.experience || '6-10'} Years</span>
                                            <span className={styles.quickInfoLabel}>Years of Practice</span>
                                        </div>
                                    </div>
                                    <div className={styles.quickInfoItem}>
                                        <div className={styles.quickInfoIcon}><MapPin size={20} /></div>
                                        <div className={styles.quickInfoText}>
                                            <span className={styles.quickInfoValue}>{profile.location?.split(',')[0] || 'Telangana'}</span>
                                            <span className={styles.quickInfoLabel}>City, India</span>
                                        </div>
                                    </div>
                                    <div className={styles.quickInfoItem}>
                                        <div className={styles.quickInfoIcon}><Heart size={20} /></div>
                                        <div className={styles.quickInfoText}>
                                            <span className={styles.quickInfoValue}>{(profile.specialties && profile.specialties[0]) || (profile.role === 'client' ? 'Legal Assistance' : 'Legal Expert')}</span>
                                            <span className={styles.quickInfoLabel}>{profile.role === 'client' ? 'Required Specialty' : 'Major Specialty'}</span>
                                        </div>
                                    </div>
                                    <div
                                        className={`${styles.quickInfoItem} ${!contactInfo ? styles.clickableInfo : ''}`}
                                        onClick={!contactInfo ? handleViewContact : undefined}
                                    >
                                        <div className={styles.quickInfoIcon}><Phone size={20} /></div>
                                        <div className={styles.quickInfoText}>
                                            <span className={`${styles.quickInfoValue} ${!contactInfo && styles.blurredValue}`}>
                                                {contactInfo?.mobile || '+91-9876543210'}
                                            </span>
                                            <span className={styles.quickInfoLabel}>Mobile Number</span>
                                            {!contactInfo && <span className={styles.lockMessage}>Spent 1 coin to view</span>}
                                        </div>
                                    </div>
                                    <div
                                        className={`${styles.quickInfoItem} ${!contactInfo ? styles.clickableInfo : ''}`}
                                        onClick={!contactInfo ? handleViewContact : undefined}
                                    >
                                        <div className={styles.quickInfoIcon}><Send size={20} /></div>
                                        <div className={styles.quickInfoText}>
                                            <span className={`${styles.quickInfoValue} ${!contactInfo && styles.blurredValue}`}>
                                                {contactInfo?.email || 'expert@eadvocate.in'}
                                            </span>
                                            <span className={styles.quickInfoLabel}>Email Address</span>
                                            {!contactInfo && <span className={styles.lockMessage}>Spent 1 coin to view</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.bioContainer}>
                                    <h3 className={styles.bioHeading}>About Me</h3>
                                    <p className={styles.bioText}>
                                        {profile.bio || "Searching for excellence in legal matters? I am a dedicated professional with a track record of success. My approach is client-oriented and result-driven."}
                                    </p>
                                </div>

                                <div className={styles.educationSection}>
                                    <h3 className={styles.sectionHeading}>Education</h3>
                                    <div className={styles.timeline}>
                                        <div className={styles.timelineLine}></div>
                                        <div className={`${styles.timelineItem} ${styles.timelineItemActive}`}>
                                            <div className={styles.timelineDot}>
                                                <div className={styles.timelineIcon}><UserCheck size={8} /></div>
                                            </div>
                                            <div className={styles.timelineContent}>
                                                <h4>{profile.education?.degree || 'LLB Law Degree'}</h4>
                                                <p>{profile.education?.college || profile.education?.university || 'National Law University'}</p>
                                            </div>
                                        </div>
                                        <div className={styles.timelineItem}>
                                            <div className={styles.timelineDot}></div>
                                            <div className={styles.timelineContent}>
                                                <h4>High School Secondary</h4>
                                                <p>Completed from Reputed Institution</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {(activeTab === 'Professional' || activeTab === 'Legal Help') && (
                            <div className={styles.professionalSection}>
                                <h3 className={styles.sectionHeading}>{profile.role === 'client' ? 'Legal Help Requirements' : 'Professional Experience'}</h3>
                                <div className={styles.timeline}>
                                    <div className={styles.timelineLine}></div>
                                    <div className={`${styles.timelineItem} ${styles.timelineItemActive}`}>
                                        <div className={styles.timelineDot}>
                                            <div className={styles.timelineIcon}><Briefcase size={8} /></div>
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <h4>{profile.role === 'client' ? 'Case Category' : 'Senior Advocate & Legal Consultant'}</h4>
                                            <p>{profile.role === 'client' ? (profile.legalHelp?.category || 'General Legal Help') : (profile.experience || '10+') + ' Years of Active Practice'}</p>
                                        </div>
                                    </div>
                                    <div className={styles.timelineItem}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineContent}>
                                            <h4>{profile.role === 'client' ? 'Specific Issue' : 'Specialization Area'}</h4>
                                            <p>{profile.role === 'client' ? (profile.legalHelp?.specialization || 'Consultation') : (profile.specialties?.join(', ') || 'Civil & Criminal Law')}</p>
                                        </div>
                                    </div>
                                    {profile.role !== 'client' && (
                                        <div className={styles.timelineItem}>
                                            <div className={styles.timelineDot}></div>
                                            <div className={styles.timelineContent}>
                                                <h4>Case Success Rate</h4>
                                                <p>Successfully handled {profile.cases_handled || '500+'} legal cases.</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.role === 'client' && profile.legalHelp?.issueDescription && (
                                        <div className={styles.timelineItem}>
                                            <div className={styles.timelineDot}></div>
                                            <div className={styles.timelineContent}>
                                                <h4>Description</h4>
                                                <p>{profile.legalHelp.issueDescription}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Gallery' && (
                            <div className={styles.galleryGrid} style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px'
                            }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={styles.galleryItem} style={{
                                        aspectRatio: '1/1', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden'
                                    }}>
                                        <img
                                            src={i === 1 ? imageUrl : `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=200`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                                            alt={`Ref ${i}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.interactionWrap}>
                    <div className={styles.actionBar}>
                        <div className={styles.group}>
                            <div className={styles.actionItem} onClick={handleInterestClick}>
                                <div className={styles.actionIcon}><Handshake size={20} /></div>
                                <span className={styles.actionLabel}>Remind</span>
                            </div>
                            <div className={styles.actionItem} onClick={handleSuperInterestClick}>
                                <div className={styles.actionIcon}><Star size={20} /></div>
                                <span className={styles.actionLabel}>Super</span>
                            </div>
                            <div className={styles.actionItem} onClick={handleChatClick}>
                                <div className={styles.actionIcon}><MessageCircle size={20} /></div>
                                <span className={styles.actionLabel}>Chat</span>
                            </div>
                            {user?.role === 'advocate' && profile.role === 'client' && (
                                <div className={styles.actionItem} onClick={handleStartCase}>
                                    <div className={styles.actionIcon} style={{ background: '#facc15', color: '#000' }}><PlusCircle size={20} /></div>
                                    <span className={styles.actionLabel} style={{ color: '#facc15' }}>Start Case</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.group}>
                            <div className={`${styles.actionItem} ${contactInfo ? styles.actionActive : ''}`} onClick={handleViewContact}>
                                <div className={styles.actionIcon}><Phone size={20} /></div>
                                <span className={styles.actionLabel}>Contact</span>
                            </div>
                            <div className={styles.actionItem} onClick={handleCall}>
                                <div className={styles.actionIcon} style={{ color: '#22c55e' }}><Phone size={20} /></div>
                                <span className={styles.actionLabel}>Voice</span>
                            </div>
                            <div className={styles.actionItem} onClick={handleVideoCall}>
                                <div className={styles.actionIcon} style={{ color: '#3b82f6' }}><Video size={20} /></div>
                                <span className={styles.actionLabel}>Video</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Modals */}
                {popupType !== 'none' && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popupCard}>
                            <button className={styles.popupCloseBtn} onClick={() => setPopupType('none')}>
                                <X size={18} />
                            </button>
                            <div className={styles.popupContent}>
                                {popupType === 'interest_upgrade' && (
                                    <>
                                        <h4 className={styles.popupTitle}>Interest Sent</h4>
                                        <p className={styles.popupMsg}>Boost your visibility with Super Interest?</p>
                                        <div className={styles.popupActions}>
                                            <button className={styles.upgradeBtn} onClick={handleUpgradeToSuper}>Upgrade to Super Interest</button>
                                            <button className={styles.noThanksBtn} onClick={() => { setPopupType('none'); setInteractionStage('chat_input'); }}>No Thanks</button>
                                        </div>
                                    </>
                                )}
                                {popupType === 'super_interest_confirm' && (
                                    <>
                                        <h4 className={styles.popupTitle}>Confirm Super Interest</h4>
                                        <p className={styles.popupMsg}>Proceed with Super Interest?</p>
                                        <div className={styles.popupActions}>
                                            <button className={styles.confirmBtn} onClick={confirmSuperInterest}>Confirm</button>
                                            <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                                        </div>
                                    </>
                                )}
                                {popupType === 'chat_confirm' && (
                                    <>
                                        <h4 className={styles.popupTitle}>Initiate Chat</h4>
                                        <p className={styles.popupMsg}>1 token will be deducted. Continue?</p>
                                        <div className={styles.popupActions}>
                                            <button className={styles.confirmBtn} onClick={confirmChat}>Proceed</button>
                                            <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                                        </div>
                                    </>
                                )}
                                {popupType === 'contact_confirm' && (
                                    <>
                                        <h4 className={styles.popupTitle}>Unlock Contact Details</h4>
                                        <p className={styles.popupMsg}>1 coin will be deducted to reveal mobile and email. Continue?</p>
                                        <div className={styles.popupActions}>
                                            <button className={styles.confirmBtn} onClick={confirmViewContact}>Unlock Now</button>
                                            <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Info Modal Removed - Persistence is now in Grid */}

                <TokenTopupModal
                    isOpen={showTopup}
                    onClose={() => setShowTopup(false)}
                    onTopup={() => window.location.href = '/dashboard?page=upgrade'}
                />

                {showTryonModal && (
                    <PremiumTryonModal onClose={() => setShowTryonModal(false)} />
                )}
            </>
        );
    };

    return (
        <div className={`${styles.container} ${isModal ? styles.modalWrapper : ''}`} onClick={() => isModal && onClose && onClose()}>
            <div className={`${styles.mainContent} ${isModal ? styles.modalContent : ''}`} onClick={(e) => e.stopPropagation()}>
                {renderInternals()}
            </div>
        </div>
    );
};

export default DetailedProfile;
