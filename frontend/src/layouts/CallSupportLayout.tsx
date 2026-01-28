import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import NotificationBell from "./notification";

const CallSupportLayout: React.FC = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(p => p !== '');

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.adminContainer}>
            <main className={styles.mainContent} style={{ marginLeft: 0 }}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.breadcrumb}>
                            <span>Call Center</span>
                            {pathParts.map((part, index) => (
                                <React.Fragment key={index}>
                                    <span>/</span>
                                    <span className={index === pathParts.length - 1 ? styles.breadcrumbActive : ''}>
                                        {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className={styles.userMenu} ref={profileRef}>
                        <div className={styles.notification}>
                            <NotificationBell />
                        </div>
                        <div className={styles.userAvatar} onClick={toggleProfile} style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                            S
                        </div>

                        {isProfileOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.userName}>Call Support Agent</div>
                                    <div className={styles.userRole}>Voice Resolution Team</div>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <button className={styles.dropdownItem} onClick={() => { navigate('/call-support/profile'); setIsProfileOpen(false); }}>
                                    <span className={styles.dropIcon}>👤</span> View Profile
                                </button>
                                <div className={styles.dropdownDivider} />
                                <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                                    <span className={styles.dropIcon}>🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.pageBodyFull}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CallSupportLayout;
