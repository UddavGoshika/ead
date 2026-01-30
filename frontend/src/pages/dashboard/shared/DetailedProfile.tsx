import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Heart, Briefcase,
    Send, X, Star, MessageCircle, Handshake, UserCheck, Loader2,
    Bookmark
} from 'lucide-react';
import { advocateService } from '../../../services/api';
import { interactionService } from '../../../services/interactionService';
import { useAuth } from '../../../context/AuthContext';
import type { Advocate } from '../../../types';
import styles from './DetailedProfile.module.css';

interface Props {
    profileId: string | null;
    backToProfiles: () => void;
}

const DetailedProfile: React.FC<Props> = ({ profileId, backToProfiles }) => {
    const [activeTab, setActiveTab] = useState('About Me');
    const [interactionStage, setInteractionStage] = useState<'none' | 'interest_sent' | 'chat_input' | 'chat_active'>('none');
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm'>('none');
    const [message, setMessage] = useState('');
    const [profile, setProfile] = useState<Advocate | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibilitySettings] = useState<Record<string, boolean>>({
        "Education": true,
        "Connections": true,
        "Family": true,
        "Looking For": true
        // Add more based on ProfileSections
    });
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const isPro = plan.toLowerCase().includes('pro') || plan.toLowerCase().includes('lite');
    const isUltra = plan.toLowerCase().includes('ultra');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return;
            try {
                setLoading(true);
                const response = await advocateService.getAdvocateById(profileId);
                if (response.data.success) {
                    const adv = response.data.advocate;
                    setProfile(adv);

                    // Record visit if user is logged in
                    if (user && adv.id) {
                        interactionService.recordActivity('advocate', String(adv.id), 'visit', String(user.id));
                    }
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId, user]);

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
                <p>Profile not found</p>
                <button onClick={backToProfiles} className={styles.backBtnLabel}>Back to Search</button>
            </div>
        );
    }

    const handleInterestClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user && profile?.id) {
            await interactionService.recordActivity('advocate', String(profile.id), 'interest', String(user.id));
        }
        setPopupType('interest_upgrade');
    };

    const handleUpgradeToSuper = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user && profile?.id) {
            await interactionService.recordActivity('advocate', String(profile.id), 'superInterest', String(user.id));
        }
        setPopupType('none');
        setInteractionStage('chat_input');
    };

    const handleSuperInterestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('super_interest_confirm');
    };

    const confirmSuperInterest = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user && profile?.id) {
            await interactionService.recordActivity('advocate', String(profile.id), 'superInterest', String(user.id));
        }
        setPopupType('none');
        setInteractionStage('chat_input');
    };

    const handleShortlistClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user && profile?.id) {
            await interactionService.recordActivity('advocate', String(profile.id), 'shortlist', String(user.id));
        }
        setInteractionStage('chat_input');
    };

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('chat_confirm');
    };

    const confirmChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPopupType('none');
        // Handle chat logic if needed
    };


    const imageUrl = profile.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400";

    const maskName = (name: string) => {
        if (isPremium) return name;
        if (!name) return "**";
        return name.substring(0, 2) + "**";
    };

    const maskId = (id: string) => {
        if (isPremium) return id;
        if (!id) return "****";
        return (id.length > 5 ? id.substring(0, 3) : id.substring(0, 2)) + "****";
    };

    return (
        <div className={styles.container}>
            {!isPremium && (
                <div className={styles.premiumOverlay}>
                    <div className={styles.premiumLockCard}>
                        <div className={styles.lockIconWrap}>
                            <Star size={40} fill="#facc15" color="#facc15" className={styles.pulseIcon} />
                        </div>
                        <h2>Premium Profile Details</h2>
                        <p>Detailed advocate profiles are available exclusively for Premium members.</p>
                        <p className={styles.benefitText}>✓ View full background & experience</p>
                        <p className={styles.benefitText}>✓ Direct contact information</p>
                        <p className={styles.benefitText}>✓ Practice specialized areas</p>
                        <button className={styles.premiumUpgradeBtn} onClick={() => window.location.href = '/dashboard?page=upgrade'}>
                            Upgrade to Premium
                        </button>
                        <button className={styles.goBackBtn} onClick={backToProfiles}>
                            No Thanks, Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Top Bar - Matching Dashboard Style */}
            <header className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <button className={styles.backBtn} onClick={backToProfiles}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className={styles.pageTitle}>
                        Profile Detail
                    </h1>
                </div>

                <div className={styles.newsTicker}>
                    <span className={styles.tickerText}>✨ LATEST NEWS: SOMEONE JUST POSTED A NEW BLOG</span>
                </div>

                <div className={styles.topBarRight}>
                    <div className={styles.badgeStack}>
                        {isPremium ? (
                            <span className={`${styles.planBadge} ${isUltra ? styles.ultraBadge : isPro ? styles.proBadge : styles.liteBadge}`}>
                                {plan}
                            </span>
                        ) : (
                            <span className={`${styles.planBadge} ${styles.freeBadge}`}>Free Plan</span>
                        )}
                    </div>
                </div>
            </header>

            {/* Header Section */}
            <div className={styles.header}>
                <img src={imageUrl} alt={profile.name} className={`${styles.bannerImage} ${!isPremium ? styles.blurredImage : ''}`} />
                <div className={styles.headerOverlay}>
                    <p className={styles.lastSeen}>Recently Active</p>
                    <h1 className={styles.profileName}>
                        {maskName(profile.name)}
                        {profile.age ? `, ${profile.age}` : ''}
                    </h1>

                    <p className={styles.profileId}>
                        ID - <span className={styles.verifiedId}>{maskId(profile.unique_id)}</span>
                    </p>

                    <p className={styles.managedBy}>Experience: {profile.experience}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {['About Me', 'Family', 'Looking For'].map(tab => {
                    // Check visibility for tabs (Family / Looking For)
                    if (tab === 'Family' && !visibilitySettings['Family Information']) return null;
                    if (tab === 'Looking For' && !visibilitySettings['Partner Expectation']) return null;

                    return (
                        <div
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className={styles.content}>
                {activeTab === 'About Me' && (
                    <>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}><MapPin size={20} /></div>
                                <div className={styles.infoText}>
                                    <span className={styles.infoLabel}>Location</span>
                                    <span className={styles.infoValue}>{profile.location}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}><Heart size={20} /></div>
                                <div className={styles.infoText}>
                                    <span className={styles.infoLabel}>Specialization</span>
                                    <span className={styles.infoValue}>{profile.specialties?.join(', ') || 'General Law'}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}><Briefcase size={20} /></div>
                                <div className={styles.infoText}>
                                    <span className={styles.infoLabel}>Experience</span>
                                    <span className={styles.infoValue}>{profile.experience}</span>
                                </div>
                            </div>
                            {/* <div className={styles.infoItem}>
                                <div className={styles.infoIcon}><Languages size={20} /></div>
                                <div className={styles.infoText}>
                                    <span className={styles.infoLabel}>Rating</span>
                                    <span className={styles.infoValue}>⭐ {profile.rating || 4.5}</span>
                                </div>
                            </div> */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}><UserCheck size={20} /></div>
                                <div className={styles.infoText}>
                                    <span className={styles.infoLabel}>Cases Handled</span>
                                    <span className={styles.infoValue}>{profile.cases_handled || 0}+ Cases</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.compatibilityCard}>
                            <div className={styles.compatAvatar}>
                                <img src={imageUrl} alt="Compat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className={styles.compatText}>
                                <h4>Highly Rated Advocate</h4>
                                <p>This advocate has an excellent track record in {profile.specialties?.[0] || 'Legal'} matters.</p>
                            </div>
                        </div>

                        <div className={styles.bioSection}>
                            <h3 className={styles.sectionTitle}>About Me</h3>
                            <p>{profile.bio || `Professional advocate with ${profile.experience} experience specializing in ${profile.specialties?.join(', ') || 'legal'} matters. Committed to providing excellence in legal representation.`}</p>
                        </div>

                        {profile.education && visibilitySettings['Education'] && (
                            <div className={styles.bioSection}>
                                <h3 className={styles.sectionTitle}>Education</h3>
                                <div className={styles.timeline}>
                                    <div className={styles.timelineItem}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineContent}>
                                            <h4>{profile.education.degree}</h4>
                                            <p>{profile.education.college}, {profile.education.university} ({profile.education.gradYear})</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Floating Action Bar - Mirrored from AdvocateCard */}
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
                        </div>
                    )}
                </div>
            </div>

            {/* Modals - Mirrored from AdvocateCard */}
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
                                        <button className={styles.upgradeBtn} onClick={handleUpgradeToSuper}>
                                            Upgrade to Super Interest
                                        </button>
                                        <button className={styles.noThanksBtn} onClick={() => { setPopupType('none'); setInteractionStage('chat_input'); }}>
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
                                        <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                                    </div>
                                </>
                            )}

                            {popupType === 'chat_confirm' && (
                                <>
                                    <h4 className={styles.popupTitle}>Initiate Chat</h4>
                                    <p className={styles.popupMsg}>2 coins will be deducted. Continue?</p>
                                    <div className={styles.popupActions}>
                                        <button className={styles.confirmBtn} onClick={confirmChat}>Proceed</button>
                                        <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
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

export default DetailedProfile;
