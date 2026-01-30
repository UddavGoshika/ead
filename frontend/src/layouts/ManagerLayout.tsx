import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ManagerSidebar from '../components/manager/ManagerSidebar';
import styles from './ManagerLayout.module.css';
import NotificationBell from "./notification";
import AdvocateRegistration from '../components/auth/AdvocateRegistration';
import ClientRegistration from '../components/auth/ClientRegistration';
import { useAuth } from '../context/AuthContext';

const ManagerLayout: React.FC = () => {
    const { logout, isAdvocateRegOpen, closeAdvocateReg, isClientRegOpen, closeClientReg } = useAuth();
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
        logout();
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
            <ManagerSidebar collapsed={isSidebarCollapsed} />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.toggleBtn} onClick={toggleSidebar}>
                            {isSidebarCollapsed ? '☰' : '✕'}
                        </button>

                        <div className={styles.breadcrumb}>
                            <span>Manager</span>
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
                            M
                        </div>

                        {isProfileOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.userName}>Operations Manager</div>
                                    <div className={styles.userRole}>Portal Management</div>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <button className={styles.dropdownItem} onClick={() => { navigate('/manager/profile'); setIsProfileOpen(false); }}>
                                    <span className={styles.dropIcon}>👤</span> View Profile
                                </button>
                                <button className={styles.dropdownItem} onClick={() => { navigate('/manager/settings'); setIsProfileOpen(false); }}>
                                    <span className={styles.dropIcon}>⚙️</span> Settings
                                </button>
                                <div className={styles.dropdownDivider} />
                                <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                                    <span className={styles.dropIcon}>🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.pageBody}>
                    <Outlet />
                </div>
            </main>
            {isAdvocateRegOpen && <AdvocateRegistration onClose={closeAdvocateReg} />}
            {isClientRegOpen && <ClientRegistration onClose={closeClientReg} />}
        </div>
    );
};

export default ManagerLayout;
