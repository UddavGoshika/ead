import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styles from './AdvisorDashboard.module.css';

// Absolute-style relative imports to ensure clarity for the compiler
import AdvisorSidebar from '../../../components/dashboard/advisor/AdvisorSidebar.tsx';
import AdvisorBottomNav from '../../../components/dashboard/advisor/AdvisorBottomNav.tsx';
import AdvisorActivity from './sections/AdvisorActivity.tsx';

import EditProfile from '../shared/EditProfile.tsx';
import AccountSettings from '../shared/AccountSettings.tsx';
import SearchPreferences from '../shared/SearchPreferences.tsx';
import SafetyCenter from '../shared/SafetyCenter.tsx';
import HelpSupport from '../shared/HelpSupport.tsx';
import Preservices from '../../../components/footerpages/premiumservices.tsx';
import WalletHistory from '../shared/WalletHistory.tsx';
import BlogFeed from '../shared/BlogFeed.tsx';
import LegalAdvisorMessenger from './components/LegalAdvisorMessenger.tsx';
import AdvisorChatPopup from './components/AdvisorChatPopup.tsx';
import MyCases from '../advocate/sections/MyCases.tsx';
import FileCase from '../advocate/sections/FileCase.tsx';
import CreateBlog from '../advocate/sections/CreateBlog.tsx';
import CreditsPage from '../shared/CreditsPage.tsx';
import LegalDocumentationPage from '../../LegalDocumentationPage.tsx';
import ReferAndEarn from '../shared/ReferAndEarn.tsx';
import SupportHub from '../shared/SupportHub.tsx';
import { Menu, ArrowLeft, Bell, PenLine, X, Info, CheckCircle, MessageSquare, Bot } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import PlanOverview from '../../../components/dashboard/shared/PlanOverview.tsx';
import VerificationBanner from '../../../components/dashboard/shared/VerificationBanner.tsx';
import { checkIsPremium } from '../../../utils/planHelper';
import { useToast } from '../../../context/ToastContext';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'alert';
    time: string;
}


const AdvisorDashboard: React.FC = () => {
    const { user } = useAuth();
    const isPremium = checkIsPremium(user);
    const { showToast: centralShowToast } = useToast();


    // For Advisor, we land on messenger
    const [currentPage, setCurrentPage] = useState('messenger');
    const [activeChatAdvocate, setActiveChatAdvocate] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCreateBlog, setShowCreateBlog] = useState(false);
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', message: 'Welcome to e-Advocate! Complete your profile to get more cases.', type: 'info', time: 'Just now' },
        { id: '2', message: 'Tip: Upload your license to get verified status.', type: 'success', time: '2 hours ago' }
    ]);

    useEffect(() => {
        const statePage = location.state?.initialPage;
        const queryPage = searchParams.get('page');
        const chatPartnerId = searchParams.get('chat');

        if (statePage) {
            setCurrentPage(statePage);
        } else if (queryPage) {
            setCurrentPage(queryPage);
        } else if (chatPartnerId) {
            setCurrentPage('messenger');
        }

        if (chatPartnerId) {
            // Passing minimal object that Messenger can use to trigger fetch
            setActiveChatAdvocate({ id: chatPartnerId } as any);
        }

        // Real-time Notification Listener
        const handleSocketNotification = (e: any) => {
            const data = e.detail;
            showToast(data.message);
            addNotification(data.message, data.status === 'accepted' ? 'success' : 'alert');
        };

        window.addEventListener('socket-notification', handleSocketNotification);

        return () => {
            window.removeEventListener('socket-notification', handleSocketNotification);
        };
    }, [location.state, searchParams]);

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

    const handleSelectForChat = (adv: any) => {
        setActiveChatAdvocate(adv);
    };

    const bottomNavClick = (page: string) => setCurrentPage(page);

    const backtohome = () => setCurrentPage('messenger');

    const showsidePage = (page: string) => {
        setCurrentPage(page);

        if (page !== 'messenger') {
            setActiveChatAdvocate(null);
        }
        setSidebarOpen(false);
    };

    const showToast = (msg: string) => {
        centralShowToast(msg);
        addNotification(msg, 'info');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'edit-profile':
                return <EditProfile backToHome={backtohome} />;
            case 'upgrade':
                return <Preservices />;
            case 'wallet-history':
                return <WalletHistory backToHome={backtohome} />;
            case 'credits':
                return <CreditsPage backToHome={backtohome} />;
            case 'search-preferences':
                return <SearchPreferences backToHome={backtohome} showToast={showToast} />;
            case 'account-settings':
                return <AccountSettings backToHome={backtohome} />;
            case 'safety-center':
                return <SafetyCenter backToHome={backtohome} showToast={showToast} />;
            case 'help-support':
                return <HelpSupport backToHome={backtohome} showToast={showToast} />;
            case 'blogs':
                return <BlogFeed />;
            case 'activity':
                return <AdvisorActivity onNavigate={setCurrentPage} onChatSelect={setActiveChatAdvocate} />;
            case 'my-subscription':
                return <PlanOverview />;
            case 'messenger':
                return <LegalAdvisorMessenger
                    view="list"
                    selectedAdvocate={activeChatAdvocate}
                    onSelectForChat={handleSelectForChat}
                />;
            case 'my-cases':
                return <MyCases onSelectForChat={handleSelectForChat} />;
            case 'fileacase':
                return <FileCase backToHome={backtohome} showToast={showToast} />;
            case 'legal-documentation':
                return <LegalDocumentationPage isEmbedded />;
            case 'refer-earn':
                return <ReferAndEarn />;
            default:
                return (
                    <LegalAdvisorMessenger
                        view="list"
                        onSelectForChat={handleSelectForChat}
                    />
                );
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'edit-profile': return 'My Profile';
            case 'upgrade': return 'Membership';
            case 'account-settings': return 'Account & Settings';
            case 'search-preferences': return 'Search Preferences';
            case 'credits': return 'Credits';
            case 'safety-center': return 'Safety Center';
            case 'help-support': return 'Support';
            case 'blogs': return 'Legal Blogs';
            case 'activity': return 'Recent Activity';
            case 'messenger': return 'Messages';
            case 'direct-chat': return 'Chat';
            case 'my-cases': return 'My Cases';
            case 'fileacase': return 'New Service Request';
            case 'legal-documentation': return 'Legal Documentation';
            case 'refer-earn': return 'Refer & Earn';
            default: return 'Legal Advisor Workspace';
        }
    };

    return (
        <div className={styles.advisordashboard}>
            <AdvisorSidebar
                isOpen={sidebarOpen}
                showsidePage={showsidePage}
                currentPage={currentPage}
            />

            <main className={styles.mainContentadvdash}>
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.hamburger} onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {currentPage !== 'messenger' && (
                            <button className={styles.backBtn} onClick={backtohome}>
                                <ArrowLeft size={22} />
                            </button>
                        )}
                        <h1 className={styles.pageTitle}>
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className={styles.topBarCenter}>
                        <div className={styles.newsTicker}>
                            <span className={styles.tickerText}>
                                {notifications.length > 0
                                    ? notifications.map(n => n.message.toUpperCase()).join(' • ')
                                    : "✨ LEGAL ADVISOR WORKSPACE: CONNECT WITH CLIENTS • MANAGE YOUR CASES EFFECTIVELY ✨"}
                            </span>
                        </div>
                    </div>

                    <div className={styles.topBarRight}>
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

                        {/* <button
                            className={styles.lexiTopBtn}
                            onClick={() => window.dispatchEvent(new CustomEvent('open-support-hub'))}
                            title="Ask Lexi AI"
                        >
                            <Bot size={22} color="#facc15" />
                            <span className={styles.lexiLabel}>Lexi</span>
                        </button> */}

                        {/* Notification Button & Dropdown */}
                        <div className={styles.notificationWrapper} ref={notifRef}>
                            <button
                                className={styles.notificationBtn}
                                onClick={() => setShowNotifications(!showNotifications)}
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
                    {renderPage()}
                </div>
            </main>

            <AdvisorBottomNav bottomNavClick={bottomNavClick} currentPage={currentPage} />

            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

            {
                showCreateBlog && (
                    <div className={styles.modalOverlay}>
                        <CreateBlog
                            onClose={() => setShowCreateBlog(false)}
                            onSuccess={() => {
                                showToast("Blog submitted for approval!");
                            }}
                        />
                    </div>
                )
            }

            {
                activeChatAdvocate && (
                    <AdvisorChatPopup
                        key={(activeChatAdvocate as any).unique_id || (activeChatAdvocate as any).partnerUserId || (activeChatAdvocate as any).userId?._id || (activeChatAdvocate as any).userId || (activeChatAdvocate as any)._id || activeChatAdvocate.id}
                        advocate={activeChatAdvocate}
                        onClose={() => setActiveChatAdvocate(null)}
                    />
                )
            }
            <SupportHub />
        </div >
    );
};

export default AdvisorDashboard;
