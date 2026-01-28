import React, { useState, useMemo } from 'react';
import styles from './SupportDashboardLayout.module.css';
import {
    Search, Shield, Target, Activity,
    MessageSquare, Phone, ArrowLeft,
    Clock, Cpu, UserCheck, MoreHorizontal,
    Mail, PhoneCall, Calendar, MapPin, GraduationCap, School, Zap,
    FileText, Upload, Star, Lock, History, List, CreditCard,
    ShieldAlert, Download, Share2,
    UserPlus, PlusCircle, Ban, Timer, Printer, Crown, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MultiOptionChat from '../../../../components/support/MultiOptionChat';
import SupportCallUI from '../../../../components/support/SupportCallUI';
import SupportMixedUI from '../../../../components/support/SupportMixedUI';
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
        id: 'demo-1',
        name: 'Adv. Rajesh Kumar (Demo)',
        role: 'advocate',
        status: 'online',
        lastActivity: 'Active now',
        priority: 'High',
        location: 'New Delhi, Delhi',
        email: 'rajesh.demo@example.com',
        phone: '+91 98765 43210',
        dob: '15/06/1985',
        gender: 'Male',
        degree: 'LLB',
        university: 'Delhi University',
        college: 'Faculty of Law',
        gradYear: '2010',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200'
    },
    {
        id: 'demo-2',
        name: 'Sarah Williams (Demo)',
        role: 'client',
        status: 'away',
        lastActivity: '2m ago',
        priority: 'Medium',
        location: 'Mumbai, Maharashtra',
        email: 'sarah.w@example.com',
        phone: '+91 91234 56789',
        dob: '22/11/1992',
        gender: 'Female',
        degree: 'MBA',
        university: 'IIM Bangalore',
        college: 'Main Campus',
        gradYear: '2015'
    },
    {
        id: 'demo-3',
        name: 'Dr. Amit Patel (Demo)',
        role: 'advocate',
        status: 'offline',
        lastActivity: '1h ago',
        priority: 'Low',
        location: 'Bangalore, Karnataka',
        email: 'amit.p@example.com',
        phone: '+91 99876 54321',
        dob: '05/03/1980',
        gender: 'Male',
        degree: 'PhD Law',
        university: 'NLSIU',
        college: 'Main Campus',
        gradYear: '2005',
        image: 'https://images.unsplash.com/photo-1556155099-870a7662039?auto=format&fit=crop&q=80&w=200&h=200'
    },
    {
        id: 'demo-4',
        name: 'Priya Sharma (Demo)',
        role: 'client',
        status: 'online',
        lastActivity: '5m ago',
        priority: 'High',
        location: 'Chennai, Tamil Nadu',
        email: 'priya.s@example.com',
        phone: '+91 87654 32109',
        dob: '10/08/1990',
        gender: 'Female',
        degree: 'BTech',
        university: 'IIT Madras',
        college: 'Engineering Dept',
        gradYear: '2012'
    }
];

interface SupportDashboardLayoutProps {
    role: 'call' | 'chat' | 'live' | 'assistant';
    title: string;
    actions?: React.ReactNode;
    specificWidgets?: React.ReactNode;
    dashboardStyles?: any;
}

const SupportDashboardLayout: React.FC<SupportDashboardLayoutProps> = ({
    role,
    title,
    actions,
    specificWidgets,
    dashboardStyles = {}
}) => {
    const [selectedUser, setSelectedUser] = useState<SupportUser | null>(MOCK_USERS[0]);
    const [activeInteraction, setActiveInteraction] = useState<'chat' | 'call' | 'mixed' | 'help' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'advocate' | 'client'>('all');
    const [membersHandled, setMembersHandled] = useState(0);
    const [activeTab, setActiveTab] = useState<'dossier' | 'timeline' | 'history' | 'files' | 'subscription' | 'notes'>('dossier');
    const [isVIP, setIsVIP] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [notes, setNotes] = useState<string>('');
    const [overlayType, setOverlayType] = useState<string | null>(null);
    const [isRecording] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [isArchiveMode] = useState(false);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || u.role === filter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filter]);

    const handleSchedule = () => setOverlayType('schedule');
    const handleNotes = () => setOverlayType('notes');
    const handleUpload = () => setOverlayType('upload');
    const handleEscalate = () => setOverlayType('escalate');
    const handlePrint = () => setOverlayType('print');
    const handleShare = () => setOverlayType('share');

    const handleSaveNotes = () => {
        setOverlayType(null);
    };

    const handleGlobalAction = (action: string) => {
        if (action === 'Block') {
            setOverlayType('block');
            return;
        }
        if (action === 'Export') {
            setOverlayType('export');
            return;
        }
        if (action === 'Archive') {
            setOverlayType('archive');
            return;
        }
        setOverlayType(action.toLowerCase());
    };

    return (
        <div className={`${styles.dashboardContainer} ${isRecording ? styles.recordingActive : ''} ${isOnHold ? styles.holdActive : ''} ${dashboardStyles.container || ''}`}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.queueHeader}>
                        <div className={styles.queueTitleArea}>
                            <Crown size={18} color="#ef4444" />
                            <h3>{title}</h3>
                        </div>
                        <span className={styles.queueCount}>{filteredUsers.length}</span>
                    </div>

                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Scan by identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterBar}>
                        {['all', 'advocate', 'client'].map((f) => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                                onClick={() => setFilter(f as any)}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.reportCard}>
                    <div className={styles.reportStat}>
                        <Zap size={14} color="#3b82f6" />
                        <span>HANDLED TODAY: {membersHandled}</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((membersHandled / 20) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className={styles.userList}>
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`${styles.userLink} ${selectedUser?.id === user.id ? styles.activeUserLink : ''}`}
                            onClick={() => {
                                setSelectedUser(user);
                                setActiveInteraction(null);
                            }}
                        >
                            <div className={styles.miniAvatar}>
                                {user.image ? <img src={user.image} alt="" /> : user.name.charAt(0)}
                            </div>
                            <div className={styles.miniInfo}>
                                <div className={styles.miniName}>{user.name}</div>
                                <div className={styles.miniMeta}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.lastActivity}</div>
                            </div>
                            <ArrowLeft size={14} className={styles.arrowIndicator} style={{ transform: 'rotate(180deg)' }} />
                        </div>
                    ))}
                </div>
            </aside>

            <main className={styles.mainPane}>
                <AnimatePresence mode="wait">
                    {activeInteraction && selectedUser ? (
                        <motion.div
                            key="interaction"
                            className={styles.interactionOverlay}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {activeInteraction === 'chat' && (
                                <MultiOptionChat
                                    user={selectedUser}
                                    onClose={() => setActiveInteraction(null)}
                                    onComplete={() => {
                                        setMembersHandled(prev => prev + 1);
                                        setActiveInteraction(null);
                                    }}
                                />
                            )}
                            {activeInteraction === 'call' && (
                                <SupportCallUI
                                    user={selectedUser}
                                    onClose={() => setActiveInteraction(null)}
                                    onComplete={() => {
                                        setMembersHandled(prev => prev + 1);
                                        setActiveInteraction(null);
                                    }}
                                    isOnHold={isOnHold}
                                    onHoldToggle={() => setIsOnHold(!isOnHold)}
                                />
                            )}
                            {activeInteraction === 'mixed' && (
                                <SupportMixedUI
                                    user={selectedUser}
                                    onClose={() => setActiveInteraction(null)}
                                    onComplete={() => {
                                        setMembersHandled(prev => prev + 1);
                                        setActiveInteraction(null);
                                    }}
                                    messages={[]}
                                    onSendMessage={() => { }}
                                />
                            )}
                            {activeInteraction === 'help' && (
                                <div className={styles.helpDoc}>
                                    <div className={styles.terminal}>
                                        <div className={styles.terminalHeader}>System Help</div>
                                        <div className={styles.terminalContent}>
                                            <p>Accessing higher authority reporting channels...</p>
                                            <p>Report queued for end-of-day transmission.</p>
                                            <button onClick={() => setActiveInteraction(null)}>RETURN</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : selectedUser ? (
                        <motion.div
                            key="dossier"
                            className={styles.dossier}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <header className={styles.dossierHeader}>
                                <div className={styles.heroSection}>
                                    <div className={styles.profileImgWrapper}>
                                        {selectedUser.image ? (
                                            <img src={selectedUser.image} alt={selectedUser.name} className={styles.mainAvatar} />
                                        ) : (
                                            <div className={styles.mainAvatar}>{selectedUser.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className={styles.heroText}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <h1>{selectedUser.name}</h1>
                                            {isArchiveMode && <span className={styles.archivedBadge}>ARCHIVED</span>}
                                        </div>
                                        <div className={styles.heroBadges}>
                                            <span className={styles.roleBadge}>{selectedUser.role.toUpperCase()}</span>
                                            <span className={styles.idBadge}>ID: {selectedUser.id}</span>
                                            {isVIP && <span className={styles.vipBadge}><Star size={10} fill="#fbbf24" /> VIP MEMBER</span>}
                                            {isLocked && <span className={styles.lockBadge}><Lock size={10} /> SESSION LOCKED</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.headerUtility}>
                                    <button className={styles.utilBtn} title="Schedule Session" onClick={handleSchedule}><Calendar size={18} /></button>
                                    <button className={styles.utilBtn} title="Session Notes" onClick={handleNotes}><FileText size={18} /></button>
                                    <button className={styles.utilBtn} title="Upload File" onClick={handleUpload}><Upload size={18} /></button>
                                    <button
                                        className={`${styles.utilBtn} ${isVIP ? styles.utilActive : ''}`}
                                        onClick={() => setIsVIP(!isVIP)}
                                        title="Mark VIP"
                                    >
                                        <Star size={18} fill={isVIP ? "#fbbf24" : "none"} />
                                    </button>
                                    <button className={styles.utilBtn} title="Escalate" style={{ color: '#ef4444' }} onClick={handleEscalate}><ShieldAlert size={18} /></button>
                                    <button
                                        className={`${styles.utilBtn} ${isLocked ? styles.utilActive : ''}`}
                                        onClick={() => setIsLocked(!isLocked)}
                                        title="Lock Session"
                                    >
                                        <Lock size={18} />
                                    </button>
                                    <button className={styles.utilBtn} title="Print Dossier" onClick={handlePrint}><Printer size={18} /></button>
                                    <button className={styles.utilBtn} title="Share Profile" onClick={handleShare}><Share2 size={18} /></button>
                                    <button className={styles.moreBtn}><MoreHorizontal size={20} /></button>
                                </div>
                            </header>

                            <nav className={styles.tabNav}>
                                <button className={activeTab === 'dossier' ? styles.activeTab : ''} onClick={() => setActiveTab('dossier')}><List size={14} /> DOSSIER</button>
                                <button className={activeTab === 'timeline' ? styles.activeTab : ''} onClick={() => setActiveTab('timeline')}><Timer size={14} /> TIMELINE</button>
                                <button className={activeTab === 'history' ? styles.activeTab : ''} onClick={() => setActiveTab('history')}><History size={14} /> HISTORY</button>
                                <button className={activeTab === 'files' ? styles.activeTab : ''} onClick={() => setActiveTab('files')}><Upload size={14} /> FILES</button>
                                <button className={activeTab === 'subscription' ? styles.activeTab : ''} onClick={() => setActiveTab('subscription')}><CreditCard size={14} /> SUBSCRIPTION</button>
                                <button className={activeTab === 'notes' ? styles.activeTab : ''} onClick={() => setActiveTab('notes')}><FileText size={14} /> NOTES</button>
                            </nav>

                            <div className={styles.scrollArea}>
                                {activeTab === 'dossier' && (
                                    <>
                                        <section className={styles.dataSection}>
                                            <div className={styles.sectionTitle}>
                                                <Search size={16} />
                                                <span>BASIC & CONTACT REGISTRATION INFO</span>
                                            </div>
                                            <div className={styles.dataGrid}>
                                                <div className={styles.dataItem}>
                                                    <label><UserCheck size={14} /> Full Name</label>
                                                    <p>{selectedUser.name}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><Mail size={14} /> Email Address</label>
                                                    <p>{selectedUser.email}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><PhoneCall size={14} /> Phone Number</label>
                                                    <p>{selectedUser.phone}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><Activity size={14} /> Gender</label>
                                                    <p>{selectedUser.gender}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><Calendar size={14} /> Date of Birth</label>
                                                    <p>{selectedUser.dob}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><MapPin size={14} /> Location</label>
                                                    <p>{selectedUser.location}</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section className={styles.dataSection}>
                                            <div className={styles.sectionTitle}>
                                                <GraduationCap size={16} />
                                                <span>EDUCATION & CERTIFICATION</span>
                                            </div>
                                            <div className={styles.dataGrid}>
                                                <div className={styles.dataItem}>
                                                    <label><GraduationCap size={14} /> Degree</label>
                                                    <p>{selectedUser.degree}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><School size={14} /> University</label>
                                                    <p>{selectedUser.university}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><Shield size={14} /> College/Institution</label>
                                                    <p>{selectedUser.college}</p>
                                                </div>
                                                <div className={styles.dataItem}>
                                                    <label><Clock size={14} /> Graduation Year</label>
                                                    <p>{selectedUser.gradYear}</p>
                                                </div>
                                            </div>
                                        </section>

                                        {specificWidgets}

                                        <SupportUserTable users={MOCK_USERS} />
                                    </>
                                )}

                                {activeTab === 'timeline' && (
                                    <div className={styles.timelineView}>
                                        <div className={styles.sectionTitle}>
                                            <Timer size={16} />
                                            <span>CLIENT INTERACTION TIMELINE</span>
                                        </div>
                                        <div className={styles.timelineList}>
                                            <div className={styles.timelineItem}>
                                                <div className={styles.timePoint} style={{ background: '#3b82f6' }} />
                                                <span className={styles.timeStamp}>Today, 10:45 AM</span>
                                                <p><strong>DOCUMENT UPLOAD:</strong> Case document #4812 uploaded via Mobile App. Metadata verified.</p>
                                                <div className={styles.timelineMeta}>Node: AP-SOUTH-1 • Device: iOS 17.4</div>
                                            </div>
                                            <div className={styles.timelineItem}>
                                                <div className={styles.timePoint} style={{ background: '#10b981' }} />
                                                <span className={styles.timeStamp}>Yesterday, 04:20 PM</span>
                                                <p><strong>SESSION COMPLETED:</strong> Successful Chat Support session (ID: 082A) with resolution of billing query.</p>
                                                <div className={styles.timelineMeta}>Duration: 14m 22s • Agent: Sarah M.</div>
                                            </div>
                                            <div className={styles.timelineItem}>
                                                <div className={styles.timePoint} style={{ background: '#f59e0b' }} />
                                                <span className={styles.timeStamp}>2 days ago, 09:15 AM</span>
                                                <p><strong>INBOUND CONTACT:</strong> Call initiated for query resolution regarding contract validation.</p>
                                                <div className={styles.timelineMeta}>Status: Resolved • Category: Legal Admin</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className={styles.historyView}>
                                        <div className={styles.sectionTitle}>
                                            <History size={16} />
                                            <span>SUPPORT HISTORY ARCHIVE</span>
                                        </div>
                                        <div className={styles.historyList}>
                                            <div className={styles.historyItem}>
                                                <div className={styles.historyHeader}>
                                                    <MessageSquare size={14} /> <span>Chat - Jan 25, 2026</span>
                                                    <span className={styles.statusLabel}>RESOLVED</span>
                                                </div>
                                                <p>User experienced login loops on the premium dashboard. Reset security tokens and performed identity handshake.</p>
                                            </div>
                                            <div className={styles.historyItem}>
                                                <div className={styles.historyHeader}>
                                                    <Phone size={14} /> <span>Call - Jan 20, 2026</span>
                                                    <span className={styles.statusLabel}>TRANSFERRED</span>
                                                </div>
                                                <p>Subscription upgrade request from Gold to Platinum. Transferred to Finance node for fulfillment.</p>
                                            </div>
                                            <div className={styles.historyItem}>
                                                <div className={styles.historyHeader}>
                                                    <Zap size={14} /> <span>Mixed - Jan 15, 2026</span>
                                                    <span className={styles.statusLabel}>RESOLVED</span>
                                                </div>
                                                <p>Aided in batch document verification for advocate onboarding. Verified 12 high-priority certificates.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'files' && (
                                    <div className={styles.filesView}>
                                        <div className={styles.sectionTitle}>
                                            <Upload size={16} />
                                            <span>SECURE VAULT / UPLOADED DOSSIERS</span>
                                        </div>
                                        <div className={styles.fileList}>
                                            <div className={styles.fileItem}>
                                                <div className={styles.fileIcon}><FileText size={20} color="#3b82f6" /></div>
                                                <div className={styles.fileInfo}>
                                                    <span>advocate_contract_main.pdf</span>
                                                    <p>4.2 MB • Digital Signature Verified</p>
                                                </div>
                                                <button className={styles.fileAction} onClick={() => handleGlobalAction('Download')}><Download size={16} /></button>
                                            </div>
                                            <div className={styles.fileItem}>
                                                <div className={styles.fileIcon}><ImageIcon size={20} color="#10b981" /></div>
                                                <div className={styles.fileInfo}>
                                                    <span>identity_proof_front.jpg</span>
                                                    <p>1.8 MB • OCR Confidence: 98%</p>
                                                </div>
                                                <button className={styles.fileAction} onClick={() => handleGlobalAction('Download')}><Download size={16} /></button>
                                            </div>
                                            <div className={styles.fileItem}>
                                                <div className={styles.fileIcon}><FileText size={20} color="#f59e0b" /></div>
                                                <div className={styles.fileInfo}>
                                                    <span>annual_report_2025.docx</span>
                                                    <p>1.1 MB • Read-Only</p>
                                                </div>
                                                <button className={styles.fileAction} onClick={() => handleGlobalAction('Download')}><Download size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'subscription' && (
                                    <div className={styles.billingView}>
                                        <div className={styles.packageCard}>
                                            <div className={styles.packHeader}>
                                                <div className={styles.crownBox}><Crown size={24} color="#fbbf24" /></div>
                                                <div>
                                                    <h3>PLATINUM ADVOCATE PRE-PAID</h3>
                                                    <span>NETWORK TOKEN: SH-9021-X</span>
                                                </div>
                                                <div className={styles.renewalBadge}>RENEWS IN 12 DAYS</div>
                                            </div>
                                            <div className={styles.packGrid}>
                                                <div className={styles.statBox}><h4>Bill Cycle</h4><p>Monthly Archival</p></div>
                                                <div className={styles.statBox}><h4>Next Recurring</h4><p>₹12,500.00</p></div>
                                                <div className={styles.statBox}><h4>Status</h4><p style={{ color: '#10b981' }}>AUTHENTICATED</p></div>
                                            </div>
                                        </div>
                                        <div className={styles.addOnsSection}>
                                            <div className={styles.sectionTitle}>
                                                <PlusCircle size={16} />
                                                <span>AVAILABLE PREMIUM ADD-ONS</span>
                                            </div>
                                            <div className={styles.addOnGrid}>
                                                <div className={styles.addOnItem}>
                                                    <UserPlus size={14} /> <span>Extra Agent Slot (L2)</span> <strong>+₹2,000</strong>
                                                </div>
                                                <div className={styles.addOnItem}>
                                                    <Target size={14} /> <span>Regional Priority Node</span> <strong>+₹1,500</strong>
                                                </div>
                                                <div className={styles.addOnItem}>
                                                    <Clock size={14} /> <span>24/7 Live Sync</span> <strong>+₹3,000</strong>
                                                </div>
                                                <div className={styles.addOnItem}>
                                                    <FileText size={14} /> <span>Custom Audit Trail</span> <strong>+₹1,000</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className={styles.notesView}>
                                        <div className={styles.sectionTitle}>
                                            <FileText size={16} />
                                            <span>SESSION NOTES</span>
                                        </div>
                                        <textarea
                                            className={styles.notesTextarea}
                                            placeholder="Add secure notes for this session..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>
                                        <button className={styles.saveBtn} onClick={handleSaveNotes}>SAVE NOTES</button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.roleActionCloud}>
                                {actions}
                            </div>

                            <div className={styles.primaryActionWrapper}>
                                <button
                                    className={styles.primaryActionBtn}
                                    onClick={() => setActiveInteraction(role === 'call' ? 'call' : 'chat')}
                                >
                                    {role === 'call' ? (
                                        <><Phone size={20} /> INITIATE SECURE CALL</>
                                    ) : (
                                        <><MessageSquare size={20} /> OPEN CHAT COMMAND</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Cpu size={64} className={styles.beaconIcon} />
                            <h2>QUANTUM SCANNER ACTIVE</h2>
                            <p>Establishing secure connection... Select a node from the live reception queue to view professional dossiers.</p>
                        </div>
                    )}
                </AnimatePresence>
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
                                <h2>{overlayType.toUpperCase()} MODE</h2>
                                <button onClick={() => setOverlayType(null)}><Ban size={20} /></button>
                            </div>
                            <div className={styles.overlayBody}>
                                <p>System protocol for {overlayType} initiated. Waiting for higher authority handshake...</p>
                                <div className={styles.loader} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportDashboardLayout;
