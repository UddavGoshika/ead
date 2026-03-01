import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Search, Menu, X, LogOut, ChevronRight, User as UserIcon, Activity, Building, Award
} from 'lucide-react';
import styles from './StaffLayout.module.css';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../../../components/dashboard/shared/NotificationDropdown';

export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface StaffLayoutProps {
    title: string;
    roleName: string;
    navItems: NavItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children: React.ReactNode;
    department?: 'hr' | 'finance' | 'marketing' | 'support' | 'operations' | 'management';
}

const StaffLayout: React.FC<StaffLayoutProps> = ({
    title,
    roleName,
    navItems,
    activeTab,
    onTabChange,
    children,
    department = 'management'
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`${styles.layout} ${styles[`dept_${department}`]}`}>
            {/* Desktop Sidebar */}
            <motion.aside
                className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollapsed : ''}`}
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
            >
                <div className={styles.sidebarHeader}>
                    {isSidebarOpen ? (
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>EA</div>
                            <span className={styles.logoText}>eAdvocate</span>
                        </div>
                    ) : (
                        <div className={styles.logoIcon}>EA</div>
                    )}
                    <button className={styles.toggleBtn} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu size={20} />
                    </button>
                </div>

                <div className={styles.roleBadge}>
                    {isSidebarOpen ? roleName : roleName.charAt(0)}
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                            onClick={() => onTabChange(item.id)}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {isSidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
                            {isSidebarOpen && activeTab === item.id && (
                                <ChevronRight size={16} className={styles.navArrow} />
                            )}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.logoutBtn} onClick={handleLogout} title={!isSidebarOpen ? "Logout" : undefined}>
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            className={styles.mobileOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.aside
                            className={styles.mobileSidebar}
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween' }}
                        >
                            <div className={styles.sidebarHeader}>
                                <div className={styles.logo}>
                                    <div className={styles.logoIcon}>EA</div>
                                    <span className={styles.logoText}>eAdvocate</span>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className={styles.roleBadge}>{roleName}</div>

                            <nav className={styles.nav}>
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <span className={styles.navIcon}>{item.icon}</span>
                                        <span className={styles.navLabel}>{item.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className={styles.sidebarFooter}>
                                <button className={styles.logoutBtn} onClick={handleLogout}>
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.mobileToggleBtn} onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <h1 className={styles.pageTitle}>{title}</h1>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.searchBar}>
                            <Search size={18} className={styles.searchIcon} />
                            <input type="text" placeholder="Search..." className={styles.searchInput} />
                        </div>

                        <div className={styles.osWidgets}>
                            <div className={styles.widgetBadge} title="Latency: 24ms">
                                <Activity size={14} className={styles.widgetIcon} color="#10b981" />
                                <span>24ms</span>
                            </div>

                            <div className={styles.orgSwitcher} title="Switch Organization">
                                <Building size={16} className={styles.widgetIcon} />
                                <span>eAdvocate Corp</span>
                                <ChevronRight size={14} style={{ rotate: '90deg', marginLeft: '4px' }} />
                            </div>

                            <div className={styles.subscriptionBadge} title="Enterprise Plan">
                                <Award size={16} className={styles.widgetIcon} color="#facc15" />
                                <span style={{ color: '#facc15' }}>Enterprise</span>
                            </div>
                        </div>

                        <NotificationDropdown />
                        <div className={styles.profileMenu}>
                            <div className={styles.avatar}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                            </div>
                            <div className={styles.profileInfo}>
                                <span className={styles.profileName}>{user?.name || 'Staff User'}</span>
                                <span className={styles.profileRole}>{roleName}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%' }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;
