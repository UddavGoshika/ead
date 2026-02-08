import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils/imageHelper';
import { Users, Briefcase, MessageSquare, Activity, LogOut, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <aside className={styles.sidebar}>
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
                    <h3 className={styles.userName}>{user?.name || 'User'}</h3>
                    <span className={styles.userUniqueId}>{user?.unique_id || user?.id || '...'}</span>
                    <div className={styles.roleLabel}>
                        {user?.role === 'legal_provider' ? 'Advisor' :
                            user?.role === 'advocate' ? 'Advocate' :
                                user?.role === 'client' ? 'Client' :
                                    'Member'}
                    </div>
                </div>
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/dashboard/client"
                    end
                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                    <Users size={20} />
                    <span>Advocates</span>
                    <ChevronRight className={styles.chevron} size={16} />
                </NavLink>

                <NavLink
                    to="/dashboard/client/cases"
                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                    <Briefcase size={20} />
                    <span>My Cases</span>
                    <ChevronRight className={styles.chevron} size={16} />
                </NavLink>

                <NavLink
                    to="/dashboard/client/messages"
                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                    <MessageSquare size={20} />
                    <span>Messages</span>
                    <ChevronRight className={styles.chevron} size={16} />
                </NavLink>

                <NavLink
                    to="/dashboard/client/activity"
                    className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                    <Activity size={20} />
                    <span>Activity</span>
                    <ChevronRight className={styles.chevron} size={16} />
                </NavLink>

                <div className={styles.divider}></div>
                <button className={styles.logoutBtn} onClick={() => logout()}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </nav>

        </aside>
    );
};

export default Sidebar;
