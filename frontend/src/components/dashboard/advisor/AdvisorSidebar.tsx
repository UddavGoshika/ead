import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    User, Newspaper, ArrowUp, Shield, Settings,
    Coins, LogOut, Briefcase, Lock, Wallet, FileText
} from 'lucide-react';
import styles from '../Sidebar.module.css';

interface Props {
    isOpen: boolean;
    showsidePage: (page: string) => void;
    currentPage: string;
}

const AdvisorSidebar: React.FC<Props> = ({ isOpen, showsidePage, currentPage }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'edit-profile', label: 'Manage Profile', icon: User },
        { id: 'wallet-history', label: 'Wallet & Billing', icon: Wallet },
        { id: 'my-subscription', label: 'Pro Benefits', icon: Shield },
        { id: 'blogs', label: 'Legal Insights', icon: Newspaper },
        { id: 'my-cases', label: 'Active Services', icon: Briefcase },
        { id: 'upgrade', label: 'Premium Tiers', icon: ArrowUp },
        { id: 'legal-documentation', label: 'Legal Documentation', icon: FileText },
        { id: 'account-settings', label: 'Security & Access', icon: Settings },
        { id: 'credits', label: 'Service Credits', icon: Coins },
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
                    <h3>{user?.name || 'Legal Advisor'}</h3>
                    <p>OFFICIAL ID - {user?.id || '...'}</p>
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
                            onClick={() => !isLocked && showsidePage(item.id)}
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
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={() => logout()}>
                    <LogOut size={20} />
                    <span>Secure Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdvisorSidebar;
