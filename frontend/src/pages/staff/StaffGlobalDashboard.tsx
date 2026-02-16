
import React, { useState, useEffect } from 'react';
import styles from './StaffGlobalDashboard.module.css';
import {
    Layout, MessageSquare, Phone, User,
    LogOut, BarChart2, Briefcase, Users,
    Settings, Shield, Clock, Inbox, Activity,
    TrendingUp, List, HelpCircle, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import TelecallerDashboard from './roles/TelecallerDashboard';
import LiveChatDashboard from './roles/LiveChatDashboard';
import CallSupportDashboard from './roles/CallSupportDashboard';
import MailSupportDashboard from './roles/MailSupportDashboard';
import MemberTable from '../../components/admin/MemberTable';

type ActiveView = 'dashboard' | 'telecaller' | 'chat' | 'call' | 'mail' | 'members' | 'profile' | 'chat_history' | 'performance' | 'call_history' | 'lead_stats';

const StaffGlobalDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');

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

    useEffect(() => {
        const r = user?.role?.toLowerCase() || '';
        if (['telecaller', 'customer_care', 'telecalling_support'].includes(r)) setActiveView('telecaller');
        else if (['chat_agent', 'chat_support'].includes(r)) setActiveView('chat');
        else if (['call_agent', 'voice_support'].includes(r)) setActiveView('call');
    }, [user]);

    const handleLogout = () => { if (window.confirm("End your terminal session?")) logout(); };

    // --- SIDEBARS ---

    const renderChatSidebar = () => (
        <div className={styles.customSidebarContent}>
            <div className={styles.sidebarSectionLabel}>SUPPORT CHANNELS</div>
            <button className={`${styles.navLink} ${activeView === 'chat' ? styles.navActive : ''}`} onClick={() => setActiveView('chat')}>
                <motion.div whileHover={{ scale: 1.1 }}><MessageSquare size={18} /></motion.div>
                <span>Live Chat Queue</span>
            </button>
            <button className={`${styles.navLink} ${activeView === 'chat_history' ? styles.navActive : ''}`} onClick={() => setActiveView('chat_history')}>
                <motion.div whileHover={{ scale: 1.1 }}><Clock size={18} /></motion.div>
                <span>Chat History</span>
            </button>

            <div className={styles.sidebarSectionLabel}>ANALYTICS</div>
            <button className={`${styles.navLink} ${activeView === 'performance' ? styles.navActive : ''}`} onClick={() => setActiveView('performance')}>
                <motion.div whileHover={{ scale: 1.1 }}><BarChart2 size={18} /></motion.div>
                <span>My Performance</span>
            </button>
            <button className={styles.navLink}>
                <motion.div whileHover={{ scale: 1.1 }}><Settings size={18} /></motion.div>
                <span>Agent Settings</span>
            </button>
        </div>
    );

    const renderCallSidebar = () => (
        <div className={styles.customSidebarContent}>
            <div className={styles.sidebarSectionLabel}>VOICE OPERATIONS</div>
            <button className={`${styles.navLink} ${activeView === 'call' ? styles.navActive : ''}`} onClick={() => setActiveView('call')}>
                <motion.div whileHover={{ scale: 1.1 }}><Activity size={18} /></motion.div>
                <span>Live Inbound</span>
            </button>
            <button className={`${styles.navLink} ${activeView === 'call_history' ? styles.navActive : ''}`} onClick={() => setActiveView('call_history')}>
                <motion.div whileHover={{ scale: 1.1 }}><Inbox size={18} /></motion.div>
                <span>Voice Logs</span>
            </button>

            <div className={styles.sidebarSectionLabel}>TOOLS</div>
            <button className={styles.navLink}>
                <motion.div whileHover={{ scale: 1.1 }}><Phone size={18} /></motion.div>
                <span>Speed Dial</span>
            </button>
            <button className={styles.navLink}>
                <motion.div whileHover={{ scale: 1.1 }}><Shield size={18} /></motion.div>
                <span>Blocked List</span>
            </button>
        </div>
    );

    const renderTelecallerSidebar = () => (
        <div className={styles.customSidebarContent}>
            <div className={styles.sidebarSectionLabel}>CRM ACCESS</div>
            <button className={`${styles.navLink} ${activeView === 'telecaller' ? styles.navActive : ''}`} onClick={() => setActiveView('telecaller')}>
                <motion.div whileHover={{ scale: 1.1 }}><List size={18} /></motion.div>
                <span>Active Leads</span>
            </button>
            <button className={`${styles.navLink} ${activeView === 'members' ? styles.navActive : ''}`} onClick={() => setActiveView('members')}>
                <motion.div whileHover={{ scale: 1.1 }}><Users size={18} /></motion.div>
                <span>Member Directory</span>
            </button>

            <div className={styles.sidebarSectionLabel}>SALES TRACKER</div>
            <button className={`${styles.navLink} ${activeView === 'lead_stats' ? styles.navActive : ''}`} onClick={() => setActiveView('lead_stats')}>
                <motion.div whileHover={{ scale: 1.1 }}><TrendingUp size={18} /></motion.div>
                <span>Conversions</span>
            </button>
            <button className={styles.navLink}>
                <motion.div whileHover={{ scale: 1.1 }}><HelpCircle size={18} /></motion.div>
                <span>Help / Scripts</span>
            </button>
        </div>
    );

    const renderMailSidebar = () => (
        <div className={styles.customSidebarContent}>
            <div className={styles.sidebarSectionLabel}>MAIL OPERATIONS</div>
            <button className={`${styles.navLink} ${activeView === 'mail' ? styles.navActive : ''}`} onClick={() => setActiveView('mail')}>
                <motion.div whileHover={{ scale: 1.1 }}><Mail size={18} /></motion.div>
                <span>Support Inbox</span>
            </button>
            <button className={styles.navLink}>
                <motion.div whileHover={{ scale: 1.1 }}><Clock size={18} /></motion.div>
                <span>Drafts</span>
            </button>

            <div className={styles.sidebarSectionLabel}>SYSTEM</div>
            <button className={styles.navLink}>
                <motion.div whileHover={{ scale: 1.1 }}><Shield size={18} /></motion.div>
                <span>SMTP Health</span>
            </button>
        </div>
    );

    const renderSidebar = () => {
        const isChat = activeView === 'chat' || activeView === 'chat_history' || activeView === 'performance';
        const isCall = activeView === 'call' || activeView === 'call_history';
        const isTele = activeView === 'telecaller' || activeView === 'members' || activeView === 'lead_stats';
        const isMail = activeView === 'mail';

        return (
            <aside className={styles.sideNav}>
                <div className={styles.brand}>
                    <div className={styles.logoSquare}>E</div>
                    <div className={styles.brandMeta}>
                        <span>EADVOCATE</span>
                        <small>{roleName.toUpperCase()} PORTAL</small>
                    </div>
                </div>

                <nav className={styles.navLinks}>
                    <button className={`${styles.navLink} ${activeView === 'dashboard' ? styles.navActive : ''}`} onClick={() => setActiveView('dashboard')}>
                        <Layout size={20} /> Operational Home
                    </button>

                    <div className={styles.navDivider} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isChat ? 'chat' : isCall ? 'call' : isTele ? 'tele' : isMail ? 'mail' : 'default'}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isChat && renderChatSidebar()}
                            {isCall && renderCallSidebar()}
                            {isTele && renderTelecallerSidebar()}
                            {isMail && renderMailSidebar()}
                            {!isChat && !isCall && !isTele && !isMail && (
                                <div className={styles.defaultQuickLinks}>
                                    <div className={styles.sidebarSectionLabel}>QUICK SWITCH</div>
                                    <button className={styles.navLink} onClick={() => setActiveView('chat')}><MessageSquare size={18} /> Chat Hub</button>
                                    <button className={styles.navLink} onClick={() => setActiveView('call')}><Phone size={18} /> Call Deck</button>
                                    <button className={styles.navLink} onClick={() => setActiveView('mail')}><Mail size={18} /> Mail Desk</button>
                                    <button className={styles.navLink} onClick={() => setActiveView('telecaller')}><Briefcase size={18} /> CRM Leads</button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className={styles.navDivider} style={{ marginTop: 'auto' }} />
                    <button className={`${styles.navLink} ${activeView === 'profile' ? styles.navActive : ''}`} onClick={() => setActiveView('profile')}>
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
        );
    };

    return (
        <div className={styles.staffContainer}>
            {renderSidebar()}
            <main className={styles.dashboard}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.viewContainer}
                    >
                        {activeView === 'dashboard' && (
                            <div className={styles.dashboardWelcome}>
                                <div className={styles.welcomeHero}>
                                    <h1>Welcome, {user?.name || user?.email} ({roleName})</h1>
                                    <p>Select an operational module to begin your shift.</p>
                                </div>
                                <div className={styles.moduleGrid}>
                                    <div className={styles.moduleCard} onClick={() => setActiveView('chat')}>
                                        <MessageSquare size={32} />
                                        <h3>Live Chat</h3>
                                        <p>Manage customer inquiries via text</p>
                                    </div>
                                    <div className={styles.moduleCard} onClick={() => setActiveView('call')}>
                                        <Phone size={32} />
                                        <h3>Call Deck</h3>
                                        <p>Handle inbound voice support signals</p>
                                    </div>
                                    <div className={styles.moduleCard} onClick={() => setActiveView('mail')}>
                                        <Mail size={32} />
                                        <h3>Mail Desk</h3>
                                        <p>Process IMAP inquiries & SMTP replies</p>
                                    </div>
                                    <div className={styles.moduleCard} onClick={() => setActiveView('telecaller')}>
                                        <Briefcase size={32} />
                                        <h3>CRM Leads</h3>
                                        <p>Follow up with advocates & leads</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeView === 'members' && (
                            <div className={styles.scrollableContent}>
                                <MemberTable title="Member Directory" defaultStatus="Active" context="approved" />
                            </div>
                        )}
                        {activeView === 'telecaller' && <TelecallerDashboard />}
                        {(activeView === 'chat' || activeView === 'chat_history' || activeView === 'performance') && (
                            <LiveChatDashboard view={activeView === 'chat' ? 'live' : activeView === 'chat_history' ? 'history' : 'performance'} />
                        )}
                        {activeView === 'call' && <CallSupportDashboard />}
                        {activeView === 'mail' && <MailSupportDashboard />}
                        {activeView === 'profile' && (
                            <div className={styles.profileSection}>
                                <div className={styles.profileHeader}>
                                    <div className={styles.profileAvatarLarge}>{user?.email?.charAt(0).toUpperCase()}</div>
                                    <div className={styles.profileMeta}>
                                        <h2>{user?.name || user?.email}</h2>
                                        <p>{user?.role?.toUpperCase()} • {user?.id}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeView === 'call_history' && <div className={styles.emptyCenter}><h2>Call Logs</h2><p>Viewing historical voice data...</p></div>}
                        {activeView === 'lead_stats' && <div className={styles.emptyCenter}><h2>Lead Stats</h2><p>Conversion metrics loading...</p></div>}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default StaffGlobalDashboard;
