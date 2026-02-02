import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, MapPin, Languages, Briefcase,
    Send, X, Star, MessageCircle, HeartHandshake,
    Loader2, Scale, GraduationCap, Gavel, Award, BookOpen, Clock,
    Coins, CheckCircle2, MessageSquare, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './PublicProfile.module.css';

const maskText = (text: string) => {
    if (!text) return "";
    const parts = text.split(" ");
    return parts.map(part => {
        if (part.length <= 2) return part;
        return part.substring(0, 2) + "*".repeat(part.length - 2);
    }).join(" ");
};

const PublicProfile: React.FC = () => {
    const { uniqueId } = useParams<{ uniqueId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('About');
    const [chatMode, setChatMode] = useState(false);
    const [message, setMessage] = useState('');
    const [showCoinNotice, setShowCoinNotice] = useState(false);
    const [hasConsentedToCoins, setHasConsentedToCoins] = useState(false);
    const { isLoggedIn, openAuthModal } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let response;
                // Determine type based on ID prefix or try both
                if (uniqueId?.toLowerCase().startsWith('cli')) {
                    response = await axios.get(`/api/clients/${uniqueId}`);
                    if (response.data.success) {
                        setProfile({ ...response.data.client, role: 'client' });
                    }
                } else {
                    response = await axios.get(`/api/advocates/${uniqueId}`);
                    if (response.data.success) {
                        setProfile({ ...response.data.advocate, role: 'advocate' });
                    }
                }
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (uniqueId) fetchProfile();
    }, [uniqueId]);

    const handleAction = (action: string) => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }
        if (action === 'Chat') {
            if (!hasConsentedToCoins) {
                setShowCoinNotice(true);
            } else {
                setChatMode(true);
            }
        } else if (action === 'Comment') {
            const comment = prompt("Enter your comment for the advocate:");
            if (comment) alert("Comment submitted for review.");
        } else {
            alert(`Feature under development`);
        }
    };

    const confirmChat = () => {
        setHasConsentedToCoins(true);
        setShowCoinNotice(false);
        setChatMode(true);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" size={60} color="#facc15" />
                <p style={{ fontFamily: 'Outfit', fontSize: '20px', letterSpacing: '2px' }}>LOADING PROFILE</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={styles.error}>
                <X size={64} color="#f43f5e" />
                <h1 style={{ fontFamily: 'Outfit' }}>{error || 'Profile not found'}</h1>
                <button onClick={() => navigate('/')} className={styles.backBtn} style={{ position: 'static', marginTop: '20px', borderRadius: '12px' }}>
                    Return to Homepage
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Centered Wrapper */}
            <div className={styles.mainWrapper}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>

                {/* Profile Container */}
                <div className={styles.profileContentWrapper}>
                    <div className={styles.profileInternal}>
                        {/* Header Section */}
                        <div className={styles.header}>
                            <img
                                src={profile.profilePicPath ? `/${profile.profilePicPath.replace(/\\/g, '/')}` : "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200"}
                                alt={profile.name}
                                className={styles.bannerImage}
                            />
                            <div className={styles.headerOverlay}>
                                <div className={styles.verifyBadge}>
                                    <CheckCircle2 size={16} /> Verified {profile.role === 'client' ? 'Client' : 'Advocate'}
                                </div>
                                <h1 className={styles.profileName}>{isLoggedIn ? profile.name : maskText(profile.name)}</h1>
                                <p className={styles.profileTitle}>
                                    {profile.role === 'client'
                                        ? (isLoggedIn ? (profile.category || 'Legal Assistance Needed') : maskText(profile.category || 'Legal Assistance Needed'))
                                        : (isLoggedIn ? (profile.practice?.specialization || 'General Legal Practitioner') : maskText(profile.practice?.specialization || 'General Legal Practitioner'))
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Sticky Tabs */}
                        <div className={styles.tabs}>
                            {['About', profile.role === 'client' ? 'Case Details' : 'Professional', profile.role === 'client' ? 'Requirements' : 'Education', profile.role === 'client' ? 'Budget' : 'Services'].map(tab => (
                                <div
                                    key={tab}
                                    className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className={styles.content}>
                            {activeTab === 'About' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><Award size={24} color="#facc15" /> Personal Information</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><MapPin size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Location</span>
                                                <span className={styles.infoValue}>{isLoggedIn ? profile.location : maskText(profile.location)}</span>
                                            </div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><Languages size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Gender / Languages</span>
                                                <span className={styles.infoValue}>{isLoggedIn ? (profile.gender || 'N/A') : maskText(profile.gender || 'N/A')} • English, Hindi</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '40px' }}>
                                        <h3 className={styles.sectionTitle}><BookOpen size={24} color="#facc15" /> Professional Bio</h3>
                                        <div className={styles.bioText}>
                                            {isLoggedIn ? (profile.bio || `${profile.name} is a dedicated legal professional...`) : maskText(profile.bio || `${profile.name} is a dedicated legal professional...`)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Professional' && profile.role !== 'client' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><Gavel size={24} color="#facc15" /> Practice & Advocacy Details</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><Scale size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Court of Practice</span>
                                                <span className={styles.infoValue}>{isLoggedIn ? (profile.practice?.court || 'Not Specified') : maskText(profile.practice?.court || 'Not Specified')}</span>
                                            </div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><Briefcase size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Experience</span>
                                                <span className={styles.infoValue}>{profile.experience}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Case Details' && profile.role === 'client' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><Scale size={24} color="#facc15" /> Case Information</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><BookOpen size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Category</span>
                                                <span className={styles.infoValue}>{isLoggedIn ? (profile.category || 'General') : maskText(profile.category || 'General')}</span>
                                            </div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><Briefcase size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Sub Category</span>
                                                <span className={styles.infoValue}>{isLoggedIn ? (profile.subCategory || '-') : maskText(profile.subCategory || '-')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Education' && profile.role !== 'client' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><GraduationCap size={24} color="#facc15" /> Academic Background</h3>
                                    <div className={styles.timeline}>
                                        <div className={styles.timelineItem}>
                                            <div className={styles.timelineDot}></div>
                                            <div className={styles.timelineContent}>
                                                <h4>{isLoggedIn ? (profile.education?.degree || 'Bachelor of Laws (LLB)') : maskText(profile.education?.degree || 'Bachelor of Laws (LLB)')}</h4>
                                                <p>{isLoggedIn ? (profile.education?.university || 'University of Delhi') : maskText(profile.education?.university || 'University of Delhi')}, {profile.education?.gradYear || '2015'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Requirements' && profile.role === 'client' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><CheckCircle2 size={24} color="#facc15" /> Service Requirements</h3>
                                    <p style={{ color: '#94a3b8' }}>{isLoggedIn ? (profile.description || 'Looking for legal assistance.') : maskText(profile.description || 'Looking for legal assistance.')}</p>
                                </div>
                            )}

                            {activeTab === 'Services' && profile.role !== 'client' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><Clock size={24} color="#facc15" /> Services & Availability</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><Coins size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Consultation Fee</span>
                                                <span className={styles.infoValue}>₹{profile.availability?.consultationFee || '1,000'} / Session</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Budget' && profile.role === 'client' && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><Coins size={24} color="#facc15" /> Budget Overview</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoIcon}><Coins size={22} /></div>
                                            <div className={styles.infoText}>
                                                <span className={styles.infoLabel}>Estimated Budget</span>
                                                <span className={styles.infoValue}>₹{profile.budget || 'Negotiable'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ID Badge is ALWAYS VISIBLE and NOT BLURRED */}
                    <div className={styles.profileIdBadge}>ID: {profile.unique_id}</div>

                    {!isLoggedIn && (
                        <div className={styles.loginBanner}>
                            <Lock size={20} className={styles.loginBannerIcon} />
                            <span>This is a public preview. Login to view full details.</span>
                            <button className={styles.loginBtnSmall} onClick={() => openAuthModal('login')}>
                                Login
                            </button>
                        </div>
                    )}
                </div>

                {/* Floating Action Bar */}
                {!chatMode && (
                    <div className={styles.actionBar}>
                        <div className={styles.actionItem} onClick={() => handleAction('Interest')}>
                            <div className={styles.actionIcon} style={{ background: '#f43f5e' }}>
                                <HeartHandshake size={24} />
                            </div>
                            <span className={styles.actionLabel}>Hire</span>
                        </div>
                        <div className={styles.actionItem} onClick={() => handleAction('Shortlist')}>
                            <div className={styles.actionIcon}>
                                <Star size={24} />
                            </div>
                            <span className={styles.actionLabel}>Save</span>
                        </div>
                        <div className={styles.actionItem} onClick={() => handleAction('Chat')}>
                            <div className={styles.actionIcon} style={{ background: '#3b82f6' }}>
                                <MessageCircle size={24} />
                            </div>
                            <span className={styles.actionLabel}>Chat Now</span>
                        </div>
                        <div className={styles.actionItem} onClick={() => handleAction('Comment')}>
                            <div className={styles.actionIcon}>
                                <MessageSquare size={24} />
                            </div>
                            <span className={styles.actionLabel}>Comment</span>
                        </div>
                    </div>
                )}

                {/* Chat Mode Overlay */}
                {chatMode && (
                    <div className={styles.actionBarChatMode}>
                        <div className={styles.chatHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#facc15', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{profile.name[0]}</div>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#fff' }}>{profile.name}</div>
                                    <div style={{ fontSize: '11px', color: '#10b981' }}>Currently Online</div>
                                </div>
                            </div>
                            <button onClick={() => setChatMode(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.chatMessages}>
                            <div style={{ padding: '15px 20px', background: '#1e293b', borderRadius: '20px 20px 20px 0', alignSelf: 'flex-start', maxWidth: '85%', fontSize: '14px', border: '1px solid rgba(255, 255, 255, 0.05)', lineHeight: '1.5' }}>
                                <span style={{ color: '#facc15', fontWeight: '600' }}>Auto-Reply:</span><br />
                                Hello! How can I assist you with your legal query? I'm currently reviewing my messages.
                            </div>
                        </div>
                        <div className={styles.chatInputArea}>
                            <input
                                type="text"
                                className={styles.chatInput}
                                placeholder="Consult with advocate..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className={styles.sendBtn} onClick={() => alert('Log in to send message')}>
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Coin Deduction Notice */}
            {showCoinNotice && (
                <div className={styles.notificationOverlay}>
                    <div className={styles.notificationBox}>
                        <div className={styles.notificationIcon}>
                            <Coins size={32} />
                        </div>
                        <h3>Chat Session Notice</h3>
                        <p>To initiate a direct chat with <strong>{profile.name}</strong>, a one-time deduction of <strong>2 coins</strong> will be applied to your balance.</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowCoinNotice(false)} style={{ background: '#334155', color: '#fff' }}>Cancel</button>
                            <button onClick={confirmChat}>Proceed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
