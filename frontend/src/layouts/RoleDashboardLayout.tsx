import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RoleDashboardLayout.module.css';
import {
    MdDashboard,
    MdPeople,
    MdVerifiedUser,
    MdPayments,
    MdHistory,
    MdAssessment,
    MdConfirmationNumber,
    MdGavel,
    MdBugReport,
    MdSupportAgent,
    MdInbox,
    MdLogout,
    MdPerson,
    MdSettings,
    MdMenu,
    MdClose
} from 'react-icons/md';

const RoleDashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
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

    const role = user?.role || 'ADMIN';

    const menuItems: Record<string, any[]> = {
        ADMIN: [
            { id: 'dash', name: 'Dashboard', icon: <MdDashboard />, path: '/dashboard/admin' },
            { id: 'approvals', name: 'Advocate Approvals', icon: <MdVerifiedUser />, path: '/dashboard/admin/approvals' },
            { id: 'clients', name: 'Clients', icon: <MdPeople />, path: '/dashboard/admin/clients' },
            { id: 'verifications', name: 'Verifications', icon: <MdAssessment />, path: '/dashboard/admin/verifications' },
            { id: 'cases', name: 'Cases', icon: <MdGavel />, path: '/dashboard/admin/cases' },
            { id: 'disputes', name: 'Disputes', icon: <MdBugReport />, path: '/dashboard/admin/disputes' },
            { id: 'tickets', name: 'Tickets', icon: <MdConfirmationNumber />, path: '/dashboard/admin/tickets' },
        ],
        VERIFIER: [
            { id: 'assigned', name: 'Assigned', icon: <MdAssessment />, path: '/dashboard/verifier/assigned' },
            { id: 'history', name: 'History', icon: <MdHistory />, path: '/dashboard/verifier/history' },
        ],
        FINANCE: [
            { id: 'transactions', name: 'Transactions', icon: <MdHistory />, path: '/dashboard/finance/transactions' },
            { id: 'payouts', name: 'Payouts', icon: <MdPayments />, path: '/dashboard/finance/payouts' },
            { id: 'refunds', name: 'Refunds', icon: <MdPayments />, path: '/dashboard/finance/refunds' },
            { id: 'reports', name: 'Reports', icon: <MdAssessment />, path: '/dashboard/finance/reports' },
        ],
        SUPPORT: [
            { id: 'inbox', name: 'Tickets Inbox', icon: <MdInbox />, path: '/dashboard/support/inbox' },
        ]
    };

    const currentMenu = menuItems[role as string] || [];

    const pathParts = location.pathname.split('/').filter(p => p !== '');
    const currentPathName = pathParts[pathParts.length - 1] || 'Dashboard';

    return (
        <div className={styles.roleContainer}>
            {/* Sidebar */}
            <aside className={`${styles.roleSidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
                <div className={styles.logoArea}>
                    {!isSidebarCollapsed && <div className={styles.logoText}>E-Advocate</div>}
                    {isSidebarCollapsed && <div className={styles.logoText}>EA</div>}
                </div>

                <nav className={styles.menuContainer}>
                    {currentMenu.map(item => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) =>
                                `${styles.menuItem} ${isActive ? styles.activeItem : ''}`
                            }
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            {!isSidebarCollapsed && <span>{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.toggleBtn} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                            {isSidebarCollapsed ? <MdMenu /> : <MdClose />}
                        </button>
                        <div className={styles.breadcrumb}>
                            <span>{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                            <span>/</span>
                            <span className={styles.breadcrumbActive}>
                                {currentPathName.charAt(0).toUpperCase() + currentPathName.slice(1).replace(/-/g, ' ')}
                            </span>
                        </div>
                    </div>

                    <div className={styles.userMenu} ref={profileRef}>
                        <div className={styles.userAvatar} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>

                        {isProfileOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.userName}>{user?.name || 'User'}</div>
                                    <div className={styles.userRole}>{role}</div>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <button className={styles.dropdownItem} onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}>
                                    <MdPerson /> Profile
                                </button>
                                <button className={styles.dropdownItem} onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}>
                                    <MdSettings /> Settings
                                </button>
                                <div className={styles.dropdownDivider} />
                                <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                                    <MdLogout /> Logout
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

export default RoleDashboardLayout;
