import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './StaffGlobalDashboard.module.css';
import {
    Phone, Video, Users, CheckCircle, Clock,
    TrendingUp, MessageSquare, Search,
    PhoneOff, MicOff, Layout, Briefcase,
    ChevronRight, Activity, LogOut, User,
    Settings, Shield, Bell, ArrowLeft,
    Save, Key, BarChart2, Inbox, Mic, VideoOff,
    Send, Paperclip, Smile, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staffService } from '../../services/api';
import { WebRTCService, useCallSignals } from '../../services/WebRTCService';
import { chatService } from '../../services/chatService';
import type { ChatMessage, ChatSession } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

interface Lead {
    _id: string;
    clientName: string;
    clientMobile: string;
    clientCity: string;
    category: string;
    problem: string;
    leadStatus: string;
    qualityUrgency: string;
    targetUserId?: string | null;
}

const StaffGlobalDashboard: React.FC = () => {
    const { user } = useAuth();
    const { logout } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [stats, setStats] = useState({
        solvedCases: 0,
        pendingCases: 0,
        successRate: '0%',
        callsToday: 0,
        convertedLeads: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'dashboard' | 'workspace' | 'profile' | 'team' | 'chat'>('dashboard');
    const [workStatus, setWorkStatus] = useState<'online' | 'away' | 'busy'>('online');

    // --- CALLING STATE ---
    const [isInCall, setIsInCall] = useState(false);
    const [callMode, setCallMode] = useState<'voice' | 'video' | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isStartingCall, setIsStartingCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [incomingCallData, setIncomingCallData] = useState<any>(null);
    const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

    const rtcRef = useRef<WebRTCService | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // --- CHAT STATE ---
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [engagementNotes, setEngagementNotes] = useState('');
    const [engagementUrgency, setEngagementUrgency] = useState('Low');
    const [engagementBudget, setEngagementBudget] = useState('');
    const [engagementGenuine, setEngagementGenuine] = useState('Unverified');
    const [engagementCity, setEngagementCity] = useState('');
    const [engagementProblem, setEngagementProblem] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (isInCall) setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isInCall]);

    // LISTEN FOR INBOUND CALLS
    useEffect(() => {
        if (!user?.id || workStatus !== 'online') return;
        const unsubscribe = useCallSignals(String(user.id), (callId, caller) => {
            if (!isInCall && !isIncomingCall) {
                setIncomingCallId(callId);
                setIncomingCallData(caller);
                setIsIncomingCall(true);
            }
        });
        return () => unsubscribe();
    }, [user?.id, workStatus, isInCall, isIncomingCall]);

    // LISTEN FOR CHAT SESSIONS
    useEffect(() => {
        if (activeView === 'chat') {
            const unsubscribe = chatService.listenToWaitingSessions(setChatSessions);
            return () => unsubscribe();
        }
    }, [activeView]);

    // LISTEN FOR MESSAGES
    useEffect(() => {
        if (activeSession) {
            const unsubscribe = chatService.listenToMessages(activeSession.id, setChatMessages);
            return () => unsubscribe();
        }
    }, [activeSession]);

    const filteredLeads = useMemo(() => {
        return leads.filter(l =>
            l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.clientMobile.includes(searchTerm) ||
            l.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [leads, searchTerm]);

    useEffect(() => {
        if (activeLead) {
            setEngagementNotes(activeLead.notes || '');
            setEngagementUrgency(activeLead.qualityUrgency || 'Low');
            setEngagementBudget(activeLead.qualityBudgetLine || '');
            setEngagementGenuine(activeLead.qualityGenuine || 'Unverified');
            setEngagementCity(activeLead.clientCity || '');
            setEngagementProblem(activeLead.problem || '');
        } else {
            setEngagementNotes('');
            setEngagementUrgency('Low');
            setEngagementBudget('');
            setEngagementGenuine('Unverified');
            setEngagementCity('');
            setEngagementProblem('');
        }
    }, [activeLead]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, statsRes] = await Promise.all([
                staffService.getMyLeads(),
                staffService.getPerformance()
            ]);
            if (leadsRes.data.success) setLeads(leadsRes.data.leads);
            if (statsRes.data.success) setStats(statsRes.data.stats);
        } catch (err) {
            console.error("Fetch data error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- CALLING LOGIC ---
    const handleStartCall = async (mode: 'voice' | 'video', targetId?: string, targetName?: string) => {
        const tid = targetId || activeLead?.targetUserId;
        const tname = targetName || activeLead?.clientName;

        if (!tid) {
            alert("Digital identity not found for this unit. Use external telephony.");
            return;
        }

        setIsInCall(true);
        setCallMode(mode);
        setCallDuration(0);
        setIsStartingCall(tid === activeLead?.targetUserId); // only show loader if on workspace

        try {
            const service = new WebRTCService();
            rtcRef.current = service;
            const streams = await service.startLocalStream(mode === 'video');

            if (localVideoRef.current) localVideoRef.current.srcObject = streams.local;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = streams.remote;

            const callerName = `Official Hub: ${user?.name || "Support"}`;
            await service.createCall(String(tid), callerName, mode);
        } catch (err: any) {
            setIsInCall(false);
            setCallMode(null);
            alert(`Signal Failure: ${err.message}`);
        } finally {
            setIsStartingCall(false);
        }
    };

    const handleAnswerInbound = async () => {
        if (!incomingCallId) return;
        try {
            const service = new WebRTCService();
            rtcRef.current = service;
            const streams = await service.startLocalStream(incomingCallData.callType === 'video');

            if (localVideoRef.current) localVideoRef.current.srcObject = streams.local;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = streams.remote;

            await service.answerCall(incomingCallId);
            setIsInCall(true);
            setIsIncomingCall(false);
            setCallMode(incomingCallData.callType);
            setCallDuration(0);
        } catch (err) {
            alert("Reception Failed. Mic/Camera access required.");
            setIsIncomingCall(false);
        }
    };

    const handleEndCall = async () => {
        setIsInCall(false);
        setIsIncomingCall(false);
        const mode = callMode;
        setCallMode(null);
        if (rtcRef.current) {
            rtcRef.current.hangup();
            rtcRef.current = null;
        }
        if (activeLead) {
            try {
                await staffService.updateLead(activeLead._id, {
                    status: activeLead.leadStatus,
                    callData: { type: 'Outbound', mode: mode === 'video' ? 'Video' : 'Voice', duration: callDuration, status: 'Completed', notes: `Secure call ended at ${formatDuration(callDuration)}` }
                });
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    const toggleMic = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        rtcRef.current?.toggleAudio(!newState);
    };

    const toggleCamera = () => {
        const newState = !isVideoOff;
        setIsVideoOff(newState);
        rtcRef.current?.toggleVideo(!newState);
    };

    // --- CHAT LOGIC ---
    const handleJoinChat = async (session: ChatSession) => {
        await chatService.joinSession(session.id, String(user?.id));
        setActiveSession(session);
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeSession) return;
        await chatService.sendMessage(activeSession.id, {
            senderId: String(user?.id),
            senderName: user?.name || 'Staff',
            text: messageInput,
            type: 'text'
        });
        setMessageInput('');
    };

    const handleCloseSession = async () => {
        if (!activeSession) return;
        if (window.confirm("Close this active communication session?")) {
            await chatService.closeSession(activeSession.id);
            setActiveSession(null);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!activeLead) return;
        try {
            await staffService.updateLead(activeLead._id, {
                status: newStatus,
                notes: engagementNotes,
                urgency: engagementUrgency,
                budget: engagementBudget,
                genuine: engagementGenuine,
                city: engagementCity,
                problem: engagementProblem
            });
            setActiveLead({
                ...activeLead,
                leadStatus: newStatus,
                notes: engagementNotes,
                qualityUrgency: engagementUrgency,
                qualityBudgetLine: engagementBudget,
                qualityGenuine: engagementGenuine,
                clientCity: engagementCity,
                problem: engagementProblem
            });
            fetchData();
            alert(`Intelligence Report Synchronized.`);
        } catch (err) { alert("Sync Error: Network or Validation Failure."); }
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    const getLeadProgress = (status: string) => {
        const states: Record<string, number> = { 'New': 20, 'Qualified': 50, 'Follow Up': 75, 'Converted': 100, 'Closed': 100 };
        return states[status] || 10;
    };

    const handleLogout = () => { if (window.confirm("End your terminal session?")) logout(); };

    // --- RENDERING ---
    const renderCallOverlay = () => (
        <AnimatePresence>
            {(isInCall || isIncomingCall) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.ultraPremiumOverlay}
                >
                    <div className={styles.overlayBlur} />

                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className={styles.callHubContainer}
                    >
                        {isIncomingCall ? (
                            <div className={styles.incomingCallPanel}>
                                <div className={styles.pulseRing} />
                                <div className={styles.callerIdentity}>
                                    <div className={styles.largeAvatar}>{(incomingCallData?.callerName?.charAt(0) || '?')}</div>
                                    <h2>INCOMING {incomingCallData?.callType?.toUpperCase()}</h2>
                                    <p>{incomingCallData?.callerName}</p>
                                </div>
                                <div className={styles.responseActions}>
                                    <button className={styles.declineBtn} onClick={() => setIsIncomingCall(false)}><PhoneOff size={32} /></button>
                                    <button className={styles.acceptBtn} onClick={handleAnswerInbound}><Phone size={32} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.activeCallPanel}>
                                <div className={styles.videoGrid}>
                                    {callMode === 'video' && (
                                        <div className={styles.remoteVideoContainer}>
                                            <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVideo} />
                                            <video ref={localVideoRef} autoPlay playsInline muted className={styles.localPreview} />
                                        </div>
                                    )}
                                    {callMode === 'voice' && (
                                        <div className={styles.audioFocus}>
                                            <div className={styles.pulseWaves}>
                                                <div className={styles.wave} />
                                                <div className={styles.wave} />
                                            </div>
                                            <div className={styles.largeAvatar}>{(activeLead?.clientName?.charAt(0) || incomingCallData?.callerName?.charAt(0) || '?')}</div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.callDetails}>
                                    <h2>{activeLead?.clientName || incomingCallData?.callerName}</h2>
                                    <div className={styles.durationBadge}>{formatDuration(callDuration)}</div>
                                    <p className={styles.secureLink}><Shield size={12} /> End-to-End Encrypted Secure Signal</p>
                                </div>

                                <div className={styles.premiumControls}>
                                    <button className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`} onClick={toggleMic}>
                                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                    </button>
                                    <button className={styles.hangupPremium} onClick={handleEndCall}>
                                        <PhoneOff size={32} />
                                    </button>
                                    {callMode === 'video' && (
                                        <button className={`${styles.controlBtn} ${isVideoOff ? styles.active : ''}`} onClick={toggleCamera}>
                                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderChatHub = () => (
        <div className={styles.chatHubLayout}>
            <div className={styles.chatSidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>GLOBAL CHAT QUEUE</h3>
                    <span className={styles.liveBadge}>LIVE</span>
                </div>
                <div className={styles.sessionList}>
                    {chatSessions.length === 0 ? (
                        <div className={styles.emptySessions}>
                            <Inbox size={32} />
                            <p>No active chat requests.</p>
                        </div>
                    ) : (
                        chatSessions.map(session => (
                            <div
                                key={session.id}
                                className={`${styles.sessionCard} ${activeSession?.id === session.id ? styles.active : ''}`}
                                onClick={() => handleJoinChat(session)}
                            >
                                <div className={styles.sessionAvatar}>{(session.clientName?.charAt(0) || '?')}</div>
                                <div className={styles.sessionInfo}>
                                    <div className={styles.sessionName}>{session.clientName}</div>
                                    <div className={styles.sessionLastMsg}>{session.lastMessage}</div>
                                </div>
                                <Activity size={12} color="#10b981" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.chatMainArea}>
                {activeSession ? (
                    <>
                        <div className={styles.activeChatHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className={styles.smallAvatar}>{(activeSession.clientName?.charAt(0) || '?')}</div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{activeSession.clientName}</div>
                                    <div style={{ fontSize: '11px', color: '#10b981' }}>Secure Session Active</div>
                                </div>
                            </div>
                            <div className={styles.headerActions}>
                                <button title="Voice Call" className={styles.iconBtn} onClick={() => handleStartCall('voice', activeSession.clientId, activeSession.clientName)}><Phone size={18} /></button>
                                <button title="Video Call" className={styles.iconBtn} onClick={() => handleStartCall('video', activeSession.clientId, activeSession.clientName)}><Video size={18} /></button>
                                <button title="Close Session" className={`${styles.iconBtn} ${styles.danger}`} onClick={handleCloseSession}><PhoneOff size={18} /></button>
                            </div>
                        </div>

                        <div className={styles.messagesContainer}>
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`${styles.messageWrapper} ${msg.senderId === String(user?.id) ? styles.sender : styles.receiver}`}>
                                    <div className={styles.messageBubble}>
                                        {msg.text}
                                        <span className={styles.msgTime}>
                                            {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.chatInputWrapper}>
                            <button className={styles.attachBtn}><Paperclip size={20} /></button>
                            <input
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button className={styles.emojiBtn}><Smile size={20} /></button>
                            <button className={styles.sendActionBtn} onClick={handleSendMessage}><Send size={20} /></button>
                        </div>
                    </>
                ) : (
                    <div className={styles.noActiveChat}>
                        <MessageSquare size={64} style={{ opacity: 0.1 }} />
                        <h3>Operational Communication Hub</h3>
                        <p>Select a session from the left queue to begin real-time support.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className={styles.workspaceContainer}>
            <div className={styles.statsRow}>
                <div className={styles.statCard}><div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.14)', color: '#3b82f6' }}><Users size={24} /></div><div className={styles.statInfo}><label>Assigned Leads</label><span>{leads.length}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.14)', color: '#10b981' }}><Phone size={24} /></div><div className={styles.statInfo}><label>Network Calls</label><span>{stats.callsToday}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b' }}><CheckCircle size={24} /></div><div className={styles.statInfo}><label>Conversions</label><span>{stats.convertedLeads}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.14)', color: '#8b5cf6' }}><TrendingUp size={24} /></div><div className={styles.statInfo}><label>Success Ratio</label><span>{stats.successRate}</span></div></div>
            </div>
            <div className={styles.workspace}>
                <div className={styles.queuePanel}><div className={styles.panelHeader}><h2>LIVE SYSTEM ACTIVITY</h2></div><div style={{ padding: '24px' }}>{[1, 2, 3].map(i => (<div key={i} className={styles.activityItem}><div className={styles.activityDot} /><div><p>Client assessment #442{i} finalized</p><span>Scheduled Sync • 1h ago</span></div></div>))}</div></div>
                <div className={styles.workArea} style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px dashed rgba(59, 130, 246, 0.2)' }}><div className={styles.analyticsCenter}><BarChart2 size={48} style={{ opacity: 0.1 }} /><h3>Diagnostic Intelligence</h3><p>Enterprise performance metrics are synchronized.</p></div></div>
            </div>
        </div>
    );

    const renderWorkspace = () => (
        <div className={styles.executionWorkspace}>
            <div className={styles.workspaceHeader}>
                <div className={styles.workspaceInfo}><Activity size={20} style={{ color: '#3b82f6' }} /><div><h2>OPERATIONAL EXECUTION HUB</h2><p>Synchronize and process assigned legal units</p></div></div>
                <div className={styles.workspaceActions}><div className={styles.searchBarSmall}><Search size={14} /><input placeholder="Filter queue..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
            </div>

            <div className={styles.workspaceGrid}>
                <div className={styles.modernQueue}>
                    <div className={styles.listHeader}><span>ACTIVE OPERATIONAL QUEUE</span><span className={styles.countBadge}>{filteredLeads.length} UNITS</span></div>
                    <div className={styles.modernLeadList}>
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map(lead => (
                                <div key={lead._id} className={`${styles.modernLeadCard} ${activeLead?._id === lead._id ? styles.active : ''}`} onClick={() => setActiveLead(lead)}>
                                    <div className={styles.leadAvatar}>{(lead.clientName?.charAt(0) || '?')}</div>
                                    <div className={styles.leadInfo}><div className={styles.leadName}>{lead.clientName}</div><div className={styles.leadMeta}>{lead.category} • {lead.leadStatus}</div></div>
                                    <div className={styles.leadProgress}><div className={styles.progressBar}><div className={styles.progressFillSmall} style={{ width: `${getLeadProgress(lead.leadStatus)}%` }} /></div></div>
                                </div>
                            ))
                        ) : (<div className={styles.emptyQueue}><Inbox size={32} style={{ opacity: 0.1 }} /><p>No units assigned.</p></div>)}
                    </div>
                </div>

                <div className={styles.modernExecutionArea}>
                    {activeLead ? (
                        <div className={styles.activeLeadPanel}>
                            <div className={styles.activeLeadHeader}>
                                <div className={styles.leadIdentity}><span style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 800 }}>UNIT UNDER MANAGEMENT</span><h1>{activeLead.clientName}</h1><div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '12px' }}><span>ID: {activeLead._id.slice(-6).toUpperCase()}</span><span>LOC: {activeLead.clientCity}</span></div></div>
                                <div className={styles.avatar}>{(activeLead.clientName?.charAt(0) || '?')}</div>
                            </div>
                            <div className={styles.problemBox}><h4 className={styles.boxLabel}>Operational Requirement</h4><p>{activeLead.problem}</p></div>

                            <div className={styles.premiumCallActions}>
                                {isStartingCall ? (
                                    <div className={styles.callingLoader}><div className={styles.spinner} /><p>Negotiating Secure Signal...</p></div>
                                ) : (
                                    <div className={styles.actionButtons}>
                                        <button className={`${styles.commBtn} ${styles.voice}`} onClick={() => handleStartCall('voice')}><Phone size={24} /> VOICE HUB</button>
                                        <button className={`${styles.commBtn} ${styles.video}`} onClick={() => handleStartCall('video')}><Video size={24} /> VIDEO HUB</button>
                                        <button className={`${styles.commBtn} ${styles.chat}`} onClick={() => setActiveView('chat')}><MessageSquare size={24} /> CHAT HUB</button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.engagementReport}>
                                <h4>INTELLIGENCE REPORT</h4>
                                <div className={styles.reportGrid}>
                                    <div className={styles.field}><label>Unit Status</label><select value={activeLead.leadStatus} onChange={(e) => updateStatus(e.target.value)}><option value="New">New</option><option value="Qualified">Qualified</option><option value="Follow Up">Follow Up</option><option value="Converted">Converted</option><option value="Closed">Closed</option></select></div>
                                    <div className={styles.field}><label>Urgency Level</label><select value={engagementUrgency} onChange={(e) => setEngagementUrgency(e.target.value)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option></select></div>
                                    <div className={styles.field}><label>Budget Pipeline</label><input type="text" placeholder="e.g. 50k - 1L" value={engagementBudget} onChange={(e) => setEngagementBudget(e.target.value)} /></div>
                                    <div className={styles.field}><label>Authenticity</label><select value={engagementGenuine} onChange={(e) => setEngagementGenuine(e.target.value)}><option value="Unverified">Unverified</option><option value="Verified">Verified</option></select></div>
                                    <div className={styles.field}><label>Operational City</label><input type="text" value={engagementCity} onChange={(e) => setEngagementCity(e.target.value)} /></div>
                                    <div className={styles.fieldFull}><label>Revised Problem Statement</label><textarea style={{ height: '80px' }} value={engagementProblem} onChange={(e) => setEngagementProblem(e.target.value)} /></div>
                                    <div className={styles.fieldFull}><label>Comprehensive Discussion Notes</label><textarea placeholder="Internal discussion findings..." value={engagementNotes} onChange={(e) => setEngagementNotes(e.target.value)} /></div>
                                    <button className={styles.syncBtn} onClick={() => updateStatus(activeLead.leadStatus)}><Save size={18} /> SYNCHRONIZE DATA</button>
                                </div>
                            </div>
                        </div>
                    ) : (<div className={styles.emptyCenter}><Briefcase size={80} style={{ opacity: 0.05 }} /><h2>TERMINAL READY</h2><p>Initialize a unit from the assigned queue to begin execution.</p></div>)}
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className={styles.profileSection}>
            <div className={styles.profileHeader}><div className={styles.profileAvatarLarge}>{user?.email?.charAt(0).toUpperCase()}</div><div className={styles.profileMeta}><h2>{user?.name || user?.email}</h2><p>{user?.role?.toUpperCase()} CREDENTIALS • {user?.id}</p></div></div>
            <div className={styles.profileCardGrid}>
                <div className={styles.configCard}><h3>Security & Identity</h3><div className={styles.formGroup}><label>Primary Email</label><input type="text" value={user?.email || ''} disabled /></div><div className={styles.formGroup}><label>Verification Name</label><input type="text" defaultValue={user?.name || ''} /></div><button className={styles.saveBtn}><Save size={16} /> Update Framework</button></div>
                <div className={styles.configCard}><h3>Access Key Management</h3><div className={styles.formGroup}><label>Auth Key</label><input type="password" placeholder="••••••••" /></div><button className={styles.saveBtn} style={{ background: '#334155' }}><Key size={16} /> Rotate Keys</button></div>
            </div>
        </div>
    );

    return (
        <div className={styles.staffContainer}>
            <aside className={styles.sideNav}>
                <div className={styles.brand}><div className={styles.logoSquare}>E</div><span>EADVOCATE</span></div>
                <nav className={styles.navLinks}>
                    <button className={`${styles.navLink} ${activeView === 'dashboard' ? styles.navActive : ''}`} onClick={() => setActiveView('dashboard')}><BarChart2 size={20} /> Dashboard</button>
                    <button className={`${styles.navLink} ${activeView === 'workspace' ? styles.navActive : ''}`} onClick={() => setActiveView('workspace')}><Layout size={20} /> Workspace</button>
                    <button className={`${styles.navLink} ${activeView === 'chat' ? styles.navActive : ''}`} onClick={() => setActiveView('chat')}><MessageSquare size={20} /> Chat Hub</button>
                    <button className={`${styles.navLink} ${activeView === 'profile' ? styles.navActive : ''}`} onClick={() => setActiveView('profile')}><User size={20} /> Profile</button>
                </nav>
                <div className={styles.sideFooter}>
                    <div className={styles.userSection}><div className={styles.userMiniAvatar}>{user?.email?.charAt(0).toUpperCase()}</div><div className={styles.userMiniMeta}><p className={styles.miniName}>{user?.role}</p><p className={styles.miniStatus}>Operational</p></div></div>
                    <button className={styles.logoutAction} onClick={handleLogout}><LogOut size={18} /><span>End Session</span></button>
                </div>
            </aside>
            <main className={styles.dashboard}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {activeView !== 'dashboard' && <button className={styles.backBtn} onClick={() => setActiveView('dashboard')}><ArrowLeft size={20} /></button>}
                            <h1>{activeView === 'workspace' ? 'Operational Execution' : activeView === 'chat' ? 'Comm Hub' : 'Enterprise Suite'}</h1>
                        </div>
                    </div>
                </header>
                <AnimatePresence mode="wait">
                    <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 'calc(100% - 80px)' }}>
                        {activeView === 'dashboard' && renderDashboard()}
                        {activeView === 'workspace' && renderWorkspace()}
                        {activeView === 'chat' && renderChatHub()}
                        {activeView === 'profile' && renderProfile()}
                        {renderCallOverlay()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default StaffGlobalDashboard;
