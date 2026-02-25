import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    ArrowLeft, Menu as MenuIcon, LayoutGrid, Square, Archive, Zap
} from 'lucide-react';
import gmailStyles from '../../../staff/roles/GmailMailbox.module.css';
import { useAuth } from '../../../../context/AuthContext';
import StaffLayout from '../../../../layouts/StaffLayout';

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
    priority?: string;
    createdAt: string;
    updatedAt?: string;
    folder?: string;
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
    const [syncLogs, setSyncLogs] = useState<string[]>([]);
    const [showSyncConsole, setShowSyncConsole] = useState(false);

    // Acknowledgments for segment tracking
    console.log("[Segment: Lifecycle] EmailSupport Component Initialized.");
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activePage = (searchParams.get('view') || 'Emailing') as any;
    const setActivePage = (page: string) => setSearchParams({ view: page });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentFolder, setCurrentFolder] = useState('Inbox');
    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [agentLogs, setAgentLogs] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [starredIds, setStarredIds] = useState<string[]>([]);
    const [ticketFolders, setTicketFolders] = useState<Record<string, string>>({});
    const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);

    // Acknowledgment Segment: Initialization & Lifecycle
    useEffect(() => {
        console.log("[Segment: Initialization] Email Support Component Ready.");
        fetchData();
        fetchAgentLogs();

        // Real-time listener for new emails
        const handleNewEmail = () => {
            console.log('✅ [Segment: Real-time] New email notification received via socket');
            fetchData();
        };

        window.addEventListener('support:new-email', handleNewEmail);

        // Polling as a fallback (every 60s)
        const interval = setInterval(() => {
            console.log("[Segment: Auto-Sync] Triggering background synchronization...");
            handleSync(false);
        }, 60000);

        return () => {
            window.removeEventListener('support:new-email', handleNewEmail);
            clearInterval(interval);
        };
    }, []);

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
    const [stats, setStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        solvedTickets: 0,
        totalEmailsSentToday: 0,
        totalUsers: 0,
        spamTickets: 0,
        binTickets: 0
    });
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
    const [activeMenu, setActiveMenu] = useState<string | null>(null); // 'toolbar' | 'header'

    const fetchData = async () => {
        console.log("[Segment: Data Fetch] Requesting comprehensive support metrics...");
        setLoading(true);
        try {
            const [ticketRes, statRes, activityRes, analyticsRes, userRes] = await Promise.all([
                api.get('/support/tickets'),
                api.get('/support/stats'),
                api.get('/support/activities', { params: { limit: 50 } }),
                api.get('/support/analytics'),
                api.get('/admin/members', { params: { limit: 20 } }).catch(() => ({ data: { success: false } }))
            ]);

            if (ticketRes.data.success) {
                console.log(`✅ [Segment: Data Fetch] Tickets retrieved: ${ticketRes.data.tickets.length}`);
                setTickets(ticketRes.data.tickets);
            }
            if (statRes.data.success) {
                console.log(`✅ [Segment: Data Fetch] Stats synchronized.`);
                setStats(statRes.data.stats);
            }
            if (activityRes.data.success) setAllActivities(activityRes.data.logs);
            if (analyticsRes.data.success) setAnalyticsData(analyticsRes.data.analytics);
            if (userRes.data.success) setRealUsers(userRes.data.members);
            else if (!userRes.data.members) {
                const staffRes = await api.get('/support/agents/email-support');
                if (staffRes.data.success) setRealUsers(staffRes.data.agents);
            }
        } catch (err) {
            console.error("❌ [Segment: Data Fetch] Segment failure:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgentLogs = async () => {
        if (!user) return;
        console.log("[Segment: Logs] Fetching agent-specific audit trail...");
        setLoading(true);
        try {
            const res = await api.get('/support/activities', {
                params: { agentId: user.loginId || user.id, limit: 100 }
            });
            if (res.data.success) {
                console.log(`✅ [Segment: Logs] Retrieved ${res.data.logs.length} activity records.`);
                const uniqueLogs = res.data.logs.reduce((acc: any[], curr: any) => {
                    if (!acc.find(l => l._id === curr._id)) acc.push(curr);
                    return acc;
                }, []);
                setAgentLogs(uniqueLogs);
            }
        } catch (err) {
            console.error("❌ [Segment: Logs] Audit trail fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };


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
            const formData = new FormData();
            formData.append('role', 'manual');
            formData.append('targetEmail', to);
            formData.append('subject', subject);
            formData.append('message', body);
            selectedFiles.forEach(file => {
                formData.append('attachments', file);
            });

            await api.post('/support/send-bulk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Email dispatched successfully via secure SMTP.');
            setIsComposeOpen(false);
            setTo('');
            setSubject('');
            setBody('');
            setSelectedFiles([]);
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
        console.log(`[Segment: Email Sync] ${isManual ? 'Manual' : 'Automated'} sync initiated.`);
        setLoading(isManual);
        try {
            const res = await api.get('/support/sync');
            if (isManual) {
                if (res.data.success) {
                    console.log(`✅ [Segment: Email Sync] Process completed with ${res.data.count} updates.`);
                    setSyncLogs(res.data.logs || []);
                    if (res.data.count > 0) {
                        alert(`Inbox Updated: ${res.data.count} new message(s) retrieved.`);
                        fetchData();
                    } else {
                        setShowSyncConsole(true);
                    }
                } else if (res.data.error) {
                    console.warn(`⚠️ [Segment: Email Sync] Warning: ${res.data.error}`);
                    setSyncLogs(res.data.logs || []);
                    setShowSyncConsole(true);
                    alert('Sync Warning: ' + res.data.error);
                }
            } else if (res.data.success && res.data.count > 0) {
                console.log(`✅ [Segment: Email Sync] Silent sync retrieved ${res.data.count} items.`);
                fetchData();
            }
        } catch (err) {
            console.error("❌ [Segment: Email Sync] Critical failure:", err);
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

    const getFolder = (t: Ticket) => t.folder || ticketFolders[t.id] || 'Inbox';

    const filteredTickets = tickets.filter(t => {
        const folder = getFolder(t);
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (folder === 'Bin' || folder === 'Spam') {
            if (currentFolder === folder) return matchesSearch;
            return false;
        }

        if (currentFolder === 'Inbox') {
            const hasUserMsg = t.messages.some(m => !(['Staff', 'Agent', 'Support', 'E-Advocate'].some(id => m.sender.includes(id))));
            const isActiveStatus = ['Open', 'New Reply', 'In Progress'].includes(t.status);
            return folder === 'Inbox' && (hasUserMsg || isActiveStatus);
        }
        if (currentFolder === 'Starred') return starredIds.includes(t.id);
        if (currentFolder === 'Important') return t.status === 'New Reply';
        if (currentFolder === 'Sent') {
            return t.messages.some(m => ['Staff', 'Agent', 'Support', 'E-Advocate'].some(role => m.sender.includes(role)));
        }

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
            const folder = getFolder(t);
            if (folder === 'Bin') { counts.Bin++; return; }
            if (folder === 'Spam') return;

            const hasUserMsg = t.messages.some(m => !(['Staff', 'Agent', 'Support', 'E-Advocate'].some(id => m.sender.includes(id))));
            const isActiveStatus = ['Open', 'New Reply', 'In Progress'].includes(t.status);

            if (folder === 'Inbox' && (hasUserMsg || isActiveStatus)) counts.Inbox++;
            if (starredIds.includes(t.id)) counts.Starred++;
            if (t.messages.some(m => ['Staff', 'Agent', 'Support', 'E-Advocate'].some(role => m.sender.includes(role)))) counts.Sent++;
            if (t.status === 'New Reply') counts.Important++;
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
        if (activePage === 'Analytics' || activePage === 'Dashboard') {
            const totalSentEmails = analyticsData?.dailyStats?.reduce((acc: any, curr: any) => acc + curr.sent, 0) || folderCounts.Sent;

            return (
                <div className={styles.pageContent}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '16px' }}>
                        {[
                            { label: 'Sent Today', value: analyticsData?.dailyStats?.[0]?.sent || 0, color: '#facc15', trend: 'Live', icon: Send },
                            { label: 'Total Sent', value: totalSentEmails || 0, color: '#3b82f6', trend: 'Logs', icon: Globe },
                            { label: 'Members', value: stats.totalUsers || 0, color: '#f59e0b', trend: 'Pop', icon: Users },
                            { label: 'Resolved', value: stats.solvedTickets || 0, color: '#10b981', trend: 'Solved', icon: ShieldCheck },
                            { label: 'Pending', value: stats.openTickets || 0, color: '#ef4444', trend: 'Wait', icon: Clock },
                            { label: 'Response', value: '1.2h', color: '#8b5cf6', trend: 'Avg', icon: Zap },
                            { label: 'Health', value: '100%', color: '#6366f1', trend: 'Stable', icon: Activity }
                        ].map(stat => (
                            <div
                                key={stat.label}
                                style={{
                                    background: '#0b0f19',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '85px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = stat.color + '60';
                                    e.currentTarget.style.background = '#0f172a';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.background = '#0b0f19';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                                    <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.6px', lineHeight: '1' }}>{stat.label}</div>
                                    <stat.icon size={14} color={stat.color} style={{ opacity: 0.6 }} />
                                </div>
                                <div style={{ zIndex: 1 }}>
                                    <div style={{ fontSize: '28px', fontWeight: '950', color: '#fff', lineHeight: '1', fontFamily: 'monospace' }}>{stat.value}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: stat.color }}></div>
                                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>{stat.trend}</span>
                                    </div>
                                </div>
                                {/* Subtle Background Accent */}
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '40px', height: '40px', background: stat.color, filter: 'blur(30px)', opacity: 0.05 }}></div>
                            </div>
                        ))}
                    </div>
                    {activePage === 'Dashboard' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Briefcase size={14} color="#3b82f6" /> Distribution Metrics
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {[
                                        { key: 'Inbox', val: folderCounts.Inbox, color: '#3b82f6' },
                                        { key: 'Starred', val: folderCounts.Starred, color: '#facc15' },
                                        { key: 'Sent', val: folderCounts.Sent, color: '#10b981' },
                                        { key: 'Important', val: folderCounts.Important, color: '#ef4444' },
                                        { key: 'Bin', val: folderCounts.Bin, color: '#64748b' },
                                        { key: 'Total Users', val: stats.totalUsers, color: '#8b5cf6' }
                                    ].map(item => (
                                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{item.key}</div>
                                            <div style={{ fontSize: '12px', fontWeight: '800', color: item.color }}>{item.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Activity size={14} color="#10b981" /> Resolution Profile
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Solved Tickets</span>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>{stats.solvedTickets}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Overall Success</span>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b' }}>{stats.totalTickets > 0 ? ((stats.solvedTickets / stats.totalTickets) * 100).toFixed(1) : '0'}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${stats.totalTickets > 0 ? (stats.solvedTickets / stats.totalTickets) * 100 : 0}%`, height: '100%', background: '#10b981' }}></div>
                                    </div>
                                    <div style={{ marginTop: '4px', padding: '8px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                        <p style={{ margin: 0, fontSize: '10px', color: '#3b82f6', fontWeight: '600', textAlign: 'center' }}>SMTP/IMAP RELAY STABLE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ background: '#0b0f19', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Recent Performance Trends (Analytics)</h3>
                            <p style={{ color: '#64748b', fontSize: '13px' }}>Daily transmission and system health metrics.</p>
                        </div>

                        {analyticsData ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#94a3b8' }}>Transmission Volume (Last 7 Days)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {analyticsData.dailyStats?.map((day: any) => (
                                            <div key={day._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '80px', fontSize: '11px', color: '#64748b' }}>{day._id.split('-').slice(1).join('/')}</div>
                                                <div style={{ flex: 1, height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                                                    <div style={{ width: `${(day.sent / (day.sent + day.failed || 1)) * 100}%`, background: '#10b981' }}></div>
                                                </div>
                                                <div style={{ width: '40px', fontSize: '11px', fontWeight: '800', textAlign: 'right' }}>{day.sent}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#94a3b8' }}>Agent Productivity Output</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {analyticsData.agentStats?.map((agent: any) => (
                                            <div key={agent._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>{agent._id}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#3b82f6' }}>{agent.count} Actions</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <Activity size={48} color="#3b82f6" style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <h3 style={{ color: '#64748b' }}>Enhanced Analytics Visualizations Loading...</h3>
                                <p style={{ fontSize: '12px', color: '#4b5563' }}>Real-time telemetry from SMTP and Chat Hub nodes.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        switch (activePage) {
            case 'Emailing':
                if (selectedTicket) {
                    return (
                        <div className={gmailStyles.emailDetail} style={{ background: 'transparent', height: '100%', overflowY: 'auto' }}>
                            <div className={gmailStyles.detailToolbar} style={{ padding: '12px 24px', position: 'sticky', top: 0, background: '#0f172a', zIndex: 10 }}>
                                <div className={gmailStyles.actionIcon} onClick={() => setSelectedTicket(null)}><ArrowLeft size={18} /></div>
                                <div className={gmailStyles.toolbarDivider} />
                                <div className={gmailStyles.actionIcon} onClick={() => handleAction('Archive')}><Archive size={18} /></div>
                                <div className={gmailStyles.actionIcon} onClick={() => handleAction('Report Spam')}><AlertCircle size={18} /></div>
                                <div className={gmailStyles.actionIcon} onClick={() => handleAction('Delete')}><Trash2 size={18} /></div>
                            </div>

                            <div className={gmailStyles.detailContent} style={{ padding: '0 32px 100px' }}>
                                <h2 className={gmailStyles.detailSubject} style={{ padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '22px', fontWeight: '400' }}>{selectedTicket.subject}</h2>

                                <div className={gmailStyles.threadContainer}>
                                    {selectedTicket.messages.map((msg, idx) => {
                                        const isStaff = ['Staff', 'Agent', 'Support', 'E-Advocate'].some(id => msg.sender.includes(id));
                                        return (
                                            <div key={idx} className={gmailStyles.threadMessage} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '24px 0' }}>
                                                <div className={gmailStyles.detailHeader} style={{ display: 'flex', gap: '16px' }}>
                                                    <div className={gmailStyles.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', background: isStaff ? '#3b82f6' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }}>{msg.sender.charAt(0)}</div>
                                                    <div className={gmailStyles.headerInfo} style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span className={gmailStyles.senderName} style={{ fontWeight: '700' }}>{msg.sender}</span>
                                                            <span className={gmailStyles.detailDate} style={{ fontSize: '12px', color: '#64748b' }}>{new Date(msg.timestamp).toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                            from: <span style={{ color: '#9ea3ae' }}>{isStaff ? 'support@eadvocate.live' : selectedTicket.user}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={gmailStyles.messageBody} style={{ paddingLeft: '56px', marginTop: '16px', lineHeight: '1.6', color: '#e2e8f0' }}>
                                                    <MessageContent text={msg.text} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {isReplying ? (
                                    <div className={gmailStyles.replySection} style={{ marginTop: '32px', background: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                                        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>To: {selectedTicket.user}</div>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            style={{ width: '100%', minHeight: '200px', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', resize: 'vertical', outline: 'none' }}
                                            placeholder="Type your message here..."
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button className={gmailStyles.sendBtn} onClick={handleReply} disabled={loading} style={{ background: '#3b82f6', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                                    {loading ? 'Sending...' : 'Send'}
                                                </button>
                                                <button className={gmailStyles.actionBtn} onClick={() => setIsReplying(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', color: '#64748b' }}>
                                                <Paperclip size={20} style={{ cursor: 'pointer' }} />
                                                <ImageIcon size={20} style={{ cursor: 'pointer' }} />
                                                <Link size={20} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                        <button className={gmailStyles.actionBtn} onClick={() => setIsReplying(true)} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '10px 24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                            <Reply size={18} /> Reply
                                        </button>
                                        <button className={gmailStyles.actionBtn} onClick={() => handleAction('Forward')} style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                            <Forward size={18} /> Forward
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                return (
                    <div className={gmailStyles.mainContent} style={{ height: '100%', overflowY: 'auto' }}>
                        {/* TOOLBAR */}
                        <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: '#0b0f19', zIndex: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div onClick={toggleSelectAll} style={{ cursor: 'pointer' }}>
                                    <Square size={16} color="#4b5563" fill={selectedEmailIds.length > 0 ? "#4b5563" : "none"} />
                                </div>
                                <RotateCcw size={16} color="#4b5563" onClick={() => handleSync(true)} className={loading ? gmailStyles.spin : ''} style={{ cursor: 'pointer' }} />
                                {selectedEmailIds.length > 0 && (
                                    <>
                                        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.05)' }} />
                                        <Archive size={16} color="#4b5563" style={{ cursor: 'pointer' }} onClick={() => handleBulkAction('Archive')} />
                                        <AlertCircle size={16} color="#4b5563" style={{ cursor: 'pointer' }} onClick={() => handleBulkAction('Report Spam')} />
                                        <Trash2 size={16} color="#4b5563" style={{ cursor: 'pointer' }} onClick={() => handleBulkAction('Delete')} />
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
                                <span>{filteredTickets.length > 0 ? `1-${filteredTickets.length} of ${filteredTickets.length}` : '1-0 of 0'}</span>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <ChevronLeft size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
                                    <ChevronRight size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>

                        {/* INBOX TABS */}
                        {currentFolder === 'Inbox' && (
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 16px', background: '#0b0f19' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderBottom: '2px solid #facc15', color: '#facc15', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                                    <Inbox size={16} /> Primary
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                                    <Info size={16} /> Updates
                                </div>
                            </div>
                        )}

                        {/* LIST OR EMPTY STATE */}
                        <div style={{ background: '#0b0f19', minHeight: 'calc(100vh - 350px)' }}>
                            {filteredTickets.length > 0 ? filteredTickets.map(t => (
                                <div key={t.id} className={`${gmailStyles.emailItem} ${t.status === 'New Reply' ? gmailStyles.unread : ''}`} onClick={() => setSelectedTicket(t)} style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.2s' }}>
                                    <div onClick={(e) => toggleEmailSelection(t.id, e)} style={{ marginRight: '16px' }}>
                                        <Square size={18} color="#4b5262" fill={selectedEmailIds.includes(t.id) ? "#9ea3ae" : "none"} />
                                    </div>
                                    <div onClick={(e) => toggleStar(t.id, e)} style={{ marginRight: '20px' }}>
                                        <Star size={18} color={starredIds.includes(t.id) ? "#facc15" : "#4b5262"} fill={starredIds.includes(t.id) ? "#facc15" : "none"} />
                                    </div>
                                    <div style={{ minWidth: '200px', fontWeight: t.status === 'New Reply' ? '700' : '400', color: t.status === 'New Reply' ? '#fff' : '#94a3b8' }}>
                                        {currentFolder === 'Sent' ? `To: ${t.user.split('@')[0]}` : t.user.split('@')[0]}
                                    </div>
                                    <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 24px' }}>
                                        <span style={{ color: '#e2e8f0', fontWeight: t.status === 'New Reply' ? '700' : '500' }}>{t.subject}</span>
                                        <span style={{ color: '#64748b', marginLeft: '8px' }}>— {t.messages[t.messages.length - 1]?.text.substring(0, 100)}...</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', minWidth: '100px', textAlign: 'right' }}>
                                        {new Date(t.updatedAt || t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: '#4b5563' }}>
                                    <Mail size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                    <p style={{ fontSize: '14px', margin: 0 }}>No queries found in {currentFolder}</p>
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

            case 'Users':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Client Management</h2>
                            <button className={styles.gmailSendBtn} style={{ borderRadius: '12px' }}><Plus size={18} /> Add Client</button>
                        </div>
                        <div className={styles.clientGrid}>
                            {realUsers.length > 0 ? realUsers.map((u: any) => (
                                <div key={u.id || u._id} className={styles.clientCard} style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: u.role === 'admin' ? '#ef4444' : u.role === 'staff' ? '#3b82f6' : '#10b981', color: '#fff', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', borderRadius: '0 0 0 12px' }}>
                                        {u.role}
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#3b82f6' }}>
                                            {u.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || 'Anonymous User'}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}>
                                                <Mail size={12} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '700' }}>UNIQUE ID</span>
                                            <span style={{ fontSize: '11px', color: '#fff', fontWeight: '800', fontFamily: 'monospace' }}>{u.unique_id || 'UID-' + (u.id?.slice(-6) || u._id?.slice(-6))}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '700' }}>PHONE</span>
                                            <span style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: '600' }}>{u.phone || '--'}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.status === 'Active' ? '#10b981' : '#f59e0b' }}></div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: u.status === 'Active' ? '#10b981' : '#f59e0b' }}>{u.status || 'Active'}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => { setTo(u.email); setIsComposeOpen(true); }}
                                                style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                                            >
                                                Message
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px 0', opacity: 0.5 }}>
                                    <Users size={48} style={{ marginBottom: '16px' }} />
                                    <p>No active sessions or members found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'Tasks':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Task Management</h2>
                            <button className={styles.gmailSendBtn} style={{ borderRadius: '12px' }}><Plus size={18} /> Create Task</button>
                        </div>
                        <div className={styles.taskContainer}>
                            {tickets.filter(t => t.status !== 'Solved' && t.status !== 'Bin').length > 0 ? (
                                tickets.filter(t => t.status !== 'Solved' && t.status !== 'Bin').map(t => (
                                    <div key={t.id} className={styles.taskItem} onClick={() => { setActivePage('Emailing'); setSelectedTicket(t); }}>
                                        <div className={`${styles.taskCheckbox} ${t.status === 'Solved' ? styles.taskChecked : ''}`}>
                                            {t.status === 'Solved' && <ShieldCheck size={14} color="#fff" />}
                                        </div>
                                        <div className={styles.taskMain}>
                                            <div className={styles.taskHeaderRow}>
                                                <h4 style={{ textDecoration: t.status === 'Solved' ? 'line-through' : 'none', opacity: t.status === 'Solved' ? 0.5 : 1 }}>{t.subject}</h4>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <span className={`${styles.actionBadge} ${t.priority === 'High' ? styles.badgeHigh : styles.badgeLow}`}>
                                                        {t.priority || 'Normal'}
                                                    </span>
                                                    <Badge color={t.status === 'Solved' ? 'green' : t.status === 'Open' ? 'gray' : 'blue'}>{t.status}</Badge>
                                                </div>
                                            </div>
                                            <p className={styles.taskDesc}>{t.messages[t.messages.length - 1]?.text.substring(0, 100)}...</p>
                                            <div className={styles.taskFooter}>
                                                <div className={styles.footerPart}>{t.user}</div>
                                                <div className={styles.footerPart}>Enquiry ID: {t.id}</div>
                                                <div className={styles.footerPart}>Last Activity: {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                                    <ShieldCheck size={48} style={{ marginBottom: '16px' }} />
                                    <p>No active tasks or pending tickets.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'Activity Log':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Audit Trail & Activity Logs</h2>
                            <div style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                                <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} className="animate-pulse"></div> Live Updates
                            </div>
                        </div>
                        <div className={styles.auditTableWrapper}>
                            <table className={styles.auditTable}>
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                        <th>IP Address</th>
                                        <th>Device</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allActivities.length > 0 ? allActivities.map((l, i) => (
                                        <tr key={l._id || i}>
                                            <td style={{ color: '#64748b' }}>{new Date(l.timestamp).toLocaleString()}</td>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <span className={styles.userName}>{l.agentName || l.sentByAgentName}</span>
                                                    <span className={styles.userId}>{l.sentByAgentId?.slice(-6) || 'AGENT'}</span>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.actionBadge} ${l.type === 'Broadcast' ? styles.badgeSent : l.type === 'Direct Email' ? styles.badgeCompleted : styles.badgeViewed}`}>{l.action}</span></td>
                                            <td style={{ color: '#94a3b8' }}>
                                                <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>{l.subject}</div>
                                                <div style={{ fontSize: '12px' }}>to: {l.recipient}</div>
                                            </td>
                                            <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{l.ipAddress || 'Internal'}</td>
                                            <td style={{ color: '#64748b' }}>{l.status}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>No activities recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`${styles.premiumDashboard} ${gmailStyles.darkTheme}`} style={{ padding: '0', height: '100vh', overflow: 'hidden' }}>

            {/* MAIN CONTENT */}
            <main className={styles.mainContainer} style={{ padding: '0 24px 24px' }}>
                {/* UNIFIED TOP SECTION */}
                <div style={{
                    background: '#111827',
                    borderRadius: '24px',
                    padding: '16px 24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '20px',
                    marginTop: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '16px', padding: '6px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onClick={() => setIsComposeOpen(true)}>
                                <Plus size={16} strokeWidth={3} /> Compose
                            </button>

                            <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {[
                                    { id: 'Emailing', icon: Inbox, label: 'Inbox', folder: 'Inbox' },
                                    { id: 'Emailing', icon: Star, label: 'Starred', folder: 'Starred' },
                                    { id: 'Emailing', icon: Send, label: 'Sent', folder: 'Sent' },
                                    { id: 'Emailing', icon: Tag, label: 'Important', folder: 'Important' },
                                ].map(item => {
                                    const isActive = activePage === 'Emailing' && currentFolder === item.folder;
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => { setActivePage('Emailing'); setCurrentFolder(item.folder); setSelectedTicket(null); }}
                                            style={{
                                                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                border: 'none',
                                                color: isActive ? '#3b82f6' : '#94a3b8',
                                                borderRadius: '12px',
                                                padding: '6px 14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '12px',
                                                fontWeight: isActive ? '700' : '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <item.icon size={14} /> {item.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className={styles.searchBar} style={{ maxWidth: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Search size={14} color="#64748b" />
                            <input
                                placeholder="Search command..."
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', width: '100%' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

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
                            <Minus size={16} onClick={(e: any) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ cursor: 'pointer' }} />
                            <Maximize2 size={14} onClick={(e: any) => { e.stopPropagation(); setIsMaximized(!isMaximized); setIsMinimized(false); }} style={{ cursor: 'pointer' }} />
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
                                {selectedFiles.length > 0 && (
                                    <div style={{ padding: '8px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>
                                                <Paperclip size={12} />
                                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                                <X size={12} onClick={() => removeFile(idx)} style={{ cursor: 'pointer', color: '#ef4444' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
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
