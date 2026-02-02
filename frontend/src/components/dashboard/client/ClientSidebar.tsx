import { useAuth } from '../../../context/AuthContext';
import {
    User, Search, Star, Newspaper, ArrowUp, Shield, Settings,
    Coins, LogOut, Wallet, FileText
} from 'lucide-react';
// import styles from '../Sidebar.module.css';
import styles from './ClientSidebar.module.css';
interface Props {
    isOpen: boolean;
    showsidePage: (page: string) => void;
    currentPage: string;
}

const ClientSidebar: React.FC<Props> = ({ isOpen, showsidePage, currentPage }) => {
    const { user, logout } = useAuth();

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    const menuItems = [
        { id: 'Promocodes', label: 'Refer & Earn', icon: User },
        { id: 'edit-profile', label: 'Edit Profile', icon: User },
        { id: 'search-preferences', label: 'Search Preferences', icon: Search },
        { id: 'wallet-history', label: 'Wallet & History', icon: Wallet },
        { id: 'my-subscription', label: 'My Subscription', icon: Shield },
        ...(isPremium ? [{ id: 'featured-profiles', label: 'Featured Profiles', icon: Star }] : []),
        { id: 'blogs', label: 'Blogs', icon: Newspaper },
        { id: 'legal-documentation', label: 'Legal Documentation', icon: FileText },
        { id: 'upgrade', label: 'Upgrade', icon: ArrowUp },
        { id: 'safety-center', label: 'Safety Center', icon: Shield },
        { id: 'account-settings', label: 'Account & Settings', icon: Settings },
        { id: 'credits', label: 'Credits', icon: Coins },
        { id: 'help-support', label: 'Help & Support', icon: Settings }
    ];

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.profileSection}>
                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        {user?.name?.charAt(0) || 'A'}
                    </div>

                    <div className={styles.userInfo}>
                        <h3>{user?.name || 'Alex'}</h3>
                        <p>ID - {user?.id || '12345'}</p>
                    </div>
                </div>


                <button className={styles.upgradeBtn}>
                    Upgrade Membership
                </button>
                <div className={styles.upgradeText}>
                    UPTO 53% OFF ALL MEMBERSHIP PLANS
                </div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`${styles.link} ${currentPage === item.id ? styles.active : ''}`}
                            onClick={() => {
                                if (item.id === 'legal-documentation') {
                                    window.open('/dashboard/legal-docs', '_blank');
                                } else {
                                    showsidePage(item.id);
                                }
                            }}
                        >
                            <Icon size={22} />
                            <span>{item.label}</span>
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

export default ClientSidebar;
