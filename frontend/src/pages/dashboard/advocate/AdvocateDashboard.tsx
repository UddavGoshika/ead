import React, { useState } from 'react';
import styles from './AdvocateDashboard.module.css';
import AdvocateSidebar from '../../../components/dashboard/advocate/AdvocateSidebar';
import AdvocateBottomNav from '../../../components/dashboard/advocate/AdvocateBottomNav';
import FeaturedProfiles from './sections/FeaturedProfiles';
import EditProfile from '../shared/EditProfile';
import SearchPreferences from '../shared/SearchPreferences';
import SafetyCenter from '../shared/SafetyCenter';
import DetailedProfile from '../shared/DetailedProfile';
import {
    NormalProfiles, HelpSupport
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
import { Menu, ArrowLeft, Bell, PenLine } from 'lucide-react';
import type { Advocate } from '../../../types';

import { useAuth } from '../../../context/AuthContext';
import PlanOverview from '../../../components/dashboard/shared/PlanOverview';

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

    const showToast = (msg: string) => {
        const toast = document.createElement('div');
        toast.className = styles.toast;
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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
                return <DetailedProfile profileId={detailedProfileId} backToProfiles={backtohome} />;
            case 'edit-profile':
                return <EditProfile backToHome={backtohome} />;
            case 'search-preferences':
                return <SearchPreferences backToHome={backtohome} showToast={showToast} />;
            case 'upgrade':
                return <Preservices />;
            case 'wallet-history':
                return <WalletHistory backToHome={backtohome} />;
            case 'credits':
                return <CreditsPage backToHome={backtohome} />;
            case 'safety-center':
                return <SafetyCenter backToHome={backtohome} showToast={showToast} />;
            case 'help-support':
                return <HelpSupport backToHome={backtohome} />;
            case 'blogs':
                return (
                    <div style={{ gridColumn: "1 / -1" }}>
                        <BlogFeed />
                    </div>
                );
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
                return <MyCases />;
            case 'fileacase':
                return <FileCase backToHome={backtohome} showToast={showToast} />;
            default:
                // Only Premium/Pro/Ultra can see Featured by default
                return isPremium ? (
                    <FeaturedProfiles
                        showDetailedProfile={showDetailedProfile}
                        showToast={showToast}
                        showsidePage={showsidePage}
                        onSelectForChat={handleSelectForChat}
                    />
                ) : (
                    <NormalProfiles
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
            case 'featured-profiles': return 'Featured Profiles';
            case 'normalfccards': return 'Browse All Advocates';
            case 'detailed-profile-view': return 'Profile Detail';
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
            case 'fileacase': return 'File a New Case';
            default: return 'Advocate Dashboard';
        }
    };

    return (
        <div className={styles.advocatedashboard}>
            <AdvocateSidebar
                isOpen={sidebarOpen}
                showsidePage={showsidePage}
                currentPage={currentPage}
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

                    {currentPage === 'featured-profiles' && (
                        <div className={styles.newsTicker}>
                            <span className={styles.tickerText}>✨ Latest News: Someone just posted a new professional blog! Boost your visibility today. ✨</span>
                        </div>
                    )}

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
                            // Optionally refresh blog feed if we add a ref
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

export default AdvocateDashboard;
