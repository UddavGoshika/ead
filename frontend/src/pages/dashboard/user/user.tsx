// ReferralDashboard.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Link as LinkIcon, Wallet, Settings, TrendingUp, CheckCircle, Search,
    Plus, Filter, RefreshCw, ArrowRight, Tag, Download, Bell, LogOut, Shield,
    BarChart3, PieChart, Calendar, MoreVertical, Clock, Menu, X,
    GraduationCap, Briefcase, Network, Building, Heart, Megaphone
} from 'lucide-react';
import styles from './user.module.css';

// ============================================
// TYPES & SCHEMAS
// ============================================

type UserStatus = 'Active' | 'Hold' | 'Blocked';
type ProjectId = 'edverse' | 'career' | 'nexus' | 'civic' | 'health' | 'advocate';

interface ReferralUser {
    id: string;
    name: string;
    email: string;
    totalRefs: number;
    level1Refs: number;
    level2Refs: number;
    earned: number;
    paid: number;
    pending: number;
    walletBalance: number;
    joinDate: string;
    status: UserStatus;
    project: ProjectId;
    referralCode: string;
    phone: string;
    lastActive: string;
    referredBy: string;
}

// Transaction logic is handled locally in views

interface ProjectData {
    id: ProjectId;
    name: string;
    icon: React.ElementType;
    color: string;
    stats: {
        totalUsers: number;
        activeReferrers: number;
        totalEarnings: number;
        projectRevenue: number;
        pendingWithdrawals: number;
    };
}

// ============================================
// SAMPLE DATA GENERATORS
// ============================================

const generateSampleUsers = (count: number, project: ProjectId): ReferralUser[] => {
    return Array.from({ length: count }, (_, i) => {
        const id = `USR-${project.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`;
        const level1 = Math.floor(Math.random() * 20);
        const level2 = Math.floor(Math.random() * 30);
        const earned = (level1 * 50) + (level2 * 25) + (Math.random() * 1000);
        return {
            id,
            name: `User ${i + 1}`,
            email: `user${i + 1}@tatito.io`,
            totalRefs: level1 + level2,
            level1Refs: level1,
            level2Refs: level2,
            earned,
            paid: earned * 0.7,
            pending: earned * 0.3,
            walletBalance: earned * 0.1,
            joinDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
            status: Math.random() > 0.1 ? 'Active' : 'Hold',
            project,
            referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            phone: `+1 ${Math.floor(Math.random() * 900000000) + 100000000}`,
            lastActive: new Date().toISOString(),
            referredBy: 'ADMIN'
        };
    });
};

const PROJECTS: ProjectData[] = [
    { id: 'edverse', name: 'Tatito Edverse', icon: GraduationCap, color: '#3b82f6', stats: { totalUsers: 12543, activeReferrers: 3245, totalEarnings: 452890, projectRevenue: 1250000, pendingWithdrawals: 45230 } },
    { id: 'career', name: 'Tatito Career Hub', icon: Briefcase, color: '#10b981', stats: { totalUsers: 8921, activeReferrers: 2345, totalEarnings: 321450, projectRevenue: 890000, pendingWithdrawals: 32100 } },
    { id: 'nexus', name: 'Tatito Nexus', icon: Network, color: '#8b5cf6', stats: { totalUsers: 15678, activeReferrers: 4567, totalEarnings: 678900, projectRevenue: 1850000, pendingWithdrawals: 67890 } },
    { id: 'civic', name: 'Tatito Civic One', icon: Building, color: '#f59e0b', stats: { totalUsers: 5678, activeReferrers: 1234, totalEarnings: 234567, projectRevenue: 650000, pendingWithdrawals: 23456 } },
    { id: 'health', name: 'E-Advocate Services', icon: Heart, color: '#ef4444', stats: { totalUsers: 7890, activeReferrers: 2345, totalEarnings: 345678, projectRevenue: 950000, pendingWithdrawals: 34567 } },
    { id: 'advocate', name: 'Tatito E-Advocate', icon: Megaphone, color: '#ec4899', stats: { totalUsers: 4567, activeReferrers: 1234, totalEarnings: 234567, projectRevenue: 550000, pendingWithdrawals: 23456 } },
];

// ============================================
// MAIN ENTERPRISE DASHBOARD
// ============================================

const EnterpriseDashboard: React.FC = () => {
    // Phase 1: Core Navigation & Project State
    const [activeProject, setActiveProject] = useState<ProjectId>('edverse');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'wallet' | 'transactions' | 'settings'>('overview');

    // Phase 2: User Management State
    const [users] = useState<Record<ProjectId, ReferralUser[]>>({
        edverse: generateSampleUsers(15, 'edverse'),
        career: generateSampleUsers(10, 'career'),
        nexus: generateSampleUsers(12, 'nexus'),
        civic: generateSampleUsers(8, 'civic'),
        health: generateSampleUsers(14, 'health'),
        advocate: generateSampleUsers(9, 'advocate'),
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Phase 3: Detail Views (Drawer/Modal)
    const [selectedUser, setSelectedUser] = useState<ReferralUser | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'promo' | 'withdrawal' | 'block'>('promo');

    // ============================================
    // LOGIC & FILTERING
    // ============================================

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentProjectData = useMemo(() => PROJECTS.find(p => p.id === activeProject)!, [activeProject]);

    const filteredUsers = useMemo(() => {
        return users[activeProject].filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [activeProject, users, searchTerm, statusFilter]);

    const handleAction = useCallback((type: 'view' | 'block' | 'promo', user: ReferralUser) => {
        setSelectedUser(user);
        if (type === 'view') setDrawerOpen(true);
        else {
            setModalType(type as any);
            setModalOpen(true);
        }
    }, []);

    // ============================================
    // RENDER HELPERS
    // ============================================

    const StatCard = ({ label, value, trend, icon: Icon }: any) => (
        <div className={styles.statCard}>
            <div className={styles.statInfo}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{value}</span>
                {trend && (
                    <span className={styles.statTrend}>
                        <TrendingUp size={14} /> {trend}%
                    </span>
                )}
            </div>
            <div className={styles.statIconWrapper}>
                <Icon size={24} className={styles.statIcon} />
            </div>
        </div>
    );

    // ============================================
    // MAIN LAYOUT
    // ============================================

    return (
        <div className={styles.enterpriseContainer}>
            {/* SIDEBAR */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarBrand}>
                        <div className={styles.brandLogo}>T</div>
                        <span className={styles.brandName}>TATITO</span>
                    </div>
                </div>

                <div className={styles.sidebarSection}>
                    <p className={styles.sectionTitle}>PROJECTS</p>
                    <nav className={styles.projectNav}>
                        {PROJECTS.map(project => (
                            <button
                                key={project.id}
                                className={`${styles.projectItem} ${activeProject === project.id ? styles.projectItemActive : ''}`}
                                onClick={() => setActiveProject(project.id)}
                            >
                                <project.icon size={18} />
                                <span>{project.name.split(' ')[1] || project.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className={styles.sidebarSection}>
                    <p className={styles.sectionTitle}>WORKSPACE</p>
                    <nav className={styles.mainNav}>
                        <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.navActive : ''}`} onClick={() => setActiveTab('overview')}>
                            <BarChart3 size={18} /> Overview
                        </button>
                        <button className={`${styles.navItem} ${activeTab === 'users' ? styles.navActive : ''}`} onClick={() => setActiveTab('users')}>
                            <Users size={18} /> Users
                        </button>
                        <button className={`${styles.navItem} ${activeTab === 'wallet' ? styles.navActive : ''}`} onClick={() => setActiveTab('wallet')}>
                            <Wallet size={18} /> Financials
                        </button>
                        <button className={`${styles.navItem} ${activeTab === 'transactions' ? styles.navActive : ''}`} onClick={() => setActiveTab('transactions')}>
                            <LinkIcon size={18} /> Chains
                        </button>
                        <button className={`${styles.navItem} ${activeTab === 'settings' ? styles.navActive : ''}`} onClick={() => setActiveTab('settings')}>
                            <Settings size={18} /> Settings
                        </button>
                    </nav>
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userBrief}>
                        <div className={styles.userAvatar}>A</div>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>Root Admin</p>
                            <p className={styles.userRole}>Super User</p>
                        </div>
                        <button className={styles.logoutBtn}><LogOut size={16} /></button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={styles.viewport}>
                {/* TOP NAVBAR */}
                <header className={styles.navbar}>
                    <div className={styles.navStart}>
                        <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu size={20} />
                        </button>
                        <div className={styles.searchBar}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by ID, Name, Email, Referral Code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.navEnd}>
                        <div className={styles.filterGroup}>
                            <select className={styles.navSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Hold">Hold</option>
                                <option value="Blocked">Blocked</option>
                            </select>
                        </div>
                        <button className={styles.navIconBtn}><Bell size={20} /><span className={styles.badge} /></button>
                        <button className={styles.navActionBtn}><Download size={16} /> Export</button>
                        <button className={`${styles.navActionBtn} ${styles.btnPrimary}`}><Plus size={16} /> Add Referral</button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProject + activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.pageContent}
                    >
                        {/* PAGE HEADER */}
                        <div className={styles.pageHeader}>
                            <div className={styles.headerTitle}>
                                <h1>{currentProjectData.name} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                                <p>Manage institutional referral workflows and real-time commission data</p>
                            </div>
                            <div className={styles.headerMeta}>
                                <div className={styles.metaItem}><Shield size={14} /> System Verified</div>
                                <div className={styles.metaItem}><Calendar size={14} /> Jan 21, 2026</div>
                            </div>
                        </div>

                        {activeTab === 'overview' && (
                            <div className={styles.dashboardGrid}>
                                <StatCard label="Total Users" value={currentProjectData.stats.totalUsers.toLocaleString()} trend="12.4" icon={Users} />
                                <StatCard label="Active Referrers" value={currentProjectData.stats.activeReferrers.toLocaleString()} trend="8.2" icon={TrendingUp} />
                                <StatCard label="Total Earnings" value={`$${currentProjectData.stats.totalEarnings.toLocaleString()}`} trend="15.1" icon={DollarSign} />
                                <StatCard label="Project Revenue" value={`$${currentProjectData.stats.projectRevenue.toLocaleString()}`} trend="21.5" icon={BarChart3} />

                                <div className={styles.mainCharCard}>
                                    <div className={styles.cardHeader}>
                                        <h3>Referral Growth Velocity</h3>
                                        <div className={styles.headerActions}>
                                            <button className={styles.cardBtn}>Daily</button>
                                            <button className={`${styles.cardBtn} ${styles.cardBtnActive}`}>Monthly</button>
                                        </div>
                                    </div>
                                    <div className={styles.chartPlaceholder}>
                                        <div className={styles.skeletonPulse} />
                                    </div>
                                </div>

                                <div className={styles.sideCard}>
                                    <h3>Top Project Referrers</h3>
                                    <div className={styles.leaderboard}>
                                        {users[activeProject].slice(0, 5).map((u, i) => (
                                            <div key={u.id} className={styles.leaderItem}>
                                                <div className={styles.rank}>{i + 1}</div>
                                                <div className={styles.leaderInfo}>
                                                    <p className={styles.leaderName}>{u.name}</p>
                                                    <p className={styles.leaderSubs}>{u.totalRefs} sub-referrals</p>
                                                </div>
                                                <div className={styles.leaderValue}>${u.earned.toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className={styles.tableCard}>
                                <div className={styles.tableHeader}>
                                    <h3>Institutional User Directory</h3>
                                    <div className={styles.headerTools}>
                                        <button className={styles.iconBtn}><Filter size={16} /></button>
                                        <button className={styles.iconBtn}><RefreshCw size={16} /></button>
                                    </div>
                                </div>
                                <div className={styles.tableWrapper}>
                                    <table className={styles.enterpriseTable}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>User Identifier</th>
                                                <th>Identification</th>
                                                <th>Network Size</th>
                                                <th>Financials</th>
                                                <th>Ledger Status</th>
                                                <th>Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((u, i) => (
                                                <tr key={u.id}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        <div className={styles.userIdPill}>{u.id}</div>
                                                        <div className={styles.refCode}>{u.referralCode}</div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.userNameBlock}>
                                                            <p className={styles.uName}>{u.name}</p>
                                                            <p className={styles.uEmail}>{u.email}</p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.networkStats}>
                                                            <span>L1: <strong>{u.level1Refs}</strong></span>
                                                            <span>L2: <strong>{u.level2Refs}</strong></span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.financialBlock}>
                                                            <p className={styles.fTotal}>Earned: <strong>${u.earned.toFixed(0)}</strong></p>
                                                            <p className={styles.fPending}>Wallet: <span>${u.walletBalance.toFixed(0)}</span></p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={`${styles.statusBadge} ${styles['status' + u.status]}`}>
                                                            {u.status}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.actionRow}>
                                                            <button className={styles.actionBtn} onClick={() => handleAction('view', u)} title="View Chain"><LinkIcon size={14} /></button>
                                                            <button className={styles.actionBtn} onClick={() => handleAction('promo', u)} title="Assign Promo"><Tag size={14} /></button>
                                                            <button className={styles.actionBtn} onClick={() => handleAction('block', u)} title="Admin Actions"><MoreVertical size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'wallet' && (
                            <div className={styles.financialView}>
                                <div className={styles.dashboardGrid}>
                                    <StatCard label="Available Payouts" value="$128,450" trend="12" icon={Wallet} />
                                    <StatCard label="Pending Requests" value="45 Requests" icon={Clock} />
                                    <StatCard label="Processed (MTD)" value="$325,000" icon={CheckCircle} />
                                    <StatCard label="Revenue Share" value="12.5%" icon={PieChart} />
                                </div>

                                <div className={styles.tableCard} style={{ marginTop: '24px' }}>
                                    <div className={styles.tableHeader}>
                                        <h3>Active Withdrawal Ledger</h3>
                                        <button className={`${styles.btn} ${styles.btnPrimary}`}>Reconcile Payouts</button>
                                    </div>
                                    <table className={styles.enterpriseTable}>
                                        <thead>
                                            <tr>
                                                <th>Reference</th>
                                                <th>Affiliate</th>
                                                <th>Amount</th>
                                                <th>Method</th>
                                                <th>Verification</th>
                                                <th>Decision</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3].map(i => (
                                                <tr key={i}>
                                                    <td><div className={styles.userIdPill}>PAY-#{1000 + i}</div></td>
                                                    <td>
                                                        <p className={styles.uName}>Affiliate User {i}</p>
                                                        <p className={styles.uEmail}>affiliate{i}@tatito.io</p>
                                                    </td>
                                                    <td style={{ fontWeight: 700 }}>${(500 * i).toLocaleString()}</td>
                                                    <td>Bank Transfer</td>
                                                    <td><span className={styles.statusActive} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Identity Verified</span></td>
                                                    <td>
                                                        <div className={styles.actionRow}>
                                                            <button className={styles.btnActionSuccess}>Approve</button>
                                                            <button className={styles.btnActionDanger}>Reject</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className={styles.chainView}>
                                <div className={styles.infoBox} style={{ marginBottom: '24px' }}>
                                    <h3>Immutable Referral Protocol</h3>
                                    <p>The Tatito protocol ensures multi-level reward distribution. All chains visualized below represent the 5% / 2.5% split as per institutional logic.</p>
                                </div>

                                <div className={styles.chainGrid}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={styles.chainCard}>
                                            <div className={styles.chainHeader}>
                                                <span className={styles.chainId}>CHAIN-#{i}0445</span>
                                                <span className={styles.statusActive} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Active</span>
                                            </div>
                                            <div className={styles.chainFlow}>
                                                <div className={styles.node}>
                                                    <div className={styles.nodeCircle}>R</div>
                                                    <p>Root Referrer</p>
                                                    <small>Level 0</small>
                                                </div>
                                                <ArrowRight size={16} />
                                                <div className={styles.node}>
                                                    <div className={styles.nodeCircle}>A</div>
                                                    <p>Direct Affiliate</p>
                                                    <small>Level 1 (5%)</small>
                                                </div>
                                                <ArrowRight size={16} />
                                                <div className={styles.node}>
                                                    <div className={styles.nodeCircle}>U</div>
                                                    <p>End User</p>
                                                    <small>Level 2 (2.5%)</small>
                                                </div>
                                            </div>
                                            <div className={styles.chainMeta}>
                                                <p>Total Revenue generated: <strong>$12,450.00</strong></p>
                                                <button className={styles.btnText}>View Detail Ledger</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* SLIDE-OUT DRAWER (DETAILED USER INTELLIGENCE) */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={styles.overlay}
                            onClick={() => setDrawerOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={styles.drawer}
                        >
                            <div className={styles.drawerHeader}>
                                <h2>Referral Intelligence</h2>
                                <button className={styles.closeBtn} onClick={() => setDrawerOpen(false)}><X size={24} /></button>
                            </div>

                            {selectedUser && (
                                <div className={styles.drawerContent}>
                                    <div className={styles.profileSection}>
                                        <div className={styles.hugeAvatar}>{selectedUser.name.charAt(0)}</div>
                                        <div className={styles.profileInfo}>
                                            <h3>{selectedUser.name}</h3>
                                            <p>{selectedUser.email}</p>
                                            <div className={styles.idBadge}>{selectedUser.id}</div>
                                        </div>
                                    </div>

                                    <div className={styles.drawerTabs}>
                                        <button className={styles.dTabActive}>Referral Tree</button>
                                        <button>Wallet</button>
                                        <button>Transactions</button>
                                    </div>

                                    <div className={styles.treeVisualization}>
                                        <div className={styles.treeNodes}>
                                            {/* SIMULATED TREE */}
                                            <div className={styles.rootNode}>{selectedUser.name} (L0)</div>
                                            <div className={styles.connector} />
                                            <div className={styles.childrenRow}>
                                                <div className={styles.childNode}>Level 1 ({selectedUser.level1Refs})</div>
                                                <div className={styles.childNode}>Level 2 ({selectedUser.level2Refs})</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoBox}>
                                            <span>Current Project</span>
                                            <p>{PROJECTS.find(p => p.id === selectedUser.project)?.name}</p>
                                        </div>
                                        <div className={styles.infoBox}>
                                            <span>Joined</span>
                                            <p>{selectedUser.joinDate}</p>
                                        </div>
                                        <div className={styles.infoBox}>
                                            <span>Referral Code</span>
                                            <p className={styles.mono}>{selectedUser.referralCode}</p>
                                        </div>
                                        <div className={styles.infoBox}>
                                            <span>Phone</span>
                                            <p>{selectedUser.phone}</p>
                                        </div>
                                    </div>

                                    <div className={styles.drawerActions}>
                                        <button className={`${styles.btn} ${styles.btnPrimary}`}>Process Payout</button>
                                        <button className={`${styles.btn} ${styles.btnSecondary}`}>Security Analytics</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* MODALS */}
            <AnimatePresence>
                {modalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={styles.modal}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3>{modalType === 'promo' ? 'Assign Promo Code' : modalType === 'withdrawal' ? 'Process Withdrawal' : 'Security Action'}</h3>
                                <button onClick={() => setModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className={styles.modalBody}>
                                {modalType === 'promo' && (
                                    <div className={styles.modalForm}>
                                        <label>Select Promo Code for {selectedUser?.name}</label>
                                        <select>
                                            <option>TATITO-ED-20 (20% Off)</option>
                                            <option>WELCOME-HUB-10 (10% Off)</option>
                                            <option>NEXUS-VIP-SPECIAL</option>
                                        </select>
                                        <p className={styles.helpText}>Assigning a code will link all subsequent purchases from this user to the referral ledger.</p>
                                    </div>
                                )}
                                {modalType === 'block' && (
                                    <div className={styles.warningBox}>
                                        <p>Warning: Blocking this user will pause all active referral commissions and freeze their wallet balance. This action will be logged in the system audit.</p>
                                    </div>
                                )}
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={styles.btnSecondary} onClick={() => setModalOpen(false)}>Cancel</button>
                                <button className={`${styles.btn} ${modalType === 'block' ? styles.btnDanger : styles.btnPrimary}`}>Confirm Action</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================
// STYLES (HELPER)
// ============================================

const DollarSign = ({ size, className }: any) => <TrendingUp size={size} className={className} />;

export default EnterpriseDashboard;
