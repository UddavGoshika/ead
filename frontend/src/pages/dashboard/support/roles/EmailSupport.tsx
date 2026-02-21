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
    priority?: string;
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
    const [activePage, setActivePage] = useState<'Emailing' | 'Dashboard' | 'Audit logs' | 'Profiles' | 'Queries' | 'Chat Hub' | 'Settings' | 'Resource Plan' | 'Users' | 'Tasks' | 'Analytics' | 'Activity Log'>('Emailing');
    const [currentView, setCurrentView] = useState<'Emailing' | 'Users' | 'Tasks' | 'Analytics' | 'Activity Log'>('Emailing');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentFolder, setCurrentFolder] = useState('Dashboard');

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
    const [starredIds, setStarredIds] = useState<string[]>([]);
    const [ticketFolders, setTicketFolders] = useState<{ [key: string]: string }>({}); // Track folder location per ticket
    const [activeMenu, setActiveMenu] = useState<string | null>(null); // 'toolbar' | 'header'
    const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]); // Multi-select state

    // Compose State (Global Popup)
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [agentLogs, setAgentLogs] = useState<any[]>([]);

    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketRes, statRes, activityRes, analyticsRes, userRes] = await Promise.all([
                api.get('/support/tickets'),
                api.get('/support/stats'),
                api.get('/support/activities', { params: { limit: 50 } }),
                api.get('/support/analytics'),
                api.get('/admin/members', { params: { limit: 20 } }).catch(() => ({ data: { success: false } })) // Admin check
            ]);

            if (ticketRes.data.success) setTickets(ticketRes.data.tickets);
            if (statRes.data.success) setStats(statRes.data.stats);
            if (activityRes.data.success) setAllActivities(activityRes.data.logs);
            if (analyticsRes.data.success) setAnalyticsData(analyticsRes.data.analytics);
            if (userRes.data.success) setRealUsers(userRes.data.members);
            else if (!userRes.data.members) {
                // Fallback to staff only if admin listing fails
                const staffRes = await api.get('/support/agents/email-support');
                if (staffRes.data.success) setRealUsers(staffRes.data.agents);
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
            case 'Emailing':
                if (currentFolder === 'Dashboard') {
                    return (
                        <div className={styles.pageContent} style={{ marginTop: '0' }}>
                            {/* Performance Analytics Section */}
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div style={{ flex: 2, background: '#0f172a', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '800' }}>Performance Analytics</h3>
                                    <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px' }}>
                                        {analyticsData ? (
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%', padding: '0 20px' }}>
                                                {analyticsData.dailyStats?.map((day: any) => {
                                                    const maxSent = Math.max(...analyticsData.dailyStats.map((d: any) => d.sent), 10);
                                                    return (
                                                        <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                            <div
                                                                title={`Sent: ${day.sent}`}
                                                                style={{
                                                                    width: '100%',
                                                                    background: '#3b82f6',
                                                                    height: `${(day.sent / maxSent) * 100}%`,
                                                                    borderRadius: '4px 4px 0 0',
                                                                    minHeight: '4px',
                                                                    transition: 'height 0.3s ease'
                                                                }}
                                                            ></div>
                                                            <div style={{ fontSize: '10px', color: '#64748b' }}>{day._id.split('-')[2]}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                                Metrics Syncing...
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ flex: 1, background: '#0f172a', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '800' }}>Quick Actions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button className={styles.navItem} onClick={() => { setIsComposeOpen(true); setSubject('[Broadcast] '); }} style={{ background: 'rgba(255,255,255,0.03)', justifyContent: 'flex-start' }}><Plus size={16} /> New Broadcast</button>
                                        <button className={styles.navItem} onClick={() => setActivePage('Analytics')} style={{ background: 'rgba(255,255,255,0.03)', justifyContent: 'flex-start' }}><Activity size={16} /> Performance Review</button>
                                        <button className={styles.navItem} onClick={() => handleSync(true)} style={{ background: 'rgba(255,255,255,0.03)', justifyContent: 'flex-start' }}><RotateCcw size={16} /> Force Sync Inbox</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (currentFolder === 'Audit logs') {
                    return (
                        <div className={styles.pageContent}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Personal Activity Forensic Trail</h2>
                                <button className={styles.goldActionBtn} onClick={fetchAgentLogs}><RotateCcw size={14} /> Refresh Logs</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>AGENT IDENTITY</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #facc15, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '12px' }}>
                                            {user?.name?.charAt(0).toUpperCase() || 'A'}
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
                }

                return (
                    <div className={gmailStyles.mainContent} style={{ border: 'none', boxShadow: 'none', background: 'transparent', height: '100%' }}>
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
                                            </div>
                                            <div className={gmailStyles.emailSender}>{t.user?.split('@')[0]}</div>
                                            <div className={gmailStyles.emailSubjectContainer}>
                                                <span className={gmailStyles.emailSubject}>{t.subject}</span>
                                                <span className={gmailStyles.emailSnippet}> — Platform Enquiry #{t.id.slice(-4)}</span>
                                            </div>
                                            <div className={gmailStyles.emailDate}>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                                            <Mail size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                                            <p>No queries found in {currentFolder}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={gmailStyles.emailDetail}>
                                <div className={gmailStyles.detailToolbar}>
                                    <div className={gmailStyles.actionIcon} onClick={() => setSelectedTicket(null)} title="Back to inbox"><ArrowLeft size={18} /></div>
                                    <div className={gmailStyles.toolbarDivider} />
                                    <div className={gmailStyles.actionIcon} title="Archive"><Archive size={18} /></div>
                                    <div className={gmailStyles.actionIcon} title="Report Spam"><AlertCircle size={18} /></div>
                                    <div className={gmailStyles.actionIcon} title="Delete"><Trash2 size={18} /></div>
                                    <div className={gmailStyles.toolbarDivider} />
                                    <div className={gmailStyles.actionIcon} title="Mark unread"><Mail size={18} /></div>
                                    <div className={gmailStyles.actionIcon} title="Clock"><Clock size={18} /></div>
                                    <div className={gmailStyles.actionIcon} title="Categorize"><Tag size={18} /></div>
                                    <div className={gmailStyles.toolbarDivider} />
                                    <div className={gmailStyles.actionIcon} title="More"><MoreVertical size={18} /></div>
                                </div>

                                <div className={gmailStyles.detailContent}>
                                    <h2 className={gmailStyles.detailSubject}>{selectedTicket.subject} <span style={{ marginLeft: '12px', fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>ENQUIRY</span></h2>

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

            case 'Analytics':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            {[
                                { label: 'Platform Population', value: stats.totalUsers, color: '#3b82f6', trend: '+12%' },
                                { label: 'Active Inbound', value: stats.openTickets, color: '#f59e0b', trend: '-5%' },
                                { label: 'Resolved Queries', value: stats.solvedTickets, color: '#10b981', trend: '+28%' },
                                { label: 'System Integrity', value: '99.9%', color: '#6366f1', trend: 'Stable' }
                            ].map(stat => (
                                <div key={stat.label} style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>{stat.label}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                                        <div style={{ fontSize: '11px', color: stat.trend.startsWith('+') ? '#10b981' : stat.trend.startsWith('-') ? '#ef4444' : '#64748b', fontWeight: '700' }}>{stat.trend}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: '#0f172a', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Recent Performance Trends</h3>
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
                                        <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#94a3b8' }}>Agent Productivity</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {analyticsData.agentStats?.map((agent: any) => (
                                                <div key={agent._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '13px' }}>{agent._id}</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#3b82f6' }}>{agent.count} Actions</div>
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

            case 'Users':
                return (
                    <div className={styles.pageContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Client Management</h2>
                            <button className={styles.gmailSendBtn} style={{ borderRadius: '12px' }}><Plus size={18} /> Add Client</button>
                        </div>
                        <div className={styles.clientGrid}>
                            {realUsers.length > 0 ? realUsers.map((u: any) => (
                                <div key={u.id || u._id} className={styles.clientCard}>
                                    <div className={styles.clientCardHeader}>
                                        <div className={styles.clientMainInfo}>
                                            <div className={styles.avatarLarge} style={{ background: u.role === 'admin' ? '#ef4444' : '#3b82f6' }}>{u.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}</div>
                                            <div className={styles.clientMeta}>
                                                <h4>{u.name || 'Member'}</h4>
                                                <p>{u.email}</p>
                                            </div>
                                        </div>
                                        <Badge color={u.role === 'client' ? 'green' : u.role === 'staff' ? 'blue' : 'yellow'}>{u.role}</Badge>
                                    </div>
                                    <div className={styles.clientDetails}>
                                        <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600' }}>{u.company || 'Org-Unit: ' + (u.unique_id || 'N/A')}</p>
                                        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>{u.phone || 'No direct dial'}</p>
                                    </div>
                                    <div className={styles.clientStats}>
                                        <div className={styles.statItem}>
                                            <span>Platform ID</span>
                                            <strong>{u.id?.slice(-6) || u._id?.slice(-6)}</strong>
                                        </div>
                                        <div className={styles.statItem} style={{ textAlign: 'right' }}>
                                            <span>Current Status</span>
                                            <strong style={{ fontSize: '14px', color: u.status === 'Active' ? '#10b981' : '#f59e0b' }}>{u.status || 'Active'}</strong>
                                        </div>
                                    </div>
                                    {u.tags && (
                                        <div className={styles.tagGroup}>
                                            {u.tags.map((t: string) => <span key={t} className={styles.tag}>{t}</span>)}
                                        </div>
                                    )}
                                    <div className={styles.clientActions}>
                                        <button className={styles.actionBtn}>View Docs</button>
                                        <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => { setTo(u.email); setIsComposeOpen(true); }}>Direct Message</button>
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
            {/* MAIN CONTENT */}
            <main className={styles.mainContainer}>
                {/* UNIFIED TOP SECTION */}
                <div style={{
                    background: '#0f172a',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '32px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                    <header className={styles.headerRow} style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                        <div>
                            <h1 className={styles.pageTitle} style={{ fontSize: '28px', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Email Support</h1>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                                Welcome to {user?.name || user?.email?.split('@')[0] || 'Support'} • {new Date().toLocaleDateString()}
                            </p>
                        </div>
                        <div className={styles.topActions}>
                            <div className={styles.profileBadge} onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ position: 'relative' }}>
                                <div className={styles.miniAvatar} style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', color: '#000' }}>
                                    {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{user?.email || 'Staff Member'}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{getRoleDisplayName()}</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* PERSISTENT UNIFIED NAVIGATION BAR */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className={styles.composeBtn} onClick={() => setIsComposeOpen(true)}>
                                <Plus size={20} /> Compose
                            </button>

                            <button className={`${styles.navItem} ${currentFolder === 'Dashboard' ? styles.navActive : ''}`} onClick={() => { setActivePage('Emailing'); setCurrentFolder('Dashboard'); setSelectedTicket(null); }}>
                                <Layout size={18} /> Dashboard
                            </button>

                            <button className={`${styles.navItem} ${currentFolder === 'Inbox' ? styles.navActive : ''}`} onClick={() => { setActivePage('Emailing'); setCurrentFolder('Inbox'); setSelectedTicket(null); }}>
                                <Inbox size={18} /> Inbox {folderCounts.Inbox > 0 && <span className={styles.countBadge}>{folderCounts.Inbox}</span>}
                            </button>
                            <button className={`${styles.navItem} ${currentFolder === 'Starred' ? styles.navActive : ''}`} onClick={() => { setActivePage('Emailing'); setCurrentFolder('Starred'); setSelectedTicket(null); }}>
                                <Star size={18} /> Starred
                            </button>
                            <button className={`${styles.navItem} ${currentFolder === 'Sent' ? styles.navActive : ''}`} onClick={() => { setActivePage('Emailing'); setCurrentFolder('Sent'); setSelectedTicket(null); }}>
                                <Send size={18} /> Sent
                            </button>
                            <button className={`${styles.navItem} ${currentFolder === 'Important' ? styles.navActive : ''}`} onClick={() => { setActivePage('Emailing'); setCurrentFolder('Important'); setSelectedTicket(null); }}>
                                <Tag size={18} /> Important
                            </button>
                            <button className={`${styles.navItem} ${activePage === 'Users' ? styles.navActive : ''}`} onClick={() => setActivePage('Users')}>
                                <Users size={18} /> Users
                            </button>
                            <button className={`${styles.navItem} ${activePage === 'Tasks' ? styles.navActive : ''}`} onClick={() => setActivePage('Tasks')}>
                                <Briefcase size={18} /> Tasks
                            </button>
                            <button className={`${styles.navItem} ${activePage === 'Analytics' ? styles.navActive : ''}`} onClick={() => setActivePage('Analytics')}>
                                <Activity size={18} /> Analytics
                            </button>
                            <button className={`${styles.navItem} ${activePage === 'Activity Log' ? styles.navActive : ''}`} onClick={() => setActivePage('Activity Log')}>
                                <ShieldCheck size={18} /> Activity Log
                            </button>
                        </div>

                        <button className={styles.navItem} onClick={handleLogout} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>

                    {/* STATS GRID - INTEGRATED INTO TOP SECTION */}
                    {activePage === 'Emailing' && currentFolder === 'Dashboard' && (
                        <div className={styles.compactCardGrid} style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                            <div className={styles.compactCard} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className={styles.compactIcon} style={{ background: 'rgba(59, 130, 246, 0.1)' }}><Mail size={20} color="#3b82f6" /></div>
                                <div className={styles.compactContent}>
                                    <div className={styles.compactLabel}>Emails Today</div>
                                    <div className={styles.compactValue}>{stats.totalEmailsSentToday || 0}</div>
                                    <div className={`${styles.compactTrend} ${styles.trendUp}`}>Live Sync Active</div>
                                </div>
                            </div>
                            <div className={styles.compactCard} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className={styles.compactIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}><Activity size={20} color="#f59e0b" /></div>
                                <div className={styles.compactContent}>
                                    <div className={styles.compactLabel}>Resolution Rate</div>
                                    <div className={styles.compactValue}>
                                        {stats.totalTickets > 0 ? ((stats.solvedTickets / stats.totalTickets) * 100).toFixed(1) : '0'}%
                                    </div>
                                    <div className={`${styles.compactTrend} ${styles.trendUp}`}>↑ Resolved: {stats.solvedTickets}</div>
                                </div>
                            </div>
                            <div className={styles.compactCard} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className={styles.compactIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}><Briefcase size={20} color="#10b981" /></div>
                                <div className={styles.compactContent}>
                                    <div className={styles.compactLabel}>Open Tickets</div>
                                    <div className={styles.compactValue}>{stats.openTickets}</div>
                                    <div className={`${styles.compactTrend} ${styles.trendNeutral}`}>Requires action</div>
                                </div>
                            </div>
                            <div className={styles.compactCard} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className={styles.compactIcon} style={{ background: 'rgba(139, 92, 246, 0.1)' }}><Users size={20} color="#8b5cf6" /></div>
                                <div className={styles.compactContent}>
                                    <div className={styles.compactLabel}>Total Users</div>
                                    <div className={styles.compactValue}>{stats.totalUsers}</div>
                                    <div className={`${styles.compactTrend} ${styles.trendUp}`}>Platform Global</div>
                                </div>
                            </div>
                        </div>
                    )}
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
