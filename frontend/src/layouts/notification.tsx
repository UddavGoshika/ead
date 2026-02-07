import React, { useState, useEffect } from "react";
import {
    Bell,
    X,
    UserPlus,
    FileText,
    Ticket,
    MessageCircle,
    Star,
    Heart,
    Info
} from "lucide-react";
import axios from "axios";
import styles from "./notification.module.css";

interface NotificationItem {
    _id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
}

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

    const deleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await axios.delete(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => notifications.find(n => n._id === id)?.read ? prev : Math.max(0, prev - 1));
        } catch (err) {
            console.error("Delete notification failed");
        }
    };

    const clearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await axios.delete('/api/notifications/all/clear');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Clear all failed");
        }
    };

    const [isClosing, setIsClosing] = useState(false);

    const closePanel = () => {
        setIsClosing(true);
        setTimeout(() => {
            setOpen(false);
            setIsClosing(false);
        }, 500); // Matches the 0.5s CSS animation
    };

    const handleBellClick = () => {
        setOpen(true);
        setIsClosing(false);
    };

    const getIcon = (type: string) => {
        const size = 16;
        switch (type?.toLowerCase()) {
            case 'registration': return <UserPlus size={size} />;
            case 'blog': return <FileText size={size} />;
            case 'ticket': return < Ticket size={size} />;
            case 'chat': return <MessageCircle size={size} />;
            case 'superinterest': return <Star size={size} />;
            case 'interest': return <Heart size={size} />;
            default: return <Info size={size} />;
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
            {open && <div className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`} onClick={closePanel} />}

            {/* Sliding Panel */}
            {open && (
                <div className={`${styles.panel} ${isClosing ? styles.closing : ''}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.headerTitle}>
                            <h4>System Notifications</h4>
                            {notifications.length > 0 && (
                                <button className={styles.clearAllBtn} onClick={clearAll}>Clear All</button>
                            )}
                        </div>
                        <button className={styles.closePanelBtn} onClick={closePanel}><X size={20} />X</button>
                    </div>

                    <div className={styles.notifList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyContainer}>
                                <div className={styles.emptyIcon}><Bell size={40} /></div>
                                <p className={styles.empty}>No activities to show</p>
                            </div>
                        ) : (
                            notifications.map((note) => (
                                <div
                                    key={note._id}
                                    className={`${styles.item} ${!note.read ? styles.itemUnread : ''}`}
                                    onClick={async () => {
                                        if (!note.read) {
                                            try {
                                                await axios.patch(`/api/notifications/${note._id}/read`);
                                                setNotifications(prev => prev.map(n => n._id === note._id ? { ...n, read: true } : n));
                                                setUnreadCount(prev => Math.max(0, prev - 1));
                                            } catch (err) { }
                                        }
                                    }}
                                >
                                    <div className={styles.itemHeader}>
                                        <div className={styles.notifTitle}>
                                            <span className={styles.typeIcon}>{getIcon(note.type)}</span>
                                            {note.type.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                        </div>
                                        <button
                                            className={styles.itemDeleteBtn}
                                            onClick={(e) => deleteNotification(e, note._id)}
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className={styles.notifMsg}>{note.message}</div>
                                    <div className={styles.notifTime}>
                                        {formatRelativeTime(note.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <div className={styles.panelFooter}>
                            <button className={styles.markReadBtn} onClick={markAllRead}>Mark all as read</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default NotificationBell;
