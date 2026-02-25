
import React, { useState, useEffect, useRef } from 'react';
import styles from './LiveChatDashboard.module.css';
import {
    Search, PhoneOff, Send, Paperclip,
    Activity, Clock, Star, CheckCircle, TrendingUp,
    BarChart2, Shield, User, Smartphone, Mail, Info,
    Mic, Wifi, Users, Timer, Plus, Zap, Users2, Share2,
    ClipboardList, Smile, Bot, ExternalLink, Signal,
    Cpu, Globe, Lock, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../../../services/chatService';
import type { ChatMessage, ChatSession } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';
import { staffService } from '../../../services/api';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useSocketStore } from '../../../store/useSocketStore';

interface LiveChatDashboardProps {
    view?: 'dashboard' | 'live' | 'history' | 'performance' | 'profile' | 'identity';
}

const TelemetryBar: React.FC = () => {
    return (
        <div className={styles.telemetryBar}>
            <div className={styles.telemetryItem}>
                <div className={styles.telIcon}><Wifi size={18} /></div>
                <div className={styles.telMeta}>
                    <label>CONNECTION</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className={styles.latencyDot} />
                        <span>Stable <small style={{ color: '#64748b', fontWeight: 400 }}>(24ms)</small></span>
                    </div>
                </div>
            </div>
            <div className={styles.telemetryItem}>
                <div className={styles.telIcon}><Cpu size={18} /></div>
                <div className={styles.telMeta}>
                    <label>SERVER LOAD</label>
                    <span>Optimal <small style={{ color: '#64748b', fontWeight: 400 }}>(12%)</small></span>
                </div>
            </div>
            <div className={styles.telemetryItem}>
                <div className={styles.telIcon}><Globe size={18} /></div>
                <div className={styles.telMeta}>
                    <label>GLOBAL TRAFFIC</label>
                    <span>Normal <small style={{ color: '#64748b', fontWeight: 400 }}>(+2.4%)</small></span>
                </div>
            </div>
            <div className={styles.telemetryItem} style={{ marginLeft: 'auto' }}>
                <div className={styles.telIcon} style={{ color: '#10b981' }}><Lock size={18} /></div>
                <div className={styles.telMeta}>
                    <label>SECURITY</label>
                    <span>AES-256 Active</span>
                </div>
            </div>
        </div>
    );
};

const IdentityView: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className={styles.identityWrapper}>
            <div className={styles.idHeader}>
                <div className={styles.idAvatar}>{user?.name?.charAt(0) || user?.email?.charAt(0)}</div>
                <div className={styles.idMeta}>
                    <h1>{user?.name || 'Authorized Staff'}</h1>
                    <p>{user?.email} • Staff ID: {String(user?.id || '').substring(0, 8).toUpperCase()}</p>
                    <div className={styles.verifiedBadge}><ShieldCheck size={16} /> VERIFIED SUPPORT REPRESENTATIVE</div>
                </div>
            </div>

            <div className={styles.idGrid}>
                <div className={styles.idCard}>
                    <h3><User size={20} /> Professional Details</h3>
                    <div className={styles.idDetail}><label>Role</label><span>{(user?.role || 'Staff').replace(/_/g, ' ').toUpperCase()}</span></div>
                    <div className={styles.idDetail}><label>Department</label><span>Legal Operations Team</span></div>
                    <div className={styles.idDetail}><label>Specialization</label><span>Live Chat & Dispute Resolution</span></div>
                    <div className={styles.idDetail}><label>Joining Date</label><span>October 24, 2024</span></div>
                </div>
                <div className={styles.idCard}>
                    <h3><Activity size={20} /> Session Statistics</h3>
                    <div className={styles.idDetail}><label>Total Chats Handled</label><span>1,482</span></div>
                    <div className={styles.idDetail}><label>Avg Handling Time</label><span>8m 42s</span></div>
                    <div className={styles.idDetail}><label>User Rating</label><span>4.9 / 5.0</span></div>
                    <div className={styles.idDetail}><label>Current Shift</label><span>ACTIVE (09:00 - 18:00)</span></div>
                </div>
            </div>

            <div className={styles.idCard} style={{ maxWidth: 800 }}>
                <h3><Smartphone size={20} /> Access & Intelligence</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                    Your terminal is currently synchronized with the central neural node. All interactions are recorded for quality assurance.
                    You have elevated permissions to view user case histories and initiate secure VoIP bridges.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                    <button className={styles.btnPrimary}>UPDATE PROFILE</button>
                    <button className={styles.btnPrimary} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>VIEW DATA LOGS</button>
                </div>
            </div>
        </div>
    );
};

const PerformanceView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    useEffect(() => { staffService.getPerformance().then(({ data }) => { if (data.success) setStats(data.stats); }); }, []);
    const barData = [
        { label: 'Mon', val: 65 }, { label: 'Tue', val: 80 }, { label: 'Wed', val: 45 },
        { label: 'Thu', val: 95 }, { label: 'Fri', val: 70 }, { label: 'Sat', val: 30 }, { label: 'Sun', val: 20 }
    ];
    return (
        <div className={styles.analyticsContainer}>
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <label>RESPONSE TIME</label>
                    <div className={styles.metricValue}>{stats?.avgResponse || '1.2m'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                        <TrendingUp size={14} /> 12% faster
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <label>SOLVED CASES</label>
                    <div className={styles.metricValue}>{stats?.solvedCases || 0}</div>
                </div>
                <div className={styles.metricCard}>
                    <label>CSAT SCORE</label>
                    <div className={styles.metricValue}>4.9/5.0</div>
                </div>
                <div className={styles.metricCard}>
                    <label>CONVERSION</label>
                    <div className={styles.metricValue}>{stats?.successRate || '85%'}</div>
                </div>
            </div>
            <div className={styles.idCard}>
                <h3 style={{ marginBottom: 40 }}><BarChart2 size={16} /> LOAD DISTRIBUTION</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 200 }}>
                    {barData.map((b, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <motion.div initial={{ height: 0 }} animate={{ height: `${b.val}%` }} style={{ background: '#3b82f6', borderRadius: '8px 8px 0 0', width: '100%' }} />
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 12, textAlign: 'center' }}>{b.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HistoryView: React.FC = () => {
    const [history, setHistory] = useState<ChatSession[]>([]);
    useEffect(() => {
        const fetchHistory = async () => {
            const q = query(collection(db, 'chat_sessions'), where('status', '==', 'closed'), limit(20));
            const snap = await getDocs(q);
            setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession)));
        };
        fetchHistory();
    }, []);
    return (
        <div className={styles.analyticsContainer}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>ARCHIVED SESSIONS</h3>
            <table className={styles.historyTable}>
                <thead><tr><th>CLIENT</th><th>DURATION</th><th>STATUS</th><th>DATE</th><th>ACTION</th></tr></thead>
                <tbody>
                    {history.map(s => (
                        <tr key={s.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className={styles.sessionAvatar} style={{ width: 36, height: 36, fontSize: 14 }}>{s.clientName.charAt(0)}</div>
                                    <div style={{ fontWeight: 700 }}>{s.clientName}</div>
                                </div>
                            </td>
                            <td>12m 45s</td>
                            <td><span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: 11, fontWeight: 800 }}>SOLVED</span></td>
                            <td>{s.updatedAt?.seconds ? new Date(s.updatedAt.seconds * 1000).toLocaleDateString() : 'Dec 24, 2025'}</td>
                            <td><button className={styles.actionBtn} onClick={() => alert("Session Protocol: " + s.id)}><ExternalLink size={16} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const LiveChatDashboard = ({ view = 'live' }: LiveChatDashboardProps) => {
    const { user } = useAuth();
    const { socket } = useSocketStore();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [agents, setAgents] = useState<any[]>([]);
    const [remoteTyping, setRemoteTyping] = useState<{ isTyping: boolean; userName?: string }>({ isTyping: false });
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user?.id) return;
        return chatService.listenToStaffSessions(String(user.id), setChatSessions);
    }, [user?.id]);

    useEffect(() => {
        if (activeSession && activeSession.status === 'active') {
            const unsub = chatService.listenToMessages(activeSession.id, (msgs) => {
                setChatMessages(msgs);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
            return () => unsub();
        }
    }, [activeSession?.id, activeSession?.status]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeSession) return;
        const text = messageInput.trim();
        setMessageInput('');
        await chatService.sendMessage(activeSession.id, { senderId: String(user?.id), senderName: user?.name || 'Staff', text: text, type: 'text' });
    };

    const renderChat = () => (
        <div className={styles.chatMain}>
            <AnimatePresence mode="wait">
                {activeSession ? (
                    activeSession.status === 'waiting' ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className={styles.idAvatar} style={{ marginBottom: 24 }}>{activeSession.clientName.charAt(0)}</div>
                            <h2 style={{ fontSize: 32, fontWeight: 900 }}>{activeSession.clientName}</h2>
                            <p style={{ color: '#94a3b8', marginBottom: 40 }}>Waiting for secure link initialization...</p>
                            <button className={styles.btnPrimary} onClick={() => chatService.joinSession(activeSession.id, String(user?.id))}>
                                CLAIM SESSION
                            </button>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className={styles.activeChatHeader}>
                                <div className={styles.activeUser}>
                                    <div className={styles.sessionAvatar} style={{ width: 40, height: 40, fontSize: 16 }}>{activeSession.clientName.charAt(0)}</div>
                                    <div style={{ fontWeight: 800 }}>{activeSession.clientName}</div>
                                </div>
                                <div className={styles.headerActions}>
                                    <button className={styles.actionBtn} onClick={() => setShowTransferModal(true)}><Share2 size={18} /></button>
                                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => chatService.closeSession(activeSession.id).then(() => setActiveSession(null))}><PhoneOff size={18} /></button>
                                </div>
                            </div>
                            <div className={styles.messagesWindow}>
                                {chatMessages.map((m, i) => (
                                    <div key={i} className={`${styles.idDetail} ${m.senderId === String(user?.id) ? styles.me : styles.client}`} style={{ border: 'none', padding: 0, flexDirection: 'column' }}>
                                        <div className={styles.bubble} style={{ alignSelf: m.senderId === String(user?.id) ? 'flex-end' : 'flex-start', background: m.senderId === String(user?.id) ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 20, padding: '12px 20px', maxWidth: '75%' }}>{m.text}</div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={{ padding: 24, paddingBottom: 40 }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '8px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <button className={styles.actionBtn} style={{ background: 'none', border: 'none' }}><Plus size={20} /></button>
                                    <textarea className={styles.mainInput} rows={1} placeholder="Type a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', padding: '12px 0' }} />
                                    <button className={styles.actionBtn} style={{ background: '#3b82f6', color: '#fff', borderRadius: 12 }} onClick={handleSendMessage}><Send size={18} /></button>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                        <Bot size={80} style={{ marginBottom: 24, color: '#3b82f6' }} />
                        <h2 style={{ fontSize: 24, fontWeight: 900 }}>TERMINAL READY</h2>
                        <p>Select a session to begin synchronization</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className={styles.chatHubLayout}>
            <TelemetryBar />
            <div className={styles.mainContentWrapper}>
                {(view === 'live' || view === 'dashboard') && (
                    <>
                        <div className={styles.sidebarQueue}>
                            <div className={styles.queueHeader}><h3>QUEUE</h3><Signal size={14} color="#10b981" /></div>
                            <div className={styles.searchBox}><div className={styles.searchInner}><Search size={16} color="#64748b" /><input placeholder="Search..." onChange={e => setSearchQuery(e.target.value)} /></div></div>
                            <div className={styles.sessionList}>
                                {chatSessions.filter(s => s.clientName.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                    <div key={s.id} className={`${styles.sessionCard} ${activeSession?.id === s.id ? styles.active : ''}`} onClick={() => setActiveSession(s)}>
                                        <div className={styles.sessionAvatar}>{s.clientName.charAt(0)}</div>
                                        <div><div className={styles.sessionName}>{s.clientName}</div><div className={styles.sessionSnippet}>{s.lastMessage}</div></div>
                                        {s.status === 'waiting' && <div className={styles.statusIndicator} style={{ background: '#ef4444', marginLeft: 'auto' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {renderChat()}
                    </>
                )}
                {view === 'performance' && <PerformanceView />}
                {view === 'history' && <HistoryView />}
                {(view === 'profile' || view === 'identity') && <IdentityView />}
            </div>
        </div>
    );
};

export default LiveChatDashboard;
