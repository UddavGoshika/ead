
import React from 'react';
import styles from '../pages/staff/StaffGlobalDashboard.module.css';
import {
    Layout, MessageSquare, Phone, User,
    LogOut, BarChart2, Briefcase, Users,
    Settings, Shield, Clock, Inbox, Activity,
    TrendingUp, List, HelpCircle, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import { useNavigate, useSearchParams } from 'react-router-dom';

interface StaffLayoutProps {
    children: React.ReactNode;
    activeTab?: string;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children, activeTab: propActiveTab }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = propActiveTab || searchParams.get('view') || 'dashboard';

    const setTab = (tab: string) => {
        setSearchParams({ view: tab });
    };

    const roleToDisplay: Record<string, string> = {
        admin: 'Super Admin',
        manager: 'Manager',
        teamlead: 'Team Lead',
        hr: 'HR',
        telecaller: 'Telecaller',
        data_entry: 'Data Entry',
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
        return roleToDisplay[r] || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase().replace(/_/g, ' ') : 'Staff');
    };

    const roleName = getRoleDisplayName();
    const role = (user?.role || '').toLowerCase().replace(/-/g, '_');

    const handleLogout = () => { if (window.confirm("End your terminal session?")) logout(); };

    const renderRoleSidebar = () => {
        if (role.includes('chat')) {
            return (
                <div className={styles.customSidebarContent}>
                    <div className={styles.sidebarSectionLabel}>SUPPORT CHANNELS</div>
                    <button onClick={() => setTab('live')} className={`${styles.navLink} ${activeTab === 'live' ? styles.navActive : ''}`}>
                        <MessageSquare size={18} />
                        <span>Live Chat Queue</span>
                    </button>
                    <button onClick={() => setTab('history')} className={`${styles.navLink} ${activeTab === 'history' ? styles.navActive : ''}`}>
                        <Clock size={18} />
                        <span>Chat History</span>
                    </button>
                    <div className={styles.sidebarSectionLabel}>ANALYTICS</div>
                    <button onClick={() => setTab('performance')} className={`${styles.navLink} ${activeTab === 'performance' ? styles.navActive : ''}`}>
                        <BarChart2 size={18} />
                        <span>My Performance</span>
                    </button>
                </div>
            );
        }

        if (role.includes('call')) {
            return (
                <div className={styles.customSidebarContent}>
                    <div className={styles.sidebarSectionLabel}>VOICE OPERATIONS</div>
                    <button onClick={() => setTab('live')} className={`${styles.navLink} ${activeTab === 'live' ? styles.navActive : ''}`}>
                        <Activity size={18} />
                        <span>Live Inbound</span>
                    </button>
                    <button onClick={() => setTab('history')} className={`${styles.navLink} ${activeTab === 'history' ? styles.navActive : ''}`}>
                        <Inbox size={18} />
                        <span>Voice Logs</span>
                    </button>
                </div>
            );
        }

        if (role === 'telecaller') {
            return (
                <div className={styles.customSidebarContent}>
                    <div className={styles.sidebarSectionLabel}>CRM ACCESS</div>
                    <button onClick={() => setTab('leads')} className={`${styles.navLink} ${activeTab === 'leads' ? styles.navActive : ''}`}>
                        <List size={18} />
                        <span>Active Leads</span>
                    </button>
                    <button onClick={() => setTab('members')} className={`${styles.navLink} ${activeTab === 'members' ? styles.navActive : ''}`}>
                        <Users size={18} />
                        <span>Member Directory</span>
                    </button>
                </div>
            );
        }

        if (role.includes('email')) {
            return (
                <div className={styles.customSidebarContent}>
                    <div className={styles.sidebarSectionLabel}>MAIL OPERATIONS</div>
                    <button onClick={() => setTab('Emailing')} className={`${styles.navLink} ${activeTab === 'Emailing' ? styles.navActive : ''}`}>
                        <Mail size={18} />
                        <span>Support Inbox</span>
                    </button>
                    <button onClick={() => setTab('Dashboard')} className={`${styles.navLink} ${activeTab === 'Dashboard' ? styles.navActive : ''}`}>
                        <Layout size={18} />
                        <span>Health Stats</span>
                    </button>
                    <div className={styles.sidebarSectionLabel}>SYSTEM</div>
                    <button onClick={() => setTab('Analytics')} className={`${styles.navLink} ${activeTab === 'Analytics' ? styles.navActive : ''}`}>
                        <BarChart2 size={18} />
                        <span>Mail Analytics</span>
                    </button>
                    <button onClick={() => setTab('Activity Log')} className={`${styles.navLink} ${activeTab === 'Activity Log' ? styles.navActive : ''}`}>
                        <Activity size={18} />
                        <span>Audit Trails</span>
                    </button>
                </div>
            );
        }

        if (['manager', 'teamlead', 'hr'].includes(role)) {
            return (
                <div className={styles.customSidebarContent}>
                    <div className={styles.sidebarSectionLabel}>MANAGEMENT</div>
                    <button onClick={() => setTab('dashboard')} className={`${styles.navLink} ${activeTab === 'dashboard' ? styles.navActive : ''}`}>
                        <Layout size={18} />
                        <span>Overview</span>
                    </button>
                    <button onClick={() => setTab('staff')} className={`${styles.navLink} ${activeTab === 'staff' ? styles.navActive : ''}`}>
                        <Users size={18} />
                        <span>Staff Directory</span>
                    </button>
                    <div className={styles.sidebarSectionLabel}>REPORTS</div>
                    <button onClick={() => setTab('performance')} className={`${styles.navLink} ${activeTab === 'performance' ? styles.navActive : ''}`}>
                        <TrendingUp size={18} />
                        <span>Audit Logs</span>
                    </button>
                </div>
            )
        }

        return null;
    };

    return (
        <div className={styles.staffContainer}>
            <aside className={styles.sideNav}>
                <div className={styles.brand}>
                    <div className={styles.logoSquare}>E</div>
                    <div className={styles.brandMeta}>
                        <span>EADVOCATE</span>
                        <small>{roleName.toUpperCase()} PORTAL</small>
                    </div>
                </div>

                <nav className={styles.navLinks}>
                    {renderRoleSidebar()}
                    <div className={styles.sidebarSectionLabel}>ACCOUNT</div>
                    <button onClick={() => setTab('profile')} className={`${styles.navLink} ${activeTab === 'profile' ? styles.navActive : ''}`}>
                        <User size={20} /> My Identity
                    </button>
                </nav>

                <div className={styles.sideFooter}>
                    <div className={styles.userSection}>
                        <div className={styles.userMiniAvatar}>{user?.email?.charAt(0).toUpperCase()}</div>
                        <div className={styles.userMiniMeta}>
                            <p className={styles.miniName}>{user?.name || 'Staff'}</p>
                            <p className={styles.miniStatus}>{roleName}</p>
                        </div>
                    </div>
                    <button className={styles.logoutAction} onClick={handleLogout}>
                        <LogOut size={18} /><span>TERMINATE</span>
                    </button>
                </div>
            </aside>

            <main className={styles.dashboard}>
                {children}
            </main>
        </div>
    );
};

export default StaffLayout;
