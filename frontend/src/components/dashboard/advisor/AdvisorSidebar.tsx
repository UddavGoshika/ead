import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatImageUrl } from '../../../utils/imageHelper';
import {
    User, Newspaper, ArrowUp, Shield, Settings,
    Coins, LogOut, Briefcase, Lock, Wallet, FileText, Search, Star, Gift
} from 'lucide-react';
import { checkIsPremium } from '../../../utils/planHelper';

import styles from '../Sidebar.module.css';

interface Props {
    isOpen: boolean;
    showsidePage: (page: string) => void;
    currentPage: string;
}

const AdvisorSidebar: React.FC<Props> = ({ isOpen, showsidePage, currentPage }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        // { id: 'edit-profile', label: 'Manage Profile', icon: User },
        // { id: 'wallet-history', label: 'Wallet & Billing', icon: Wallet },
        // { id: 'my-subscription', label: 'Pro Benefits', icon: Shield },
        // { id: 'blogs', label: 'Legal Insights', icon: Newspaper },
        // { id: 'my-cases', label: 'Active Services', icon: Briefcase },
        // { id: 'upgrade', label: 'Premium Tiers', icon: ArrowUp },
        // { id: 'legal-documentation', label: 'Legal Documentation', icon: FileText },
        // { id: 'account-settings', label: 'Security & Access', icon: Settings },
        // { id: 'credits', label: 'Service Credits', icon: Coins },



        { id: 'edit-profile', label: 'Edit Profile', icon: User },
        { id: 'search-preferences', label: 'Search Preferences', icon: Search },
        // { id: 'featured-profiles', label: 'Featured Profiles', icon: Star },
        { id: 'blogs', label: 'Blogs', icon: Newspaper },
        { id: 'my-cases', label: 'My Cases', icon: Briefcase },
        // { id: 'legal-documentation', label: 'Legal Documentation', icon: FileText },
        { id: 'my-subscription', label: 'My Subscription', icon: Shield },

        { id: 'wallet-history', label: 'Wallet & History', icon: Wallet },
        { id: 'upgrade', label: 'Upgrade', icon: ArrowUp },
        { id: 'credits', label: 'Credits', icon: Coins },

        { id: 'safety-center', label: 'Safety Center', icon: Shield },
        { id: 'help-support', label: 'Help & Support', icon: Settings },

        { id: 'refer-earn', label: 'Refer & Earn', icon: Gift },

        { id: 'account-settings', label: 'Account & Settings', icon: Settings }






    ];

    const isPremium = checkIsPremium(user);
    const plan = user?.plan || 'Free';


    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                    {user?.image_url ? (
                        <img src={formatImageUrl(user.image_url)} alt={user.name} className={styles.profileAvatar} />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {user?.name?.charAt(0) || 'L'}
                        </div>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user?.name || 'Legal Advisor'}</h3>
                    <span className={styles.userUniqueId}>{user?.unique_id || user?.id || '...'}</span>
                    <div className={styles.roleLabel}>Legal Advisor</div>
                </div>

                <button className={styles.upgradeBtn} onClick={() => showsidePage('upgrade')}>
                    Elite Membership
                </button>
                <div className={styles.upgradeText}>
                    PROFESSIONAL PLAN ACTIVE
                </div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isLocked = (item as any).premium && !isPremium;

                    return (
                        <button
                            key={item.id}
                            className={`${styles.link} ${currentPage === item.id ? styles.active : ''} ${isLocked ? styles.locked : ''}`}
                            onClick={() => {
                                if (isLocked) return;
                                if (item.id === 'legal-documentation') {
                                    window.open('/dashboard/legal-docs', '_blank');
                                } else {
                                    showsidePage(item.id);
                                }
                            }}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon size={22} />
                                {isLocked && <Lock size={12} className={styles.lockIcon} />}
                            </div>
                            <span>{item.label}</span>
                            {isLocked && <span className={styles.proTagSmall}>PRO</span>}
                        </button>
                    );
                })}
                <div className={styles.divider}></div>
                <button className={styles.logoutBtn} onClick={() => logout()}>
                    <LogOut size={20} />
                    <span>Secure Logout</span>
                </button>
            </nav>
        </aside>
    );
};

export default AdvisorSidebar;
