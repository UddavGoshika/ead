import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, X } from 'lucide-react';
import styles from './NotificationDropdown.module.css';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    { id: '1', title: 'New Leave Request', message: 'John Doe submitted a new PTO request.', type: 'info', time: '5m ago', read: false },
    { id: '2', title: 'Invoice Paid', message: 'Invoice #INV-2023-045 has been paid.', type: 'success', time: '1h ago', read: false },
    { id: '3', title: 'System Alert', message: 'High CPU usage detected on backend server.', type: 'warning', time: '2h ago', read: true },
    { id: '4', title: 'SLA Breach', message: 'Ticket #TK-9021 breached response SLA.', type: 'error', time: '1d ago', read: true }
];

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check size={16} className={styles.iconSuccess} />;
            case 'warning': return <AlertTriangle size={16} className={styles.iconWarning} />;
            case 'error': return <AlertTriangle size={16} className={styles.iconError} />;
            default: return <Info size={16} className={styles.iconInfo} />;
        }
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button className={styles.iconBtn} onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className={styles.markReadBtn} onClick={markAllRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>No notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div key={notification.id} className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}>
                                    <div className={styles.itemIcon}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className={styles.itemContent}>
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className={styles.time}><Clock size={12} /> {notification.time}</span>
                                    </div>
                                    {!notification.read && <div className={styles.unreadDot} />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.viewAllBtn}>View All Activity</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
