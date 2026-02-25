
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
import { staffService } from '../../services/api';
import TelecallerDashboard from './roles/TelecallerDashboard';
import LiveChatDashboard from './roles/LiveChatDashboard';
import CallSupportDashboard from './roles/CallSupportDashboard';
import MailSupportDashboard from './roles/MailSupportDashboard';
import MemberTable from '../../components/admin/MemberTable';

type ActiveView = 'dashboard' | 'telecaller' | 'chat' | 'call' | 'mail' | 'members' | 'profile' | 'chat_history' | 'performance' | 'call_history' | 'lead_stats';

const CallLogsView: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        staffService.getCallLogs().then(({ data }) => {
            if (data.success) setLogs(data.logs || []);
        }).catch(() => setLogs([])).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className={styles.emptyCenter}><p>Loading voice logs...</p></div>;
    return (
        <div className={styles.scrollableContent}>
            <h2 style={{ marginBottom: 16 }}>Voice Logs</h2>
            {logs.length === 0 ? <p className={styles.emptyCenter}>No call records yet.</p> : (
                <table className={styles.dataTable}>
                    <thead><tr><th>Date / Time</th><th>Contact</th><th>Type</th><th>Mode</th><th>Duration</th><th>Status</th></tr></thead>
                    <tbody>
                        {logs.map((l: any) => (
                            <tr key={l._id}>
                                <td>{l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
                                <td>{l.leadId?.clientName || l.leadId?.clientMobile || l.leadId?._id || '—'}</td>
                                <td>{l.type || '—'}</td>
                                <td>{l.mode || 'Voice'}</td>
                                <td>{l.duration != null ? `${l.duration}s` : '—'}</td>
                                <td>{l.status || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const LeadStatsView: React.FC = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        Promise.all([staffService.getMyLeads(), staffService.getPerformance()]).then(([r1, r2]) => {
            if (r1.data.success) setLeads(r1.data.leads || []);
            if (r2.data.success) setStats(r2.data.stats);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className={styles.emptyCenter}><p>Loading conversion metrics...</p></div>;
    const byStatus = leads.reduce((acc: Record<string, number>, l: any) => { acc[l.leadStatus] = (acc[l.leadStatus] || 0) + 1; return acc; });
    return (
        <div className={styles.scrollableContent}>
            <h2 style={{ marginBottom: 16 }}>Lead Stats & Conversions</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div className={styles.statCard}><span>Total Leads</span><strong>{leads.length}</strong></div>
                <div className={styles.statCard}><span>Converted</span><strong>{stats?.convertedLeads ?? byStatus['Converted'] ?? 0}</strong></div>
                <div className={styles.statCard}><span>By Status</span><strong>{Object.keys(byStatus).length}</strong></div>
            </div>
            {leads.length === 0 ? <p>No leads assigned yet.</p> : (
                <table className={styles.dataTable}>
                    <thead><tr><th>Name</th><th>Mobile</th><th>Status</th><th>Category</th></tr></thead>
                    <tbody>
                        {leads.slice(0, 50).map((l: any) => (
                            <tr key={l._id}><td>{l.clientName}</td><td>{l.clientMobile}</td><td>{l.leadStatus}</td><td>{l.category || '—'}</td></tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

import { useSearchParams } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';

const StaffGlobalDashboard: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const activeView = searchParams.get('view') || 'dashboard';

    const renderView = () => {
        switch (activeView) {
            case 'staff':
            case 'members':
                return (
                    <div className={styles.scrollableContent}>
                        <MemberTable title="Member Directory" defaultStatus="Active" context="approved" />
                    </div>
                );
            case 'telecaller':
            case 'leads':
                return <TelecallerDashboard />;
            case 'chat':
            case 'live':
            case 'chat_history':
            case 'history':
            case 'performance':
                return <LiveChatDashboard view={activeView.includes('chat') || activeView === 'live' ? 'live' : activeView.includes('history') ? 'history' : 'performance'} />;
            case 'call':
                return <CallSupportDashboard />;
            case 'call_history':
                return <CallLogsView />;
            case 'mail':
            case 'inbox':
                return <MailSupportDashboard />;
            case 'lead_stats':
                return <LeadStatsView />;
            case 'profile':
                return (
                    <div className={styles.profileSection}>
                        <div className={styles.profileHeader}>
                            <div className={styles.profileAvatarLarge}>{user?.email?.charAt(0).toUpperCase()}</div>
                            <div className={styles.profileMeta}>
                                <h2>{user?.name || user?.email}</h2>
                                <p>{user?.role?.toUpperCase()} • {user?.id}</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className={styles.dashboardWelcome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                        <div className={styles.logoSquare} style={{ width: 80, height: 80, fontSize: 40, marginBottom: 24 }}>E</div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Welcome to the Terminal</h1>
                        <p style={{ color: '#94a3b8', fontSize: 16 }}>Select an operation from the sidebar to begin your session.</p>
                    </div>
                );
        }
    };

    return (
        <StaffLayout>
            <main className={styles.dashboard} style={{ padding: 0 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.viewContainer}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </StaffLayout>
    );
};

export default StaffGlobalDashboard;
