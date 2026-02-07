import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styles from './AdvocateDashboard.module.css';
import AdvocateSidebar from '../../../components/dashboard/advocate/AdvocateSidebar';
import AdvocateBottomNav from '../../../components/dashboard/advocate/AdvocateBottomNav';
import FeaturedProfiles from './sections/FeaturedProfiles';
import EditProfile from '../shared/EditProfile';
import AccountSettings from '../shared/AccountSettings';
import SearchPreferences from '../shared/SearchPreferences';
import SafetyCenter from '../shared/SafetyCenter';
import DetailedProfile from '../shared/DetailedProfile';
import HelpSupport from '../shared/HelpSupport';
import {
    NormalProfiles
} from './sections/Placeholders';
import Preservices from '../../../components/footerpages/premiumservices';
import WalletHistory from '../shared/WalletHistory';
import Activity from './sections/Activity';
import BlogFeed from '../shared/BlogFeed';
import Messenger from '../shared/Messenger';
import ChatPopup from '../shared/ChatPopup';
import MyCases from './sections/MyCases';
import FileCase from './sections/FileCase';
import CreateBlog from './sections/CreateBlog';
import CreditsPage from '../shared/CreditsPage';
import LegalDocumentationPage from '../../LegalDocumentationPage';
import PremiumTryonModal from '../shared/PremiumTryonModal';
import { Menu, ArrowLeft, Bell, PenLine, X, Info, CheckCircle, MessageSquare, FileText, PlusSquare, Briefcase, Zap } from 'lucide-react';
import type { Advocate } from '../../../types';

import { useAuth } from '../../../context/AuthContext';
import PlanOverview from '../../../components/dashboard/shared/PlanOverview';
import SupportHub from '../shared/SupportHub';
import VerificationBanner from '../../../components/dashboard/shared/VerificationBanner';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'alert';
    time: string;
}

const AdvocateDashboard: React.FC = () => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const isPro = plan.toLowerCase().includes('pro') || plan.toLowerCase().includes('lite');
    const isUltra = plan.toLowerCase().includes('ultra');

    const [currentPage, setCurrentPage] = useState('featured-profiles');
    const [detailedProfileId, setDetailedProfileId] = useState<string | null>(null);
    const [activeChatAdvocate, setActiveChatAdvocate] = useState<Advocate | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCreateBlog, setShowCreateBlog] = useState(false);
    const [showTryonModal, setShowTryonModal] = useState(false);
    const location = useLocation();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Show try-on modal ONLY if user is on Free plan and hasn't used demo
        const currentPlan = (user?.plan || 'Free').toLowerCase();
        if (user && currentPlan === 'free' && !user.demoUsed) {
            const hasSeen = sessionStorage.getItem('hasSeenTryon');
            if (!hasSeen) {
                setShowTryonModal(true);
                sessionStorage.setItem('hasSeenTryon', 'true');
            }
        }
    }, [user]);

    useEffect(() => {
        const statePage = location.state?.initialPage;
        const queryPage = searchParams.get('page');
        if (statePage) {
            setCurrentPage(statePage);
        } else if (queryPage) {
            setCurrentPage(queryPage);
        }

        // Real-time Notification Listener
        const handleSocketNotification = (e: any) => {
            const data = e.detail;
            showToast(data.message);
            // Optionally add to notification list
            addNotification(data.message, data.status === 'accepted' ? 'success' : 'alert');
        };

        window.addEventListener('socket-notification', handleSocketNotification);

        // Listen for internal tab changes (e.g. from DetailedProfile)
        const handleChangeTab = (e: any) => {
            if (e.detail) {
                setCurrentPage(e.detail);
            }
        };
        window.addEventListener('change-tab', handleChangeTab);

        return () => {
            window.removeEventListener('socket-notification', handleSocketNotification);
            window.removeEventListener('change-tab', handleChangeTab);
        };
    }, [location.state, searchParams]);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', message: 'Welcome to e-Advocate! Complete your profile to get more cases.', type: 'info', time: 'Just now' },
        { id: '2', message: 'Tip: Upload your license to get verified status.', type: 'success', time: '2 hours ago' }
    ]);


    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const showsidePage = (page: string) => {
        setCurrentPage(page);

        if (page !== 'messenger') {
            setActiveChatAdvocate(null);
        }
        setSidebarOpen(false);
    };

    const handleSelectForChat = (adv: Advocate) => {
        setActiveChatAdvocate(adv);
    };

    const backtohome = () => setCurrentPage('featured-profiles');

    const showDetailedProfile = (id: string) => {
        setDetailedProfileId(id);
        setCurrentPage('detailed-profile-view');
    };

    const bottomNavClick = (page: string) => setCurrentPage(page);

    const addNotification = (msg: string, type: 'info' | 'success' | 'alert' = 'info') => {
        const newNotif: Notification = {
            id: Date.now().toString(),
            message: msg,
            type,
            time: 'Just now'
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const removeNotification = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const showToast = (msg: string) => {
        const toast = document.createElement('div');
        toast.className = styles.toast;
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        // Add to notification center
        addNotification(msg, 'info');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'featured-profiles':
                return <FeaturedProfiles
                    showDetailedProfile={showDetailedProfile}
                    showToast={showToast}
                    showsidePage={showsidePage}
                    onSelectForChat={handleSelectForChat}
                />;
            case 'normalfccards':
                return <NormalProfiles
                    showDetailedProfile={showDetailedProfile}
                    showToast={showToast}
                    showsidePage={showsidePage}
                    onSelectForChat={handleSelectForChat}
                />;
            case 'detailed-profile-view':
                return <DetailedProfile profileId={detailedProfileId} backToProfiles={backtohome} onSelectForChat={handleSelectForChat} />;
            case 'edit-profile':
                return <EditProfile backToHome={backtohome} />;
            case 'search-preferences':
                return <SearchPreferences backToHome={backtohome} showToast={showToast} />;
            case 'upgrade':
                return <Preservices />;
            case 'account-settings':
                return <AccountSettings backToHome={backtohome} />;
            case 'wallet-history':
                return <WalletHistory backToHome={backtohome} />;
            case 'credits':
                return <CreditsPage backToHome={backtohome} />;
            case 'safety-center':
                return <SafetyCenter backToHome={backtohome} showToast={showToast} />;
            case 'help-support':
                return <HelpSupport backToHome={backtohome} showToast={showToast} />;
            case 'blogs':
                return <BlogFeed />;
            case 'activity':
                return <Activity />;
            case 'my-subscription':
                return <PlanOverview />;
            case 'messenger':
                return <Messenger
                    view="list"
                    onSelectForChat={handleSelectForChat}
                />;
            case 'my-cases':
                return <MyCases onSelectForChat={handleSelectForChat} />;
            case 'initiate-case':
                return (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Briefcase size={64} color="#facc15" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#f8fafc', marginBottom: '10px' }}>Initiate a New Case</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                            To initiate a case, please visit a client profile and click on "Appoint as Advocate" or "Start Case".
                        </p>
                    </div>
                );
            case 'fileacase':
                return <FileCase backToHome={backtohome} showToast={showToast} />;
            case 'legal-documentation':
                return <LegalDocumentationPage isEmbedded />;
            default:
                return (
                    <FeaturedProfiles
                        showDetailedProfile={showDetailedProfile}
                        showToast={showToast}
                        showsidePage={showsidePage}
                        onSelectForChat={handleSelectForChat}
                    />
                );
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'featured-profiles': return 'Featured Clients';
            case 'normalfccards': return 'Browse Clients';
            case 'detailed-profile-view': return 'Client View';
            case 'edit-profile': return 'Edit Profile';
            case 'search-preferences': return 'Search Preferences';
            case 'upgrade': return 'Membership Upgrade';
            case 'account-settings': return 'Account & Settings';
            case 'credits': return 'My Credits';
            case 'safety-center': return 'Safety Center';
            case 'help-support': return 'Help & Support';
            case 'blogs': return 'Legal Blogs';
            case 'activity': return 'Recent Activity';
            case 'messenger': return 'Messages';
            case 'direct-chat': return 'Chat';
            case 'my-cases': return 'My Cases';
            case 'initiate-case': return 'Initiate New Case';
            case 'fileacase': return 'File a New Case';
            case 'legal-documentation': return 'Legal Documentation';
            default: return 'Advocate Dashboard';
        }
    };

    return (
        <div className={styles.advocatedashboard}>
            <AdvocateSidebar
                isOpen={sidebarOpen}
                showsidePage={showsidePage}
                currentPage={currentPage}
                onShowTryon={() => setShowTryonModal(true)}
            />

            <main className={styles.mainContentadvocatedash}>
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.hamburger} onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {currentPage !== 'featured-profiles' && (
                            <button className={styles.backBtn} onClick={backtohome}>
                                <ArrowLeft size={22} />
                            </button>
                        )}
                        <h1 className={styles.pageTitle}>
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className={styles.topBarCenter} style={{ position: 'relative' }}>
                        {/* News Ticker - Behind Profile (99% width, top:10) */}
                        <div className={styles.newsTicker} style={{ position: 'absolute', width: '99%', left: 0, top: -10, zIndex: 0, opacity: 0.8 }}>
                            <span className={styles.tickerText}>
                                ✨ LATEST NEWS: SOMEONE JUST POSTED A NEW PROFESSIONAL BLOG! BOOST YOUR VISIBILITY TODAY • COMPLETE YOUR PROFILE TO GET MORE LEADS ✨
                            </span>
                        </div>

                        {/* Profile Header - On Top */}
                        {/* <div className={styles.profileHeader} style={{ position: 'relative', zIndex: 10, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)' }}>
                            <div className={styles.profileInfoQuick}>
                                <img
                                    src={user?.image_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                                    className={styles.miniProfileImg}
                                    alt="Profile"
                                />
                                <div className={styles.miniNameStack}>
                                    <span className={styles.miniName}>{user?.name}</span>
                                    <span className={styles.miniId}>{user?.unique_id}</span>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    <div className={styles.topBarRight}>
                        <div className={styles.statusGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Coins & Plan */}
                            {/* <div className={styles.coinBadge} style={{ marginRight: '0' }}>
                                <span className={styles.coinCount}>{user?.coins || 0}</span>
                                <span className={styles.coinLabel}>Coins</span>
                            </div> */}

                            {/* <div className={styles.badgeStack}>
                                {isPremium && plan.toLowerCase() !== 'free' ? (
                                    <span className={`${styles.badgePlan} ${isUltra ? styles.ultraBadge : isPro ? styles.proBadge : styles.liteBadge}`}>
                                        {plan.toUpperCase()} PLAN
                                    </span>
                                ) : (
                                    <span className={`${styles.badgePlan} ${styles.freeBadge}`}>FREE MEMBER</span>
                                )}
                            </div> */}
                        </div>

                        {/* Special Action: Write Blog (Only if Premium & on Blog Page) */}
                        {currentPage === 'blogs' && isPremium && (
                            <button
                                className={styles.writeBlogBtn}
                                onClick={() => setShowCreateBlog(true)}
                                style={{ marginRight: '15px' }}
                            >
                                <PenLine size={18} />
                                <span>Write Blog</span>
                            </button>
                        )}

                        {/* Notification Button & Dropdown */}
                        <div className={styles.notificationWrapper}>
                            <button
                                className={styles.notificationBtn}
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ position: 'relative' }}
                            >
                                <Bell size={24} />
                                {notifications.length > 0 && (
                                    <span className={styles.badgeCount}>{notifications.length}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className={styles.notificationDropdown}>
                                    <div className={styles.notifHeader}>
                                        <h3>Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button className={styles.clearAllBtn} onClick={clearAllNotifications}>
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.notifList}>
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif.id} className={styles.notifItem}>
                                                    <div className={styles.notifIcon}>
                                                        {notif.type === 'success' ? <CheckCircle size={16} /> :
                                                            notif.type === 'alert' ? <MessageSquare size={16} /> : <Info size={16} />}
                                                    </div>
                                                    <div className={styles.notifContent}>
                                                        <p className={styles.notifMessage}>{notif.message}</p>
                                                        <span className={styles.notifTime}>{notif.time}</span>
                                                    </div>
                                                    <button
                                                        className={styles.notifCloseBtn}
                                                        onClick={(e) => removeNotification(notif.id, e)}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.noNotifs}>
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className={styles.contentBody}>
                    {user?.status === 'Pending' && <VerificationBanner />}
                    {currentPage === 'my-cases' && (
                        <div className={styles.caseActions}>
                            <button className={styles.topBtn} onClick={() => setCurrentPage('my-cases')}>
                                <FileText size={18} />
                                Case Status
                            </button>
                            <button className={styles.topBtnPrimary} onClick={() => setCurrentPage('initiate-case')}>
                                <PlusSquare size={18} />
                                New Case
                            </button>
                        </div>
                    )}
                    {renderPage()}
                </div>
            </main>

            <AdvocateBottomNav bottomNavClick={bottomNavClick} currentPage={currentPage} />

            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

            {showCreateBlog && (
                <div className={styles.modalOverlay}>
                    <CreateBlog
                        onClose={() => setShowCreateBlog(false)}
                        onSuccess={() => {
                            showToast("Blog submitted for approval!");
                        }}
                    />
                </div>
            )}

            {activeChatAdvocate && (
                <ChatPopup
                    advocate={activeChatAdvocate}
                    onClose={() => setActiveChatAdvocate(null)}
                />
            )}
            {showTryonModal && (
                <PremiumTryonModal onClose={() => setShowTryonModal(false)} />
            )}
            <SupportHub />
        </div>
    );
};

export default AdvocateDashboard;
