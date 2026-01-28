import React, { useState, useMemo } from 'react';
import styles from './PremiumPersonalAgent.module.css';
import {
    Search, Zap, MoreHorizontal,
    Mail, Calendar, FileText, Ban,
    Settings, ListTodo, CheckSquare, Shield, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportUserTable from '../../../../components/support/SupportUserTable';

export interface SupportUser {
    id: string;
    name: string;
    role: 'advocate' | 'client';
    status: 'online' | 'offline' | 'away';
    lastActivity: string;
    priority: 'High' | 'Medium' | 'Low';
    location: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    degree: string;
    university: string;
    college: string;
    gradYear: string;
    image?: string;
}

const MOCK_USERS: SupportUser[] = [
    {
        id: 'agent-1',
        name: 'John Doe',
        role: 'client',
        status: 'online',
        lastActivity: 'Active now',
        priority: 'High',
        location: 'London, UK',
        email: 'john.d@example.com',
        phone: '+44 20 7946 0958',
        dob: '12/05/1988',
        gender: 'Male',
        degree: 'MA Political Science',
        university: 'Oxford',
        college: 'Balliol',
        gradYear: '2010',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'
    }
];

const PremiumPersonalAgent: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<SupportUser | null>(MOCK_USERS[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter] = useState<'all' | 'advocate' | 'client'>('all');
    const [activeTab, setActiveTab] = useState<'dossier' | 'tasks' | 'notes'>('dossier');
    const [overlayType, setOverlayType] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || u.role === filter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filter]);

    const handleRoleAction = (action: string) => {
        setOverlayType(action.toLowerCase());
    };

    return (
        <div className={styles.dashboardContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.queueHeader}>
                        <div className={styles.queueTitleArea}>
                            <Zap size={18} color="#8b5cf6" />
                            <h3>PERSONAL AGENT OPS</h3>
                        </div>
                        <span className={styles.queueCount}>{filteredUsers.length}</span>
                    </div>

                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Client lookup..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.userList}>
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selectedUser : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className={styles.miniAvatar}>
                                {user.image ? <img src={user.image} alt="" /> : user.name.charAt(0)}
                            </div>
                            <div className={styles.miniInfo}>
                                <div className={styles.miniName}>{user.name}</div>
                                <div className={styles.miniMeta}>{user.role.toUpperCase()} • ACTIVE</div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className={styles.mainPane}>
                {selectedUser ? (
                    <div className={styles.dossier}>
                        <header className={styles.dossierHeader}>
                            <div className={styles.heroSection}>
                                <div className={styles.mainAvatar}>{selectedUser.name.charAt(0)}</div>
                                <div className={styles.heroText}>
                                    <h1>{selectedUser.name}</h1>
                                    <div className={styles.heroBadges}>
                                        <span className={styles.roleBadge}>PREMIUM CLIENT</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.headerUtility}>
                                <button className={styles.utilBtn}><Settings size={18} /></button>
                                <button className={styles.moreBtn}><MoreHorizontal size={20} /></button>
                            </div>
                        </header>

                        <nav className={styles.tabNav}>
                            <button className={activeTab === 'dossier' ? styles.activeTab : ''} onClick={() => setActiveTab('dossier')}>OVERVIEW</button>
                            <button className={activeTab === 'tasks' ? styles.activeTab : ''} onClick={() => setActiveTab('tasks')}>TASK LIST</button>
                        </nav>

                        <div className={styles.scrollArea}>
                            {activeTab === 'dossier' && (
                                <>
                                    <section className={styles.dataSection}>
                                        <div className={styles.sectionTitle}>
                                            <Shield size={16} />
                                            <span>AGENT PROTOCOL DATA</span>
                                        </div>
                                        <div className={styles.dataGrid}>
                                            <div className={styles.dataItem}>
                                                <label>Primary Handle</label>
                                                <p>{selectedUser.name}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Client ID</label>
                                                <p>{selectedUser.id}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Email Contact</label>
                                                <p>{selectedUser.email}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Phone Contact</label>
                                                <p>{selectedUser.phone}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Date of Birth</label>
                                                <p>{selectedUser.dob}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Gender</label>
                                                <p>{selectedUser.gender}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Residence</label>
                                                <p>{selectedUser.location}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Qualification</label>
                                                <p>{selectedUser.degree}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>University</label>
                                                <p>{selectedUser.university}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Graduation</label>
                                                <p>{selectedUser.gradYear}</p>
                                            </div>
                                            <div className={styles.dataItem}>
                                                <label>Priority Status</label>
                                                <p>{selectedUser.priority}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className={styles.dataSection}>
                                        <div className={styles.sectionTitle}>
                                            <ListTodo size={16} />
                                            <span>ACTIVE WORKFLOWS</span>
                                        </div>
                                        <div className={styles.roleWidgetGrid}>
                                            <div className={styles.widgetCard}>
                                                <h4>Daily Briefing</h4>
                                                <span className={styles.miniTag}>PENDING</span>
                                            </div>
                                            <div className={styles.widgetCard}>
                                                <h4>Legal Filing</h4>
                                                <span className={styles.miniTag}>ACTIVE</span>
                                            </div>
                                            <div className={styles.widgetCard}>
                                                <h4>Task AI</h4>
                                                <button className={styles.pulseBtn} onClick={() => handleRoleAction('Optimize')}>Optimize</button>
                                            </div>
                                        </div>
                                    </section>

                                    <div className={styles.tableWrapper}>
                                        <SupportUserTable users={MOCK_USERS} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.roleActionCloud}>
                            <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Draft')}><FileText size={16} /> DRAFT</button>
                            <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Mail')}><Mail size={16} /> MAIL</button>
                            <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Schedule')}><Calendar size={16} /> SCHEDULE</button>
                            <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Verify')}><CheckSquare size={16} /> VERIFY</button>
                            <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Close')}><Ban size={16} /> CLOSE</button>
                        </div>

                        <div className={styles.primaryActionWrapper}>
                            <button
                                className={styles.primaryActionBtn}
                                onClick={() => handleRoleAction('Protocol')}
                            >
                                <Zap size={22} /> ACTIVATE TASK PROTOCOL
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Cpu size={64} className={styles.beaconIcon} />
                        <h2>AGENT ENGINE STANDBY</h2>
                        <p>Select a client to begin personal assistant task management.</p>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {overlayType && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className={styles.overlayContent}>
                            <div className={styles.overlayHeader}>
                                <h2>AGENT PROTOCOL</h2>
                                <button onClick={() => setOverlayType(null)}><Ban size={20} /></button>
                            </div>
                            <div className={styles.overlayBody}>
                                <p>System activating {overlayType} protocol...</p>
                                <div className={styles.loader} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumPersonalAgent;
