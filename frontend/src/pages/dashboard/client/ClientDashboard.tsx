import React, { useState } from 'react';
import styles from './ClientDashboard.module.css';
import ClientSidebar from '../../../components/dashboard/client/ClientSidebar';
import ClientBottomNav from '../../../components/dashboard/client/ClientBottomNav';
import FeaturedProfiles from './sections/FeaturedProfiles';
import EditProfile from '../shared/EditProfile';
import SearchPreferences from '../shared/SearchPreferences';
import AccountSettings from '../shared/AccountSettings';
import SafetyCenter from '../shared/SafetyCenter';
import DetailedProfile from '../shared/DetailedProfile';
import {
    NormalProfiles, HelpSupport
} from './sections/Placeholders';
import Preservices from '../../../components/footerpages/premiumservices';
import WalletHistory from '../shared/WalletHistory';
import CreditsPage from '../shared/CreditsPage';
import { FileText, PlusSquare, Briefcase } from "lucide-react";
import Activity from './sections/activity';
import Messenger from '../shared/Messenger';
import BlogFeed from '../shared/BlogFeed';
import ChatPopup from '../shared/ChatPopup';
import MyCases from './sections/MyCases';
import FileCase from './sections/FileCase';
import PromoCodes from './sections/PromoCodes';
import { Menu, ArrowLeft, Bell } from 'lucide-react';

import type { Advocate } from '../../../types';

import { useAuth } from '../../../context/AuthContext';

const ClientDashboard: React.FC = () => {
    const { user } = useAuth();
    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || ['Silver', 'Gold', 'Platinum', 'Pro', 'Ultra'].some(p => plan.includes(p));

    const [currentPage, setCurrentPage] = useState('featured-profiles');
    const [detailedProfileId, setDetailedProfileId] = useState<string | null>(null);
    const [activeChatAdvocate, setActiveChatAdvocate] = useState<Advocate | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
            case 'account-settings':
                return <AccountSettings backToHome={backtohome} showToast={showToast} />;
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
            case 'messenger':
                return <Messenger
                    view="list"
                    onSelectForChat={handleSelectForChat}
                />;
            case 'my-cases':
                return <MyCases />;
            case 'fileacase':
                return <FileCase backToHome={backtohome} showToast={showToast} />;
            case 'Promocodes':
                return <PromoCodes />;
            default:
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
            case 'detailed-profile-view': return 'Advocate Detail';
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
            case 'Promocodes': return 'Special Promocodes';
            default: return 'Client Dashboard';
        }
    };

    return (
        <div className={styles.clientdashboard}>
            <ClientSidebar
                isOpen={sidebarOpen}
                showsidePage={showsidePage}
                currentPage={currentPage}
            />

            <main className={styles.mainContentclientdash}>
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.hamburger} onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        {currentPage !== 'featured-profiles' && (
                            <button className={styles.backBtn} onClick={backtohome}>
                                <ArrowLeft size={22} />
                            </button>
                        )}
                        <h1 className={styles.pageTitle}>
                            {getPageTitle()}
                            {currentPage === 'featured-profiles' && <span>some one is posted their blogs</span>}
                        </h1>
                    </div>

                    {currentPage === 'my-cases' && (
                        <div className={styles.topBarRight}>
                            {/* Top Action Bar */}
                            <div className={styles.caseActions}>
                                <button className={styles.topBtn}>
                                    <FileText size={18} />
                                    Case Status
                                </button>
                                <button className={styles.topBtn}>
                                    <PlusSquare size={18} />
                                    File a Case
                                </button>
                                <button className={styles.topBtnPrimary}>
                                    <Briefcase size={18} />
                                    New Case
                                </button>
                            </div>

                            <button className={styles.notificationBtn}>
                                <Bell size={22} />
                            </button>
                        </div>
                    )}

                </header>

                <div className={styles.contentBody}>
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
        </div>
    );
};

export default ClientDashboard;
