import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatImageUrl } from '../../../utils/imageHelper';
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

const ProviderSidebar: React.FC<Props> = ({ isOpen, showsidePage, currentPage }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'provider-stats', label: 'Overview', icon: FileText },
        { id: 'edit-profile', label: 'Service Profile', icon: User },
        { id: 'wallet-history', label: 'Earnings & Wallet', icon: Wallet },
        { id: 'blogs', label: 'Legal Blogs', icon: Newspaper },
        { id: 'messenger', label: 'Client Inquiries', icon: Briefcase },
        { id: 'upgrade', label: 'Promote Services', icon: ArrowUp },
        { id: 'account-settings', label: 'Account Settings', icon: Settings },
    ];

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                    {user?.image_url ? (
                        <img src={formatImageUrl(user.image_url)} alt={user.name} className={styles.profileAvatar} />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {user?.name?.charAt(0) || 'P'}
                        </div>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user?.name || 'Service Provider'}</h3>
                    <span className={styles.userUniqueId}>{user?.unique_id || user?.id || '...'}</span>
                    <div className={styles.roleLabel}>Legal Advisor</div>
                </div>

                <button className={styles.upgradeBtn} onClick={() => showsidePage('upgrade')}>
                    Elite Membership
                </button>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`${styles.link} ${currentPage === item.id ? styles.active : ''}`}
                            onClick={() => showsidePage(item.id)}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon size={22} />
                            </div>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={() => logout()}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default ProviderSidebar;
