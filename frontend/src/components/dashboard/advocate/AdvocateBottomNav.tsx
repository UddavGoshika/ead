import React from 'react';
import { Users, MessageSquare, Clock, Newspaper, Briefcase } from 'lucide-react';
import styles from '../MobileNav.module.css';

interface Props {
    bottomNavClick: (page: string) => void;
    currentPage: string;
}

const AdvocateBottomNav: React.FC<Props> = ({ bottomNavClick, currentPage }) => {
    const items = [
        { id: 'featured-profiles', label: 'Profiles', icon: Users },
        { id: 'messenger', label: 'Messenger', icon: MessageSquare },
        { id: 'activity', label: 'Activity', icon: Clock },
        { id: 'blogs', label: 'Blogs', icon: Newspaper },
        { id: 'my-cases', label: 'My Cases', icon: Briefcase }
    ];

    return (
        <div className={styles.mobileNav}>
            {items.map((item) => (
                <button
                    key={item.id}
                    className={`${styles.item} ${currentPage === item.id ? styles.active : ''}`}
                    onClick={() => bottomNavClick(item.id)}
                >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default AdvocateBottomNav;
