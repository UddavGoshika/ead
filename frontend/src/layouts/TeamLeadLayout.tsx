import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TeamLeadSidebar from '../components/teamlead/TeamLeadSidebar';
import styles from './TeamLeadLayout.module.css';
import NotificationBell from "./notification";

const TeamLeadLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(p => p !== '');

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

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
        <div className={`${styles.adminContainer} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
            <TeamLeadSidebar collapsed={isSidebarCollapsed} />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.toggleBtn} onClick={toggleSidebar}>
                            {isSidebarCollapsed ? '☰' : '✕'}
                        </button>

                        <div className={styles.breadcrumb}>
                            <span>MISSION CONTROL</span>
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
                        <div className={styles.userAvatar} onClick={toggleProfile}>
                            TL
                        </div>

                        {isProfileOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.userName}>Senior Lead</div>
                                    <div className={styles.userRole}>Team Operations</div>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <button className={styles.dropdownItem} onClick={() => { navigate('/team-lead/profile'); setIsProfileOpen(false); }}>
                                    <span className={styles.dropIcon}>👤</span> Personnel File
                                </button>
                                <button className={styles.dropdownItem} onClick={() => { navigate('/team-lead/queries'); setIsProfileOpen(false); }}>
                                    <span className={styles.dropIcon}>📩</span> Urgent Escalations
                                </button>
                                <div className={styles.dropdownDivider} />
                                <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                                    <span className={styles.dropIcon}>🚪</span> Terminate Session
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.pageBody}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TeamLeadLayout;
