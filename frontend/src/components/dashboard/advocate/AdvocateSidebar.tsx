import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    User, Search, Star, Newspaper, ArrowUp, Shield, Settings,
    Coins, LogOut, Briefcase, Lock, Wallet, FileText
} from 'lucide-react';
import styles from '../Sidebar.module.css';

interface Props {
    isOpen: boolean;
    showsidePage: (page: string) => void;
    currentPage: string;
}

const AdvocateSidebar: React.FC<Props> = ({ isOpen, showsidePage, currentPage }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'edit-profile', label: 'Edit Profile', icon: User },
        { id: 'search-preferences', label: 'Search Preferences', icon: Search },
        { id: 'wallet-history', label: 'Wallet & History', icon: Wallet },
        { id: 'my-subscription', label: 'My Subscription', icon: Shield },
        { id: 'featured-profiles', label: 'Featured Profiles', icon: Star, premium: true },
        { id: 'blogs', label: 'Blogs', icon: Newspaper },
        { id: 'my-cases', label: 'My Cases', icon: Briefcase },
        { id: 'legal-documentation', label: 'Legal Documentation', icon: FileText },
        { id: 'upgrade', label: 'Upgrade', icon: ArrowUp },
        { id: 'safety-center', label: 'Safety Center', icon: Shield },
        { id: 'account-settings', label: 'Account & Settings', icon: Settings },
        { id: 'credits', label: 'Credits', icon: Coins },
    ];

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.profileSection}>
                <div className={styles.avatar}>
                    {user?.name?.charAt(0) || 'A'}
                </div>
                <div className={styles.userInfo}>
                    <h3>{user?.name || 'Advocate'}</h3>
                    <p>ID - {user?.id || '12345'}</p>
                </div>

                <button className={styles.upgradeBtn} onClick={() => showsidePage('upgrade')}>
                    Upgrade Membership
                </button>
                <div className={styles.upgradeText}>
                    UPTO 53% OFF ALL MEMBERSHIP PLANS
                </div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isLocked = item.premium && !isPremium;

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
                    <span>Logout</span>
                </button>
            </nav>

        </aside>
    );
};

export default AdvocateSidebar;
