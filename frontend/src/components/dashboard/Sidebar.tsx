import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Briefcase, MessageSquare, Activity, LogOut, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.profileSection}>
                <div className={styles.avatar}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className={styles.userInfo}>
                    <h3>{user?.name || 'User'}</h3>
                    <p>ID: {user?.unique_id || '...'}</p>
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

export default Sidebar;
