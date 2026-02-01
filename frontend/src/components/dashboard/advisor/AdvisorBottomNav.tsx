import React from 'react';
import { MessageSquare, Clock, Newspaper, Briefcase } from 'lucide-react';
import styles from '../MobileNav.module.css';

interface Props {
    bottomNavClick: (page: string) => void;
    currentPage: string;
}

const AdvisorBottomNav: React.FC<Props> = ({ bottomNavClick, currentPage }) => {
    const items = [
        { id: 'messenger', label: 'Inbox', icon: MessageSquare },
        { id: 'activity', label: 'Feeds', icon: Clock },
        { id: 'blogs', label: 'Insights', icon: Newspaper },
        { id: 'my-cases', label: 'Tasks', icon: Briefcase }
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

export default AdvisorBottomNav;
