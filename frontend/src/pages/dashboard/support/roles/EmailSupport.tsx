import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EmailSupport.module.css';
import api from '../../../../services/api';
import {
    Search, UserPlus, ShieldCheck, ShieldAlert,
    XCircle, RotateCcw, Download, Upload,
    Users, Mail, Send, Layout,
    Briefcase, MessageSquare, Settings,
    HelpCircle, LogOut, Bell, Minus, Maximize2, X,
    Type, Paperclip, Link, Smile, ImageIcon, Lock,
    Trash2, MoreVertical, Plus, Globe, Clock, Activity, AlertCircle, ChevronRight, ChevronLeft, Star, Tag, Inbox, Info, Reply, Forward,
    ArrowLeft, Menu as MenuIcon, LayoutGrid, Square, Archive
} from 'lucide-react';
import gmailStyles from '../../../staff/roles/GmailMailbox.module.css';
import { useAuth } from '../../../../context/AuthContext';

interface Email {
    id: string;
    to: string;
    subject: string;
    body: string;
    date: string;
}

interface Ticket {
    id: string;
    subject: string;
    user: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    messages: { sender: string; text: string; timestamp: string }[];
}

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Robust regex to find the start of quoted content (On ... wrote, Forwarded message, or start of > block)
    const quotePattern = /\r?\n\s*(?:On\s+[\s\S]*?wrote:|---+\s*Forwarded\s+message|&gt;|>)/i;
    const match = text.match(quotePattern);

    if (!match) {
        return (
            <>
                {text.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '4px 0' }}>{line}</p>
                ))}
            </>
        );
    }

    const quoteIndex = match.index!;
    const mainBody = text.substring(0, quoteIndex).trim();
    const quotedContent = text.substring(quoteIndex);

    return (
        <>
            {mainBody.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '4px 0' }}>{line}</p>
            ))}

            <div style={{ marginTop: '8px' }}>
                {!isExpanded ? (
                    <button
                        onClick={() => setIsExpanded(true)}
                        style={{
                            background: '#e8eaed', // Light grey like Gmail
                            border: 'none',
                            width: '32px',
                            height: '18px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#5f6368',
                            margin: '8px 0',
                            padding: 0
                        }}
                        title="Show quoted text"
                    >
                        <span style={{ fontSize: '18px', lineHeight: 0, marginTop: '-4px', fontWeight: 'bold' }}>...</span>
                    </button>
                ) : (
                    <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: '16px', marginTop: '12px' }}>
                        <div
                            onClick={() => setIsExpanded(false)}
                            style={{
                                cursor: 'pointer',
                                color: '#facc15',
                                fontSize: '11px',
                                marginBottom: '12px',
                                opacity: 0.7,
                                textDecoration: 'underline'
                            }}
                        >
                            Hide quoted text
                        </div>
                        <div style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                            {quotedContent.split('\n').map((line, i) => (
                                <p key={i} style={{
                                    margin: '2px 0',
                                    color: line.trim().startsWith('>') || line.trim().startsWith('&gt;') ? '#666' : 'inherit'
                                }}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};




const Badge: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = 'blue' }) => {
    const colors: { [key: string]: string } = {
        blue: 'rgba(59, 130, 246, 0.1), #3b82f6',
        green: 'rgba(16, 185, 129, 0.1), #10b981',
        red: 'rgba(239, 68, 68, 0.1), #ef4444',
        yellow: 'rgba(245, 158, 11, 0.1), #f59e0b',
        purple: 'rgba(139, 92, 246, 0.1), #8b5cf6',
        gray: 'rgba(100, 116, 139, 0.1), #64748b'
    };
    const [bg, text] = (colors[color] || colors.blue).split(', ');
    return (
        <span style={{
            padding: '2px 10px', borderRadius: '20px', fontSize: '10px',
            fontWeight: '800', background: bg, color: text, border: `1px solid ${text}20`,
            display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }}>
            {children}
        </span>
    );
};

const EmailSupport: React.FC = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activePage, setActivePage] = useState('Emailing');

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
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Primary');
    const [isReplying, setIsReplying] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to end your session?")) {
            logout();
        }
    };

    // Data State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [stats, setStats] = useState({ totalUsers: 0, openTickets: 0, solvedTickets: 0 });
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Compose Window State
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [composePos, setComposePos] = useState({ x: 0, y: 0 }); // 0,0 means default/centered
    const composeRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef(false);
    const dragOffset = React.useRef({ x: 0, y: 0 });

    // Compose Toolbar State
    const [showFormatTools, setShowFormatTools] = useState(false);
    const [isConfidential, setIsConfidential] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            setComposePos({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        };
        const handleMouseUp = () => {
            isDragging.current = false;
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDrag = (e: React.MouseEvent) => {
        if (isMaximized) return;
        isDragging.current = true;
        const rect = composeRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    // Helper for toolbar insertion
    const insertIntoBody = (text: string) => setBody(prev => prev + text);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            insertIntoBody(`\n[Attached: ${e.target.files[0].name}]\n`);
        }
    };


    // Filter Stats
    const [activeTopFilter, setActiveTopFilter] = useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = useState('All Members');
    const [activePlan, setActivePlan] = useState<string | null>(null);
    const [activeTier, setActiveTier] = useState<{ [key: string]: string }>({
        'PRO LITE': 'Silver',
        'PRO': 'Silver',
        'ULTRA PRO': 'Silver'
    });
    const [currentFolder, setCurrentFolder] = useState('Inbox');
    const [starredIds, setStarredIds] = useState<string[]>([]);
    const [ticketFolders, setTicketFolders] = useState<{ [key: string]: string }>({}); // Track folder location per ticket
    const [activeMenu, setActiveMenu] = useState<string | null>(null); // 'toolbar' | 'header'
    const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]); // Multi-select state

    // Compose State (Global Popup)
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [agentLogs, setAgentLogs] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketRes, statRes] = await Promise.all([
                api.get('/support/tickets'),
                api.get('/support/stats')
            ]);
            if (ticketRes.data.success) {
                setTickets(ticketRes.data.tickets);
                if (ticketRes.data.tickets.length > 0 && !selectedTicket) {
                    setSelectedTicket(ticketRes.data.tickets[0]);
                }
            }
            if (statRes.data.success) {
                setStats(statRes.data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch support data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgentLogs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch logs specifically for this agent and ensure no duplicates
            const res = await api.get('/support/activities', {
                params: { agentId: user.loginId || user.id, limit: 100 }
            });
            if (res.data.success) {
                // Deduplicate by _id just in case
                const uniqueLogs = res.data.logs.reduce((acc: any[], curr: any) => {
                    if (!acc.find(l => l._id === curr._id)) acc.push(curr);
                    return acc;
                }, []);
                setAgentLogs(uniqueLogs);
            }
        } catch (err) {
            console.error("Failed to fetch agent logs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Real-time listener for new emails
        const handleNewEmail = () => {
            console.log('[Support] New email notification received via socket');
            fetchData();
        };

        // Custom event for socket updates if being relayed through window events
        window.addEventListener('support:new-email', handleNewEmail);

        // Polling as a fallback for lowest latency (every 60s)
        const interval = setInterval(() => {
            handleSync(false); // Silent sync
        }, 60000);

        return () => {
            window.removeEventListener('support:new-email', handleNewEmail);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (activePage === 'Audit logs') {
            fetchAgentLogs();
        }
    }, [activePage, user]);

    const handleSendEmail = async () => {
        if (!to || !subject || !body) {
            alert('All fields are required');
            return;
        }
        setLoading(true);
        try {
            await api.post('/support/send-bulk', {
                role: 'manual',
                targetEmail: to,
                subject,
                message: body
            });
            alert('Email dispatched successfully via secure SMTP.');
            setIsComposeOpen(false);
            setTo('');
            setSubject('');
            setBody('');
            fetchData();
        } catch (err: any) {
            alert('Failed to send: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!selectedTicket || !replyText) return;
        setLoading(true);
        try {
            await api.post('/support/reply', {
                ticketId: selectedTicket.id,
                message: replyText
            });
            alert('Response dispatched to user.');
            setReplyText('');
            fetchData();
        } catch (err: any) {
            alert('Reply failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Sub-Page Renderers
    const handleSync = async (isManual = true) => {
        setLoading(isManual);
        try {
            const res = await api.get('/support/sync');
            if (isManual) {
                if (res.data.success && res.data.count > 0) {
                    alert(`Inbox Updated: ${res.data.count} new message(s) retrieved.`);
                    fetchData();
                } else if (res.data.error) {
                    alert('Sync Warning: ' + res.data.error);
                } else {
                    alert('Inbox is up to date.');
                }
            } else if (res.data.success && res.data.count > 0) {
                fetchData(); // Silent refresh
            }
        } catch (err) {
            console.error("Sync Failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action: string) => {
        if (!selectedTicket) return;

        // FOLDER MOVEMENTS
        if (['Trash', 'Delete'].includes(action)) {
            setTicketFolders(prev => ({ ...prev, [selectedTicket.id]: 'Bin' }));
            api.post('/support/action', { action: 'Delete', ticketIds: [selectedTicket.id] }).catch(console.error);
            setSelectedTicket(null);
        }
        if (action === 'Report Spam') {
            setTicketFolders(prev => ({ ...prev, [selectedTicket.id]: 'Spam' }));
            api.post('/support/action', { action: 'Report Spam', ticketIds: [selectedTicket.id] }).catch(console.error);
            setSelectedTicket(null);
        }
        if (action === 'Archive') {
            setTicketFolders(prev => ({ ...prev, [selectedTicket.id]: 'Archive' }));
            api.post('/support/action', { action: 'Archive', ticketIds: [selectedTicket.id] }).catch(console.error);
            setSelectedTicket(null);
        }

        // OTHER ACTIONS
        if (action === 'Mark Unread') {
            setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'New Reply' } : t));
            setSelectedTicket(null);
        }
        if (action === 'Mark Read') {
            setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'Open' } : t));
            setActiveMenu(null);
        }
        if (action === 'Mark Important') {
            setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'New Reply' } : t)); // Simulate important
            setActiveMenu(null);
        }

        // Snooze logic (simulate remove from inbox)
        if (action === 'Snooze') {
            setTicketFolders(prev => ({ ...prev, [selectedTicket.id]: 'Snoozed' }));
            setSelectedTicket(null);
        }

        // Forward logic
        if (action === 'Forward') {
            setReplyText(`---------- Forwarded message ---------\nFrom: ${selectedTicket.user} <user@eadvocate.live>\nDate: ${new Date().toLocaleString()}\nSubject: ${selectedTicket.subject}\n\n${selectedTicket.messages[selectedTicket.messages.length - 1]?.text}`);
            setIsReplying(true);
        }

        if (action === 'More') {
            // Legacy handler check removed
        } else {
            // Close menu for other actions
            if (action !== 'Forward' && action !== 'Reply') setActiveMenu(null);
        }
    };

    const toggleStar = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setStarredIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const getFolder = (id: string) => ticketFolders[id] || 'Inbox';

    const filteredTickets = tickets.filter(t => {
        const folder = getFolder(t.id);
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (currentFolder === 'Inbox') {
            // Only show in inbox if it's NOT just an outgoing email with no reply
            const hasUserMsg = t.messages.some(m => !(['Staff', 'Agent', 'Support', 'E-Advocate'].some(id => m.sender.includes(id))));
            return folder === 'Inbox' && hasUserMsg;
        }
        if (currentFolder === 'Starred') return starredIds.includes(t.id) && folder !== 'Bin';
        if (currentFolder === 'Important') return t.status === 'New Reply' && folder !== 'Bin';
        if (currentFolder === 'Sent') return folder === 'Sent' || (folder === 'Inbox' && t.messages.length > 0);
        if (currentFolder === 'Bin') return folder === 'Bin';
        if (currentFolder === 'Spam') return folder === 'Spam';

        return false;
    });

    const toggleEmailSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEmailIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedEmailIds.length === filteredTickets.length) {
            setSelectedEmailIds([]);
        } else {
            setSelectedEmailIds(filteredTickets.map(t => t.id));
        }
    };

    const getFolderCounts = () => {
        const counts = { Inbox: 0, Starred: 0, Sent: 0, Important: 0, Bin: 0 };
        tickets.forEach(t => {
            const folder = getFolder(t.id);
            const hasUserMsg = t.messages.some(m => !(['Staff', 'Agent', 'Support', 'E-Advocate'].some(id => m.sender.includes(id))));

            if (folder === 'Inbox' && hasUserMsg) counts.Inbox++;
            if (starredIds.includes(t.id) && folder !== 'Bin') counts.Starred++;
            if (folder === 'Sent') counts.Sent++;
            if (t.status === 'New Reply' && folder !== 'Bin') counts.Important++;
            if (folder === 'Bin') counts.Bin++;
        });
        return counts;
    };

    const folderCounts = getFolderCounts();

    const handleBulkAction = async (action: string) => {
        if (selectedEmailIds.length === 0) return;

        // Log to backend
        try {
            await api.post('/support/action', { action, ticketIds: selectedEmailIds });
        } catch (err) {
            console.error("Action logging failed", err);
        }

        if (action === 'Delete') {
            setTicketFolders(prev => {
                const newState = { ...prev };
                selectedEmailIds.forEach(id => newState[id] = 'Bin');
                return newState;
            });
        }
        if (action === 'Archive') {
            setTicketFolders(prev => {
                const newState = { ...prev };
                selectedEmailIds.forEach(id => newState[id] = 'Archive');
                return newState;
            });
        }
        if (action === 'Mark Read') {
            setTickets(prev => prev.map(t => selectedEmailIds.includes(t.id) ? { ...t, status: 'Open' } : t));
        }
        if (action === 'Mark Unread') {
            setTickets(prev => prev.map(t => selectedEmailIds.includes(t.id) ? { ...t, status: 'New Reply' } : t));
        }
        if (action === 'Report Spam') {
            setTicketFolders(prev => {
                const newState = { ...prev };
                selectedEmailIds.forEach(id => newState[id] = 'Spam');
                return newState;
            });
        }

        setSelectedEmailIds([]); // Reset selection
        alert(`${action} applied to ${selectedEmailIds.length} conversations.`);
    };

    const renderPageContent = () => {
        switch (activePage) {
            case 'Dashboard':
                return (
                    // ... (keep existing dashboard code)
                    <div className={styles.pageContent}>
                        {/* PLAN CARDS omitted for brevity in replace, assume unchanged */}
                        <div className={styles.planGrid}>
                            <div className={`${styles.planCard} ${activePlan === 'FREE' ? styles.planActive : ''}`} onClick={() => setActivePlan('FREE')}>
                                <div className={styles.planHeader}>
                                    <h3>FREE</h3>
                                    <span className={styles.planSub}>BASIC ACCESS</span>
                                </div>
                            </div>
                            {['PRO LITE', 'PRO', 'ULTRA PRO'].map(plan => (
                                <div key={plan} className={`${styles.planCard} ${activePlan === plan ? styles.planActive : ''}`} onClick={() => setActivePlan(plan)}>
                                    <div className={styles.planHeader}>
                                        <h3>{plan}</h3>
                                        <span className={styles.planSub}>{plan === 'PRO LITE' ? 'STANDARD PREMIUM' : plan === 'PRO' ? 'ADVANCED FEATURES' : 'EXECUTIVE SUPPORT'}</span>
                                    </div>
                                    <div className={styles.tierChips}>
                                        {['Silver', 'Gold', 'Platinum'].map(tier => (
                                            <button key={tier} className={activeTier[plan] === tier ? styles.tierActive : ''} onClick={(e) => { e.stopPropagation(); setActiveTier(prev => ({ ...prev, [plan]: tier })); }}>{tier}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* STATS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px' }}>
                            {[
                                { label: 'Platform Population', value: stats.totalUsers, color: '#3b82f6' },
                                { label: 'Active Inbound', value: stats.openTickets, color: '#f59e0b' },
                                { label: 'Resolved Queries', value: stats.solvedTickets, color: '#10b981' },
                                { label: 'System Integrity', value: '99.9%', color: '#6366f1' }
                            ].map(stat => (
                                <div key={stat.label} style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>{stat.label}</div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Emailing':
                return (
                    <div className={`${gmailStyles.gmailContainer} ${gmailStyles.darkTheme}`} style={{ height: 'calc(100vh - 100px)', width: '100%', marginLeft: '-40px', marginTop: '-32px' }}>
                        {/* GMAIL SIDEBAR (CATEGORIES) */}
                        <div className={`${gmailStyles.sidebar} ${isSidebarCollapsed ? gmailStyles.sidebarCollapsed : ''}`}>
                            <div className={gmailStyles.sidebarToggle} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                                <MenuIcon size={20} />
                            </div>
                            <button className={gmailStyles.composeNavBtn} onClick={() => setIsComposeOpen(true)}>
                                <Plus size={24} style={{ marginRight: isSidebarCollapsed ? 0 : '12px' }} />
                                {!isSidebarCollapsed && "Compose"}
                            </button>
                            <div className={`${gmailStyles.navItem} ${currentFolder === 'Inbox' ? gmailStyles.navItemActive : ''}`} onClick={() => setCurrentFolder('Inbox')}>
                                <Inbox size={20} />
                                <span>Inbox</span>
                                {!isSidebarCollapsed && folderCounts.Inbox > 0 && <span className={gmailStyles.navItemCount}>{folderCounts.Inbox}</span>}
                            </div>
                            <div className={`${gmailStyles.navItem} ${currentFolder === 'Starred' ? gmailStyles.navItemActive : ''}`} onClick={() => setCurrentFolder('Starred')}>
                                <Star size={20} /> <span>Starred</span>
                                {!isSidebarCollapsed && folderCounts.Starred > 0 && <span className={gmailStyles.navItemCount} style={{ background: '#3b82f6' }}>{folderCounts.Starred}</span>}
                            </div>
                            <div className={`${gmailStyles.navItem} ${currentFolder === 'Sent' ? gmailStyles.navItemActive : ''}`} onClick={() => setCurrentFolder('Sent')}>
                                <Send size={20} /> <span>Sent</span>
                                {!isSidebarCollapsed && folderCounts.Sent > 0 && <span className={gmailStyles.navItemCount} style={{ background: '#64748b' }}>{folderCounts.Sent}</span>}
                            </div>
                            <div className={`${gmailStyles.navItem} ${currentFolder === 'Important' ? gmailStyles.navItemActive : ''}`} onClick={() => setCurrentFolder('Important')}>
                                <Tag size={20} /> <span>Important</span>
                                {!isSidebarCollapsed && folderCounts.Important > 0 && <span className={gmailStyles.navItemCount} style={{ background: '#f59e0b' }}>{folderCounts.Important}</span>}
                            </div>
                            <div className={`${gmailStyles.navItem} ${currentFolder === 'Bin' ? gmailStyles.navItemActive : ''}`} onClick={() => setCurrentFolder('Bin')}>
                                <Trash2 size={20} /> <span>Bin</span>
                                {!isSidebarCollapsed && folderCounts.Bin > 0 && <span className={gmailStyles.navItemCount} style={{ background: '#ef4444' }}>{folderCounts.Bin}</span>}
                            </div>
                        </div>

                        <div className={gmailStyles.mainContent}>
                            {/* ACTION BAR / TABS */}
                            {!selectedTicket ? (
                                <>
                                    <div className={gmailStyles.actionBar}>
                                        <div className={gmailStyles.bulkActionGroup}>
                                            <div onClick={toggleSelectAll} style={{ cursor: 'pointer', padding: '8px' }}>
                                                <Square size={18} color="#9ea3ae" fill={selectedEmailIds.length > 0 && selectedEmailIds.length === filteredTickets.length ? "#9ea3ae" : "none"} />
                                            </div>
                                            {selectedEmailIds.length > 0 ? (
                                                <>
                                                    <div className={gmailStyles.actionIcon} onClick={() => handleBulkAction('Archive')} title="Archive"><Archive size={18} /></div>
                                                    <div className={gmailStyles.actionIcon} onClick={() => handleBulkAction('Report Spam')} title="Report Spam"><AlertCircle size={18} /></div>
                                                    <div className={gmailStyles.actionIcon} onClick={() => handleBulkAction('Delete')} title="Delete"><Trash2 size={18} /></div>
                                                    <div className={gmailStyles.actionIcon} onClick={() => handleBulkAction('Mark Unread')} title="Mark as unread"><Mail size={18} /></div>
                                                    <div className={gmailStyles.toolbarDivider} />
                                                    <div className={gmailStyles.actionIcon}><MoreVertical size={18} /></div>
                                                </>
                                            ) : (
                                                <RotateCcw size={18} className={loading ? gmailStyles.spin : ''} onClick={() => handleSync(true)} style={{ cursor: 'pointer', color: '#9ea3ae' }} />
                                            )}
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px' }}>1-{filteredTickets.length} of {filteredTickets.length}</span>
                                            <ChevronLeft size={18} color="#dadce0" />
                                            <ChevronRight size={18} color="#dadce0" />
                                        </div>
                                    </div>

                                    <div className={gmailStyles.tabs}>
                                        <div className={`${gmailStyles.tab} ${activeTab === 'Primary' ? gmailStyles.tabActive : ''}`} onClick={() => setActiveTab('Primary')}>
                                            <Inbox size={20} /> Primary
                                        </div>
                                        <div className={`${gmailStyles.tab} ${activeTab === 'Updates' ? gmailStyles.tabActive : ''}`} onClick={() => setActiveTab('Updates')}>
                                            <Info size={20} /> Updates
                                        </div>
                                    </div>

                                    <div className={gmailStyles.emailList}>
                                        {filteredTickets.length > 0 ? filteredTickets.map(t => (
                                            <div
                                                key={t.id}
                                                className={`${gmailStyles.emailItem} ${t.status === 'New Reply' || t.status === 'Open' ? gmailStyles.unread : ''}`}
                                                onClick={() => setSelectedTicket(t)}
                                            >
                                                <div className={gmailStyles.emailItemIcons}>
                                                    <div className={gmailStyles.emailCheckbox} onClick={(e) => toggleEmailSelection(t.id, e)}>
                                                        <Square size={20} fill={selectedEmailIds.includes(t.id) ? "#9ea3ae" : "none"} color={selectedEmailIds.includes(t.id) ? "#9ea3ae" : "#4b5262"} />
                                                    </div>
                                                    <div className={gmailStyles.emailStar} onClick={(e) => toggleStar(t.id, e)}>
                                                        <Star size={20} color={starredIds.includes(t.id) ? "#fbbc04" : "#4b5262"} fill={starredIds.includes(t.id) ? "#fbbc04" : "none"} />
                                                    </div>
                                                    <div className={gmailStyles.emailImportant}><Tag size={18} fill={t.status === 'New Reply' ? "#fbbc04" : "none"} stroke="#fbbc04" /></div>
                                                </div>
                                                <div className={gmailStyles.emailSender}>{t.user}</div>
                                                <div className={gmailStyles.emailSubjectContainer}>
                                                    <span className={gmailStyles.emailSubject}>{t.subject}</span>
                                                    <span className={gmailStyles.emailSnippet}>- {t.messages[t.messages.length - 1]?.text.substring(0, 100)}</span>
                                                </div>
                                                <div className={gmailStyles.emailDate}>{new Date(t.updatedAt || t.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}</div>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                                                <Mail size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                                <p>No messages found in {currentFolder}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className={gmailStyles.emailDetail}>
                                    <div className={gmailStyles.detailToolbar}>
                                        <ArrowLeft size={24} className={gmailStyles.actionIcon} onClick={() => setSelectedTicket(null)} />
                                        <Archive size={24} className={gmailStyles.actionIcon} onClick={() => handleAction('Archive')} />
                                        <AlertCircle size={24} className={gmailStyles.actionIcon} onClick={() => handleAction('Report Spam')} />
                                        <Trash2 size={24} className={gmailStyles.actionIcon} onClick={() => handleAction('Trash')} />
                                        <Mail size={24} className={gmailStyles.actionIcon} onClick={() => handleAction('Mark Unread')} />
                                        <Clock size={24} className={gmailStyles.actionIcon} onClick={() => handleAction('Snooze')} />
                                        <div className={gmailStyles.toolbarDivider} />
                                        <div style={{ position: 'relative' }}>
                                            <div className={gmailStyles.actionIcon} onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'toolbar' ? null : 'toolbar'); }}>
                                                <MoreVertical size={24} />
                                            </div>
                                            {activeMenu === 'toolbar' && (
                                                <div className={gmailStyles.moreMenu} style={{ position: 'absolute', right: 0, top: '100%', background: '#1e2128', border: '1px solid #444', borderRadius: '8px', padding: '8px 0', zIndex: 100, width: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                                    <div className={gmailStyles.menuItem} onClick={() => handleAction('Mark Unread')} style={{ padding: '8px 16px', cursor: 'pointer', color: '#e3e3e3', fontSize: '14px' }}>Mark as unread</div>
                                                    <div className={gmailStyles.menuItem} onClick={() => handleAction('Mark Important')} style={{ padding: '8px 16px', cursor: 'pointer', color: '#e3e3e3', fontSize: '14px' }}>Mark as important</div>
                                                    <div className={gmailStyles.menuItem} onClick={() => handleAction('Add Star')} style={{ padding: '8px 16px', cursor: 'pointer', color: '#e3e3e3', fontSize: '14px' }}>Add star</div>
                                                    <div className={gmailStyles.menuItem} onClick={() => handleAction('Filter')} style={{ padding: '8px 16px', cursor: 'pointer', color: '#e3e3e3', fontSize: '14px' }}>Filter messages like this</div>
                                                    <div className={gmailStyles.menuItem} onClick={() => handleAction('Mute')} style={{ padding: '8px 16px', cursor: 'pointer', color: '#e3e3e3', fontSize: '14px' }}>Mute</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={gmailStyles.detailContent}>
                                        <h2 className={gmailStyles.detailSubject}>{selectedTicket.subject}</h2>

                                        {/* CONVERSATION THREAD */}
                                        <div className={gmailStyles.threadContainer}>
                                            {selectedTicket.messages.map((msg, index) => {
                                                const staffIdentifiers = ['Staff', 'Agent', 'Support', 'E-Advocate'];
                                                const isAgent = staffIdentifiers.some(id => msg.sender.includes(id));
                                                const isLast = index === selectedTicket.messages.length - 1;

                                                return (
                                                    <div key={index} className={`${gmailStyles.threadMessage} ${isLast ? gmailStyles.activeMessage : ''}`}>
                                                        <div className={gmailStyles.detailHeader}>
                                                            <div className={gmailStyles.avatar} style={{ background: isAgent ? '#3b82f6' : '#d97706' }}>
                                                                {msg.sender.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className={gmailStyles.headerInfo}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span className={gmailStyles.senderName}>{msg.sender}</span>
                                                                    <span className={gmailStyles.detailDate}>{formatDate(msg.timestamp)}</span>
                                                                </div>
                                                                <div className={gmailStyles.senderEmail}>
                                                                    <div style={{ color: '#9ea3ae', fontSize: '12px' }}>
                                                                        from: <span style={{ color: '#e3e3e3' }}>{isAgent ? `support@eadvocate.live` : selectedTicket.user}</span>
                                                                    </div>
                                                                    <div style={{ color: '#9ea3ae', fontSize: '12px', marginTop: '2px' }}>
                                                                        to: <span style={{ color: '#e3e3e3' }}>{isAgent ? selectedTicket.user : `support@eadvocate.live`}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={gmailStyles.headerActions}>
                                                                <div onClick={() => setIsReplying(true)} className={gmailStyles.actionIcon} title="Reply">
                                                                    <Reply size={18} />
                                                                </div>
                                                                <div className={gmailStyles.actionIcon} title="More">
                                                                    <MoreVertical size={18} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={gmailStyles.messageBody}>
                                                            <MessageContent text={msg.text} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {isReplying ? (
                                            <div className={gmailStyles.replySection}>
                                                <div className={gmailStyles.replyBox}>
                                                    <div className={gmailStyles.replyHeader}>
                                                        <Reply size={16} /> To: {selectedTicket.user}
                                                    </div>
                                                    <textarea
                                                        placeholder={`Reply to ${selectedTicket.user}`}
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className={gmailStyles.replyBoxActions}>
                                                        <button className={gmailStyles.sendBtn} onClick={handleReply} disabled={loading}>
                                                            {loading ? 'Sending...' : 'Send'}
                                                        </button>
                                                        <div style={{ display: 'flex', gap: '16px', color: '#9ea3ae', alignItems: 'center' }}>
                                                            <Paperclip size={20} style={{ cursor: 'pointer' }} />
                                                            <Type size={20} style={{ cursor: 'pointer' }} />
                                                            <Smile size={20} style={{ cursor: 'pointer' }} />
                                                            <div className={gmailStyles.vDivider} />
                                                            <Trash2 size={20} onClick={() => setIsReplying(false)} style={{ cursor: 'pointer' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={gmailStyles.bottomActions}>
                                                <button className={gmailStyles.actionBtn} onClick={() => setIsReplying(true)}>
                                                    <Reply size={18} /> Reply
                                                </button>
                                                <button className={gmailStyles.actionBtn} onClick={() => handleAction('Forward')}>
                                                    <Forward size={18} /> Forward
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Profiles':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Unified Member Directory</h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time oversight of all platform collaborators and clients.</p>
                            </div>
                            <button className={styles.goldActionBtn}><UserPlus size={18} /> Add Premium Member</button>
                        </div>

                        <div className={styles.statsStrip} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            {[
                                { label: 'Total Advocates', value: '452', icon: Briefcase, color: '#3b82f6' },
                                { label: 'Legal Experts', value: '128', icon: ShieldCheck, color: '#10b981' },
                                { label: 'Active Clients', value: '2,904', icon: Users, color: '#f59e0b' },
                                { label: 'Pending Verification', value: '14', icon: Activity, color: '#ef4444' }
                            ].map(s => (
                                <div key={s.label} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <s.icon size={20} color={s.color} />
                                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{s.value}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <tr>
                                        {['Member', 'Role', 'Status', 'Registration', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Dr. Sarah Wilson', role: 'Advocate', status: 'Verified', date: 'Feb 12, 2026' },
                                        { name: 'James Morrison', role: 'Legal Provider', status: 'Pending', date: 'Feb 14, 2026' },
                                        { name: 'Elena Rodriguez', role: 'Client', status: 'Verified', date: 'Jan 30, 2026' },
                                        { name: 'M. K. Gandhi', role: 'Advocate', status: 'Blocked', date: 'Feb 01, 2026' }
                                    ].map((m, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: '600' }}>{m.name}</td>
                                            <td style={{ padding: '16px 24px', color: '#9ea3ae' }}>{m.role}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    background: m.status === 'Verified' ? 'rgba(16,185,129,0.1)' : m.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: m.status === 'Verified' ? '#10b981' : m.status === 'Pending' ? '#f59e0b' : '#ef4444'
                                                }}>{m.status}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#64748b' }}>{m.date}</td>
                                            <td style={{ padding: '16px 24px' }}><button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>Review</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Queries':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <HelpCircle size={64} color="#facc15" style={{ opacity: 0.2, marginBottom: '24px' }} />
                            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Interactive Knowledge Base</h2>
                            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px' }}>
                                This terminal handles real-time web queries and AI-assisted troubleshooting for platform members.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
                                <div style={{ background: '#0f172a', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Globe size={24} color="#3b82f6" style={{ marginBottom: '16px' }} />
                                    <h4 style={{ marginBottom: '8px' }}>Web Inquiries</h4>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>08 New Requests from organic web traffic.</p>
                                </div>
                                <div style={{ background: '#0f172a', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ShieldAlert size={24} color="#ef4444" style={{ marginBottom: '16px' }} />
                                    <h4 style={{ marginBottom: '8px' }}>Security Reports</h4>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>System-wide reports requiring manual audit.</p>
                                </div>
                                <div style={{ background: '#0f172a', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Type size={24} color="#10b981" style={{ marginBottom: '16px' }} />
                                    <h4 style={{ marginBottom: '8px' }}>FAQ Engine</h4>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>Configure automated AI responses for common legal issues.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Chat Hub':
                return (
                    <div className={styles.pageContent} style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 180px)' }}>
                        <div style={{ width: '320px', background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Active Sessions</h3>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ padding: '16px 24px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#334155' }}></div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Session #{1032 + i}</div>
                                            <div style={{ fontSize: '12px', color: '#10b981' }}>Active now • Client</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <MessageSquare size={48} color="#64748b" style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <h3>Select a session to join the conversation</h3>
                                <p style={{ color: '#64748b', fontSize: '13px' }}>Real-time encrypted bridge for legal consultations.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'Settings':
                return (
                    <div className={styles.pageContent}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>System Configuration</h2>
                        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={18} color="#facc15" /> SMTP & IMAP Relay</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div><label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>HOST</label><input type="text" value="imap.gmail.com" readOnly style={{ width: '100%', background: '#1e293b', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', marginTop: '4px' }} /></div>
                                    <div><label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PORT</label><input type="text" value="993" readOnly style={{ width: '100%', background: '#1e293b', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', marginTop: '4px' }} /></div>
                                </div>
                            </div>
                            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}><ShieldCheck size={18} color="#10b981" /> Security & Access</h4>
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px' }}>ACTIVE SESSION PROFILE</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900' }}>
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{user?.name || 'Platform Representative'}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>Platform UID: {user?.loginId || user?.id || 'AUTH-PENDING'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>Two-Factor Authentication</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>Force 2FA for all support staff sessions.</div>
                                    </div>
                                    <div style={{ width: '40px', height: '20px', background: '#10b981', borderRadius: '20px', position: 'relative' }}><div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div></div>
                                </div>
                            </div>
                            <button className={styles.goldActionBtn} style={{ width: 'fit-content' }}>Save Configurations</button>
                        </div>
                    </div>
                );
            case 'Audit logs':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Personal Activity Forensic Trail</h2>
                            <button className={styles.goldActionBtn} onClick={fetchAgentLogs}><RotateCcw size={14} /> Refesh Logs</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>AGENT IDENTITY</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #facc15, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '12px' }}>
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{user?.name || 'Staff Member'}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>#{String(user?.loginId || user?.id || '').substring(0, 8)}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>DEPARTMENTAL ROLE</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Badge color="purple">{user?.role?.replace('_', ' ').toUpperCase() || 'SUPPORT'}</Badge>
                                    <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Online
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>TOTAL LOGS RECORDED</div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{agentLogs.length} Records</div>
                            </div>
                        </div>

                        <div className={styles.logTableContainer}>
                            <table className={styles.logTable}>
                                <thead>
                                    <tr>
                                        <th>TIME</th>
                                        <th>RECIPIENT / SUBJECT</th>
                                        <th>TYPE</th>
                                        <th>STATUS</th>
                                        <th>IP / DEVICE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Analyzing secure logs...</td></tr>
                                    ) : agentLogs.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No recorded activity found for this session.</td></tr>
                                    ) : agentLogs.map(log => (
                                        <tr key={log._id}>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>
                                                <div style={{ fontWeight: '700', color: '#fff' }}>{log.recipient}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{log.subject}</div>
                                            </td>
                                            <td>{log.action}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800',
                                                    background: log.status === 'Sent' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: log.status === 'Sent' ? '#10b981' : '#ef4444'
                                                }}>{log.status}</span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '12px' }}>{log.ipAddress || 'Internal'}</div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>{log.deviceInfo?.substring(0, 30)}...</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className={styles.emptyState}>
                        <AlertCircle size={48} />
                        <h3>Secure Extension Zone</h3>
                        <p>This module is currently initializing in your environment.</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.premiumDashboard}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <div className={styles.logoIcon}>E</div>
                    <div>
                        <h2>EADVOCATE</h2>
                        <small style={{ fontSize: '9px', color: '#64748b', fontWeight: '800', letterSpacing: '1px' }}>{roleName.toUpperCase()} HUB</small>
                    </div>
                </div>

                <button className={`${styles.navItem} ${styles.composeNavBtn}`} onClick={() => setIsComposeOpen(true)} style={{ background: '#fff', color: '#444746', width: 'fit-content', marginLeft: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                        <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#4285F4" />
                        <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#FBBC05" clipPath="inset(0 11px 11px 0)" />
                        <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#34A853" clipPath="inset(11px 0 0 11px)" />
                        <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#EA4335" clipPath="inset(11px 11px 0 0)" />
                    </svg>
                    Compose
                </button>

                <nav className={styles.sidebarNav}>
                    <button className={`${styles.navItem} ${activePage === 'Dashboard' ? styles.navActive : ''}`} onClick={() => setActivePage('Dashboard')}><Layout size={18} /> Dashboard</button>
                    <button className={`${styles.navItem} ${activePage === 'Emailing' ? styles.navActive : ''}`} onClick={() => setActivePage('Emailing')}><Mail size={18} /> Emailing</button>
                    <button className={`${styles.navItem} ${activePage === 'Profiles' ? styles.navActive : ''}`} onClick={() => setActivePage('Profiles')}><Users size={18} /> Profiles</button>
                    <button className={`${styles.navItem} ${activePage === 'Queries' ? styles.navActive : ''}`} onClick={() => setActivePage('Queries')}><HelpCircle size={18} /> Queries</button>
                    <button className={`${styles.navItem} ${activePage === 'Chat Hub' ? styles.navActive : ''}`} onClick={() => setActivePage('Chat Hub')}><MessageSquare size={18} /> Chat Hub</button>
                    <button className={`${styles.navItem} ${activePage === 'Settings' ? styles.navActive : ''}`} onClick={() => setActivePage('Settings')}><Settings size={18} /> Component Settings</button>

                    <div className={styles.navDivider}>EXTENSIONS</div>
                    <button className={`${styles.navItem} ${activePage === 'Resource Plan' ? styles.navActive : ''}`} onClick={() => setActivePage('Resource Plan')}><Briefcase size={18} /> Resource Plan</button>
                    <button className={`${styles.navItem} ${activePage === 'Audit logs' ? styles.navActive : ''}`} onClick={() => setActivePage('Audit logs')}><ShieldCheck size={18} /> Audit logs</button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #facc15, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#000', fontSize: '14px' }}>
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || user?.email}</div>
                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>{roleName}</div>
                            </div>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={18} /> End Session</button>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>v4.2.0-SECURE</div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={styles.mainContainer}>
                <header className={styles.headerRow}>
                    <div>
                        <h1 className={styles.pageTitle}>{activePage}</h1>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>Welcome back {user?.name || user?.email} ({roleName})</p>
                    </div>
                    <div className={styles.topActions}>
                        {activePage !== 'Emailing' && (
                            <div className={styles.segmentedControl}>
                                {['All', 'Advocates', 'Legal Providers', 'Clients'].map(f => (
                                    <button key={f} className={activeTopFilter === f ? styles.segmentActive : ''} onClick={() => setActiveTopFilter(f)}>{f}</button>
                                ))}
                            </div>
                        )}
                        <div className={styles.searchBar}>
                            <Search size={16} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Scan records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={styles.goldActionBtn} onClick={fetchData}><RotateCcw size={14} className={loading ? 'animate-spin' : ''} /></button>
                    </div>
                </header>

                {activePage !== 'Emailing' && (
                    <div className={styles.secondaryFilterBar}>
                        <div className={styles.statusPills}>
                            {['All Members', 'Verified', 'Unverified'].map(p => (
                                <button key={p} className={`${styles.statusPill} ${activeStatusFilter === p ? styles.pillActive : ''}`} onClick={() => setActiveStatusFilter(p)}>{p}</button>
                            ))}
                        </div>
                        <div className={styles.utilityGroup}>
                            <button className={styles.utilBtn}><Download size={14} /> Export</button>
                            <button className={styles.bulkBtn}><Users size={14} /> Bulk</button>
                        </div>
                    </div>
                )}

                {renderPageContent()}
            </main>

            {/* GLOBAL COMPOSE MODAL */}
            {isComposeOpen && (
                <div
                    ref={composeRef}
                    className={styles.composePopup}
                    style={{
                        ...(isMaximized ? { top: 0, left: 0, width: '100vw', height: '100vh', transform: 'none' } :
                            isMinimized ? { height: '40px', overflow: 'hidden', width: '260px', top: 'auto', bottom: 0, right: '80px', transform: 'none' } :
                                composePos.x !== 0 ? { top: composePos.y, left: composePos.x, bottom: 'auto', right: 'auto', margin: 0 } : {})
                    }}
                >
                    <div className={styles.composeHeader} onMouseDown={startDrag} style={{ cursor: isMaximized ? 'default' : 'grab' }}>
                        <span>Direct Secure Transmission</span>
                        <div className={styles.headerActions}>
                            <Minus size={16} onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ cursor: 'pointer' }} />
                            <Maximize2 size={14} onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); setIsMinimized(false); }} style={{ cursor: 'pointer' }} />
                            <X size={16} onClick={() => setIsComposeOpen(false)} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                    {!isMinimized && (
                        <>
                            <div className={styles.composeBody}>
                                <input className={styles.inputField} placeholder="To (Recipient Email)" value={to} onChange={(e) => setTo(e.target.value)} />
                                <input className={styles.inputField} placeholder="Subject Line" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                {showFormatTools && (
                                    <div style={{ display: 'flex', gap: '8px', padding: '4px 12px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <button onClick={() => insertIntoBody('**bold** ')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
                                        <button onClick={() => insertIntoBody('_italic_ ')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
                                        <button onClick={() => insertIntoBody('__underline__ ')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textDecoration: 'underline' }}>U</button>
                                    </div>
                                )}
                                <textarea className={styles.editorArea} placeholder="Type your secure message here..." value={body} onChange={(e) => setBody(e.target.value)} />
                            </div>
                            <div className={styles.gmailToolbar}>
                                <button className={styles.gmailSendBtn} onClick={handleSendEmail} disabled={loading}>{loading ? 'Relaying...' : 'Send'}</button>
                                <div className={styles.toolbarIcons} style={{ display: 'flex', gap: '16px' }}>
                                    <div onClick={() => setShowFormatTools(!showFormatTools)} title="Formatting options" style={{ cursor: 'pointer', color: showFormatTools ? '#3b82f6' : 'inherit' }}><Type size={18} /></div>
                                    <div onClick={() => fileInputRef.current?.click()} title="Attach files" style={{ cursor: 'pointer' }}><Paperclip size={18} /></div>
                                    <div onClick={() => { const link = prompt('Enter URL:'); if (link) insertIntoBody(` ${link} `); }} title="Insert link" style={{ cursor: 'pointer' }}><Link size={18} /></div>
                                    <div onClick={() => insertIntoBody(' 🙂 ')} title="Insert emoji" style={{ cursor: 'pointer' }}><Smile size={18} /></div>
                                    <div onClick={() => imageInputRef.current?.click()} title="Insert photo" style={{ cursor: 'pointer' }}><ImageIcon size={18} /></div>
                                    <div onClick={() => setIsConfidential(!isConfidential)} title="Toggle confidential mode" style={{ cursor: 'pointer', color: isConfidential ? '#ef4444' : 'inherit' }}><Lock size={18} /></div>

                                    {/* Hidden Inputs */}
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
                                    <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
                                </div>
                                <div className={styles.discardBtn} onClick={() => { setBody(''); setSubject(''); setTo(''); setIsComposeOpen(false); }} title="Discard draft" style={{ cursor: 'pointer' }}><Trash2 size={18} /></div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmailSupport;
