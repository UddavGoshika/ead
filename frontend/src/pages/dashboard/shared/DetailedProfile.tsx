import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Heart, Briefcase, UserCheck, Star,
    X, Phone, CheckCircle, Handshake, Bookmark, MessageCircle, Send,
    AlertCircle, Loader2, Video, PlusCircle, ChevronRight,
    Bell, Trash2, Clock, Globe, Award, ShieldCheck, GraduationCap, Gavel, Image, FileText
} from 'lucide-react';
import { advocateService, clientService } from '../../../services/api';
import { interactionService } from '../../../services/interactionService';
import { useAuth } from '../../../context/AuthContext';
import { useCall } from '../../../context/CallContext';
import TokenTopupModal from '../../../components/dashboard/shared/TokenTopupModal';
import PremiumTryonModal from './PremiumTryonModal';
import styles from './DetailedProfile.module.css';
import { formatImageUrl } from '../../../utils/imageHelper';

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

    // Animation States
    const [animClass, setAnimClass] = useState('');
    const [prevIndex, setPrevIndex] = useState(currentIndex || 0);

    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();

    // Detect Tab Changes to animate
    useEffect(() => {
        if (tabs) {
            setAnimClass(styles.animTabSwitch);
            const t = setTimeout(() => setAnimClass(''), 400);
            return () => clearTimeout(t);
        }
    }, [tabs, listTitle]); // Re-anim on tab/list change

    // Detect Profile Navigation (Left/Right)
    useEffect(() => {
        if (currentIndex !== undefined) {
            if (currentIndex > prevIndex) {
                setAnimClass(styles.animSlideFromRight);
            } else if (currentIndex < prevIndex) {
                setAnimClass(styles.animSlideFromLeft);
            }
            const t = setTimeout(() => setAnimClass(''), 400);
            setPrevIndex(currentIndex);
            return () => clearTimeout(t);
        } else if (profileId) {
            // Initial load or direct ID change
            setAnimClass(styles.animSlideFromRight);
            const t = setTimeout(() => setAnimClass(''), 400);
            return () => clearTimeout(t);
        }
    }, [currentIndex, profileId]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return;
            try {
                setLoading(true);
                // Try fetching as advocate
                try {
                    const response = await advocateService.getAdvocateById(profileId);
                    if (response.data.success) {
                        setProfile({ ...response.data.advocate, role: 'advocate' });
                        if (response.data.advocate.contactInfo) setContactInfo(response.data.advocate.contactInfo);
                        if (user && response.data.advocate.id) {
                            interactionService.recordActivity('advocate', String(response.data.advocate.id), 'visit', String(user.id));
                        }
                        return;
                    }
                } catch (e) { }

                // Try fetching as client
                try {
                    const clientRes = await clientService.getClientById(profileId);
                    if (clientRes.data.success) {
                        const client = clientRes.data.client;
                        setProfile({
                            ...client,
                            role: 'client',
                            name: client.name || `${client.firstName} ${client.lastName}`,
                            image_url: client.image_url || client.img,
                            location: typeof client.location === 'object' ? `${client.location.city}, ${client.location.state}` : client.location,
                            experience: 'Client',
                            specialties: client.legalHelp ? [client.legalHelp.category, client.legalHelp.specialization].filter(Boolean) : [],
                            bio: client.legalHelp?.issueDescription || 'Legal client looking for assistance.'
                        });
                        if (client.contactInfo) setContactInfo(client.contactInfo);
                        if (user && client.id) {
                            interactionService.recordActivity('client', String(client.id), 'visit', String(user.id));
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

    if (loading) return (
        <div className={styles.modalWrapper}>
            <Loader2 className="animate-spin" size={48} color="#facc15" />
        </div>
    );

    if (!profile) return null;

    const displayName = profile.name || (profile.firstName ? `${profile.firstName} ${profile.lastName}` : "Legal Professional");
    const imageUrl = profile.image_url || "/assets/manoj.png";
    const experience = profile.experience || "8 Years";
    const loc = profile.location || "New Delhi, India";
    const uniqueId = profile.unique_id || "TP-EAD-ADV-0YGLVF";
    const bio = profile.bio || "A dedicated and results-driven professional.";

    const servicesList = [
        { name: "Legal Consultation", icon: <UserCheck size={16} /> },
        { name: "Doc Review", icon: <FileText size={16} /> },
        { name: "Litigation", icon: <Gavel size={16} /> },
        { name: "Arbitration", icon: <Handshake size={16} /> },
        { name: "Corporate Law", icon: <Briefcase size={16} /> },
        { name: "Property Disputes", icon: <MapPin size={16} /> }
    ];

    const allSpecializations = (profile.specialties && profile.specialties.length > 0)
        ? profile.specialties
        : [
            "Criminal Defense", "Civil Litigation", "Corporate Law", "Family Law",
            "Intellectual Property", "Real Estate", "Banking & Finance", "Tax Law",
            "Cyber Law", "Labor & Employment", "Environmental Law", "Human Rights",
            "Constitutional Law", "Arbitration", "Mediation", "Merger & Acquisition",
            "Startup Advisory", "Immigration Law", "Medical Negligence", "Consumer Protection",
            "Insurance Law", "Maritime Law", "Aviation Law", "Entertainment Law",
            "Sports Law", "International Trade", "Bankruptcy", "Wills & Trusts",
            "Personal Injury", "Product Liability", "Defamation", "Education Law", "Public Interest"
        ];

    return (
        <div className={isModal ? styles.modalWrapper : styles.container} onClick={() => isModal && onClose && onClose()}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>

                {/* 0. TOP NAVIGATION ROW (Outside Hero) */}
                <div className={styles.topNavRow}>
                    {/* Left: Back Button */}
                    <button className={styles.topNavBackBtn} onClick={isModal ? onClose : backToProfiles}><ArrowLeft size={20} />⬅</button>

                    {/* Center/Right: Toggle Tabs */}
                    {tabs && tabs.length > 0 ? (
                        <div className={styles.toggleTabContainer}>
                            {tabs.map((t, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.toggleTab} ${t.active ? styles.toggleTabActive : ''}`}
                                    onClick={t.onClick}
                                >
                                    {t.label} {t.count !== undefined && `(${t.count})`}
                                </button>
                            ))}
                        </div>
                    ) : <div></div>} {/* Spacer if no tabs */}

                    {/* Right spacer / Counter */}
                    <div style={{ minWidth: 40, color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
                        {currentIndex !== undefined && items ? `${currentIndex + 1} / ${items.length}` : ''}
                    </div>
                </div>

                {/* WRAPPER FOR ANIMATED CONTENT */}
                <div key={profileId} className={`${styles.profileContentWrapper} ${animClass}`}>

                    {/* 1. HERO SECTION (Split 40/60) */}
                    <div className={styles.heroSection}>
                        {/* Left: Info & Tags */}
                        <div className={styles.heroLeft}>

                            <div className={styles.profileIdentity}>
                                <span className={styles.lastSeen}>Last seen on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span>
                                <h1 className={styles.heroName}>{displayName}, {profile.age || 28} <CheckCircle style={{ display: 'inline', verticalAlign: 'middle' }} size={24} fill="#3b82f6" color="#0f172a" /></h1>
                                <p className={styles.heroId}>ID - {uniqueId}</p>
                            </div>

                            {/* Specializations Cloud (Scrollable if needed) */}
                            <div className={styles.specSection}>
                                <div className={styles.specTitle}><Award size={14} /> Expertise & Specializations</div>
                                <div className={styles.tagsGrid}>
                                    {allSpecializations.map((s: string, i: number) => (
                                        <div key={i} className={styles.tagItem}><CheckCircle size={10} color="#10b981" /> {s}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className={styles.heroActions}>
                                <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={() => setPopupType('chat_confirm')}>
                                    <MessageCircle size={18} /> Chat with Advocate
                                </button>
                                <button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={() => setPopupType('super_interest_confirm')}>
                                    <Heart size={18} fill={popupType === 'super_interest_confirm' ? 'white' : 'none'} /> Super Interest
                                </button>
                            </div>
                        </div>

                        {/* Right: Cover Image */}
                        <div className={styles.heroRight}>
                            <img src={formatImageUrl(imageUrl)} alt={displayName} className={styles.coverImage} />
                            <div className={styles.imageOverlay} />

                            {/* Old Arrows Removed */}
                        </div>
                    </div>

                    {/* 2. BOTTOM CONTENT (Restored Grid) */}
                    <div className={styles.contentContainer}>
                        {/* Main Left Column */}
                        <div className={styles.mainColumn}>
                            {/* About */}
                            <div className={styles.contentSection}>
                                <div className={styles.sectionHeader}><UserCheck size={20} color="#facc15" /> <h3>About {displayName}</h3></div>
                                <p className={styles.aboutText}>{bio}</p>
                            </div>

                            {/* Experience Stats */}
                            <div className={styles.contentSection}>
                                <div className={styles.sectionHeader}><Briefcase size={20} color="#facc15" /> <h3>Experience & Track Record</h3></div>
                                <div className={styles.statsRow}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}><Clock size={20} /></div>
                                        <div className={styles.statInfo}><span className={styles.statVal}>{experience}</span><span className={styles.statLbl}>Experience</span></div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}><ShieldCheck size={20} /></div>
                                        <div className={styles.statInfo}><span className={styles.statVal}>150+</span><span className={styles.statLbl}>Cases Won</span></div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className={styles.timelineBox}>
                                    <div className={styles.timelineItem}>
                                        <span className={styles.tDot}></span>
                                        <span className={styles.tYear}>Current</span>
                                        <h4 className={styles.tRole}>Senior Legal Consultant</h4>
                                        <p className={styles.tDesc}>Leading corporate advisory and litigation at E-Advocate Services.</p>
                                    </div>
                                    <div className={styles.timelineItem}>
                                        <span className={styles.tDot}></span>
                                        <span className={styles.tYear}>2018 - 2023</span>
                                        <h4 className={styles.tRole}>Associate Partner</h4>
                                        <p className={styles.tDesc}>Specialized in Family Law and Civil Dispute Resolution.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div className={styles.contentSection}>
                                <div className={styles.sectionHeader}><Award size={20} color="#facc15" /> <h3>Legal Services</h3></div>
                                <div className={styles.servGrid}>
                                    {servicesList.map((s, i) => (
                                        <div key={i} className={styles.servCard}>{s.icon} {s.name}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className={styles.sidebarColumn}>
                            <div className={styles.contactCard}>
                                <div className={styles.contactTitle}><Handshake size={20} color="#facc15" /> Connect Now</div>
                                <input type="text" className={styles.cInput} placeholder="Your Full Name" />
                                <input type="text" className={styles.cInput} placeholder="Mobile Number" />
                                <textarea className={styles.cInput} style={{ minHeight: 100, resize: 'vertical' }} placeholder="Briefly describe your case..."></textarea>
                                <button className={styles.cBtn} onClick={() => setPopupType('contact_confirm')}>Send Request <Send size={16} /></button>
                            </div>
                        </div>
                    </div>

                </div> {/* End of ProfileContentWrapper */}

                {/* Bottom Quick Actions (Restored) */}
                <div className={styles.quickActionsWrap}>
                    <div className={styles.quickActionsBar}>
                        <div className={styles.quickActionItem} onClick={() => handleAction('interest')}>
                            <div className={styles.quickActionIcon}><Bell size={20} /></div>
                            <span className={styles.quickActionLabel}>Remind</span>
                        </div>
                        <div className={styles.quickActionItem} onClick={() => setPopupType('super_interest_confirm')}>
                            <div className={styles.quickActionIcon}><Heart size={20} /></div>
                            <span className={styles.quickActionLabel}>Super</span>
                        </div>
                        <div className={styles.quickActionItem} onClick={() => handleAction('decline')}>
                            <div className={styles.quickActionIcon}><Trash2 size={20} /></div>
                            <span className={styles.quickActionLabel}>Cancel</span>
                        </div>
                        <div className={styles.quickActionItem} onClick={() => setPopupType('chat_confirm')}>
                            <div className={styles.quickActionIcon}><MessageCircle size={20} /></div>
                            <span className={styles.quickActionLabel}>Chat</span>
                        </div>
                    </div>
                </div>

                {/* Popups */}
                {popupType !== 'none' && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setPopupType('none')}>
                        <div style={{ background: '#1e293b', padding: 40, borderRadius: 20, maxWidth: 400, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', marginTop: 0 }}>
                                {popupType === 'chat_confirm' ? 'Start Chat Session' : 'Premium Feature'}
                            </h3>
                            <p style={{ color: '#cbd5e1' }}>
                                {popupType === 'chat_confirm' ? 'Start a direct chat session with this advocate. Costs 5 coins.' : 'This action requires coins. Proceed?'}
                            </p>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
                                <button className={styles.cBtn} style={{ marginTop: 0 }} onClick={() => { handleAction('view_contact'); setPopupType('none'); }}>Confirm</button>
                                <button className={styles.cBtn} style={{ marginTop: 0, background: '#334155', color: '#fff' }} onClick={() => setPopupType('none')}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <TokenTopupModal isOpen={showTopup} onClose={() => setShowTopup(false)} onTopup={() => window.location.href = '/dashboard?page=upgrade'} />
                {showTryonModal && <PremiumTryonModal onClose={() => setShowTryonModal(false)} />}
            </div>

            {/* FIXED NAV ARROWS (Outside Content) */}
            {items && items.length > 1 && currentIndex !== undefined && onNavigate && (
                <>
                    {currentIndex > 0 && (
                        <div className={`${styles.navArrow} ${styles.navLeft}`} onClick={(e) => { e.stopPropagation(); onNavigate(Math.max(0, currentIndex - 1)); }}>
                            <ChevronRight size={30} style={{ transform: 'rotate(180deg)' }} />
                        </div>
                    )}
                    {currentIndex < items.length - 1 && (
                        <div className={`${styles.navArrow} ${styles.navRight}`} onClick={(e) => { e.stopPropagation(); onNavigate(Math.min(items.length - 1, currentIndex + 1)); }}>
                            <ChevronRight size={30} />
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default DetailedProfile;
