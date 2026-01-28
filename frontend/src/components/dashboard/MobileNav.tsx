import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, MessageSquare, Activity } from 'lucide-react';
import styles from './MobileNav.module.css';

const MobileNav: React.FC = () => {
    return (
        <nav className={styles.mobileNav}>
            <NavLink
                to="/dashboard/client"
                end
                className={({ isActive }) => isActive ? `${styles.item} ${styles.active}` : styles.item}
            >
                <Users size={20} />
                <span>Advocates</span>
            </NavLink>

            <NavLink
                to="/dashboard/client/cases"
                className={({ isActive }) => isActive ? `${styles.item} ${styles.active}` : styles.item}
            >
                <Briefcase size={20} />
                <span>Cases</span>
            </NavLink>

            <NavLink
                to="/dashboard/client/messages"
                className={({ isActive }) => isActive ? `${styles.item} ${styles.active}` : styles.item}
            >
                <MessageSquare size={20} />
                <span>Messages</span>
            </NavLink>

            <NavLink
                to="/dashboard/client/activity"
                className={({ isActive }) => isActive ? `${styles.item} ${styles.active}` : styles.item}
            >
                <Activity size={20} />
                <span>Activity</span>
            </NavLink>
        </nav>
    );
};

export default MobileNav;
