import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Heart, Briefcase, UserCheck, Star,
    X, Phone, CheckCircle, Handshake, Bookmark, MessageCircle, Send,
    AlertCircle, Loader2, Video, PlusCircle, ChevronRight,
    Bell, Trash2, Clock, Globe, Award, ShieldCheck, GraduationCap, Gavel, Image, FileText,
    Share2, Download, EyeOff, Ban, AlertTriangle, MoreHorizontal, UserPlus, Repeat, GitCompare, CheckSquare, RotateCcw, Info, FolderOpen
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
    const [popupType, setPopupType] = useState<'none' | 'interest_upgrade' | 'super_interest_confirm' | 'chat_confirm' | 'contact_confirm' | 'contact_reveal' | 'accept_confirm' | 'reject_confirm'>('none');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState<{ email?: string, mobile?: string, whatsapp?: string } | null>(null);
    const [showTopup, setShowTopup] = useState(false);
    const [showTryonModal, setShowTryonModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Connection Logic
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected_by_me' | 'rejected_by_them' | 'blocked' | 'shortlisted' | 'ignored'>('none');
    const [activityId, setActivityId] = useState<string | null>(null);

    // Animation States
    const [animClass, setAnimClass] = useState('');
    const [prevIndex, setPrevIndex] = useState(currentIndex || 0);

    const { user, refreshUser } = useAuth();
    const { initiateCall } = useCall();

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    // Helper for specific actions
    const performSpecificAction = async (actionType: string) => {
        if (!activityId) return;
        try {
            if (actionType === 'delete') {
                await interactionService.deleteActivity(activityId);
                // alert("Activity removed");
                if (backToProfiles) backToProfiles();
            } else if (actionType === 'unblock') {
                await interactionService.respondToActivity(activityId, 'unblocked' as any);
                setConnectionStatus('none');
            } else if (actionType === 'reconsider') {
                await interactionService.respondToActivity(activityId, 'accepted');
                setConnectionStatus('accepted');
            }
        } catch (e) { console.error(e); }
    };

    // Detect Tab Changes to animate
    useEffect(() => {
        if (tabs) {
            setAnimClass(styles.animTabSwitch);
            const t = setTimeout(() => setAnimClass(''), 400);
            return () => clearTimeout(t);
        }
    }, [tabs, listTitle]);

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
            setAnimClass(styles.animSlideFromRight);
            const t = setTimeout(() => setAnimClass(''), 400);
            return () => clearTimeout(t);
        }
    }, [currentIndex, profileId]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId || profileId === 'undefined' || profileId === 'null' || profileId === 'N/A') {
                setLoading(false);
                setProfile(null);
                setConnectionStatus('none');
                return;
            }

            try {
                setLoading(true);
                setProfile(null); // Clear previous profile data
                setContactInfo(null);
                console.log(`[DetailedProfile] Loading profile for: ${profileId}`);

                // Determine connection status from items (Activity Context)
                if (items && currentIndex !== undefined) {
                    const act = items[currentIndex];
                    if (act) {
                        setActivityId(act._id || act.id);
                        if (act.status === 'accepted') setConnectionStatus('accepted');
                        else if (act.status === 'blocked') setConnectionStatus('blocked');
                        else if (act.status === 'ignored') setConnectionStatus('ignored');
                        else if (act.status === 'declined') {
                            setConnectionStatus(act.isSender ? 'rejected_by_them' : 'rejected_by_me');
                        }
                        else if (act.type === 'shortlist') setConnectionStatus('shortlisted');
                        else if (act.type === 'interest' || act.type === 'super-interest' || act.type === 'superInterest') {
                            if (act.isSender) setConnectionStatus('pending_sent');
                            else setConnectionStatus('pending_received');
                        } else {
                            setConnectionStatus('none');
                        }
                    }
                } else {
                    setConnectionStatus('none');
                }

                let foundProfile = false;

                // Try fetching as advocate
                try {
                    const response = await advocateService.getAdvocateById(profileId);
                    if (response.data.success && response.data.advocate) {
                        setProfile({ ...response.data.advocate, role: 'advocate' });
                        if (response.data.advocate.contactInfo) setContactInfo(response.data.advocate.contactInfo);
                        if (user && response.data.advocate.id) {
                            interactionService.recordActivity('advocate', String(response.data.advocate.id), 'visit', String(user.id)).catch(() => { });
                        }
                        foundProfile = true;
                    }
                } catch (e) {
                    console.log(`[DetailedProfile] Advocate fetch failed for ${profileId}`);
                }

                // Try fetching as client
                if (!foundProfile) {
                    try {
                        const clientRes = await clientService.getClientById(profileId);
                        if (clientRes.data.success && clientRes.data.client) {
                            const client = clientRes.data.client;
                            setProfile({
                                ...client,
                                role: 'client',
                                name: client.name || `${client.firstName} ${client.lastName}`,
                                image_url: client.image_url || client.img,
                                location: typeof client.location === 'object' ? `${client.location.city || ''}, ${client.location.state || ''}` : client.location,
                                experience: 'Client',
                                specialties: client.legalHelp ? [client.legalHelp.category, client.legalHelp.specialization].filter(Boolean) : [],
                                bio: client.legalHelp?.issueDescription || 'Legal client looking for assistance.'
                            });
                            if (client.contactInfo) setContactInfo(client.contactInfo);
                            if (user && client.id) {
                                interactionService.recordActivity('client', String(client.id), 'visit', String(user.id)).catch(() => { });
                            }
                            foundProfile = true;
                        }
                    } catch (e) {
                        console.log(`[DetailedProfile] Client fetch failed for ${profileId}`);
                    }
                }

                if (!foundProfile) {
                    console.warn(`[DetailedProfile] Profile not resolved for ID: ${profileId}`);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId, user, items, currentIndex]);


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
        <div className={styles.modalWrapper} onClick={() => isModal && onClose && onClose()}>
            <div className={styles.loadingBox} onClick={e => e.stopPropagation()}>
                <Loader2 className="animate-spin" size={48} color="#facc15" />
            </div>
        </div>
    );

    if (!profile) return (
        <div className={styles.modalWrapper} onClick={() => isModal && onClose && onClose()}>
            <div className={styles.modalContent} style={{ height: 'auto', padding: 40, textAlign: 'center', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>Profile Not Found</h3>
                <p style={{ color: '#cbd5e1', marginBottom: '30px', lineHeight: '1.5' }}>
                    Unable to load profile details. This profile may have been deactivated or the record is invalid.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button className={styles.cBtn} onClick={isModal ? onClose : backToProfiles} style={{ marginTop: 0, width: 'auto', background: '#334155', color: '#fff' }}>
                        Go Back
                    </button>
                    {activityId && (
                        <button
                            className={styles.cBtn}
                            style={{ marginTop: 0, width: 'auto', background: '#ef4444', color: '#fff' }}
                            onClick={() => {
                                if (window.confirm("Remove this broken record from your activity?")) {
                                    performSpecificAction('delete');
                                }
                            }}
                        >
                            <Trash2 size={18} style={{ marginRight: '8px' }} />
                            Remove Activity
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

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
                                <p className={`${styles.heroId} ${!isPremium ? styles.blurredId : ''}`}>ID - {uniqueId}</p>
                            </div>

                            {/* Specializations Cloud (Scrollable if needed) */}
                            <div className={styles.specSection}>
                                <div className={styles.specTitle}>
                                    {profile.role === 'client' ? <FileText size={14} /> : <Award size={14} />}
                                    {profile.role === 'client' ? ' Required Legal Help' : ' Expertise & Specializations'}
                                </div>
                                <div className={styles.tagsGrid}>
                                    {allSpecializations.map((s: string, i: number) => (
                                        <div key={i} className={styles.tagItem}>
                                            {profile.role === 'client' ? <Info size={10} color="#38bdf8" /> : <CheckCircle size={10} color="#10b981" />}
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons - Communication Options */}
                            <div className={styles.heroActionsFull}>
                                <button
                                    className={`${styles.commBtn} ${connectionStatus !== 'accepted' ? styles.disabled : ''}`}
                                    onClick={() => {
                                        if (connectionStatus !== 'accepted') return;
                                        if (!isPremium) {
                                            setShowTryonModal(true);
                                            return;
                                        }
                                        if (onSelectForChat) {
                                            onSelectForChat(profile);
                                        } else {
                                            setPopupType('chat_confirm');
                                        }
                                    }}
                                >
                                    <MessageCircle size={20} /> <span>Chat</span>
                                </button>
                                <button
                                    className={`${styles.commBtn} ${connectionStatus !== 'accepted' ? styles.disabled : ''}`}
                                    onClick={() => {
                                        if (connectionStatus !== 'accepted') return;
                                        if (!isPremium) {
                                            setShowTryonModal(true);
                                            return;
                                        }
                                        initiateCall(String(profile.id), 'audio');
                                    }}
                                >
                                    <Phone size={20} /> <span>Voice</span>
                                </button>
                                <button
                                    className={`${styles.commBtn} ${connectionStatus !== 'accepted' ? styles.disabled : ''}`}
                                    onClick={() => {
                                        if (connectionStatus !== 'accepted') return;
                                        if (!isPremium) {
                                            setShowTryonModal(true);
                                            return;
                                        }
                                        initiateCall(String(profile.id), 'video');
                                    }}
                                >
                                    <Video size={20} /> <span>Video</span>
                                </button>
                                <button
                                    className={`${styles.commBtn} ${connectionStatus !== 'accepted' ? styles.disabled : ''}`}
                                    onClick={async () => {
                                        if (connectionStatus !== 'accepted') return;
                                        if (!isPremium) {
                                            setShowTryonModal(true);
                                            return;
                                        }
                                        if (window.confirm('Send an in-person meeting request to this profile?')) {
                                            try {
                                                await interactionService.recordActivity(
                                                    profile.role,
                                                    String(profile.unique_id || profile.id),
                                                    'meet_request',
                                                    String(user?.id || '')
                                                );
                                                alert('In-person meeting request sent successfully!');
                                            } catch (error) {
                                                console.error('Meet request failed', error);
                                                alert('Failed to send meeting request.');
                                            }
                                        }
                                    }}
                                >
                                    <MapPin size={20} /> <span>Meet</span>
                                </button>
                            </div>
                        </div>

                        {/* Right: Cover Image */}
                        <div className={styles.heroRight}>
                            <img
                                src={formatImageUrl(String(imageUrl))}
                                alt={displayName}
                                className={`${styles.coverImage} ${!isPremium ? styles.blurred : ''}`}
                            />
                            {!isPremium && (
                                <div className={styles.revealOverlay} style={{ opacity: 1, background: 'rgba(15, 23, 42, 0.6)' }}>
                                    <div className={styles.revealBtn} onClick={() => setShowTryonModal(true)}>Upgrade to View</div>
                                </div>
                            )}
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
                                <div className={styles.sectionHeader}>
                                    {profile.role === 'client' ? <Clock size={20} color="#facc15" /> : <Briefcase size={20} color="#facc15" />}
                                    <h3>{profile.role === 'client' ? 'Case Timeline & Stats' : 'Experience & Track Record'}</h3>
                                </div>
                                <div className={styles.statsRow}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}><Clock size={20} /></div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statVal}>{profile.role === 'client' ? 'Active' : experience}</span>
                                            <span className={styles.statLbl}>{profile.role === 'client' ? 'Member Status' : 'Experience'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}>{profile.role === 'client' ? <FolderOpen size={20} /> : <ShieldCheck size={20} />}</div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statVal}>{profile.role === 'client' ? '5+' : '150+'}</span>
                                            <span className={styles.statLbl}>{profile.role === 'client' ? 'Active Requirements' : 'Cases Won'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className={styles.timelineBox}>
                                    <div className={styles.timelineItem}>
                                        <span className={styles.tDot}></span>
                                        <span className={styles.tYear}>Current</span>
                                        <h4 className={styles.tRole}>{profile.role === 'client' ? 'Case Initiation' : 'Senior Legal Consultant'}</h4>
                                        <p className={styles.tDesc}>
                                            {profile.role === 'client'
                                                ? 'Currently seeking legal representation for a civil matter.'
                                                : 'Leading corporate advisory and litigation at E-Advocate Services.'}
                                        </p>
                                    </div>
                                    {profile.role !== 'client' && (
                                        <div className={styles.timelineItem}>
                                            <span className={styles.tDot}></span>
                                            <span className={styles.tYear}>2018 - 2023</span>
                                            <h4 className={styles.tRole}>Associate Partner</h4>
                                            <p className={styles.tDesc}>Specialized in Family Law and Civil Dispute Resolution.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Services / Requirements */}
                            <div className={styles.contentSection}>
                                <div className={styles.sectionHeader}>
                                    <Award size={20} color="#facc15" />
                                    <h3>{profile.role === 'client' ? 'Case Requirements' : 'Legal Services'}</h3>
                                </div>
                                <div className={styles.servGrid}>
                                    {(profile.role === 'client'
                                        ? [
                                            { name: "Legal Representation", icon: <UserCheck size={16} /> },
                                            { name: "Document drafting", icon: <FileText size={16} /> },
                                            { name: "Mediation", icon: <Handshake size={16} /> }
                                        ]
                                        : servicesList
                                    ).map((s, i) => (
                                        <div key={i} className={styles.servCard}>{s.icon} {s.name}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className={styles.sidebarColumn}>
                            {/* NEW: Contact Grid with Unblur */}
                            <div className={styles.contactTitle} style={{ marginBottom: '12px', fontSize: '14px', color: '#94a3b8' }}>Contact Info:</div>
                            <div className={styles.contactGrid}>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}><Phone size={18} /></div>
                                    <div className={styles.contactDetail}>
                                        <span className={styles.contactLbl}>Mobile Number</span>
                                        {contactInfo?.mobile ? (
                                            <span className={styles.contactVal}>{contactInfo.mobile}</span>
                                        ) : (
                                            <div className={styles.revealBox} onClick={() => setPopupType('contact_reveal')}>
                                                <span className={`${styles.contactVal} ${styles.blurred}`}>+91 98XXX XXX89</span>
                                                <div className={styles.revealOverlay}>
                                                    <div className={styles.revealBtn}>Reveal (1 Coin)</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}><Globe size={18} /></div>
                                    <div className={styles.contactDetail}>
                                        <span className={styles.contactLbl}>Email Address</span>
                                        {contactInfo?.email ? (
                                            <span className={styles.contactVal}>{contactInfo.email}</span>
                                        ) : (
                                            <div className={styles.revealBox} onClick={() => setPopupType('contact_reveal')}>
                                                <span className={`${styles.contactVal} ${styles.blurred}`}>advocate.xxx@gmail.com</span>
                                                <div className={styles.revealOverlay}>
                                                    <div className={styles.revealBtn}>Reveal (1 Coin)</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {profile.role !== 'client' && (
                                    <div className={styles.contactItem}>
                                        <div className={styles.contactIcon}><Handshake size={18} /></div>
                                        <div className={styles.contactDetail}>
                                            <span className={styles.contactLbl}>License ID</span>
                                            {isPremium ? (
                                                contactInfo?.email ? (
                                                    <span className={styles.contactVal}>{profile.licenseId || 'LIC-2024-XXXX'}</span>
                                                ) : (
                                                    <div className={styles.revealBox} onClick={() => setPopupType('contact_reveal')}>
                                                        <span className={`${styles.contactVal} ${styles.blurred}`}>LIC-XXXX-XXXX</span>
                                                        <div className={styles.revealOverlay}>
                                                            <div className={styles.revealBtn}>Reveal (1 Coin)</div>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className={styles.revealBox} onClick={() => setShowTryonModal(true)}>
                                                    <span className={`${styles.contactVal} ${styles.blurred}`}>LIC-XXXX-XXXX</span>
                                                    <div className={styles.revealOverlay}>
                                                        <div className={styles.revealBtn}>Upgrade to View</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}><MapPin size={18} /></div>
                                    <div className={styles.contactDetail}>
                                        <span className={styles.contactLbl}>Main Office</span>
                                        <span className={styles.contactVal}>{profile.location || 'New Delhi, India'}</span>
                                    </div>
                                </div>

                                {profile.role !== 'client' && (
                                    <div className={styles.contactItem}>
                                        <div className={styles.contactIcon}><Clock size={18} /></div>
                                        <div className={styles.contactDetail}>
                                            <span className={styles.contactLbl}>Office Hours</span>
                                            <span className={styles.contactVal}>{profile.officeHours || '10:00 AM - 07:00 PM'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.contactCard}>
                                <div className={styles.contactTitle}><Handshake size={20} color="#facc15" /> {profile.role === 'client' ? 'Connect with Client' : 'Connect Now'}</div>
                                <input type="text" className={styles.cInput} placeholder="Your Full Name" />
                                <input type="text" className={styles.cInput} placeholder="Mobile Number" />
                                <textarea className={styles.cInput} style={{ minHeight: 100, resize: 'vertical' }} placeholder={profile.role === 'client' ? "Offer your legal assessment..." : "Briefly describe your case..."}></textarea>
                                <button className={styles.cBtn} onClick={() => setPopupType('contact_confirm')}>{profile.role === 'client' ? 'Interested' : 'Send Request'} <Send size={16} /></button>
                            </div>
                        </div>
                    </div>

                </div> {/* End of ProfileContentWrapper */}

                {/* Bottom Quick Actions (Dynamic) */}
                {/* Bottom Quick Actions (Dynamic) */}
                {/* Bottom Quick Actions (Dynamic Grid-Based) */}
                <div className={styles.quickActionsWrap}>
                    {(() => {
                        let buttons: any[] = [];
                        let moreOptions: any[] = [];

                        // State-based Logic overrides
                        let effectiveStatus = connectionStatus;
                        // Example: If in shortlist but interest sent, treat as sent
                        if (effectiveStatus === 'shortlisted' && profile?.interests?.includes(user?.id)) {
                            effectiveStatus = 'pending_sent';
                        }

                        switch (effectiveStatus) {
                            case 'accepted':
                                buttons = [
                                    { label: 'Contact Details', icon: <UserPlus size={18} />, onClick: () => handleAction('view_contact') },
                                    { label: 'Share Profile', icon: <Share2 size={18} />, onClick: () => { navigator.clipboard.writeText(window.location.href); alert("Profile Link Copied!"); } },
                                    { label: 'Shortlist', icon: <Bookmark size={18} />, onClick: () => handleAction('shortlist') }
                                ];
                                moreOptions = [
                                    { label: 'Add Personal Note', onClick: () => alert("Note feature coming soon") },
                                    { label: 'Download Biodata', onClick: () => alert("Downloading Biodata...") },
                                ];
                                break;
                            case 'pending_received':
                                buttons = [
                                    { label: 'Accept', icon: <CheckCircle size={18} />, onClick: () => setPopupType('accept_confirm') },
                                    { label: 'Decline', icon: <X size={18} />, onClick: () => setPopupType('reject_confirm') },
                                    { label: 'Shortlist', icon: <Bookmark size={18} />, onClick: () => handleAction('shortlist') },
                                ];
                                moreOptions = [
                                    { label: 'View Full Profile', onClick: () => { } },
                                    { label: 'Respond Later', onClick: () => alert("Reminder set") },
                                    { label: 'Block Profile', onClick: () => alert("Profile Blocked") },
                                    { label: 'Report Profile', onClick: () => alert("Report submitted") },
                                ];
                                break;
                            case 'pending_sent':
                                buttons = [
                                    { label: 'Cancel Interest', icon: <X size={18} />, onClick: () => performSpecificAction('delete') },
                                    { label: 'Remind', icon: <Clock size={18} />, onClick: () => handleAction('remind') },
                                    { label: 'Shortlist', icon: <Bookmark size={18} />, onClick: () => handleAction('shortlist') },
                                ];
                                moreOptions = [
                                    { label: 'Share Profile', onClick: () => { navigator.clipboard.writeText(window.location.href); alert("Profile Link Copied!"); } },
                                    { label: 'Upgrade Priority', onClick: () => handleAction('superInterest') },
                                    { label: 'Add Note', onClick: () => alert("Note added") },
                                ];
                                break;
                            case 'shortlisted':
                                buttons = [
                                    { label: 'Send Interest', icon: <Send size={18} />, onClick: () => handleAction('interest') },
                                    { label: 'Remove', icon: <Trash2 size={18} />, onClick: () => performSpecificAction('delete') },
                                ];
                                moreOptions = [
                                    { label: 'Share Profile', onClick: () => { navigator.clipboard.writeText(window.location.href); alert("Profile Link Copied!"); } },
                                    { label: 'Add Note', onClick: () => alert("Note added") },
                                    { label: 'Download Biodata', onClick: () => alert("Downloading...") },
                                ];
                                break;
                            case 'rejected_by_me': // Declined Grid
                                buttons = [
                                    { label: 'Reconsider', icon: <RotateCcw size={18} />, onClick: () => setPopupType('accept_confirm') }, // Reconsider usually means Accept
                                    { label: 'Similar', icon: <UserCheck size={18} />, onClick: () => alert("Showing similar profiles...") },
                                ];
                                moreOptions = [
                                    { label: 'Share', onClick: () => { navigator.clipboard.writeText(window.location.href); alert("Copied!") } },
                                    { label: 'Add Note', onClick: () => alert("Note added") },
                                    { label: 'Report Profile', onClick: () => alert("Reported") },
                                ];
                                break;
                            case 'blocked':
                                buttons = [
                                    { label: 'Unblock', icon: <ShieldCheck size={18} />, onClick: () => performSpecificAction('unblock') },
                                    { label: 'Report', icon: <AlertTriangle size={18} />, onClick: () => alert("Reported") },
                                ];
                                moreOptions = [
                                    { label: 'Delete from List', onClick: () => performSpecificAction('delete') },
                                    { label: 'Add Note', onClick: () => alert("Note added") },
                                ];
                                break;
                            case 'ignored':
                                buttons = [
                                    { label: 'Send Interest', icon: <Send size={18} />, onClick: () => handleAction('interest') },
                                    { label: 'Remove Ignore', icon: <RotateCcw size={18} />, onClick: () => performSpecificAction('delete') }, // Remove from ignored
                                    { label: 'Shortlist', icon: <Bookmark size={18} />, onClick: () => handleAction('shortlist') },
                                ];
                                moreOptions = [
                                    { label: 'Similar Matches', onClick: () => alert("Showing similar...") },
                                    { label: 'Hide Permanently', onClick: () => alert("Hidden permanently") },
                                    { label: 'Add Note', onClick: () => alert("Note added") },
                                    { label: 'Compare', onClick: () => alert("Compare tool") },
                                ];
                                break;
                            default: // None / Explore
                                buttons = [
                                    { label: 'Connect', icon: <Send size={18} />, onClick: () => handleAction('interest') },
                                    { label: 'Shortlist', icon: <Bookmark size={18} />, onClick: () => handleAction('shortlist') },
                                    { label: 'Super', icon: <Heart size={18} />, onClick: () => setPopupType('super_interest_confirm') },
                                ];
                                moreOptions = [
                                    { label: 'Compare', onClick: () => alert("Compare") },
                                    { label: 'Share', onClick: () => alert("Shared") }
                                ];
                                break;
                        }

                        const visibleButtons = buttons.slice(0, 3);
                        const hiddenPrimary = buttons.slice(3);
                        const allMoreOptions = [...hiddenPrimary.map(b => ({ ...b, isPrimary: true })), ...moreOptions];

                        return (
                            <div className={styles.quickActionsBar}>
                                {visibleButtons.map((btn, i) => (
                                    <div key={i} className={styles.quickActionItem} onClick={btn.onClick}>
                                        <div className={styles.quickActionIcon} style={i === 0 ? { background: '#facc15', color: '#0f172a' } : {}}>
                                            {btn.icon}
                                        </div>
                                        <span className={styles.quickActionLabel}>{btn.label}</span>
                                    </div>
                                ))}

                                <div className={styles.quickActionItem} onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }}>
                                    <div className={styles.quickActionIcon} style={showMoreMenu ? { background: '#334155', color: '#fff' } : {}}>
                                        <MoreHorizontal size={18} />
                                    </div>
                                    <span className={styles.quickActionLabel}>More</span>
                                </div>

                                {showMoreMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '90px',
                                        right: '20px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        padding: '8px 0',
                                        width: '200px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                        zIndex: 1000
                                    }} onClick={e => e.stopPropagation()}>
                                        {allMoreOptions.map((opt, i) => (
                                            <div key={i} className={styles.moreMenuItem} onClick={() => { opt.onClick(); setShowMoreMenu(false); }}
                                                style={{
                                                    padding: '10px 16px',
                                                    color: opt.isPrimary ? '#fff' : '#cbd5e1',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: opt.isPrimary ? 600 : 400,
                                                    borderBottom: i === hiddenPrimary.length - 1 ? '1px solid #334155' : 'none',
                                                    display: 'flex', alignItems: 'center', gap: '8px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {opt.isPrimary && opt.icon && <span style={{ transform: 'scale(0.8)' }}>{opt.icon}</span>}
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Popups */}
                {popupType !== 'none' && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setPopupType('none')}>
                        <div style={{ background: '#1e293b', padding: 40, borderRadius: 20, maxWidth: 400, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', marginTop: 0 }}>
                                {popupType === 'chat_confirm' ? 'Start Chat Session' :
                                    popupType === 'accept_confirm' ? 'Accept Interest?' :
                                        popupType === 'reject_confirm' ? 'Reject Interest?' :
                                            popupType === 'contact_reveal' ? 'Reveal Contact Info' : 'Premium Feature'}
                            </h3>
                            <p style={{ color: '#cbd5e1' }}>
                                {popupType === 'chat_confirm' ? 'Start a direct chat session with this advocate. Costs 5 coins.' :
                                    popupType === 'accept_confirm' ? 'This will allow you to chat and connect.' :
                                        popupType === 'reject_confirm' ? 'Are you sure you want to decline this interest?' :
                                            popupType === 'contact_reveal' ? 'Unblur phone number, email and License ID for this profile. Cost: 1 Coin.' :
                                                'This action requires coins. Proceed?'}
                            </p>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
                                <button className={styles.cBtn} style={{ marginTop: 0 }} onClick={async () => {
                                    try {
                                        if (popupType === 'accept_confirm') {
                                            if (!activityId) throw new Error("Missing interaction ID");
                                            await interactionService.respondToActivity(activityId, 'accepted');
                                            setConnectionStatus('accepted');
                                            setPopupType('none');
                                        } else if (popupType === 'reject_confirm') {
                                            if (!activityId) throw new Error("Missing interaction ID");
                                            await interactionService.respondToActivity(activityId, 'declined');
                                            setConnectionStatus('rejected_by_me');
                                            setPopupType('none');
                                        } else if (popupType === 'contact_reveal') {
                                            if (!isPremium) {
                                                setPopupType('none');
                                                setShowTryonModal(true);
                                                return;
                                            }
                                            await handleAction('view_contact');
                                            setPopupType('none');
                                        } else {
                                            handleAction('view_contact'); setPopupType('none');
                                        }
                                    } catch (e) {
                                        console.error("Popup Action Error", e);
                                        alert("Action failed, please try again.");
                                    }
                                }}>Confirm</button>
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
