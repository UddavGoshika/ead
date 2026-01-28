import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import axios from "axios";
import styles from "./notification.module.css";

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const formatRelativeTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'just now';
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h ago`;
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        } catch (e) {
            return 'recently';
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            if (res.data.success) {
                const fetchedNotifs = res.data.notifications;
                setNotifications(fetchedNotifs);
                setUnreadCount(fetchedNotifs.filter((n: any) => !n.read).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        try {
            await axios.post('/api/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Mark all read failed");
        }
    };

    const handleBellClick = () => {
        setOpen(true);
        if (unreadCount > 0) markAllRead();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'registration': return '👤';
            case 'blog': return '📝';
            case 'ticket': return '🎫';
            case 'chat': return '💬';
            default: return '🔔';
        }
    };

    return (
        <>
            <div className={styles.notificationWrapper}>
                <div className={styles.bellContainer} onClick={handleBellClick}>
                    <Bell size={22} />
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount}</span>
                    )}
                </div>
            </div>

            {/* Notification Panel Overlay */}
            {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

            {/* Sliding Panel */}
            {open && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h4>System Notifications</h4>
                        <button className={styles.closeBtn} onClick={() => setOpen(false)}><X size={20} /></button>
                    </div>

                    <div className={styles.notifList}>
                        {notifications.length === 0 ? (
                            <p className={styles.empty}>No activities to show</p>
                        ) : (
                            notifications.map((note) => (
                                <div key={note._id} className={`${styles.item} ${!note.read ? styles.itemUnread : ''}`}>
                                    <div className={styles.notifTitle}>
                                        {getIcon(note.type)} {note.type.toUpperCase()}
                                    </div>
                                    <div className={styles.notifMsg}>{note.message}</div>
                                    <div className={styles.notifTime}>
                                        {formatRelativeTime(note.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationBell;
