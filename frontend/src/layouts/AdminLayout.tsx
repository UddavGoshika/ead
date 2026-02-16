import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import styles from './AdminLayout.module.css';
import NotificationBell from "./notification";
import AdvocateRegistration from '../components/auth/AdvocateRegistration';
import ClientRegistration from '../components/auth/ClientRegistration';
import LegalProviderRegistration from '../components/auth/LegalProviderRegistration';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
    const { logout, user, isAdvocateRegOpen, closeAdvocateReg, isClientRegOpen, closeClientReg, isLegalProviderRegOpen, closeLegalProviderReg } = useAuth();

    const roleToDisplay: Record<string, string> = {
        admin: 'Super Admin',
        super_admin: 'Super Admin',
        manager: 'Manager',
        teamlead: 'Team Lead',
        hr: 'HR',
        telecaller: 'Telecaller',
        customer_care: 'Customer Care Support',
        chat_support: 'Chat Support',
        live_chat: 'Live Chat Support',
        call_support: 'Call Support',
        personal_assistant: 'Personal Assistant',
        marketer: 'Marketer',
        legal_provider: 'Legal Advisor',
        email_support: 'Email Support'
    };

    const getRoleDisplayName = () => {
        const r = (user?.role || '').toLowerCase().replace(/-/g, '_');
        return roleToDisplay[r] || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase().replace(/_/g, ' ') : 'Administrator');
    };

    const roleName = getRoleDisplayName();

    // Initialize collapsed state: Mobile (hidden) or Tablet (icon-only) for < 1024px
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
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

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarCollapsed(true);
        }
    }, [location.pathname]);

    return (
        <div className={`${styles.adminContainer} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
            {/* Mobile Overlay */}
            {!isSidebarCollapsed && (
                <div
                    className={styles.mobileOverlay}
                    onClick={() => setIsSidebarCollapsed(true)}
                />
            )}

            <AdminSidebar collapsed={isSidebarCollapsed} />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.toggleBtn} onClick={toggleSidebar}>
                            {isSidebarCollapsed ? '☰' : '✕'}
                        </button>




                        <div className={styles.breadcrumb}>
                            <span>Admin</span>
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
                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>

                        {isProfileOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.userName}>{user?.name || user?.email || 'Super Admin'}</div>
                                    <div className={styles.userRole}>{roleName}</div>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <button className={styles.dropdownItem} onClick={() => { navigate('/admin/profile'); setIsProfileOpen(false); }}>
                                    <span className={styles.dropIcon}>👤</span> View Profile
                                </button>
                                <button className={styles.dropdownItem} onClick={() => { navigate('/admin/settings'); setIsProfileOpen(false); }}>
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
            {isLegalProviderRegOpen && <LegalProviderRegistration onClose={closeLegalProviderReg} />}
        </div>
    );
};

export default AdminLayout;
