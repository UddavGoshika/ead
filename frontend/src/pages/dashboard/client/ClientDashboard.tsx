import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styles from './ClientDashboard.module.css';
import ClientSidebar from '../../../components/dashboard/client/ClientSidebar';
import ClientBottomNav from '../../../components/dashboard/client/ClientBottomNav';
import FeaturedProfiles from './sections/FeaturedProfiles';
import EditProfile from '../shared/EditProfile';
import SearchPreferences from '../shared/SearchPreferences';
import AccountSettings from '../shared/AccountSettings';
import SafetyCenter from '../shared/SafetyCenter';
import DetailedProfile from '../shared/DetailedProfile';
import HelpSupport from '../shared/HelpSupport';
import AdvocateList from './AdvocateList';
import Preservices from '../../../components/footerpages/premiumservices';
import WalletHistory from '../shared/WalletHistory';
import CreditsPage from '../shared/CreditsPage';
import { FileText, PlusSquare, Briefcase, Menu, ArrowLeft, Bell, X, Info, CheckCircle, MessageSquare } from "lucide-react";
import Activity from './sections/activity';
import Messenger from '../shared/Messenger';
import BlogFeed from '../shared/BlogFeed';
import ChatPopup from '../shared/ChatPopup';
import MyCases from './sections/MyCases';
import FileCase from './sections/FileCase';
import PromoCodes from './sections/PromoCodes';
import LegalDocumentationPage from '../../LegalDocumentationPage';
import PremiumTryonModal from '../shared/PremiumTryonModal';

import type { Advocate } from '../../../types';

import { useAuth } from '../../../context/AuthContext';
import PlanOverview from '../../../components/dashboard/shared/PlanOverview';
import SupportHub from '../shared/SupportHub';
import VerificationBanner from '../../../components/dashboard/shared/VerificationBanner';
import PendingPopup from '../../../components/dashboard/shared/PendingPopup';
interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'alert';
    time: string;
}

const ClientDashboard: React.FC = () => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));
    const isPro = plan.toLowerCase().includes('pro') || plan.toLowerCase().includes('lite');
    const isUltra = plan.toLowerCase().includes('ultra');

    // Set initial page based on premium status
    const [currentPage, setCurrentPage] = useState('featured-profiles');
    const [detailedProfileId, setDetailedProfileId] = useState<string | null>(null);
    const [activeChatAdvocate, setActiveChatAdvocate] = useState<Advocate | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showTryonModal, setShowTryonModal] = useState(false);
    const [showPendingPopup, setShowPendingPopup] = useState(false);
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

        // Show pending popup if user is unverified
        if (user && (user.status === 'Pending' || user.status === 'Reverify')) {
            const hasSeenPending = sessionStorage.getItem('hasSeenPendingPopup');
            if (!hasSeenPending) {
                setShowPendingPopup(true);
                sessionStorage.setItem('hasSeenPendingPopup', 'true');
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
        return () => window.removeEventListener('socket-notification', handleSocketNotification);
    }, [location.state, searchParams]);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', message: 'Welcome to e-Advocate! Dashboard initialized.', type: 'info', time: 'Just now' },
        { id: '2', message: 'Check out the new Featured Profiles section.', type: 'info', time: '1 min ago' }
    ]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const showsidePage = (page: string) => {
        setCurrentPage(page);

        if (page !== 'messenger') {
            setActiveChatAdvocate(null); // Reset when navigating elsewhere
        }
        setSidebarOpen(false);
    };

    const backtohome = () => {
        setCurrentPage('featured-profiles');
        setActiveChatAdvocate(null);
    };

    const showDetailedProfile = (id: string) => {
        setDetailedProfileId(id);
        setCurrentPage('detailed-profile-view');
    };

    const handleSelectForChat = (adv: Advocate) => {
        setActiveChatAdvocate(adv);
    };

    const bottomNavClick = (page: string) => {
        setCurrentPage(page);
        if (page !== 'messenger') setActiveChatAdvocate(null);
    };

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
                return <AdvocateList
                    showDetailedProfile={showDetailedProfile}
                    onAction={(action, adv) => {
                        if (action === 'openFullChatPage') {
                            handleSelectForChat(adv);
                        } else if (action === 'openUpgradePage') {
                            showsidePage('upgrade');
                        } else if (action === 'switchFeatured') {
                            showsidePage('featured-profiles');
                        }
                    }} />;
            case 'detailed-profile-view':
                return <DetailedProfile profileId={detailedProfileId} backToProfiles={backtohome} onSelectForChat={handleSelectForChat} />;
            case 'edit-profile':
                return <EditProfile backToHome={backtohome} showToast={showToast} />;
            case 'search-preferences':
                return <SearchPreferences backToHome={backtohome} showToast={showToast} />;
            case 'upgrade':
                return <Preservices />;
            case 'wallet-history':
                return <WalletHistory backToHome={backtohome} />;
            case 'account-settings':
                return <AccountSettings backToHome={backtohome} showToast={showToast} />;
            case 'credits':
                return <CreditsPage backToHome={backtohome} />;
            case 'safety-center':
                return <SafetyCenter backToHome={backtohome} showToast={showToast} />;
            case 'help-support':
                return <HelpSupport backToHome={backtohome} showToast={showToast} />;
            case 'blogs':
                return <BlogFeed />;

            case 'activity':
                return <Activity onSelectForChat={handleSelectForChat} />;
            case 'my-subscription':
                return <PlanOverview />;
            case 'messenger':
                return <Messenger
                    view="list"
                    onSelectForChat={handleSelectForChat}
                />;
            case 'my-cases':
                return <MyCases onSelectForChat={handleSelectForChat} />;
            case 'new-case-info':
                return (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Info size={64} color="#facc15" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#f8fafc', marginBottom: '10px' }}>No Case Initiated</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                            Advocate not assigned yet OR No documents requested by advocate.
                            Cases are always initiated by advocates on this platform.
                        </p>
                    </div>
                );
            case 'Promocodes':
                return <PromoCodes />;
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
        if (currentPage === 'featured-profiles') return 'Featured Experts';
        if (currentPage === 'normalfccards') return 'Profiles';
        return getPageTitleBase(currentPage);
    };

    const getPageTitleBase = (p: string) => {
        switch (p) {
            case 'detailed-profile-view': return 'Advocate Detail';
            case 'edit-profile': return 'Edit Profile';
            case 'search-preferences': return 'Search Preferences';
            case 'upgrade': return 'Membership Upgrade';
            case 'account-settings': return 'Account & Settings';
            case 'credits': return 'My Credits';
            case 'safety-center': return 'Safety Center';
            case 'help-support': return 'Help & Support';
            case 'blogs': return 'Blogs';
            case 'activity': return 'Recent Activity';
            case 'messenger': return 'Messages';
            case 'direct-chat': return 'Chat';
            case 'my-cases': return 'My Cases';
            case 'new-case-info': return 'New Case Information';
            case 'Promocodes': return 'Special Promocodes';
            case 'legal-documentation': return 'Legal Documentation';
            default: return 'Client Dashboard';
        }
    };

    // Click outside handler for notifications
    const notifRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.clientdashboard}>
            <ClientSidebar
                isOpen={sidebarOpen}
                showsidePage={showsidePage}
                currentPage={currentPage}
                onShowTryon={() => setShowTryonModal(true)}
            />

            <main className={styles.mainContentclientdash}>
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.hamburger} onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        {currentPage !== 'featured-profiles' && currentPage !== 'normalfccards' && (
                            <button className={styles.backBtn} onClick={backtohome}>
                                <ArrowLeft size={22} />
                            </button>
                        )}
                        <h1 className={styles.pageTitle}>
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className={styles.topBarCenter} style={{ position: 'relative' }}>
                        {/* News Ticker - Behind Profile */}
                        <div className={styles.newsTicker} style={{ position: 'absolute', width: '99%', left: 0, top: -10, zIndex: 0, opacity: 0.8 }}>
                            <span className={styles.tickerText}>
                                🚀 LATEST UPDATES: WELCOME TO THE NEW DASHBOARD • FIND YOUR EXPERT ADVOCATE TODAY • 24/7 SUPPORT AVAILABLE • CHECK OUT OUR NEW BLOGS
                            </span>
                        </div>
                    </div>

                    <div className={styles.topBarRight}>
                        <div className={styles.statusGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Coins Display */}
                            {/* <div className={styles.coinBadge} style={{ marginRight: '0' }}>
                                <span className={styles.coinCount}>{user?.coins || 0}</span>
                                <span className={styles.coinLabel}>Coins</span>
                            </div> */}

                            {/* Plan Badge */}
                            <div className={styles.badgeStack}>
                                {isPremium && plan.toLowerCase() !== 'free' ? (
                                    <span className={`${styles.badgePlan} ${isUltra ? styles.ultraBadge : isPro ? styles.proBadge : styles.liteBadge}`}>
                                        {plan.toUpperCase()} PLAN
                                    </span>
                                ) : (
                                    <span className={`${styles.badgePlan} ${styles.freeBadge}`}>FREE MEMBER</span>
                                )}
                            </div>
                        </div>

                        {/* Notification Button & Dropdown */}
                        <div className={styles.notificationWrapper} ref={notifRef}>
                            <button
                                className={styles.notificationBtn}
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ position: 'relative' }}
                            >
                                <Bell size={22} />
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
                            <button className={styles.topBtn} onClick={() => window.open('https://filing.ecourts.gov.in/', '_blank')}>
                                <Briefcase size={18} />
                                File a case
                            </button>
                            <button className={styles.topBtnPrimary} onClick={() => window.open('https://services.ecourts.gov.in/ecourtindia_v6/', '_blank')}>
                                <FileText size={18} />
                                Case Status
                            </button>
                        </div>
                    )}
                    {renderPage()}
                </div>
            </main>

            <ClientBottomNav bottomNavClick={bottomNavClick} currentPage={currentPage} />

            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

            {activeChatAdvocate && (
                <ChatPopup
                    advocate={activeChatAdvocate}
                    onClose={() => setActiveChatAdvocate(null)}
                />
            )}
            {showTryonModal && (
                <PremiumTryonModal onClose={() => setShowTryonModal(false)} />
            )}
            {showPendingPopup && user && (
                <PendingPopup
                    status={user.status || 'Pending'}
                    rejectionReason={user.rejectionReason}
                    onClose={() => setShowPendingPopup(false)}
                />
            )}
            <SupportHub />
        </div>
    );
};

export default ClientDashboard;
