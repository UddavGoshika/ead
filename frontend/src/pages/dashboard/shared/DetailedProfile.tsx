import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Heart, Briefcase,
    Send, X, Star, MessageCircle, Handshake, UserCheck, Loader2,
    Bookmark, Phone
} from 'lucide-react';
import { advocateService, clientService } from '../../../services/api';
import { interactionService } from '../../../services/interactionService';
import { useAuth } from '../../../context/AuthContext';
import type { Advocate } from '../../../types';
import TokenTopupModal from '../../../components/dashboard/shared/TokenTopupModal';
import styles from './DetailedProfile.module.css';

interface Props {
    profileId: string | null;
    backToProfiles: () => void;
    isModal?: boolean;
    onClose?: () => void;
}

const DetailedProfile: React.FC<Props> = ({ profileId, backToProfiles, isModal, onClose }) => {
    const [activeTab, setActiveTab] = useState('About Me');
    const [interactionStage, setInteractionStage] = useState<'none' | 'interest_sent' | 'chat_input' | 'chat_active'>('none');
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm' | 'contact_confirm'>('none');
    const [message, setMessage] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState<{ email?: string, mobile?: string, whatsapp?: string } | null>(null);
    const [showTopup, setShowTopup] = useState(false);

    // Visibility settings (could be dynamic later)
    const [visibilitySettings] = useState<Record<string, boolean>>({
        "Education": true,
        "Connections": true,
        "Family": true,
        "Looking For": true
    });

    const { user, refreshUser } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.role === 'advocate' || user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const isPro = user?.role === 'advocate' || plan.toLowerCase().includes('pro') || plan.toLowerCase().includes('lite');
    const isUltra = user?.role === 'advocate' || plan.toLowerCase().includes('ultra');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return;
            try {
                setLoading(true);
                // Try fetching as advocate first
                try {
                    const response = await advocateService.getAdvocateById(profileId);
                    if (response.data.success) {
                        const adv = response.data.advocate;
                        setProfile({ ...adv, role: 'advocate' });
                        if (user && adv.id) {
                            interactionService.recordActivity('advocate', String(adv.id), 'visit', String(user.id));
                        }
                        return; // Found advocate
                    }
                } catch (e) {
                    console.log("Not an advocate profile, trying client...");
                }

                // If not advocate, try fetching as client
                const clientRes = await clientService.getClientById(profileId);
                if (clientRes.data.success) {
                    const client = clientRes.data.client;
                    setProfile({
                        ...client,
                        role: 'client',
                        id: client.userId || client.id,
                        name: client.name || `${client.firstName} ${client.lastName}`,
                        image_url: client.image_url || client.img,
                        location: typeof client.location === 'object' ? `${client.location.city}, ${client.location.state}` : client.location,
                        experience: 'Client',
                        specialties: client.legalHelp ? [client.legalHelp.category, client.legalHelp.specialization].filter(Boolean) : [],
                        bio: client.legalHelp?.issueDescription || 'Legal client looking for assistance.'
                    });
                }
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
            const res = await interactionService.recordActivity('advocate', String(profile.id), action, String(user.id)) as any;

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
    const confirmChat = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('chat'); setPopupType('none'); setInteractionStage('chat_input'); } catch (err) { } };
    const handleViewContact = (e: React.MouseEvent) => { e.stopPropagation(); setPopupType('contact_confirm'); };
    const confirmViewContact = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('view_contact'); setPopupType('none'); } catch (err) { } };

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
                {/* Top Bar - Matching Dashboard Style */}
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.backBtn} onClick={isModal ? onClose : backToProfiles}>
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className={styles.pageTitle}>{profile?.role === 'client' ? 'Client Profile' : 'Advocate Profile'}</h1>
                    </div>
                    {isModal && (
                        <div className={styles.topBarRight}>
                            <button className={styles.modalCloseBtn} onClick={onClose}>
                                <X size={22} />
                            </button>
                        </div>
                    )}
                </header>

                {/* Header Section */}
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
                        </h1>
                        <p className={styles.profileId}>
                            ID - <span className={styles.verifiedId}>{displayId}</span>
                        </p>
                        {!profile.isMasked && <p className={styles.managedBy}>Professional Experience</p>}
                    </div>
                </div>

                <div className={styles.content} style={{ position: 'relative', minHeight: '400px' }}>
                    {isRestricted && (
                        <div className={styles.premiumOverlay} style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
                            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div className={styles.premiumLockCard}>
                                <div className={styles.lockIconWrap}>
                                    <Star size={40} fill="#facc15" color="#facc15" className={styles.pulseIcon} />
                                </div>
                                <h2>Featured Profile Locked</h2>
                                <p>This is a Featured Expert. Full details are available exclusively for Premium members.</p>
                                <p className={styles.benefitText}>✓ Reveal full identity & photo</p>
                                <p className={styles.benefitText}>✓ Access contact options</p>
                                <p className={styles.benefitText}>✓ View case history</p>
                                <button className={styles.premiumUpgradeBtn} onClick={() => window.location.href = '/dashboard?page=upgrade'}>
                                    Upgrade to Unlock
                                </button>
                                <button className={styles.goBackBtn} onClick={backToProfiles}>
                                    Go Back
                                </button>
                            </div>
                        </div>
                    )}

                    {!isRestricted && (
                        <>
                            <div className={styles.tabs}>
                                {['About Me', 'Family', 'Looking For'].map(tab => {
                                    if (tab === 'Family' && !visibilitySettings['Family Information']) return null;
                                    if (tab === 'Looking For' && !visibilitySettings['Partner Expectation']) return null;
                                    return (
                                        <div key={tab} className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab)}>
                                            {tab}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.tabContent}>
                                {activeTab === 'About Me' && (
                                    <>
                                        <div className={styles.statsRow}>
                                            <div className={styles.statBox}>
                                                <MapPin size={18} color="#facc15" />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statVal}>{profile.location}</span>
                                                    <span className={styles.statLab}>Location</span>
                                                </div>
                                            </div>
                                            <div className={styles.statBox}>
                                                <Heart size={18} color="#facc15" />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statVal}>{profile.specialties?.[0] || 'General Law'}</span>
                                                    <span className={styles.statLab}>Major Specialty</span>
                                                </div>
                                            </div>
                                            <div className={styles.statBox}>
                                                <Briefcase size={18} color="#facc15" />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statVal}>{profile.experience}</span>
                                                    <span className={styles.statLab}>Practice</span>
                                                </div>
                                            </div>
                                            <div className={styles.statBox}>
                                                <UserCheck size={18} color="#facc15" />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statVal}>{profile.cases_handled || 0}+</span>
                                                    <span className={styles.statLab}>Total Cases</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.compatibilityCard}>
                                            <div className={styles.compatIcon}>
                                                <Star size={24} color="#facc15" />
                                            </div>
                                            <div className={styles.compatText}>
                                                <h4>Highly Rated Professional</h4>
                                                <p>This {profile.role || 'advocate'} has an excellent track record in {profile.specialties?.[0] || 'Legal'} matters.</p>
                                            </div>
                                        </div>

                                        <div className={styles.bioSection}>
                                            <p>{profile.bio || `Professional advocate with ${profile.experience} experience specializing in ${profile.specialties?.join(', ') || 'legal'} matters. Committed to providing excellence in legal representation.`}</p>
                                        </div>

                                        {profile.education && visibilitySettings['Education'] && (profile.education.degree || profile.education.college) && (
                                            <div className={styles.bioSection}>
                                                <h3 className={styles.sectionTitle}>Education</h3>
                                                <div className={styles.timeline}>
                                                    <div className={styles.timelineItem}>
                                                        <div className={styles.timelineDot}></div>
                                                        <div className={styles.timelineContent}>
                                                            {profile.education.degree && <h4>{profile.education.degree}</h4>}
                                                            <p>
                                                                {[profile.education.college, profile.education.university].filter(Boolean).join(', ')}
                                                                {profile.education.gradYear && ` (${profile.education.gradYear})`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {!isRestricted && (
                    <div className={styles.interactionWrap}>
                        <div className={`${styles.actionBar} ${interactionStage === 'chat_input' ? styles.actionBarChatActive : ''}`}>
                            {interactionStage === 'chat_input' ? (
                                <div className={styles.chatInputContainer}>
                                    <button className={styles.chatCloseBtn} onClick={() => setInteractionStage('none')}>
                                        <X size={22} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className={styles.chatInput}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <button className={styles.sendIconBtn} onClick={async () => {
                                        if (user && profile?.id && message.trim()) {
                                            await interactionService.sendMessage(String(user.id), String(profile.id), message);
                                            setMessage('');
                                            setInteractionStage('none');
                                        }
                                    }}>
                                        <Send size={24} />
                                    </button>
                                </div>
                            ) : (
                                <div className={`${styles.actionItems} ${interactionStage === 'interest_sent' ? styles.actionsSliding : ''}`}>
                                    <div className={styles.actionItem} onClick={handleInterestClick}>
                                        <div className={styles.actionIcon} style={{ background: '#1e293b' }}>
                                            <Handshake size={24} />
                                        </div>
                                        <span className={styles.actionLabel}>Interest</span>
                                    </div>
                                    <div className={styles.actionItem} onClick={handleSuperInterestClick}>
                                        <div className={styles.actionIcon} style={{ background: '#1e293b' }}>
                                            <Star size={22} />
                                        </div>
                                        <span className={styles.actionLabel}>Super Interest</span>
                                    </div>
                                    <div className={styles.actionItem} onClick={handleShortlistClick}>
                                        <div className={styles.actionIcon} style={{ background: '#1e293b' }}>
                                            <Bookmark size={24} color="#fff" />
                                        </div>
                                        <span className={styles.actionLabel}>Shortlist</span>
                                    </div>
                                    {visibilitySettings['Connections'] !== false && (
                                        <div className={styles.actionItem} onClick={handleChatClick}>
                                            <div className={styles.actionIcon} style={{ background: '#1e293b' }}>
                                                <MessageCircle size={24} color="#fff" />
                                            </div>
                                            <span className={styles.actionLabel}>Chat</span>
                                        </div>
                                    )}
                                    {!profile.isMasked && (
                                        <div className={styles.actionItem} onClick={handleViewContact}>
                                            <div className={styles.actionIcon} style={{ background: '#1e293b' }}>
                                                <Phone size={24} color="#fff" />
                                            </div>
                                            <span className={styles.actionLabel}>Contact</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

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

                {/* Contact Info Modal */}
                {contactInfo && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popupCard}>
                            <button className={styles.popupCloseBtn} onClick={() => setContactInfo(null)}>
                                <X size={18} />
                            </button>
                            <div className={styles.popupContent}>
                                <h4 className={styles.popupTitle}>Contact Information</h4>
                                <div className={styles.infoGrid} style={{ marginTop: '20px' }}>
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoIcon}><Phone size={20} /></div>
                                        <div className={styles.infoText}>
                                            <span className={styles.infoLabel}>Mobile</span>
                                            <span className={styles.infoValue}>{contactInfo.mobile}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoIcon}><Phone size={20} /></div>
                                        <div className={styles.infoText}>
                                            <span className={styles.infoLabel}>WhatsApp</span>
                                            <span className={styles.infoValue}>{contactInfo.whatsapp || contactInfo.mobile}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className={styles.confirmBtn} onClick={() => setContactInfo(null)} style={{ marginTop: '20px', width: '100%' }}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                <TokenTopupModal
                    isOpen={showTopup}
                    onClose={() => setShowTopup(false)}
                    onTopup={() => window.location.href = '/dashboard?page=upgrade'}
                />
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
