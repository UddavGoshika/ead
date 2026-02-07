import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Heart, Briefcase, UserCheck, Star,
    X, Phone, CheckCircle, Handshake, Bookmark, MessageCircle, Send,
    AlertCircle, Loader2, Video, PlusCircle, ChevronRight,
    Bell, Trash2, Clock, Globe, Award, ShieldCheck, GraduationCap, Gavel, Image
} from 'lucide-react';
import { advocateService, clientService } from '../../../services/api';
import { interactionService } from '../../../services/interactionService';
import { useAuth } from '../../../context/AuthContext';
import { useCall } from '../../../context/CallContext';
import TokenTopupModal from '../../../components/dashboard/shared/TokenTopupModal';
import PremiumTryonModal from './PremiumTryonModal';
import styles from './DetailedProfile.module.css';

interface Props {
    profileId: string | null;
    backToProfiles: () => void;
    isModal?: boolean;
    onClose?: () => void;
    onSelectForChat?: (partner: any) => void;
    // Navigation for activity lists
    items?: any[];
    currentIndex?: number;
    onNavigate?: (index: number) => void;
    listTitle?: string;
    // New Tabs Prop
    tabs?: {
        label: string;
        count?: number;
        active: boolean;
        onClick: () => void;
    }[];
}

const DetailedProfile: React.FC<Props> = ({
    profileId,
    backToProfiles,
    isModal,
    onClose,
    onSelectForChat,
    items,
    currentIndex,
    onNavigate,
    listTitle,
    tabs
}) => {
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm' | 'contact_confirm'>('none');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState<{ email?: string, mobile?: string, whatsapp?: string } | null>(null);
    const [showTopup, setShowTopup] = useState(false);
    const [showTryonModal, setShowTryonModal] = useState(false);

    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();
    const plan = (user?.plan || 'Free').toLowerCase();
    const isPremium = user?.isPremium || (plan !== 'free' && plan !== '');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return;
            try {
                setLoading(true);
                let fetchedProfile = null;

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
                        return;
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
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId, user]);

    const handleAction = async (action: string) => {
        if (!user || !profile?.id) return;
        try {
            const targetRole = profile.role === 'client' ? 'client' : 'advocate';
            const res = await interactionService.recordActivity(targetRole, String(profile.id), action, String(user.id)) as any;
            if (res && res.coins !== undefined) {
                refreshUser({ coins: res.coins, coinsUsed: res.coinsUsed, coinsReceived: res.coinsReceived });
            }
            if (action === 'view_contact' && res.contact) setContactInfo(res.contact);
            return res;
        } catch (err: any) {
            const errorCode = err.response?.data?.error;
            if (errorCode === 'ZERO_COINS' || errorCode === 'INSUFFICIENT_COINS') setShowTopup(true);
            else alert(err.response?.data?.message || 'Action failed');
            throw err;
        }
    };

    const handleInterestClick = (e: React.MouseEvent) => { e.stopPropagation(); handleAction('interest'); setPopupType('interest_upgrade'); };
    const handleSuperInterestClick = (e: React.MouseEvent) => { e.stopPropagation(); setPopupType('super_interest_confirm'); };
    const confirmSuperInterest = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('superInterest'); setPopupType('none'); } catch (err) { } };
    const handleViewContact = (e: React.MouseEvent) => { e.stopPropagation(); setPopupType('contact_confirm'); };
    const confirmViewContact = async (e: React.MouseEvent) => { e.stopPropagation(); try { await handleAction('view_contact'); setPopupType('none'); } catch (err) { } };

    if (loading) return (
        <div className={styles.modalWrapper}>
            <div className={styles.loadingContainer}>
                <Loader2 className="animate-spin" size={48} color="#facc15" />
                <p style={{ color: '#fff', marginTop: '20px' }}>Loading Profile Details...</p>
            </div>
        </div>
    );

    if (!profile) return (
        <div className={styles.modalWrapper}>
            <div className={styles.errorContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <h2 style={{ color: '#fff', margin: '20px 0' }}>Profile Not Found</h2>
                <button onClick={backToProfiles} className={styles.backToResults}>Back to Search</button>
            </div>
        </div>
    );

    const displayName = profile.name || "Legal Professional";
    const imageUrl = "/assets/manoj.png";
    const experience = profile.experience || "8+";
    const loc = profile.location || "Location Not Provided";

    const legalServices = [
        { name: "Court Representation", icon: <Gavel size={18} /> },
        { name: "Document Preparation", icon: <Award size={18} /> },
        { name: "Contract Review", icon: <ShieldCheck size={18} /> },
        { name: "Dispute Resolution", icon: <UserCheck size={18} /> },
        { name: "Family Law", icon: <Heart size={18} /> },
        { name: "Corporate Law", icon: <Briefcase size={18} /> },
        { name: "Real Estate", icon: <MapPin size={18} /> },
        { name: "Criminal Defense", icon: <ShieldCheck size={18} /> }
    ];

    const notableCases = [
        { title: "Corporate Fraud Investigation", desc: "Successfully represented a major corporation in a multi-million dollar fraud case.", status: "Won", year: "2021" },
        { title: "Intellectual Property Dispute", desc: "Defended client's patent rights against infringement claims from a competitor.", status: "Settled", year: "2018" },
        { title: "Family Estate Settlement", desc: "Mediated a complex family estate dispute involving multiple beneficiaries.", status: "Resolved", year: "2021" }
    ];

    return (
        <div className={isModal ? styles.modalWrapper : styles.container} onClick={() => isModal && onClose && onClose()}>
            <div className={isModal ? styles.modalContent : styles.container} onClick={e => e.stopPropagation()}>

                {/* Floating Sliders */}
                {items && items.length > 1 && currentIndex !== undefined && onNavigate && (
                    <>
                        <button className={`${styles.floatingNavBtn} ${styles.navLeft}`} onClick={() => onNavigate(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                            <ChevronRight size={32} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button className={`${styles.floatingNavBtn} ${styles.navRight}`} onClick={() => onNavigate(Math.min(items.length - 1, currentIndex + 1))} disabled={currentIndex === items.length - 1}>
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                <div className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.backBtn} onClick={isModal ? onClose : backToProfiles}>
                            <ArrowLeft size={24} />
                        </button>
                        {listTitle && <h2 className={styles.navTitle}>{listTitle}</h2>}
                    </div>
                </div>

                <div className={styles.heroSection}>
                    <img src={imageUrl} alt={displayName} className={styles.heroImage} />
                    <div className={styles.heroOverlay}></div>
                    <div className={styles.heroContent}>
                        {/* Top Right Controls: Image Badge + Tabs */}
                        <div className={styles.topRightControls}>
                            {tabs && tabs.length > 0 && (
                                <div className={styles.tabsContainer}>
                                    {tabs.map((t, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.tabBtn} ${t.active ? styles.tabBtnActive : ''}`}
                                            onClick={t.onClick}
                                        >
                                            {t.label}
                                            {t.count !== undefined && <span className={styles.tabCount}>({t.count})</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className={styles.imageCountBadge}>
                                <Image size={14} /> 6
                            </div>
                        </div>

                        <div className={styles.heroBottomContent}>
                            <div className={styles.lastSeenBadge}>Last seen on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</div>
                            <h1 className={styles.heroName}>
                                {displayName}, {profile.age || '28'}
                                <span className={styles.verifiedTick}><CheckCircle size={16} fill="#3b82f6" color="white" /></span>
                            </h1>
                            <p className={styles.heroId}>ID - {profile.unique_id || String(profile.id).slice(-8).toUpperCase()}</p>
                            {/* <p className={styles.heroManagedBy}>Profile managed by {profile.managed_by || 'Self'}</p> */}
                        </div>
                    </div>
                </div>

                <div className={styles.layoutGrid}>
                    <div className={styles.mainContentArea}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <UserCheck className={styles.sectionIcon} size={22} />
                                <h3>About {displayName}</h3>
                            </div>
                            <span className={styles.aboutDegrees}>Expert Legal Practitioner</span>
                            <p className={styles.aboutText}>{profile.bio || "A dedicated legal professional with extensive experience in handling complex litigation and advisory matters. Committed to providing excellence and results-driven representation for all clients."}</p>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Award className={styles.sectionIcon} size={22} />
                                <h3>Experience & Expertise</h3>
                            </div>
                            <div className={styles.statsRow}>
                                <div className={styles.statItem}>
                                    <div className={styles.statIconWrap}><Clock size={20} /></div>
                                    <div className={styles.statInfo}><span className={styles.statValue}>{experience}</span><span className={styles.statLabel}>Experience</span></div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statIconWrap}><ShieldCheck size={20} /></div>
                                    <div className={styles.statInfo}><span className={styles.statValue}>150+</span><span className={styles.statLabel}>Cases</span></div>
                                </div>

                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div>
                                    <h4 className={styles.listHeading}>Key Specializations</h4>
                                    <div className={styles.specializationGrid}>
                                        {(profile.specialties || ['General Practice', 'Litigation', 'Legal Advice']).map((s: string, i: number) => (
                                            <div key={i} className={styles.listItem}>
                                                <CheckCircle className={styles.checkIcon} size={14} /> {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className={styles.listHeading}>Recent History</h4>
                                    <div className={styles.experienceTimeline}>
                                        <div className={styles.timelinePoint}>
                                            <span className={styles.timelineYear}>Current</span>
                                            <span className={styles.timelineRole}>Legal Consultant</span>
                                        </div>
                                        <div className={styles.timelinePoint}>
                                            <span className={styles.timelineYear}>Earlier</span>
                                            <span className={styles.timelineRole}>Senior Associate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Briefcase className={styles.sectionIcon} size={22} />
                                <h3>Legal Services</h3>
                            </div>
                            <div className={styles.servicesGrid}>
                                {legalServices.map((s, i) => (
                                    <div key={i} className={styles.serviceCard}>
                                        <div className={styles.serviceIcon}>{s.icon}</div>
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebar}>
                        <div className={styles.sideCard}>
                            <div className={styles.sideBody}>
                                <div className={styles.detailItem}>
                                    <Phone className={styles.detailIcon} size={18} />
                                    <div className={styles.detailText} onClick={handleViewContact}>
                                        <span className={styles.detailLabel}>Mobile</span>
                                        <span className={styles.detailValue}>{contactInfo?.mobile || '••••••••••'}</span>
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <MapPin className={styles.detailIcon} size={18} />
                                    <div className={styles.detailText}>
                                        <span className={styles.detailLabel}>Location</span>
                                        <span className={styles.detailValue}>{loc}</span>
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <Clock className={styles.detailIcon} size={18} />
                                    <div className={styles.detailText}>
                                        <span className={styles.detailLabel}>Working Hours</span>
                                        <span className={styles.detailValue}>Flexible / Professional</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sideCard}>
                            <div className={styles.sideHeader}><Globe size={18} /> Languages</div>
                            <div className={styles.sideBody}>
                                <div className={styles.langGrid}>
                                    {['English', 'Hindi', 'Regional'].map(l => <span key={l} className={styles.langChip}>{l}</span>)}
                                </div>
                            </div>
                        </div>

                        <button onClick={backToProfiles} className={styles.backToResults}><ArrowLeft size={18} /> Back to Search</button>
                    </div>
                </div>

                {/* Bottom Quick Actions Bar */}
                <div className={styles.quickActionsWrap}>
                    <div className={styles.quickActionsBar}>
                        <div className={styles.quickActionItem} onClick={handleInterestClick}>
                            <div className={styles.quickActionIcon}><Bell size={24} /></div>
                            <span className={styles.quickActionLabel}>Remind</span>
                        </div>
                        <div className={styles.quickActionItem} onClick={handleSuperInterestClick}>
                            <div className={styles.quickActionIcon}><Heart size={24} /></div>
                            <span className={styles.quickActionLabel}>Super Interest</span>
                        </div>
                        <div className={styles.quickActionItem} onClick={() => handleAction('decline')}>
                            <div className={styles.quickActionIcon}><Trash2 size={24} /></div>
                            <span className={styles.quickActionLabel}>Cancel</span>
                        </div>
                        <div className={styles.quickActionItem} onClick={handleViewContact}>
                            <div className={styles.quickActionIcon}><Phone size={24} /></div>
                            <span className={styles.quickActionLabel}>Contact</span>
                        </div>
                    </div>
                </div>

                {/* Truly Fixed Interaction Popups */}
                {popupType !== 'none' && (
                    <div className={styles.popupOverlay} onClick={() => setPopupType('none')}>
                        <div className={styles.popupCard} onClick={e => e.stopPropagation()}>
                            <Award size={48} color="#facc15" style={{ marginBottom: '20px' }} />
                            <h4 className={styles.popupTitle}>
                                {popupType === 'contact_confirm' ? 'Unlock Contact' : 'Confirm Interest'}
                            </h4>
                            <p className={styles.popupMsg}>
                                {popupType === 'contact_confirm'
                                    ? 'Spend 1 coin to reveal direct contact details for this professional.'
                                    : 'Send an interest notification to start bridging the gap.'}
                            </p>
                            <div className={styles.popupActions}>
                                <button className={styles.confirmBtn} onClick={popupType === 'contact_confirm' ? confirmViewContact : confirmSuperInterest}>Confirm</button>
                                <button className={styles.cancelBtn} onClick={() => setPopupType('none')}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <TokenTopupModal isOpen={showTopup} onClose={() => setShowTopup(false)} onTopup={() => window.location.href = '/dashboard?page=upgrade'} />
                {showTryonModal && <PremiumTryonModal onClose={() => setShowTryonModal(false)} />}
            </div>
        </div>
    );
};

export default DetailedProfile;
