import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styles from './AdvisorDashboard.module.css';

// Absolute-style relative imports to ensure clarity for the compiler
import AdvisorSidebar from '../../../components/dashboard/advisor/AdvisorSidebar.tsx';
import AdvisorBottomNav from '../../../components/dashboard/advisor/AdvisorBottomNav.tsx';
import AdvisorActivity from './sections/AdvisorActivity.tsx';

import EditProfile from '../shared/EditProfile.tsx';
import { HelpSupport } from '../advocate/sections/Placeholders.tsx';
import Preservices from '../../../components/footerpages/premiumservices.tsx';
import WalletHistory from '../shared/WalletHistory.tsx';
import BlogFeed from '../shared/BlogFeed.tsx';
import Messenger from '../shared/Messenger.tsx';
import ChatPopup from '../shared/ChatPopup.tsx';
import MyCases from '../advocate/sections/MyCases.tsx';
import FileCase from '../advocate/sections/FileCase.tsx';
import CreateBlog from '../advocate/sections/CreateBlog.tsx';
import CreditsPage from '../shared/CreditsPage.tsx';
import LegalDocumentationPage from '../../LegalDocumentationPage.tsx';
import ReferAndEarn from '../shared/ReferAndEarn.tsx';
import { Menu, ArrowLeft, Bell, PenLine } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import PlanOverview from '../../../components/dashboard/shared/PlanOverview.tsx';
import VerificationBanner from '../../../components/dashboard/shared/VerificationBanner.tsx';

const AdvisorDashboard: React.FC = () => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    // For Advisor, we land on messenger
    const [currentPage, setCurrentPage] = useState('messenger');
    const [activeChatAdvocate, setActiveChatAdvocate] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCreateBlog, setShowCreateBlog] = useState(false);
    const location = useLocation();
    const [searchParams] = useSearchParams();

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
    }, [location.state, searchParams]);

    const backtohome = () => setCurrentPage('messenger');

    const showsidePage = (page: string) => {
        setCurrentPage(page);

        if (page !== 'messenger') {
            setActiveChatAdvocate(null);
        }
        setSidebarOpen(false);
    };

    const handleSelectForChat = (adv: any) => {
        setActiveChatAdvocate(adv);
    };

    const bottomNavClick = (page: string) => setCurrentPage(page);

    const showToast = (msg: string) => {
        const toast = document.createElement('div');
        toast.className = styles.toast;
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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
            case 'help-support':
                return <HelpSupport backToHome={backtohome} />;
            case 'blogs':
                return <BlogFeed />;
            case 'activity':
                return <AdvisorActivity onNavigate={setCurrentPage} onChatSelect={setActiveChatAdvocate} />;
            case 'my-subscription':
                return <PlanOverview />;
            case 'messenger':
                return <Messenger
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
                    <Messenger
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
            case 'account-settings': return 'Settings';
            case 'credits': return 'Credits';
            case 'help-support': return 'Support';
            case 'blogs': return 'Legal Blogs';
            case 'activity': return 'Recent Activity';
            case 'messenger': return 'Messages';
            case 'direct-chat': return 'Chat';
            case 'my-cases': return 'Service Cases';
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

                    <div className={styles.topBarRight}>
                        {currentPage === 'blogs' && isPremium && (
                            <button
                                className={styles.writeBlogBtn}
                                onClick={() => setShowCreateBlog(true)}
                            >
                                <PenLine size={18} />
                                <span>Write Blog</span>
                            </button>
                        )}
                        <button className={styles.notificationBtn}>
                            <Bell size={24} />
                        </button>
                    </div>
                </header>

                <div className={styles.contentBody}>
                    {user?.status === 'Pending' && <VerificationBanner />}
                    {renderPage()}
                </div>
            </main>

            <AdvisorBottomNav bottomNavClick={bottomNavClick} currentPage={currentPage} />

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
        </div>
    );
};

export default AdvisorDashboard;
