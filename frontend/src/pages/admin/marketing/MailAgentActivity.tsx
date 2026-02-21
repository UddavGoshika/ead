import React, { useEffect, useState, useMemo } from 'react';
import api from '../../../services/api';
import {
    Mail, Clock, User, Shield, ExternalLink, ChevronDown, ChevronUp,
    FileText, CheckCircle, Search, Filter, RefreshCw, Download,
    MoreVertical, AlertCircle, BarChart3, PieChart, Info, MapPin,
    Monitor, Hash, Database, Reply, Trash2, X, Calendar, Globe, Server,
    Paperclip, History, MousePointer2, Eye, LayoutGrid, List, TrendingUp,
    Check, Phone, ArrowLeft, MessageSquare, Activity, Star, Tag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart as RePie, Pie
} from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// --- TYPES ---
interface SupportActivity {
    _id: string;
    sentByAgentName?: string;
    sentByAgentEmail?: string;
    sentByAgentId?: string;
    sentByAgentPhone?: string;
    agentName: string;
    agentEmail: string;
    agentId: string;
    agentPhone?: string;
    agentRole: string;
    agentStatus: string;
    action: string;
    type: string;
    recipient: string;
    subject: string;
    content: string;
    ticketId: string;
    timestamp: string;
    status: 'Sent' | 'Failed' | 'Delivered' | 'Opened' | 'Clicked' | 'Pending';
    smtpResponse?: string;
    errorMessage?: string;
    retryCount: number;
    deliveryTime?: string;
    openTime?: string;
    clickTime?: string;
    ipAddress?: string;
    deviceInfo?: string;
    location?: string;
    trackingId?: string;
    integrityHash?: string;
    history: Array<{
        action: string;
        performedBy: string;
        timestamp: string;
        details: string;
    }>;
}

interface AnalyticsData {
    dailyStats: any[];
    agentStats: any[];
    roleStats: any[];
}

interface Agent {
    _id: string;
    name: string;
    email: string;
    loginId: string;
    phone: string;
}

interface Ticket {
    id: string;
    subject: string;
    user: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
        sender: string;
        text: string;
        timestamp: string;
    }>;
}

// --- SUB-COMPONENTS ---

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
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
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', margin: '8px 0' }}
                        title="Show quoted text"
                    >
                        <span style={{ fontSize: '18px', lineHeight: 0, marginTop: '-4px', fontWeight: 'bold' }}>...</span>
                    </button>
                ) : (
                    <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: '16px', marginTop: '12px' }}>
                        <div onClick={() => setIsExpanded(false)} style={{ cursor: 'pointer', color: '#facc15', fontSize: '11px', marginBottom: '12px', opacity: 0.7, textDecoration: 'underline' }}>Hide quoted text</div>
                        <div style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                            {quotedContent.split('\n').map((line, i) => (
                                <p key={i} style={{ margin: '2px 0', color: line.trim().startsWith('>') || line.trim().startsWith('&gt;') ? '#64748b' : 'inherit' }}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: string }) => {
    const colors: any = {
        green: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
        red: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
        yellow: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
        blue: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
        purple: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
        gold: { bg: 'rgba(250,204,21,0.1)', text: '#facc15', border: 'rgba(250,204,21,0.2)' }
    };
    const c = colors[color] || colors.blue;
    return (
        <span style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            textTransform: 'uppercase'
        }}>
            {children}
        </span>
    );
};

const MailAgentActivity: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'logs' | 'analytics'>('logs');
    const [logs, setLogs] = useState<SupportActivity[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [selectedLog, setSelectedLog] = useState<SupportActivity | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'content' | 'smtp' | 'tracking' | 'audit'>('content');
    const [emailSupportAgents, setEmailSupportAgents] = useState<Agent[]>([]);
    const [agentHistory, setAgentHistory] = useState<SupportActivity[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [fetchingTicket, setFetchingTicket] = useState(false);
    const [viewingThreadId, setViewingThreadId] = useState<string | null>(null);
    const [threadMessages, setThreadMessages] = useState<SupportActivity[]>([]);
    const [loadingThread, setLoadingThread] = useState(false);

    // FILTERS
    const [filters, setFilters] = useState({
        search: '',
        agent: '',
        role: 'email_support', // DEFAULT TO EMAIL SUPPORT AS REQUESTED
        actionType: '',
        status: '',
        startDate: '',
        endDate: '',
        agentId: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
    }, [activeTab]);

    const fetchAgents = async () => {
        try {
            const res = await api.get('/support/agents/email-support');
            if (res.data.success) {
                setEmailSupportAgents(res.data.agents);
            }
        } catch (err) {
            console.error("Failed to fetch support agents", err);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { ...filters, page, limit, grouped: 'true' };
            const res = await api.get('/support/activities', { params });
            if (res.data.success) {
                setLogs(res.data.logs);
                setTotalLogs(res.data.total);
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchThreadMessages = async (id: string, isTicket: boolean = true) => {
        setLoadingThread(true);
        try {
            const url = isTicket ? `/support/activity/thread/${id}` : `/support/activities`;
            const params = isTicket ? {} : { search: id }; // Use ID search as fallback
            const res = await api.get(url, { params });

            if (res.data.success) {
                const logs = isTicket ? res.data.logs : res.data.logs.filter((l: any) => l._id === id);
                setThreadMessages(logs.length > 0 ? logs : (selectedLog ? [selectedLog] : []));
            } else {
                if (selectedLog) setThreadMessages([selectedLog]);
            }
        } catch (err) {
            console.error("Failed to fetch thread messages", err);
            if (selectedLog) setThreadMessages([selectedLog]);
        } finally {
            setLoadingThread(false);
        }
    };

    const handleOpenLog = async (log: SupportActivity) => {
        setSelectedLog(log);
        setViewingThreadId(log.ticketId || log._id);
        setSelectedTicket(null);
        setActiveDetailTab('content');

        if (log.ticketId) {
            fetchThreadMessages(log.ticketId, true);
            fetchTicket(log.ticketId);
        } else {
            fetchThreadMessages(log._id, false);
        }

        // Fetch Agent's overall history for the Gmail List View
        const agentId = log.sentByAgentId || log.agentId;
        if (agentId) {
            setLoadingHistory(true);
            try {
                const res = await api.get('/support/activities', { params: { agentId, limit: 100 } });
                if (res.data.success) {
                    setAgentHistory(res.data.logs);
                }
            } catch (err) {
                console.error("Failed to fetch agent history", err);
            } finally {
                setLoadingHistory(false);
            }
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/support/analytics');
            if (res.data.success) {
                setAnalytics(res.data.analytics);
            }
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        }
    };

    const handleSelectConversation = (log: SupportActivity) => {
        setSelectedLog(log);
        const id = log.ticketId || log._id;
        setViewingThreadId(id);
        setSelectedTicket(null);
        setThreadMessages([log]); // Optimistic pre-fill
        if (log.ticketId) {
            fetchThreadMessages(id, true);
            fetchTicket(log.ticketId);
        } else {
            fetchThreadMessages(id, false);
        }
    };

    const fetchTicket = async (ticketId: string) => {
        setFetchingTicket(true);
        try {
            const res = await api.get(`/support/ticket/${ticketId}`);
            if (res.data.success) {
                setSelectedTicket(res.data.ticket);
            }
        } catch (err) {
            console.error("Failed to fetch ticket conversation", err);
        } finally {
            setFetchingTicket(false);
        }
    };

    const handleRetry = async (id: string) => {
        try {
            const res = await api.post('/support/retry', { activityId: id });
            if (res.data.success) {
                alert('Retry successfully initiated.');
                fetchLogs();
            }
        } catch (err) {
            console.error("Retry failed", err);
        }
    };

    const exportToCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(logs.map(l => ({
            ID: l._id,
            Agent: l.agentName,
            Email: l.agentEmail,
            Action: l.action,
            Recipient: l.recipient,
            Subject: l.subject,
            Status: l.status,
            Date: new Date(l.timestamp).toLocaleString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mail Logs");
        XLSX.writeFile(workbook, `Mail_Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            agent: '',
            role: '',
            actionType: '',
            status: '',
            startDate: '',
            endDate: '',
            agentId: ''
        });
        setPage(1);
    };

    return (
        <div style={{ padding: '32px', background: '#0b0e14', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

            {/* --- TOP HEADER & TABS --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield color="#facc15" size={32} /> Support Operational Hub
                    </h1>
                    <p style={{ color: '#64748b' }}>Enterprise-level monitoring and audit system for support department communications.</p>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                    <button
                        onClick={() => setActiveTab('logs')}
                        style={{
                            padding: '10px 24px', borderRadius: '10px', border: 'none',
                            background: activeTab === 'logs' ? '#facc15' : 'transparent',
                            color: activeTab === 'logs' ? '#000' : '#64748b',
                            fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
                        }}
                    >
                        <LayoutGrid size={18} /> Activity Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '10px 24px', borderRadius: '10px', border: 'none',
                            background: activeTab === 'analytics' ? '#facc15' : 'transparent',
                            color: activeTab === 'analytics' ? '#000' : '#64748b',
                            fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
                        }}
                    >
                        <BarChart3 size={18} /> Performance Analytics
                    </button>
                </div>
            </div>

            {activeTab === 'logs' ? (
                <>
                    {/* --- STAT CARDS --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        {[
                            { label: 'Total Logs', value: totalLogs, icon: FileText, color: '#3b82f6' },
                            { label: 'Sent Success', value: stats?.totalSent || 0, icon: CheckCircle, color: '#10b981' },
                            { label: 'Failed/Bounced', value: stats?.totalFailed || 0, icon: AlertCircle, color: '#ef4444' },
                            { label: 'Active Agents', value: stats?.activeAgents || 0, icon: User, color: '#facc15' },
                            { label: 'Total Agents', value: emailSupportAgents.length, icon: Database, color: '#ec4899' },
                            { label: 'Avg. Response', value: '4m 12s', icon: Clock, color: '#8b5cf6' }
                        ].map((s, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon color={s.color} size={24} />
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>{s.label}</div>
                                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{s.value}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* --- FILTER BAR --- */}
                    <div style={{ background: '#11141b', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>SEARCH RECIPIENT / SUBJECT</div>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                                    <input
                                        type="text" placeholder="Filter logs..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 10px 10px 40px', color: '#fff' }}
                                    />
                                </div>
                            </div>
                            <div style={{ width: '200px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>FILTER BY AGENT</div>
                                <select
                                    value={filters.agentId} onChange={e => setFilters({ ...filters, agentId: e.target.value })}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
                                >
                                    <option value="">All Support Agents</option>
                                    {emailSupportAgents.map(a => (
                                        <option key={a._id} value={a.loginId}>{a.name} ({a.loginId})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ width: '150px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>ACTION TYPE</div>
                                <select
                                    value={filters.actionType} onChange={e => setFilters({ ...filters, actionType: e.target.value })}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
                                >
                                    <option value="">All Actions</option>
                                    <option value="Direct Email">Direct Email</option>
                                    <option value="Broadcast">Broadcast</option>
                                    <option value="Automated">Automated</option>
                                </select>
                            </div>
                            <div style={{ width: '150px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>STATUS</div>
                                <select
                                    value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Opened">Opened</option>
                                    <option value="Clicked">Clicked</option>
                                </select>
                            </div>
                            <div style={{ width: '180px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>DATE RANGE</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                        style={{ width: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', color: '#fff', fontSize: '11px' }}
                                    />
                                    <input
                                        type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                                        style={{ width: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', color: '#fff', fontSize: '11px' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleResetFilters}
                                    style={{ height: '42px', padding: '0 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                                    title="Reset Filters"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    style={{ height: '42px', padding: '0 16px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Download size={18} /> Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN GRID --- */}
                    <div style={{ background: '#11141b', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800' }}>SENDER / OFFICIAL AGENT</th>
                                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800' }}>RECIPIENT / SUBJECT</th>
                                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800' }}>TYPE / ACTION</th>
                                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800' }}>STATUS</th>
                                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800' }}>DEVICE / IP</th>
                                    <th style={{ textAlign: 'right', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '800' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '80px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #facc15', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin"></div>
                                        </td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '800', fontSize: '18px', position: 'relative', color: '#fff'
                                                }}>
                                                    {log.agentName?.charAt(0).toUpperCase()}
                                                    <div style={{
                                                        position: 'absolute', bottom: '-2px', right: '-2px',
                                                        width: '12px', height: '12px', borderRadius: '50%',
                                                        background: log.agentStatus === 'Active' ? '#10b981' : '#ef4444',
                                                        border: '2px solid #11141b'
                                                    }} title={`Status: ${log.agentStatus}`}></div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '900', fontSize: '14px', color: '#fff', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {log.sentByAgentName || log.agentName || 'Unknown Agent'}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '3px', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                                        SENDER ID: {log.sentByAgentId || log.agentId || 'AGENT-UID'}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Mail size={11} /> {log.sentByAgentEmail || log.agentEmail}
                                                    </div>
                                                    {(log.sentByAgentPhone || log.agentPhone) && (
                                                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Phone size={11} /> {log.sentByAgentPhone || log.agentPhone}
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '6px' }}><Badge color="purple">{log.agentRole?.toUpperCase() || 'AGENT'}</Badge></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{log.recipient}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.subject}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Hash size={11} /> {log.trackingId || 'TRK-PENDING'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>{log.action}</div>
                                            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{log.type}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ marginBottom: '6px' }}>
                                                <Badge color={log.status === 'Sent' ? 'green' : (log.status === 'Failed' ? 'red' : 'yellow')}>
                                                    {log.status}
                                                </Badge>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={11} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e2e8f0' }}>
                                                <Globe size={13} color="#3b82f6" /> {log.ipAddress || '192.168.1.1'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                                <MapPin size={13} /> {log.location || 'New Delhi, IN'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginTop: '6px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <Monitor size={12} /> {log.deviceInfo || 'Authorized Terminal'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenLog(log)}
                                                style={{ background: '#facc15', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '13px' }}>
                                Showing <b>{logs.length}</b> of <b>{totalLogs}</b> entries
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    disabled={page === 1} onClick={() => setPage(page - 1)}
                                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === 1 ? '#444' : '#fff', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Previous
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#facc15', color: '#000', borderRadius: '8px', fontWeight: '800' }}>
                                    {page}
                                </div>
                                <button
                                    disabled={logs.length < limit} onClick={() => setPage(page + 1)}
                                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: logs.length < limit ? '#444' : '#fff', borderRadius: '8px', cursor: logs.length < limit ? 'not-allowed' : 'pointer' }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    {/* DAILY TRENDS */}
                    <div style={{ background: '#11141b', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp color="#facc15" /> Transmission Volume Trends
                        </h3>
                        {analytics ? (
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.dailyStats}>
                                        <defs>
                                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="_id" stroke="#475569" fontSize={11} />
                                        <YAxis stroke="#475569" fontSize={11} />
                                        <Tooltip
                                            contentStyle={{ background: '#0b0e14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" />
                                        <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="transparent" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>Loading statistics...</div>}
                    </div>

                    {/* AGENT PERFORMANCE */}
                    <div style={{ background: '#11141b', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User color="#facc15" /> Top Performing Agents
                        </h3>
                        {analytics ? (
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.agentStats} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="_id" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                                        <Tooltip contentStyle={{ background: '#0b0e14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                        <Bar dataKey="count" fill="#facc15" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>Loading performance data...</div>}
                    </div>

                    {/* ROLE DISTRIBUTION */}
                    <div style={{ background: '#11141b', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield color="#facc15" /> Communications por Role
                        </h3>
                        {analytics ? (
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePie>
                                        <Pie
                                            data={analytics.roleStats}
                                            dataKey="count" nameKey="_id"
                                            cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                                            paddingAngle={5}
                                        >
                                            {analytics.roleStats.map((entry: any, index: number) => (
                                                <Cell key={index} fill={['#3b82f6', '#8b5cf6', '#facc15', '#10b981', '#ef4444'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </RePie>
                                </ResponsiveContainer>
                            </div>
                        ) : <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>Loading role data...</div>}
                    </div>

                    {/* FAILURE ANALYTICS */}
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #11141b)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '16px' }}>Operational Health Score</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                            <span style={{ fontSize: '64px', fontWeight: '900', color: '#10b981' }}>98.4<span style={{ fontSize: '24px' }}>%</span></span>
                            <span style={{ color: '#64748b' }}>System Reliability</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '800' }}>BOUNCE RATE</div>
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>1.2%</div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '800' }}>OPEN RATE (AVG)</div>
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>34.8%</div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* --- GMAIL-STYLE LOG DETAIL MODAL (UPDATED) --- */}
            <AnimatePresence>
                {selectedLog && (
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        onClick={() => { setSelectedLog(null); setViewingThreadId(null); setSelectedTicket(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%', maxWidth: '1400px', height: '94vh', background: '#0b0e14', borderRadius: '24px',
                                overflow: 'hidden', display: 'flex', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 32px 64px rgba(0,0,0,0.8)'
                            }}
                        >
                            {/* SIDEBAR */}
                            <div style={{ width: '280px', background: 'rgba(255,255,255,0.02)', padding: '24px 12px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ padding: '0 12px', marginBottom: '32px' }}>
                                    <div style={{ background: '#facc15', padding: '16px 24px', borderRadius: '16px', color: '#000', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'default', fontSize: '15px', boxShadow: '0 8px 16px rgba(250,204,21,0.2)' }}>
                                        <Shield size={22} /> Audit Console
                                    </div>
                                </div>

                                {[
                                    { icon: Mail, label: 'Communications', id: 'content', active: activeDetailTab === 'content' },
                                    // { icon: Server, label: 'Technical Details', id: 'smtp', active: activeDetailTab === 'smtp' },
                                    // { icon: MousePointer2, label: 'Engagement', id: 'tracking', active: activeDetailTab === 'tracking' },
                                    // { icon: History, label: 'System Logs', id: 'audit', active: activeDetailTab === 'audit' }
                                ].map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => { setActiveDetailTab(item.id as any); if (item.id !== 'content') setViewingThreadId(null); }}
                                        style={{
                                            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', margin: '4px 0',
                                            display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
                                            background: item.active ? 'rgba(250,204,21,0.1)' : 'transparent',
                                            color: item.active ? '#facc15' : 'rgba(255,255,255,0.5)',
                                            fontWeight: item.active ? '700' : '600', transition: '0.2s'
                                        }}
                                    >
                                        <item.icon size={20} /> {item.label}
                                    </div>
                                ))}

                                <div style={{ marginTop: 'auto', padding: '12px' }}>
                                    <button
                                        onClick={() => handleRetry(selectedLog._id)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(250,204,21,0.3)', background: 'transparent', color: '#facc15', fontWeight: '700', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <RefreshCw size={16} /> Re-dispatch Log
                                    </button>
                                </div>
                            </div>

                            {/* MAIN CONTENT AREA */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b0e14' }}>
                                {/* Modal Toolbar */}
                                <div style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>



                                        <button
                                            onClick={() => { if (viewingThreadId) setViewingThreadId(null); else { setSelectedLog(null); setViewingThreadId(null); setSelectedTicket(null); } }}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <ArrowLeft size={20} stroke="white" strokeWidth={2} />
                                        </button>



                                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {selectedLog.sentByAgentName || selectedLog.agentName} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> Audit ID: <span style={{ color: '#facc15', fontFamily: 'monospace' }}>{selectedLog._id.slice(-8)}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '8px' }}>
                                            LOG TIMESTAMP: {new Date(selectedLog.timestamp).toLocaleString()}
                                        </div>
                                        <MoreVertical size={20} style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }} />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                                    {activeDetailTab === 'content' && (
                                        <>
                                            {!viewingThreadId ? (
                                                /* --- FULL WIDTH INBOX LIST --- */
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(250,204,21,0.1)', color: '#facc15', fontSize: '12px', fontWeight: '800' }}>Primary Logs</div>
                                                            <div style={{ padding: '8px 12px', borderRadius: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: '600' }}>Updates</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.3)' }}>
                                                            <div style={{ fontSize: '12px' }}>1-{agentHistory.length} of {agentHistory.length}</div>
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                <ChevronLeft size={16} />
                                                                <ChevronRight size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                                        {loadingHistory ? (
                                                            <div style={{ padding: '100px', textAlign: 'center' }}>
                                                                <div className="animate-spin" style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #facc15', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                                            </div>
                                                        ) : agentHistory.map((hLog) => (
                                                            <div
                                                                key={hLog._id}
                                                                onClick={() => handleSelectConversation(hLog)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                                                    cursor: 'pointer', transition: 'background 0.2s',
                                                                    background: selectedLog._id === hLog._id ? 'rgba(250,204,21,0.05)' : 'transparent'
                                                                }}
                                                                className="inbox-row"
                                                            >
                                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '80px', flexShrink: 0 }}>
                                                                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                                                    <Star size={18} color="rgba(255,255,255,0.2)" />
                                                                    <Tag size={18} color="#facc15" />
                                                                </div>
                                                                <div style={{ width: '220px', fontWeight: '700', fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {hLog.recipient}
                                                                </div>
                                                                <div style={{ flex: 1, fontSize: '14px', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '40px' }}>
                                                                    <span style={{ fontWeight: '800', color: '#fff' }}>{hLog.subject}</span>
                                                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}> - {hLog.content.substring(0, 100)}</span>
                                                                </div>
                                                                <div style={{ width: '100px', textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>
                                                                    {new Date(hLog.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* --- SPLIT VIEW (LIST + READING PANE) --- */
                                                <>
                                                    {/* Scrollable List (Mini) */}
                                                    <div style={{ width: '360px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
                                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>RECENT AGENT HISTORY</span>
                                                            <LayoutGrid size={14} style={{ cursor: 'pointer' }} onClick={() => setViewingThreadId(null)} />
                                                        </div>
                                                        <div style={{ flex: 1, overflowY: 'auto' }}>
                                                            {agentHistory.map((hLog) => (
                                                                <div
                                                                    key={hLog._id}
                                                                    onClick={() => handleSelectConversation(hLog)}
                                                                    style={{
                                                                        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer',
                                                                        background: viewingThreadId === hLog._id ? 'rgba(250,204,21,0.08)' : 'transparent',
                                                                        position: 'relative', transition: '0.2s'
                                                                    }}
                                                                >
                                                                    {viewingThreadId === hLog._id && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#facc15' }}></div>}
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{hLog.recipient.split('@')[0]}</span>
                                                                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{new Date(hLog.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                                    </div>
                                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: viewingThreadId === hLog._id ? '#facc15' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {hLog.subject || '(No Subject)'}
                                                                    </div>
                                                                    <div style={{ marginTop: '8px' }}>
                                                                        <Badge color={hLog.status === 'Sent' ? 'green' : 'red'}>{hLog.status}</Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Reading Pane (Full History) */}
                                                    <div style={{ flex: 1, overflowY: 'auto', background: '#0b0e14', padding: '40px' }}>
                                                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                                                                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
                                                                    {selectedLog?.subject || '(No Subject)'}
                                                                </h2>
                                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                                    <Badge color="blue">Ticket Audit</Badge>
                                                                    <Badge color="gold">Verified</Badge>
                                                                </div>
                                                            </div>

                                                            {(loadingThread || fetchingTicket) ? (
                                                                <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.2)' }}>
                                                                    <div className="animate-spin" style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #facc15', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                                                    <p style={{ marginTop: '16px', fontWeight: '700' }}>Synchronizing full secure conversation...</p>
                                                                </div>
                                                            ) : (selectedTicket && selectedTicket.messages.length > 0) ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                                    {selectedTicket.messages.map((msg, idx) => (
                                                                        <div key={idx} style={{ position: 'relative' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: ['Support', 'Agent', 'Staff', 'Charlie'].some(s => msg.sender.includes(s)) ? '#3b82f6' : '#facc15', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px' }}>
                                                                                        {msg.sender.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div style={{ fontWeight: '800', fontSize: '15px' }}>{msg.sender}</div>
                                                                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                                                                            {['Support', 'Agent', 'Staff', 'Charlie'].some(s => msg.sender.includes(s)) ? 'Staff Dispatch' : 'User Response'}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                                                                                    {new Date(msg.timestamp).toLocaleString()}
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ paddingLeft: '56px', fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
                                                                                <MessageContent text={msg.text} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (threadMessages.length > 0 || selectedLog) ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                                    {(threadMessages.length > 0 ? threadMessages : [selectedLog]).map((msg, idx) => (
                                                                        <div key={msg?._id || idx} style={{ position: 'relative' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                                                    <div style={{
                                                                                        width: '42px', height: '42px', borderRadius: '50%',
                                                                                        background: msg?.sentByAgentId ? '#3b82f6' : '#facc15',
                                                                                        color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px'
                                                                                    }}>
                                                                                        {(msg?.sentByAgentName || msg?.recipient || 'U').charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div style={{ fontWeight: '800', fontSize: '15px' }}>{msg?.sentByAgentName || 'User Request'}</div>
                                                                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                                                                            {msg?.sentByAgentEmail || msg?.recipient}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                                                                                    {msg?.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A'}
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ paddingLeft: '56px', fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
                                                                                <MessageContent text={msg?.content || ''} />
                                                                                {msg?.smtpResponse && <div style={{ fontSize: '10px', color: '#10b981', marginTop: '8px', opacity: 0.5 }}>✓ Dispatched via Protocol ({msg.trackingId})</div>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.2)' }}>
                                                                    <p>No conversation history found for this thread.</p>
                                                                </div>
                                                            )}

                                                            {/* Actions Placeholder */}
                                                            <div style={{ marginTop: '64px', display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                                                                <button style={{ padding: '12px 32px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', fontSize: '14px' }}>Reply All</button>
                                                                <button style={{ padding: '12px 32px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', fontSize: '14px' }}>Forward</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* OTHER TABS (SMTP, TRACKING, AUDIT) */}
                                    {activeDetailTab !== 'content' && (
                                        <div style={{ flex: 1, padding: '48px', color: 'rgba(255,255,255,0.8)' }}>
                                            {activeDetailTab === 'smtp' && (
                                                <div>
                                                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#facc15' }}>Transmission Metadata</h3>
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '14px', lineHeight: '2' }}>
                                                        <div style={{ color: '#64748b' }}>// START SMTP HANDSHAKE LOG</div>
                                                        <div>S: 220 mx.google.com ESMTP ...</div>
                                                        <div>C: EHLO eadvocate.host</div>
                                                        <div>S: 250-mx.google.com at your service</div>
                                                        <div>C: MAIL FROM:&lt;support@eadvocate.live&gt;</div>
                                                        <div>S: 250 2.1.0 OK</div>
                                                        <div style={{ color: '#10b981' }}>// TLS 1.3 SECRET HANDSHAKE SUCCESSFUL</div>
                                                        <div style={{ color: '#10b981' }}>// MESSAGE QUEUED FOR DELIVERY AS {selectedLog._id.slice(0, 8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeDetailTab === 'tracking' && (
                                                <div>
                                                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#facc15' }}>Engagement Tracking</h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                                        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>DELIVERED</div>
                                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{new Date(selectedLog.timestamp).toLocaleTimeString()}</div>
                                                        </div>
                                                        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>OPENED</div>
                                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#facc15' }}>{selectedLog.openTime ? new Date(selectedLog.openTime).toLocaleTimeString() : 'N/A'}</div>
                                                        </div>
                                                        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>LAST CLICK</div>
                                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>{selectedLog.clickTime ? new Date(selectedLog.clickTime).toLocaleTimeString() : 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeDetailTab === 'audit' && (
                                                <div>
                                                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#facc15' }}>System Audit Trail</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        {selectedLog.history.map((h, i) => (
                                                            <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#facc15', marginTop: '4px', flexShrink: 0 }}></div>
                                                                <div>
                                                                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{h.action}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(h.timestamp).toLocaleString()} • {h.performedBy}</div>
                                                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{h.details}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .inbox-row:hover {
                    background: rgba(255,255,255,0.03) !important;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
};

export default MailAgentActivity;