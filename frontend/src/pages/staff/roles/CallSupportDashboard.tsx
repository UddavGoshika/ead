
import React, { useState, useEffect, useRef } from 'react';
import styles from '../StaffGlobalDashboard.module.css';
import {
    Activity, Clock, Users,
    Mic, Phone, PhoneOff, MicOff,
    Shield, Edit3, CheckCircle, XCircle,
    Play, Pause, Mail, Smartphone, User, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { WebRTCService, useCallSignals } from '../../../services/WebRTCService';
import { db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface CallSupportDashboardProps {
    view?: 'live' | 'history' | 'performance';
}

const CallSupportDashboard: React.FC<CallSupportDashboardProps> = ({ view = 'live' }) => {
    const { user } = useAuth();
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [incomingCallId, setIncomingCallId] = useState<string | null>(null);
    const [activeCall, setActiveCall] = useState<any>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [callNotes, setCallNotes] = useState('');

    const [callLogs, setCallLogs] = useState([
        { id: 1, name: 'Charlie Goshika (Test)', phone: '+91 9876543210', date: '14/02/2026', duration: '5:20', status: 'Answered', agent: 'Self', notes: 'Inquired about advocate fees.' },
    ]);

    const rtcRef = useRef<WebRTCService | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    // --- DATA CONNECTION LOGIC ---
    useEffect(() => {
        if (!user?.id) return;
        const unsubscribe = useCallSignals(String(user.id), (callId, caller) => {
            if (!activeCall && !incomingCallId) {
                setIncomingCallId(callId);
                setIncomingCall({
                    ...caller,
                    email: caller.email || 'N/A',
                    unique_id: caller.unique_id || 'ID-' + callId.slice(-6)
                });
            }
        });

        return () => { unsubscribe(); };
    }, [user?.id, activeCall, incomingCallId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeCall && !isOnHold) {
            interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [activeCall, isOnHold]);

    const handleAnswerCall = async () => {
        if (!incomingCallId) return;

        try {
            rtcRef.current = new WebRTCService();
            await rtcRef.current.startLocalStream(false);
            await rtcRef.current.answerCall(incomingCallId);

            setActiveCall({
                id: incomingCallId,
                clientName: incomingCall?.callerName || 'Client',
                clientPhone: incomingCall?.callerPhone || 'N/A',
                email: incomingCall?.email || 'N/A',
                unique_id: incomingCall?.unique_id || 'N/A',
                status: 'Connected'
            });
            setIncomingCallId(null);

            onSnapshot(doc(db, 'calls', incomingCallId), (snapshot) => {
                if (!snapshot.exists()) handleEndCall();
            });

            rtcRef.current.pc.ontrack = (event) => {
                if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
            };
        } catch (err) { setIncomingCallId(null); }
    };

    const handleRejectCall = () => { setIncomingCallId(null); setIncomingCall(null); };

    const handleEndCall = () => {
        if (activeCall) {
            const newLog = {
                id: Date.now(),
                name: activeCall.clientName,
                phone: activeCall.clientPhone,
                date: new Date().toLocaleDateString(),
                duration: formatDuration(callDuration),
                status: 'Answered',
                agent: 'Self',
                notes: callNotes || 'Call completed successfully.'
            };
            setCallLogs(prev => [newLog, ...prev]);
        }
        setActiveCall(null);
        setCallDuration(0);
        setCallNotes('');
        setIsMuted(false);
        setIsOnHold(false);
        if (rtcRef.current) { rtcRef.current.hangup(); rtcRef.current = null; }
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    return (
        <div className={styles.fullDashboardArea}>
            <AnimatePresence>
                {incomingCallId && (
                    <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className={styles.incomingCallStrip}>
                        <div className={styles.stripInfo}>
                            <div className={styles.pulseRingSmall} />
                            <div className={styles.stripCaller}>
                                <strong>{incomingCall?.callerName}</strong>
                                <span className={styles.stripMeta}><Smartphone size={12} /> {incomingCall?.callerPhone} • <Mail size={12} /> {incomingCall?.email}</span>
                            </div>
                        </div>
                        <div className={styles.stripActions}>
                            <button className={styles.stripDecline} onClick={handleRejectCall}><PhoneOff size={18} /> Reject</button>
                            <button className={styles.stripAccept} onClick={handleAnswerCall}><Phone size={18} /> Accept</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {view === 'live' ? (
                <div className={styles.callWorkspace}>
                    {activeCall ? (
                        <div className={styles.productionCallPanel}>
                            <div className={styles.callStateHeader}>
                                <div className={styles.callIdentity}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div className={styles.smallAvatar}>{activeCall.clientName.charAt(0)}</div>
                                        <div>
                                            <h2>{activeCall.clientName}</h2>
                                            <div className={styles.callIdentityMeta}>
                                                <span>ID: {activeCall.unique_id}</span>
                                                <span><Smartphone size={12} /> {activeCall.clientPhone}</span>
                                                <span><Mail size={12} /> {activeCall.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.callTimerDisplay}><Clock size={20} /><span>{formatDuration(callDuration)}</span></div>
                            </div>
                            <div className={styles.productionControls}>
                                <button className={`${styles.prodIconBtn} ${isMuted ? styles.active : ''}`} onClick={() => setIsMuted(!isMuted)}>{isMuted ? <MicOff size={28} /> : <Mic size={28} />}</button>
                                <button className={`${styles.prodIconBtn} ${isOnHold ? styles.active : ''}`} onClick={() => setIsOnHold(!isOnHold)}>{isOnHold ? <Play size={28} /> : <Pause size={28} />}</button>
                                <button className={styles.prodEndBtn} onClick={handleEndCall}><PhoneOff size={32} /></button>
                            </div>
                            <div className={styles.notesSection}>
                                <label><Edit3 size={14} /> Internal Call Notes</label>
                                <textarea placeholder="Note details..." value={callNotes} onChange={(e) => setCallNotes(e.target.value)} />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyCallState}><div className={styles.pulseRing} /><h3>Status: Online</h3><p>Listening for real client voice signals...</p></div>
                    )}
                </div>
            ) : (
                <div className={styles.callLogsBox} style={{ flex: 1, margin: 0 }}>
                    <div className={styles.boxHeader}><h3>Full Voice Archives</h3></div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.modernTable}>
                            <thead><tr><th>Name</th><th>Phone</th><th>Date</th><th>Duration</th><th>Status</th><th>Notes</th></tr></thead>
                            <tbody>
                                {callLogs.map(log => (
                                    <tr key={log.id}>
                                        <td><strong>{log.name}</strong></td>
                                        <td>{log.phone}</td>
                                        <td>{log.date}</td>
                                        <td>{log.duration}</td>
                                        <td><span className={log.status === 'Answered' ? styles.statusClosed : styles.statusMissed}>{log.status}</span></td>
                                        <td className={styles.truncateNotes}>{log.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
        </div>
    );
};

export default CallSupportDashboard;
