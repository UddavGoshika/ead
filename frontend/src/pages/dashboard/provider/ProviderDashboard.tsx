import React, { useState } from 'react';
import styles from '../advocate/AdvocateDashboard.module.css';
import ProviderSidebar from '../../../components/dashboard/provider/ProviderSidebar';
import AdvocateBottomNav from '../../../components/dashboard/advocate/AdvocateBottomNav';
import FeaturedProfiles from '../advocate/sections/FeaturedProfiles';
import EditProfile from '../shared/EditProfile';
import SearchPreferences from '../shared/SearchPreferences';
import SafetyCenter from '../shared/SafetyCenter';
import DetailedProfile from '../shared/DetailedProfileEnhanced';
import {
    NormalProfiles, HelpSupport
} from '../advocate/sections/Placeholders';
import Preservices from '../../../components/footerpages/premiumservices';
import WalletHistory from '../shared/WalletHistory';
import Activity from '../advocate/sections/Activity';
import BlogFeed from '../shared/BlogFeed';
import Messenger from '../shared/Messenger';
import ChatPopup from '../shared/ChatPopup';
import MyCases from '../advocate/sections/MyCases';
import FileCase from '../advocate/sections/FileCase';
import CreateBlog from '../advocate/sections/CreateBlog';
import CreditsPage from '../shared/CreditsPage';
import { Menu, ArrowLeft, Bell, PenLine, FileText } from 'lucide-react';
import type { Advocate } from '../../../types';

import { useAuth } from '../../../context/AuthContext';
import PlanOverview from '../../../components/dashboard/shared/PlanOverview';

const ProviderDashboard: React.FC = () => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    const [currentPage, setCurrentPage] = useState('provider-stats');
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

    const backtohome = () => setCurrentPage('provider-stats');

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
            case 'provider-stats':
                return (
                    <div className={styles.statsContainer}>
                        <div className={styles.statsHeader}>
                            <FileText size={32} />
                            <h2>Documentation Provider Dashboard</h2>
                            <p>Manage your legal drafting services and client requests.</p>
                        </div>
                        <Activity onSelectForChat={handleSelectForChat} />
                    </div>
                );
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
                return <div style={{ gridColumn: "1 / -1" }}><BlogFeed /></div>;
            case 'messenger':
                return <Messenger view="list" onSelectForChat={handleSelectForChat} />;
            default:
                return <Activity onSelectForChat={handleSelectForChat} />;
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'provider-stats': return 'Provider Overview';
            case 'edit-profile': return 'Service Provider Profile';
            case 'blogs': return 'Legal Publications';
            case 'messenger': return 'Client Inquiries';
            default: return 'Service Provider Dashboard';
        }
    };

    return (
        <div className={styles.advocatedashboard}>
            <ProviderSidebar
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
                        {currentPage !== 'provider-stats' && (
                            <button className={styles.backBtn} onClick={backtohome}>
                                <ArrowLeft size={22} />
                            </button>
                        )}
                        <h1 className={styles.pageTitle}>
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className={styles.topBarRight}>
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
        </div>
    );
};

export default ProviderDashboard;
