import React, { useState, useEffect, useRef } from 'react';
import {
    Phone, Video, MessageSquare, Send, X,
    Mic, MicOff, VideoOff, PhoneOff, Shield,
    Activity, Headphones, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebRTCService, useCallSignals } from '../../../services/WebRTCService';
import { chatService } from '../../../services/chatService';
import type { ChatMessage } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';
import styles from './SupportHub.module.css';

const SupportHub: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');

    // --- CALLING STATE ---
    const [isInCall, setIsInCall] = useState(false);
    const [callMode, setCallMode] = useState<'voice' | 'video' | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [incomingCallData, setIncomingCallData] = useState<any>(null);
    const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

    const rtcRef = useRef<WebRTCService | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // --- CHAT STATE ---
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isAgentConnected, setIsAgentConnected] = useState(false);
    const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
    const [isStartingCall, setIsStartingCall] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isInCall) setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isInCall]);

    // LISTEN FOR CALLS FROM STAFF
    useEffect(() => {
        if (!user?.id) return;
        const unsubscribe = useCallSignals(String(user.id), (callId, caller) => {
            if (!isInCall && !isIncomingCall) {
                setIncomingCallId(callId);
                setIncomingCallData(caller);
                setIsIncomingCall(true);
            }
        });
        return () => unsubscribe();
    }, [user?.id, isInCall, isIncomingCall]);

    // CHAT LOGIC
    const handleStartChat = async () => {
        if (sessionId) return;
        const id = await chatService.startSession(String(user?.id), user?.name || 'Client');
        setSessionId(id);
    };

    useEffect(() => {
        if (sessionId) {
            const unsubMessages = chatService.listenToMessages(sessionId, (msgs) => {
                setMessages(msgs);
                const agentJoined = msgs.some(m => m.senderId !== String(user?.id));
                if (agentJoined) setIsAgentConnected(true);
            });
            const unsubSession = chatService.listenToSession(sessionId, (sess) => {
                if (sess.status === 'closed') {
                    setSessionId(null);
                    setMessages([]);
                    setIsAgentConnected(false);
                    setAssignedStaffId(null);
                    alert("Official session has been closed by the agent.");
                } else if (sess.assignedStaffId) {
                    setAssignedStaffId(sess.assignedStaffId);
                    setIsAgentConnected(true);
                }
            });
            return () => {
                unsubMessages();
                unsubSession();
            };
        }
    }, [sessionId, user?.id]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !sessionId) return;
        await chatService.sendMessage(sessionId, {
            senderId: String(user?.id),
            senderName: user?.name || 'Client',
            text: messageInput,
            type: 'text'
        });
        setMessageInput('');
    };

    // CALLING LOGIC
    const handleAnswerCall = async () => {
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
            alert("Connection failed.");
        }
    };

    const handleEndCall = () => {
        setIsInCall(false);
        setIsIncomingCall(false);
        setCallMode(null);
        setIsStartingCall(false);
        rtcRef.current?.hangup();
        rtcRef.current = null;
    };

    const handleStartOutgoingCall = async (mode: 'voice' | 'video') => {
        if (!assignedStaffId) {
            alert("No official agent is currently assigned to your session. Please send a message in chat first.");
            return;
        }
        setIsInCall(true);
        setCallMode(mode);
        setIsStartingCall(true);
        setCallDuration(0);

        try {
            const service = new WebRTCService();
            rtcRef.current = service;
            const streams = await service.startLocalStream(mode === 'video');
            if (localVideoRef.current) localVideoRef.current.srcObject = streams.local;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = streams.remote;

            await service.createCall(assignedStaffId, user?.name || 'Client', mode);
        } catch (err) {
            alert("Digital Signal Negotiation Failed.");
            setIsInCall(false);
            setCallMode(null);
        } finally {
            setIsStartingCall(false);
        }
    };

    const handleCloseChat = async () => {
        if (!sessionId) return;
        if (window.confirm("End this official support session?")) {
            await chatService.closeSession(sessionId);
            setSessionId(null);
            setMessages([]);
            setIsAgentConnected(false);
            setAssignedStaffId(null);
        }
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={styles.fab}
                onClick={() => setIsOpen(true)}
            >
                <Headphones size={24} />
                <span>Contact Official Support</span>
            </motion.button>

            {/* MAIN SUPPORT HUB OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.hubOverlay}
                    >
                        <div className={styles.overlayBlur} onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className={styles.hubContent}
                        >
                            <div className={styles.hubHeader}>
                                <div className={styles.headerTitle}>
                                    <Headphones size={20} color="#3b82f6" />
                                    <div>
                                        <h3>Official Support Hub</h3>
                                        <p>Secure Communication Terminal</p>
                                    </div>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                    <X size={20} />
                                </button>
                                {sessionId && (
                                    <button className={styles.endChatBtn} onClick={handleCloseChat} title="End Session">
                                        <X size={16} color="#ef4444" />
                                    </button>
                                )}
                            </div>

                            <div className={styles.hubTabs}>
                                <button
                                    className={activeTab === 'chat' ? styles.activeTab : ''}
                                    onClick={() => setActiveTab('chat')}
                                >
                                    <MessageSquare size={18} /> LIVE CHAT
                                </button>
                                <button
                                    className={activeTab === 'call' ? styles.activeTab : ''}
                                    onClick={() => setActiveTab('call')}
                                >
                                    <Phone size={18} /> VOICE/VIDEO
                                </button>
                            </div>

                            {activeTab === 'chat' ? (
                                <div className={styles.chatSection}>
                                    {!sessionId ? (
                                        <div className={styles.startChatState}>
                                            <div className={styles.shieldIcon}><Shield size={48} /></div>
                                            <h4>Initialize Secure Session</h4>
                                            <p>Our official legal support agents are ready to assist you in real-time.</p>
                                            <button className={styles.startBtn} onClick={handleStartChat}>
                                                START LIVE CHAT <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.activeChat}>
                                            <div className={styles.connectionStatus}>
                                                <div className={isAgentConnected ? styles.dotActive : styles.dotWaiting} />
                                                {isAgentConnected ? 'Official Agent Connected' : 'Waiting for Official Response...'}
                                            </div>
                                            <div className={styles.messagesContainer}>
                                                {messages.map((msg, i) => (
                                                    <div key={i} className={msg.senderId === String(user?.id) ? styles.myMsg : styles.agentMsg}>
                                                        <div className={styles.msgBubble}>{msg.text}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.inputArea}>
                                                <input
                                                    placeholder="Type your query..."
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                />
                                                <button onClick={handleSendMessage}><Send size={20} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.callSection}>
                                    <div className={styles.callFeatures}>
                                        <div className={styles.featureItem}>
                                            <Shield size={24} />
                                            <div>
                                                <h5>End-to-End Secure</h5>
                                                <p>All calls are encrypted via Official WebRTC Signaling.</p>
                                            </div>
                                        </div>
                                        <div className={styles.featureItem}>
                                            <Video size={24} />
                                            <div>
                                                <h5>Premium Interaction</h5>
                                                <p>Request live assessment once an agent is assigned.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.callInitiation}>
                                        {isStartingCall ? (
                                            <div className={styles.callLoader}><div className={styles.spinner} /> Negotiating Signal...</div>
                                        ) : (
                                            <div className={styles.callButtons}>
                                                <button disabled={!isAgentConnected} onClick={() => handleStartOutgoingCall('voice')} className={styles.voiceBtn}><Phone size={20} /> VOICE HUB</button>
                                                <button disabled={!isAgentConnected} onClick={() => handleStartOutgoingCall('video')} className={styles.videoBtn}><Video size={20} /> VIDEO HUB</button>
                                            </div>
                                        )}
                                        {!isAgentConnected && <p className={styles.note}>Waiting for Official Agent Assignment...</p>}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GLOBAL INCOMING CALL MODAL (FOR CLIENT) */}
            <AnimatePresence>
                {(isIncomingCall || isInCall) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.fullCallOverlay}
                    >
                        <div className={styles.overlayBlur} />
                        <div className={styles.callContainer}>
                            {isIncomingCall ? (
                                <div className={styles.incomingBox}>
                                    <div className={styles.callerAv}>{(incomingCallData?.callerName?.charAt(0) || '?')}</div>
                                    <h2>{isStartingCall ? 'NEGOTIATING SIGNAL...' : 'INCOMING OFFICIAL CALL'}</h2>
                                    <p>{isStartingCall ? 'Connecting to Secure Hub' : incomingCallData?.callerName}</p>
                                    {!isStartingCall && (
                                        <div className={styles.actions}>
                                            <button className={styles.hangup} onClick={() => setIsIncomingCall(false)}><PhoneOff size={32} /></button>
                                            <button className={styles.answer} onClick={handleAnswerCall}><Phone size={32} /></button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.activeCallBox}>
                                    <div className={styles.videoStreamGrid}>
                                        {callMode === 'video' ? (
                                            <>
                                                <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVid} />
                                                <video ref={localVideoRef} autoPlay playsInline muted className={styles.localPreview} />
                                            </>
                                        ) : (
                                            <div className={styles.voiceOnlyAv}>
                                                <div className={styles.pulseWaves} />
                                                <div className={styles.callerAv}>{(incomingCallData?.callerName?.charAt(0) || '?')}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.callInfo}>
                                        <h3>{incomingCallData?.callerName}</h3>
                                        <span className={styles.timer}>{formatDuration(callDuration)}</span>
                                    </div>
                                    <div className={styles.controls}>
                                        <button className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`} onClick={() => { setIsMuted(!isMuted); rtcRef.current?.toggleAudio(isMuted); }}>{isMuted ? <MicOff /> : <Mic />}</button>
                                        <button className={styles.hangupLarge} onClick={handleEndCall}><PhoneOff size={32} /></button>
                                        {callMode === 'video' && (
                                            <button className={`${styles.controlBtn} ${isVideoOff ? styles.active : ''}`} onClick={() => { setIsVideoOff(!isVideoOff); rtcRef.current?.toggleVideo(isVideoOff); }}>{isVideoOff ? <VideoOff /> : <Video />}</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportHub;
