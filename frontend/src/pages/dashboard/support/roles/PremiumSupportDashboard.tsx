import React, { useState, useMemo } from 'react';
import styles from './PremiumSupportDashboard.module.css';
import {
    Search, Shield, Target, Activity,
    MessageSquare, Phone, HelpCircle, ArrowLeft,
    Clock, Cpu, Globe, UserCheck, MoreHorizontal,
    Mail, PhoneCall, Calendar, MapPin, GraduationCap, School, Layers, Zap,
    FileText, Upload, Star, Lock, History, List, CreditCard,
    Mic, Pause, Repeat, Receipt, StarHalf, ShieldAlert, Download,
    Paperclip, MessageCircle, Smile, Bell, BellOff, Eye, Bot, Share2,
    UserPlus, PlusCircle, Ban, Timer, Printer, Play, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportChatUI from '../../../../components/support/SupportChatUI';
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

interface PremiumSupportDashboardProps {
    role: 'call' | 'chat' | 'live' | 'assistant';
}

const PremiumSupportDashboard: React.FC<PremiumSupportDashboardProps> = ({ role }) => {
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
    const [isRecording, setIsRecording] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [shareLink, setShareLink] = useState<string>('');
    const [feedbackRating, setFeedbackRating] = useState<number>(0);
    const [escalationLevel, setEscalationLevel] = useState<string>('1');
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [isArchiveMode, setIsArchiveMode] = useState(false);
    const [summaryText, setSummaryText] = useState<string>('Client reported low latency in high-court uplink. Verified bandwidth and re-routed via Singapore-2 node. Resolved in 4m 30s.');

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

    const handleRoleAction = (action: string) => {
        if (action === 'Record') {
            setIsRecording(!isRecording);
            return;
        }
        if (action === 'Mute') {
            setIsMuted(!isMuted);
            return;
        }
        if (action === 'Hold') {
            setIsOnHold(!isOnHold);
            return;
        }
        if (action === 'Transfer') {
            setOverlayType('transfer');
            return;
        }
        if (action === 'Call Back') {
            setOverlayType('callback');
            return;
        }
        if (action === 'Summary') {
            setOverlayType('summary');
            return;
        }
        setOverlayType(action.toLowerCase());
    };

    const handleBillingAction = (action: string) => {
        setOverlayType(action.toLowerCase());
    };

    const handleAddOn = (addon: string) => {
        alert(`Adding ${addon}...`);
    };

    return (
        <div className={`${styles.dashboardContainer} ${isRecording ? styles.recordingActive : ''} ${isOnHold ? styles.holdActive : ''}`}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.queueHeader}>
                        <div className={styles.queueTitleArea}>
                            <Crown size={18} color="#ef4444" />
                            <h3>Ultra Pro-Silver Chat Support</h3>
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {activeInteraction === 'chat' && (
                                <SupportChatUI
                                    user={selectedUser}
                                    messages={[]}
                                    onSendMessage={() => { }}
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

                                        {role === 'call' && (
                                            <section className={styles.dataSection}>
                                                <div className={styles.sectionTitle}>
                                                    <Activity size={16} />
                                                    <span>CALL RECORDING HUB & PROMPTS</span>
                                                </div>
                                                <div className={styles.roleWidgetGrid}>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Live Recording</h4>
                                                        <div className={styles.toggleRow}>
                                                            <span>Auto-Record Uplink</span>
                                                            <div className={styles.miniToggle} />
                                                        </div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Recording History</h4>
                                                        <div className={styles.miniList}>
                                                            <div className={styles.miniListItem}><Clock size={12} /> Session_082.mp3 <span>2m 45s</span></div>
                                                            <div className={styles.miniListItem}><Clock size={12} /> Session_079.mp3 <span>5m 12s</span></div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Transcription</h4>
                                                        <button className={styles.pulseBtn} onClick={() => handleRoleAction('Transcribe')}>Start Transcription</button>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {role === 'chat' && (
                                            <section className={styles.dataSection}>
                                                <div className={styles.sectionTitle}>
                                                    <MessageSquare size={16} />
                                                    <span>AUTO-REPLY & SENTIMENT ANALYSIS</span>
                                                </div>
                                                <div className={styles.roleWidgetGrid}>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Quick Templates</h4>
                                                        <div className={styles.chipCloud}>
                                                            <span>#greeting</span> <span>#legal_esc</span> <span>#id_req</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Sentiment Gauge</h4>
                                                        <div className={styles.sentimentMeter}>
                                                            <div className={styles.sentimentFill} style={{ width: '85%', background: '#10b981' }} />
                                                            <span>POSITIVE (+0.85)</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>AI Suggestions</h4>
                                                        <button className={styles.pulseBtn} onClick={() => handleRoleAction('Suggest Reply')}>Generate Reply</button>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {role === 'live' && (
                                            <section className={styles.dataSection}>
                                                <div className={styles.sectionTitle}>
                                                    <Globe size={16} />
                                                    <span>VISITOR GEOSPATIAL MONITOR & ACTIVITY</span>
                                                </div>
                                                <div className={styles.roleWidgetGrid}>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Active Signals</h4>
                                                        <div className={styles.geoStats}>
                                                            <div>Maharashtra: 12</div>
                                                            <div>Delhi NCR: 8</div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Heatmap Signal</h4>
                                                        <div className={styles.signalPulse} />
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Traffic Density</h4>
                                                        <div className={styles.densityBar}><div style={{ width: '65%' }} /></div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Live Alerts</h4>
                                                        <button className={styles.pulseBtn} onClick={() => handleRoleAction('Set Alert')}>Set Geo Alert</button>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {role === 'assistant' && (
                                            <section className={styles.dataSection}>
                                                <div className={styles.sectionTitle}>
                                                    <Calendar size={16} />
                                                    <span>VIP SCHEDULER & REVENUE TRACKING</span>
                                                </div>
                                                <div className={styles.roleWidgetGrid}>
                                                    <div className={styles.widgetCard}>
                                                        <h4>VIP Revenue</h4>
                                                        <div className={styles.revenueText}>₹12,450.00 <span>MONTHLY</span></div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Pending Tasks</h4>
                                                        <div className={styles.taskItem}>- File review for {selectedUser.name}</div>
                                                        <div className={styles.taskItem}>- Schedule high court uplink</div>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Master Calendar</h4>
                                                        <button className={styles.calendarBtn} onClick={() => handleRoleAction('Open Calendar')}>OPEN SCHEDULE</button>
                                                    </div>
                                                    <div className={styles.widgetCard}>
                                                        <h4>Task Manager</h4>
                                                        <button className={styles.pulseBtn} onClick={() => handleRoleAction('Add Task')}>Add New Task</button>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

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
                                                <div className={styles.timePoint} />
                                                <span className={styles.timeStamp}>Today, 10:45 AM</span>
                                                <p>Case document #4812 uploaded via Mobile App</p>
                                            </div>
                                            <div className={styles.timelineItem}>
                                                <div className={styles.timePoint} />
                                                <span className={styles.timeStamp}>Yesterday, 04:20 PM</span>
                                                <p>Successful Chat Support session (ID: 082A)</p>
                                            </div>
                                            <div className={styles.timelineItem}>
                                                <div className={styles.timePoint} />
                                                <span className={styles.timeStamp}>2 days ago, 09:15 AM</span>
                                                <p>Call initiated for query resolution</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className={styles.historyView}>
                                        <div className={styles.sectionTitle}>
                                            <History size={16} />
                                            <span>SUPPORT HISTORY</span>
                                        </div>
                                        <div className={styles.historyList}>
                                            <div className={styles.historyItem}>
                                                <span>Chat - 01/25/2026</span>
                                                <p>Resolved login issue</p>
                                            </div>
                                            <div className={styles.historyItem}>
                                                <span>Call - 01/20/2026</span>
                                                <p>Subscription upgrade</p>
                                            </div>
                                            <div className={styles.historyItem}>
                                                <span>Mixed - 01/15/2026</span>
                                                <p>Document verification</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'files' && (
                                    <div className={styles.filesView}>
                                        <div className={styles.sectionTitle}>
                                            <Upload size={16} />
                                            <span>UPLOADED FILES</span>
                                        </div>
                                        <div className={styles.fileList}>
                                            <div className={styles.fileItem}>
                                                <FileText size={16} />
                                                <span>contract.pdf</span>
                                                <button onClick={() => handleGlobalAction('Download')}><Download size={16} /></button>
                                            </div>
                                            <div className={styles.fileItem}>
                                                <FileText size={16} />
                                                <span>id_proof.jpg</span>
                                                <button onClick={() => handleGlobalAction('Download')}><Download size={16} /></button>
                                            </div>
                                            <div className={styles.fileItem}>
                                                <FileText size={16} />
                                                <span>report.docx</span>
                                                <button onClick={() => handleGlobalAction('Download')}><Download size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'subscription' && (
                                    <div className={styles.billingView}>
                                        <div className={styles.packageCard}>
                                            <div className={styles.packHeader}>
                                                <Target size={24} color="#3b82f6" />
                                                <div>
                                                    <h3>PLATINUM ADVOCATE PRE-PAID</h3>
                                                    <span>Active until Dec 20, 2026</span>
                                                </div>
                                            </div>
                                            <div className={styles.packGrid}>
                                                <div className={styles.statBox}><h4>Bill Cycle</h4><p>Monthly</p></div>
                                                <div className={styles.statBox}><h4>Next Bill</h4><p>₹12,500.00</p></div>
                                                <div className={styles.statBox}><h4>Last Payment</h4><p>₹12,500.00 on 01/01/2026</p></div>
                                            </div>
                                            <div className={styles.packActions}>
                                                <button className={styles.billingBtn} onClick={() => handleBillingAction('Renew')}>RENEW</button>
                                                <button className={styles.billingBtn} onClick={() => handleBillingAction('Upgrade')}>UPGRADE</button>
                                                <button className={styles.billingBtn} onClick={() => handleBillingAction('Downgrade')}>DOWNGRADE</button>
                                            </div>
                                        </div>
                                        <div className={styles.addOnsSection}>
                                            <div className={styles.sectionTitle}>
                                                <PlusCircle size={16} />
                                                <span>AVAILABLE ADD-ONS</span>
                                            </div>
                                            <div className={styles.addOnGrid}>
                                                <div className={styles.addOnItem} onClick={() => handleAddOn('Extra Agent Slot')}>
                                                    <UserPlus size={14} /> Extra Agent Slot <span>+₹2,000</span>
                                                </div>
                                                <div className={styles.addOnItem} onClick={() => handleAddOn('Priority Slot')}>
                                                    <Target size={14} /> Priority Slot <span>+₹1,500</span>
                                                </div>
                                                <div className={styles.addOnItem} onClick={() => handleAddOn('Extended Support')}>
                                                    <Clock size={14} /> Extended Support <span>+₹3,000</span>
                                                </div>
                                                <div className={styles.addOnItem} onClick={() => handleAddOn('Custom Reports')}>
                                                    <FileText size={14} /> Custom Reports <span>+₹1,000</span>
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

                            {/* <div className={styles.globalActionsBar}>
                                <button title="Session Rating" onClick={() => handleGlobalAction('Rating')}><StarHalf size={16} /> RATING</button>
                                <button title="Feedback Form" onClick={() => handleGlobalAction('Feedback')}><MessageCircle size={16} /> FEEDBACK</button>
                                <button title="Refund Request" onClick={() => handleGlobalAction('Refund')}><CreditCard size={16} /> REFUND</button>
                                <button title="Dispute Session" onClick={() => handleGlobalAction('Dispute')}><ShieldAlert size={16} /> DISPUTE</button>
                                <button title="Export History" onClick={() => handleGlobalAction('Export')}><Download size={16} /> EXPORT</button>
                                <button style={{ color: '#ef4444' }} title="Block Client" onClick={() => handleGlobalAction('Block')}><Ban size={16} /> BLOCK</button>
                                <button title="Archive" onClick={() => handleGlobalAction('Archive')}><Layers size={16} /> ARCHIVE</button>
                            </div> */}

                            <div className={styles.roleActionCloud}>
                                {role === 'call' && (
                                    <>
                                        {/* <button
                                            className={`${styles.roleActionBtn} ${isRecording ? styles.recordingBtnActive : ''}`}
                                            onClick={() => handleRoleAction('Record')}
                                        >
                                            <Mic size={16} /> {isRecording ? 'STOP' : 'RECORD'}
                                        </button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Hold')} style={{ color: isOnHold ? '#fbbf24' : '#cbd5e1' }}>
                                            <Pause size={16} /> {isOnHold ? 'RESUME' : 'HOLD'}
                                        </button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Transfer')}><Repeat size={16} /> TRANSFER</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Call Back')}><PhoneCall size={16} /> CALL BACK</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Summary')}><Receipt size={16} /> SUMMARY</button>
                                        <button
                                            className={`${styles.roleActionBtn} ${isMuted ? styles.mutedBtnActive : ''}`}
                                            onClick={() => handleRoleAction('Mute')}
                                        >
                                            {isMuted ? <BellOff size={16} /> : <Bell size={16} />} {isMuted ? 'UNMUTE' : 'MUTE'}
                                        </button> */}
                                    </>
                                )}
                                {role === 'chat' && (
                                    <>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('File')}><Paperclip size={16} /> FILE</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Canned')}><MessageSquare size={16} /> CANNED</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Emoji')}><Smile size={16} /> EMOJI</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Nudge')}><Bell size={16} /> NUDGE</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Transfer')}><Repeat size={16} /> TRANSFER</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Close Chat')}><Ban size={16} /> CLOSE</button>
                                    </>
                                )}
                                {role === 'live' && (
                                    <>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Bot')}><Bot size={16} /> BOT</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Auto-RT')}><Share2 size={16} /> AUTO-RT</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Join')}><UserPlus size={16} /> JOIN</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Monitor')}><Eye size={16} /> MONITOR</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Broadcast')}><Globe size={16} /> BROADCAST</button>
                                    </>
                                )}
                                {role === 'assistant' && (
                                    <>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Assign')}><UserPlus size={16} /> ASSIGN</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Change')}><Repeat size={16} /> CHANGE</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Asst Call')}><PhoneCall size={16} /> ASST CALL</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Asst Chat')}><MessageSquare size={16} /> ASST CHAT</button>
                                        <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Delegate')}><UserCheck size={16} /> DELEGATE</button>
                                    </>
                                )}
                            </div>

                            <div className={styles.actionTier}>
                                <button className={styles.actionBtn} onClick={() => setActiveInteraction('chat')}>
                                    <MessageSquare size={18} />
                                    <span>CHAT</span>
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
                        className={styles.modalBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOverlayType(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3>{overlayType.toUpperCase()} SYSTEM</h3>
                                <button onClick={() => setOverlayType(null)} className={styles.closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                {overlayType === 'notes' && (
                                    <div className={styles.notesOverlay}>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Enter secure session notes..."
                                            className={styles.notesTextarea}
                                        />
                                        <button onClick={handleSaveNotes} className={styles.saveBtn}>SAVE TO DOSSIER</button>
                                    </div>
                                )}

                                {overlayType === 'schedule' && (
                                    <div className={styles.scheduleOverlay}>
                                        <div className={styles.formGroup}>
                                            <label>SELECT DATE</label>
                                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.modalInput} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>SELECT TIME SLOT</label>
                                            <div className={styles.gridPicker}>
                                                {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                                                    <button
                                                        key={time}
                                                        className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotActive : ''}`}
                                                        onClick={() => setSelectedTime(time)}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button className={styles.saveBtn} style={{ width: '100%', marginTop: '20px' }} onClick={() => setOverlayType(null)}>CONFIRM BOOKING</button>
                                    </div>
                                )}

                                {overlayType === 'upload' && (
                                    <div className={styles.uploadOverlay}>
                                        <div className={styles.dropZone} onClick={() => {
                                            setIsUploading(true);
                                            let p = 0;
                                            const interval = setInterval(() => {
                                                p += 10;
                                                setUploadProgress(p);
                                                if (p >= 100) {
                                                    clearInterval(interval);
                                                    setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 500);
                                                }
                                            }, 200);
                                        }}>
                                            <Upload size={32} />
                                            <p>{isUploading ? `Uploading... ${uploadProgress}%` : 'Drag & Drop documents or Click to browse'}</p>
                                        </div>
                                        {isUploading && (
                                            <div className={styles.uploadBar}><div style={{ width: `${uploadProgress}%` }} /></div>
                                        )}
                                        <div className={styles.pendingUploads}>
                                            <h4>RECENT UPLOADS</h4>
                                            <div className={styles.miniListItem}><FileText size={12} /> kyc_document_v1.pdf <span>VERIFIED</span></div>
                                            <div className={styles.miniListItem}><FileText size={12} /> case_summary.docx <span>SCANNING</span></div>
                                        </div>
                                    </div>
                                )}

                                {overlayType === 'escalate' && (
                                    <div className={styles.escalateOverlay}>
                                        <div className={styles.alertBox}>
                                            <ShieldAlert size={24} color="#ef4444" />
                                            <p>Escalating this session will alert the Senior Legal Supervisor and move it to the High-Priority Queue.</p>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>ESCALATION LEVEL</label>
                                            <select value={escalationLevel} onChange={(e) => setEscalationLevel(e.target.value)} className={styles.modalSelect}>
                                                <option value="1">Level 1 - Supervisor</option>
                                                <option value="2">Level 2 - Department Head</option>
                                                <option value="3">Level 3 - Managing Partner</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>REASON FOR ESCALATION</label>
                                            <textarea className={styles.modalTextarea} placeholder="Detail the complexity or risk factors..." />
                                        </div>
                                        <button className={styles.escalateActionBtn} onClick={() => setOverlayType(null)}>TRIGGER ESCALATION</button>
                                    </div>
                                )}

                                {overlayType === 'share' && (
                                    <div className={styles.shareOverlay}>
                                        <div className={styles.formGroup}>
                                            <label>SECURE ACCESS LINK</label>
                                            <div className={styles.shareRow}>
                                                <input readOnly value={shareLink || "https://e-advocate.cloud/share/temp_0921..."} className={styles.shareInput} />
                                                <button className={styles.copyBtn} onClick={() => {
                                                    setShareLink(`https://e-advocate.cloud/share/secure_${Math.random().toString(36).substr(2, 9)}`);
                                                    alert("Secure link generated and copied!");
                                                }}>GENERATE</button>
                                            </div>
                                        </div>
                                        <div className={styles.securityToggle}>
                                            <span>Password Protection</span>
                                            <div className={styles.miniToggle} />
                                        </div>
                                    </div>
                                )}

                                {['rating', 'feedback', 'refund', 'dispute'].includes(overlayType) && (
                                    <div className={styles.saasFormOverlay}>
                                        <div className={styles.formGroup}>
                                            <label>{overlayType.toUpperCase()} DETAILS</label>
                                            <textarea className={styles.modalTextarea} placeholder={`Provide additional details for the ${overlayType} request...`} />
                                        </div>
                                        {overlayType === 'rating' && (
                                            <div className={styles.starRow}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star
                                                        key={s}
                                                        size={24}
                                                        onClick={() => setFeedbackRating(s)}
                                                        fill={s <= feedbackRating ? "#fbbf24" : "none"}
                                                        color={s <= feedbackRating ? "#fbbf24" : "#475569"}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <button className={styles.saveBtn} style={{ width: '100%', marginTop: '20px' }} onClick={() => setOverlayType(null)}>SUBMIT REQUEST</button>
                                    </div>
                                )}

                                {overlayType === 'export' && (
                                    <div className={styles.exportOverlay}>
                                        <div className={styles.formGroup}>
                                            <label>EXPORT FORMAT</label>
                                            <div className={styles.gridPicker}>
                                                <button className={styles.formatBtn}><FileText size={18} /> PDF</button>
                                                <button className={styles.formatBtn}><FileText size={18} /> JSON</button>
                                                <button className={styles.formatBtn}><FileText size={18} /> CSV</button>
                                                <button className={styles.formatBtn}><FileText size={18} /> XML</button>
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>DATA RANGE</label>
                                            <select className={styles.modalSelect}>
                                                <option>All Session Activity</option>
                                                <option>Last 24 Hours</option>
                                                <option>Document History Only</option>
                                            </select>
                                        </div>
                                        <button className={styles.saveBtn} style={{ width: '100%' }} onClick={() => setOverlayType(null)}>INITIATE EXPORT</button>
                                    </div>
                                )}

                                {overlayType === 'block' && (
                                    <div className={styles.blockOverlay}>
                                        <div className={styles.criticalAlert}>
                                            <Ban size={24} color="#ef4444" />
                                            <p>CRITICAL ACTION: Blocking this client will terminate all active uplinks and flag their account for compliance review.</p>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>REASON FOR BLOCK</label>
                                            <select className={styles.modalSelect}>
                                                <option>Fraudulent Content</option>
                                                <option>Prohibited Solicitation</option>
                                                <option>Harassment / Abuse</option>
                                                <option>Other / Compliance Issue</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>SUPPORTING NOTES</label>
                                            <textarea className={styles.modalTextarea} placeholder="Detail the incident for audit logs..." />
                                        </div>
                                        <button className={styles.blockActionBtn} onClick={() => setOverlayType(null)}>EXECUTE PERMANENT BLOCK</button>
                                    </div>
                                )}

                                {overlayType === 'archive' && (
                                    <div className={styles.archiveOverlay}>
                                        <div className={styles.formGroup}>
                                            <label>SELECT ARCHIVE DESTINATION</label>
                                            <div className={styles.miniList}>
                                                <div className={styles.miniListItem}><Layers size={14} /> Closed Cases 2026</div>
                                                <div className={styles.miniListItem}><Layers size={14} /> VIP History / Secure</div>
                                                <div className={styles.miniListItem}><Layers size={14} /> Compliance / Audit Store</div>
                                            </div>
                                        </div>
                                        <div className={styles.securityToggle}>
                                            <span>Encryption Level: AES-256</span>
                                            <div className={styles.miniToggle} style={{ background: '#10b981' }} />
                                        </div>
                                        <button className={styles.saveBtn} style={{ width: '100%', marginTop: '20px' }} onClick={() => {
                                            setIsArchiveMode(true);
                                            setOverlayType(null);
                                        }}>COMMIT TO ARCHIVE</button>
                                    </div>
                                )}

                                {overlayType === 'transfer' && (
                                    <div className={styles.transferOverlay}>
                                        <div className={styles.searchBox}>
                                            <Search size={16} />
                                            <input type="text" placeholder="Search departments or senior agents..." />
                                        </div>
                                        <div className={styles.directoryList}>
                                            <div className={styles.directoryItem}>
                                                <div className={styles.miniAvatar}>LS</div>
                                                <div className={styles.dirInfo}>
                                                    <span>Legal Super (L3)</span>
                                                    <p>Delhi | Singapore Nodes</p>
                                                </div>
                                                <button className={styles.transferBtn}>TRANSFER</button>
                                            </div>
                                            <div className={styles.directoryItem}>
                                                <div className={styles.miniAvatar}>FS</div>
                                                <div className={styles.dirInfo}>
                                                    <span>Finance Support (L2)</span>
                                                    <p>Mumbai Node</p>
                                                </div>
                                                <button className={styles.transferBtn}>TRANSFER</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {overlayType === 'callback' && (
                                    <div className={styles.callbackOverlay}>
                                        <div className={styles.formGroup}>
                                            <label>CALLBACK PRIORITY</label>
                                            <div className={styles.gridPicker}>
                                                <button className={styles.priorityBtn} style={{ borderLeft: '4px solid #ef4444' }}>IMMEDIATE</button>
                                                <button className={styles.priorityBtn} style={{ borderLeft: '4px solid #3b82f6' }}>SCHEDULED</button>
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>TARGET TIME WINDOW</label>
                                            <input type="datetime-local" className={styles.modalInput} />
                                        </div>
                                        <button className={styles.saveBtn} style={{ width: '100%' }} onClick={() => setOverlayType(null)}>QUE CALLBACK TASK</button>
                                    </div>
                                )}

                                {overlayType === 'summary' && (
                                    <div className={styles.summaryOverlay}>
                                        <div className={styles.aiHeader}>
                                            <Zap size={14} color="#a855f7" />
                                            <span>AI-GENERATED INTELLIGENCE SUMMARY</span>
                                        </div>
                                        <textarea
                                            className={styles.summaryTextarea}
                                            value={summaryText}
                                            onChange={(e) => setSummaryText(e.target.value)}
                                        />
                                        <div className={styles.formGroup}>
                                            <label>ACTION ITEMS</label>
                                            <div className={styles.miniListItem} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}><PlusCircle size={12} /> Add follow-up for next Tuesday</div>
                                        </div>
                                        <button className={styles.saveBtn} style={{ width: '100%' }} onClick={() => setOverlayType(null)}>ATTACH TO SESSION</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {isOnHold && (
                <div className={styles.holdOverlay}>
                    <motion.div
                        className={styles.holdContent}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Pause size={48} color="#fbbf24" style={{ marginBottom: '20px' }} />
                        <h2>SESSION ON HOLD</h2>
                        <p>All active uplinks are paused for security or adjustment.</p>
                        <button
                            className={styles.unholdBtn}
                            onClick={() => setIsOnHold(false)}
                        >
                            <Play size={16} /> RESUME SESSION
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PremiumSupportDashboard;
