
import React, { useState, useEffect, useRef } from 'react';
import styles from '../StaffGlobalDashboard.module.css';
import {
    Phone, MessageSquare, Search,
    PhoneOff, MicOff, Send, Paperclip,
    Activity, Inbox, Clock, Star,
    CheckCircle, ArrowRight, TrendingUp,
    BarChart2, Shield, User, Smartphone, Mail, Info,
    Mic, Pause, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../../../services/chatService';
import type { ChatMessage, ChatSession } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';
import { staffService } from '../../../services/api';
import { WebRTCService } from '../../../services/WebRTCService';
import { db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface LiveChatDashboardProps {
    view?: 'dashboard' | 'live' | 'history' | 'performance';
}

const ChatHistoryView: React.FC = () => {
    return (
        <div className={styles.emptyCenter}>
            <h2>Chat History</h2>
            <p>Archived sessions will appear here. Completed chats are tracked per session.</p>
            <p style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>No archived records to display yet.</p>
        </div>
    );
};

const PerformanceView: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<{ solvedCases?: number; pendingCases?: number; successRate?: string; callsToday?: number; convertedLeads?: number } | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        staffService.getPerformance().then(({ data }) => {
            if (data.success && data.stats) setStats(data.stats);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);
    if (loading) return <div className={styles.emptyCenter}><p>Loading metrics...</p></div>;
    return (
        <div className={styles.fullDashboardArea} style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 20 }}>My Performance</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div className={styles.statCard}><span>Solved Cases</span><strong>{stats?.solvedCases ?? 0}</strong></div>
                <div className={styles.statCard}><span>Pending Cases</span><strong>{stats?.pendingCases ?? 0}</strong></div>
                <div className={styles.statCard}><span>Success Rate</span><strong>{stats?.successRate ?? '0%'}</strong></div>
                <div className={styles.statCard}><span>Calls Today</span><strong>{stats?.callsToday ?? 0}</strong></div>
                <div className={styles.statCard}><span>Converted Leads</span><strong>{stats?.convertedLeads ?? 0}</strong></div>
            </div>
        </div>
    );
};

const LiveChatDashboard = ({ view = 'live' }: LiveChatDashboardProps) => {
    const { user } = useAuth();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [isInfoExpanded, setIsInfoExpanded] = useState(false);

    // CALL STATE
    const [isInCall, setIsInCall] = useState(false);
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const rtcRef = useRef<WebRTCService | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    // --- DATA CONNECTION LOGIC ---
    useEffect(() => {
        if (!user?.id) return;
        const unsubscribe = chatService.listenToStaffSessions(String(user.id), (sessions) => {
            const mockSession: ChatSession = {
                id: 'MOCK-SESSION-101',
                clientId: 'client_charlie_123',
                clientName: 'Charlie Goshika (Test)',
                status: 'waiting',
                updatedAt: new Date(),
                lastMessage: 'Hello, I need legal help with a startup contract.',
                metadata: {
                    email: 'charlie@test.com',
                    unique_id: 'CAD-10293',
                    mobile: '+91 9988776655',
                    role: 'Client',
                    plan: 'Premium',
                    status: 'Active'
                } as any
            };

            const finalSessions = sessions.length > 0 ? sessions.map(s => ({
                ...s,
                metadata: s.metadata || {
                    email: 'Not Provided',
                    unique_id: 'ID-' + s.clientId?.slice(-4),
                    mobile: 'N/A',
                    role: 'Member',
                    plan: 'Free',
                    status: 'Pending'
                }
            })) : [mockSession];
            setChatSessions(finalSessions);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user?.id]);

    useEffect(() => {
        if (activeSession) {
            if (activeSession.id === 'MOCK-SESSION-101') {
                const mockMsgs: ChatMessage[] = [
                    { senderId: 'client_charlie_123', senderName: 'Charlie Goshika', text: 'Hello, I need legal help with a startup contract.', type: 'text', timestamp: { toDate: () => new Date() } } as any
                ];
                setChatMessages(mockMsgs);
            } else {
                const unsubscribe = chatService.listenToMessages(activeSession.id, setChatMessages);
                return () => unsubscribe();
            }
        }
    }, [activeSession]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isInCall && callStatus === 'connected' && !isOnHold) {
            interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isInCall, callStatus, isOnHold]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeSession) return;
        const text = messageInput.trim();
        setMessageInput('');

        if (activeSession.id === 'MOCK-SESSION-101') {
            setChatMessages(prev => [...prev, {
                senderId: String(user?.id),
                senderName: user?.name || 'Agent',
                text: text,
                type: 'text',
                timestamp: { toDate: () => new Date() } as any
            } as any]);
            return;
        }

        await chatService.sendMessage(activeSession.id, {
            senderId: String(user?.id),
            senderName: user?.name || 'Support Agent',
            text: text,
            type: 'text'
        });
    };

    const handleAcceptChat = async (session: ChatSession) => {
        if (session.id === 'MOCK-SESSION-101') {
            setActiveSession({ ...session, status: 'active', assignedStaffId: String(user?.id) });
            return;
        }
        try {
            await chatService.joinSession(session.id, String(user?.id));
            setActiveSession({ ...session, status: 'active', assignedStaffId: String(user?.id) });
        } catch (err) { alert("Failed to join."); }
    };

    const handleCloseSession = async () => {
        if (!activeSession) return;
        if (window.confirm("End this chat session?")) {
            if (activeSession.id !== 'MOCK-SESSION-101') {
                await chatService.closeSession(activeSession.id);
            }
            setActiveSession(null);
        }
    };

    const handleStartCall = async (targetId: string) => {
        setIsInCall(true);
        setCallStatus('calling');
        setCallDuration(0);
        setIsMuted(false);
        setIsOnHold(false);

        if (activeSession?.id === 'MOCK-SESSION-101') {
            setTimeout(() => setCallStatus('ringing'), 1500);
            setTimeout(() => setCallStatus('connected'), 4000);
            return;
        }

        try {
            rtcRef.current = new WebRTCService();
            await rtcRef.current.startLocalStream(false);
            const callId = await rtcRef.current.createCall(targetId, user?.name || 'Staff', 'voice');

            setCallStatus('ringing');

            onSnapshot(doc(db, 'calls', callId), (s) => {
                if (!s.exists()) {
                    setIsInCall(false);
                    setCallStatus('idle');
                } else {
                    const data = s.data();
                    if (data?.status === 'connected') setCallStatus('connected');
                }
            });
        } catch (err) {
            alert("Call Sync Error");
            setIsInCall(false);
            setCallStatus('idle');
        }
    };

    const handleEndCall = () => {
        setIsInCall(false);
        setCallStatus('idle');
        setCallDuration(0);
        if (rtcRef.current) {
            rtcRef.current.hangup();
            rtcRef.current = null;
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        if (rtcRef.current) rtcRef.current.toggleAudio(!next);
    };

    const toggleHold = () => {
        setIsOnHold(!isOnHold);
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    const renderDashboard = () => (
        <div className={styles.fullDashboardArea}>
            <div className={styles.statsRow}>
                <div className={styles.statCard}><div className={styles.statIcon}><MessageSquare size={24} /></div><div className={styles.statInfo}><label>Active Chats</label><span>{chatSessions.filter(s => s.status === 'active').length}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon}><Clock size={24} /></div><div className={styles.statInfo}><label>Waiting</label><span>{chatSessions.filter(s => s.status === 'waiting').length}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon}><CheckCircle size={24} /></div><div className={styles.statInfo}><label>Closed Today</label><span>12</span></div></div>
            </div>

            <div className={styles.recentChatsBox}>
                <div className={styles.boxHeader}><h3>Recent Operations</h3></div>
                <table className={styles.modernTable}>
                    <thead>
                        <tr><th>Client Name</th><th>Status</th><th>Agent</th><th>Last Activity</th></tr>
                    </thead>
                    <tbody>
                        {chatSessions.map(s => (
                            <tr key={s.id}>
                                <td>{s.clientName}</td>
                                <td><span className={s.status === 'active' ? styles.statusActive : styles.statusWait}>{s.status.toUpperCase()}</span></td>
                                <td>{s.assignedStaffId ? 'Self' : 'Unassigned'}</td>
                                <td>Just Now</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLiveChat = () => (
        <div className={styles.chatHubLayout}>
            <div className={styles.chatSidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>LIVE QUEUE</h3>
                    <div className={styles.liveBadge}><Activity size={10} /> FEED</div>
                </div>
                <div className={styles.sessionList}>
                    {loading ? (
                        <div className={styles.emptySessions}><div className={styles.spinner} /></div>
                    ) : (
                        chatSessions.map(s => (
                            <div key={s.id} className={`${styles.sessionCard} ${activeSession?.id === s.id ? styles.active : ''}`} onClick={() => setActiveSession(s)}>
                                <div className={styles.sessionAvatar}>{(s.clientName?.charAt(0) || '?')}</div>
                                <div className={styles.sessionInfo}>
                                    <div className={styles.sessionName}>{s.clientName}</div>
                                    <div className={styles.sessionLastMsg}>{s.lastMessage || 'Connected...'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.chatMainArea}>
                {activeSession ? (
                    activeSession.status === 'waiting' ? (
                        <div className={styles.waitScreen}>
                            <div className={styles.largeAvatar}>{(activeSession.clientName?.charAt(0) || '?')}</div>
                            <h2>{activeSession.clientName}</h2>
                            <div className={styles.clientDetailBadges}>
                                <span><Mail size={12} /> {(activeSession.metadata as any)?.email}</span>
                                <span><Smartphone size={12} /> {(activeSession.metadata as any)?.mobile}</span>
                            </div>
                            <button className={styles.acceptActionBtn} onClick={() => handleAcceptChat(activeSession)}>JOIN CONVERSATION</button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.activeChatHeader}>
                                <div className={styles.activeChatUser}>
                                    <div className={styles.smallAvatar}>{(activeSession.clientName?.charAt(0) || '?')}</div>
                                    <div>
                                        <div className={styles.userName}>{activeSession.clientName}</div>
                                        <div className={styles.userStatus}>Online • Secure Channel</div>
                                    </div>
                                </div>
                                <div className={styles.headerActions}>
                                    <button className={styles.iconBtn} onClick={() => setIsInfoExpanded(!isInfoExpanded)} title="Client Info"><Info size={18} /></button>
                                    <button className={styles.iconBtn} onClick={() => handleStartCall(activeSession.clientId)} title="Start Voice Call"><Phone size={18} /></button>
                                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={handleCloseSession} title="Close Chat"><PhoneOff size={18} /></button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isInfoExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={styles.clientInfoPanel}>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoField}><label>Account ID</label><span>{(activeSession.metadata as any)?.unique_id}</span></div>
                                            <div className={styles.infoField}><label>Mobile</label><span>{(activeSession.metadata as any)?.mobile}</span></div>
                                            <div className={styles.infoField}><label>Email Address</label><span>{(activeSession.metadata as any)?.email}</span></div>
                                            <div className={styles.infoField}><label>User Role</label><span>{(activeSession.metadata as any)?.role || 'Member'}</span></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={styles.messagesContainer}>
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`${styles.messageWrapper} ${msg.senderId === String(user?.id) ? styles.sender : styles.receiver}`}>
                                        <div className={styles.messageBubble}>
                                            {msg.text}
                                            <span className={styles.msgTime}>Just Now</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.chatInputWrapper}>
                                <button className={styles.attachBtn}><Paperclip size={20} /></button>
                                <input placeholder="Type your message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                                <button className={styles.sendActionBtn} onClick={handleSendMessage}><Send size={20} /></button>
                            </div>
                        </>
                    )
                ) : (
                    <div className={styles.noActiveChat}><MessageSquare size={64} style={{ opacity: 0.1 }} /><h3>CHAT CONSOLE</h3><p>Select a session to begin.</p></div>
                )}
            </div>
            {/* CALL OVERLAY */}
            <AnimatePresence>
                {isInCall && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.ultraPremiumOverlay}>
                        <div className={styles.premiumCallCard}>
                            <div className={styles.callHeader}>
                                <div className={styles.callBadge}>
                                    {callStatus === 'calling' && 'Initiating...'}
                                    {callStatus === 'ringing' && 'Ringing...'}
                                    {callStatus === 'connected' && 'Live Session'}
                                </div>
                                <div className={styles.encryptionInfo}><Shield size={12} /> Secure VoIP</div>
                            </div>

                            <div className={styles.callBody}>
                                <div className={styles.callAvatarWrapper}>
                                    <div className={styles.avatarPulsar} />
                                    <div className={styles.largeAvatar}>{(activeSession?.clientName?.charAt(0) || '?')}</div>
                                </div>
                                <h2>{activeSession?.clientName}</h2>
                                <p className={styles.callDetailMeta}>{(activeSession?.metadata as any)?.mobile} • {(activeSession?.metadata as any)?.unique_id}</p>

                                {callStatus === 'connected' && (
                                    <div className={styles.callTimer}>
                                        {formatDuration(callDuration)}
                                    </div>
                                )}
                            </div>

                            <div className={styles.callFooter}>
                                <div className={styles.callActionGrid}>
                                    <button
                                        className={`${styles.callActionBtn} ${isMuted ? styles.active : ''}`}
                                        onClick={toggleMute}
                                        title={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                    </button>
                                    <button
                                        className={`${styles.callActionBtn} ${isOnHold ? styles.active : ''}`}
                                        onClick={toggleHold}
                                        title={isOnHold ? "Resume" : "Hold"}
                                    >
                                        {isOnHold ? <Play size={24} /> : <Pause size={24} />}
                                    </button>
                                    <button className={styles.hangupActionBtn} onClick={handleEndCall} title="End Call">
                                        <PhoneOff size={32} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
        </div>
    );

    return (
        <div className={styles.fullDashboardArea}>
            {view === 'dashboard' && renderDashboard()}
            {view === 'live' && renderLiveChat()}
            {view === 'history' && <ChatHistoryView />}
            {view === 'performance' && <PerformanceView />}
        </div>
    );
};

export default LiveChatDashboard;
