import { useAuth } from '../../../context/AuthContext';
import { formatImageUrl } from '../../../utils/imageHelper';
import {
    User, Search, Star, Newspaper, ArrowUp, Shield, Settings,
    Coins, LogOut, Wallet, FileText, Briefcase, Gift
} from 'lucide-react';
import { checkIsPremium } from '../../../utils/planHelper';

// import styles from '../Sidebar.module.css';
import styles from './ClientSidebar.module.css';
interface Props {
    isOpen: boolean;
    showsidePage: (page: string) => void;
    currentPage: string;
    onShowTryon?: () => void;
}

const ClientSidebar: React.FC<Props> = ({ isOpen, showsidePage, currentPage, onShowTryon }) => {
    const { user, logout } = useAuth();

    const isPremium = checkIsPremium(user);
    const plan = user?.plan || 'Free';


    const menuItems = [
        { id: 'edit-profile', label: 'Edit Profile', icon: User },
        { id: 'search-preferences', label: 'Search Preferences', icon: Search },
        { id: 'featured-profiles', label: 'Featured Profiles', icon: Star },
        { id: 'blogs', label: 'Blogs', icon: Newspaper },
        { id: 'my-cases', label: 'My Cases', icon: Briefcase },
        { id: 'legal-documentation', label: 'Legal Documentation', icon: FileText },
        { id: 'my-subscription', label: 'My Subscription', icon: Shield },

        { id: 'wallet-history', label: 'Wallet & History', icon: Wallet },
        { id: 'upgrade', label: 'Upgrade', icon: ArrowUp },
        { id: 'credits', label: 'Credits', icon: Coins },

        { id: 'safety-center', label: 'Safety Center', icon: Shield },
        { id: 'help-support', label: 'Help & Support', icon: Settings },

        { id: 'refer-earn', label: 'Refer & Earn', icon: Gift },

        { id: 'account-settings', label: 'Account & Settings', icon: Settings }
    ];

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                    {user?.image_url ? (
                        <img src={formatImageUrl(user.image_url)} alt={user.name} className={styles.profileAvatar} />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>

                <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user?.name || 'Client Member'}</h3>
                    <span className={styles.userUniqueId}>{user?.unique_id || user?.id || '...'}</span>
                    <div className={styles.roleLabel}>
                        {user?.role === 'legal_provider' ? 'Advisor' :
                            user?.role === 'advocate' ? 'Advocate' :
                                user?.role === 'client' ? 'Client' :
                                    'Client'}
                    </div>
                </div>

                <button className={styles.upgradeBtn} onClick={() => showsidePage('upgrade')}>
                    Upgrade Membership
                </button>
                <div className={styles.upgradeText}>
                    UPTO 53% OFF ALL MEMBERSHIP PLANS
                </div>

                {!user?.isPremium && !user?.demoUsed && onShowTryon && !localStorage.getItem('hasDismissedPremiumTrial') && (
                    <button
                        className={styles.tryonBtn}
                        onClick={onShowTryon}
                        style={{
                            marginTop: '12px',
                            background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                            color: '#000',
                            fontWeight: 800,
                            padding: '10px',
                            borderRadius: '12px',
                            width: '100%',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)'
                        }}
                    >
                        <Star size={16} fill="black" />
                        Try Premium Gold 12h
                    </button>
                )}
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

                {/* TOKEN TRACKER (Rule 16) */}
                {isPremium && (
                    <div className={styles.tokenTracker}>
                        <div className={styles.tokenHeader}>
                            <Coins size={16} />
                            <span>Token Tracker</span>
                        </div>
                        <div className={styles.tokenStats}>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Total Tokens</span>
                                <span className={styles.statValue}>{user?.coinsReceived || 0}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Tokens Spent</span>
                                <span className={styles.statValue}>{user?.coinsUsed || 0}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Remaining</span>
                                <span className={styles.statValueHighlight}>{user?.coins || 0}</span>
                            </div>
                            <div className={styles.tokenProgressBase}>
                                <div
                                    className={styles.tokenProgressBar}
                                    style={{ width: `${Math.min(((user?.coins || 0) / (user?.coinsReceived || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SUBSCRIPTION INFO (Rule 11) */}
                <div className={styles.subscriptionDetails}>
                    <div className={styles.subRow}>
                        <span>Current Plan</span>
                        <strong>{plan}</strong>
                    </div>
                    {isPremium && user?.premiumExpiry && (
                        <div className={styles.subRow}>
                            <span>Expiry Date</span>
                            <strong>{new Date(user.premiumExpiry).toLocaleDateString()}</strong>
                        </div>
                    )}
                    <div className={styles.subRow}>
                        <span>Interactions</span>
                        <strong>Live</strong>
                    </div>
                    <a className={styles.renewLink} onClick={() => showsidePage('upgrade')}>Manage Plan</a>
                </div>

                <div className={styles.divider}></div>
                <button
                    className={styles.link}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-support-hub'))}
                    style={{ color: '#3b82f6' }}
                >
                    <Shield size={22} color="#3b82f6" />
                    <span>Official Support</span>
                </button>

                <button className={styles.logoutBtn} onClick={() => logout()}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </nav>

        </aside>
    );
};

export default ClientSidebar;
