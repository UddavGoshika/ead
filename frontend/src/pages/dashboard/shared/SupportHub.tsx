import React, { useState, useEffect, useRef } from 'react';
import {
    Phone, Video, MessageSquare, Send, X,
    Mic, MicOff, VideoOff, PhoneOff, Shield,
    Activity, Headphones, ChevronRight, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { WebRTCService, useCallSignals } from '../../../services/WebRTCService';
import { chatService } from '../../../services/chatService';
import type { ChatMessage } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import styles from './SupportHub.module.css';

const SupportHub: React.FC = () => {
    const { user, isFirebaseReady } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');

    // --- CALLING STATE ---
    const [isInCall, setIsInCall] = useState(false);
    const [callMode, setCallMode] = useState<'voice' | null>(null); // Changed to only 'voice'
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    // const [isVideoOff, setIsVideoOff] = useState(false); // Removed
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [incomingCallData, setIncomingCallData] = useState<any>(null);
    const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

    const lastActivityRef = useRef<number>(Date.now());
    const rtcRef = useRef<WebRTCService | null>(null);
    // const localVideoRef = useRef<HTMLVideoElement>(null); // Removed
    // const remoteVideoRef = useRef<HTMLVideoElement>(null); // Removed
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    // --- CHAT STATE ---
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isAgentConnected, setIsAgentConnected] = useState(false);
    const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [isStartingCall, setIsStartingCall] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- NEW STAGES ---
    const [hubStage, setHubStage] = useState<'faq' | 'form' | 'agent'>('faq');
    const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', query: '' });
    const dragControls = useDragControls();

    // FAQs data
    const faqs = [
        { q: "How do I update my profile?", a: "Go to 'My Identity' in the sidebar, click the edit icon on your profile card, and save your changes." },
        { q: "Where can I see my active leads?", a: "Leads are located in the CRM Leads module. You can filter them by status or date." },
        { q: "Is my data secure?", a: "Yes, Lexi uses end-to-end encrypted Firestore relays for all communications." },
        { q: "How to start a voice call?", a: "First, start a chat with an agent. Once an agent is assigned, the Voice Hub button will be enabled." }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (isInCall) setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isInCall]);

    // LISTEN FOR CALLS FROM STAFF
    useEffect(() => {
        if (!user?.id || !isFirebaseReady) return;
        const unsubscribe = useCallSignals(String(user.id), (callId, caller) => {
            if (!isInCall && !isIncomingCall) {
                setIncomingCallId(callId);
                setIncomingCallData(caller);
                setIsIncomingCall(true);
            }
        });
        return () => unsubscribe();
    }, [user?.id, isInCall, isIncomingCall]);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-support-hub', handleOpen);
        return () => window.removeEventListener('open-support-hub', handleOpen);
    }, []);

    // CHAT LOGIC
    const handleStartChat = async () => {
        if (sessionId || isStartingChat) return;

        if (!user?.id) {
            alert("User identity verification missing. Please refresh.");
            return;
        }

        if (!isFirebaseReady) {
            alert("Connecting to secure server... Please wait a moment and try again.");
            return;
        }

        setIsStartingChat(true);
        try {
            const metadata = {
                role: user?.role || 'unknown',
                plan: user?.plan || 'Free',
                email: user?.email || 'unknown',
                status: user?.status || 'unknown',
                unique_id: user?.unique_id || user?.id || 'unknown',
                lastActivity: Date.now()
            };
            const id = await chatService.startSession(String(user.id), user.name || 'Client', metadata);
            setSessionId(id);
            lastActivityRef.current = Date.now();
        } catch (err: any) {
            console.error("Chat Start Error:", err);
            if (err.code === 'permission-denied') {
                alert("Access Denied: Please enable 'Anonymous Auth' in Firebase Authentication and check Firestore Rules.");
            } else {
                alert(`Failed to initialize session: ${err.message || 'Connection Error'}`);
            }
        } finally {
            setIsStartingChat(false);
        }
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
        const text = messageInput.trim();
        await chatService.sendMessage(sessionId, {
            senderId: String(user?.id),
            senderName: user?.name || 'Client',
            text: text,
            type: 'text'
        });
        setMessageInput('');
        lastActivityRef.current = Date.now();
    };

    // AUTO-SCROLL
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // INACTIVITY TIMEOUT (2 MINS)
    useEffect(() => {
        if (!sessionId) return;

        const interval = setInterval(() => {
            const inactiveTime = Date.now() - lastActivityRef.current;
            if (inactiveTime > 120000) { // 2 minutes
                console.log("Inactivity timeout: Closing session");
                handleCloseChat(); // Use existing handleCloseChat
                alert("Session closed due to 2 minutes of inactivity.");
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [sessionId]);

    // CALLING LOGIC
    const handleAnswerCall = async () => {
        if (!incomingCallId) return;
        setIsStartingCall(true);
        try {
            const service = new WebRTCService();
            rtcRef.current = service;
            const streams = await service.startLocalStream(false); // No video
            // if (localVideoRef.current) localVideoRef.current.srcObject = streams.local; // Removed

            await service.answerCall(incomingCallId);

            // LISTEN FOR CALL STATUS (ENDED BY OTHER SIDE)
            const unsubscribe = onSnapshot(doc(db, 'calls', incomingCallId), (snapshot) => {
                if (!snapshot.exists()) {
                    handleEndCall();
                }
            });

            rtcRef.current.pc.ontrack = (event) => {
                if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
            };

            setIsInCall(true);
            setIsIncomingCall(false);
            setCallMode('voice'); // Force voice mode
            setCallDuration(0);
        } catch (err) {
            console.error("Answer Call Error:", err);
            alert("Connection failed.");
        } finally {
            setIsStartingCall(false);
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

    const handleStartOutgoingCall = async (mode: 'voice') => { // Only voice mode allowed
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
            const streams = await service.startLocalStream(false); // No video
            // if (localVideoRef.current) localVideoRef.current.srcObject = streams.local; // Removed

            const callId = await service.createCall(assignedStaffId, user?.name || 'Client', mode);

            // LISTEN FOR CALL STATUS (ENDED BY OTHER SIDE)
            const unsubscribe = onSnapshot(doc(db, 'calls', callId), (snapshot) => {
                if (!snapshot.exists()) {
                    handleEndCall();
                }
            });

            rtcRef.current.pc.ontrack = (event) => {
                if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
            };

        } catch (err) {
            console.error("Call Start Error:", err);
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
                onClick={() => {
                    setIsOpen(true);
                    if (!sessionId) setHubStage('faq');
                }}
            >
                <Headphones size={24} />
                <span>Ask Lexi</span>
            </motion.button>

            {/* MAIN SUPPORT HUB OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <div className={styles.hubOverlay}>
                        <div className={styles.overlayBlur} onClick={() => setIsOpen(false)} />

                        <motion.div
                            drag
                            dragControls={dragControls}
                            dragListener={false}
                            dragMomentum={false}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className={styles.hubContent}
                        >
                            <div
                                className={styles.hubHeader}
                                style={{ cursor: 'grab' }}
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <div className={styles.headerTitle}>
                                    <div className={styles.lexiAvatar}>L</div>
                                    <div>
                                        <h3>Ask Lexi</h3>
                                        <p>{hubStage === 'faq' ? 'Virtual Assistant' : 'Official Support Relay'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {sessionId && (
                                        <button className={styles.endChatBtn} onClick={handleCloseChat} title="End Session">
                                            <X size={16} color="#ef4444" />
                                        </button>
                                    )}
                                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* BODY CONTENT BASED ON STAGE */}
                            <div className={styles.hubScrollBody}>
                                {hubStage === 'faq' && (
                                    <div className={styles.faqView}>
                                        <div className={styles.faqHero}>
                                            <h4>Hello {user?.name?.split(' ')[0]}!</h4>
                                            <p>How can I help you today?</p>
                                        </div>
                                        <div className={styles.faqList}>
                                            {faqs.map((f, i) => (
                                                <details key={i} className={styles.faqItem}>
                                                    <summary>{f.q} <ChevronRight size={14} /></summary>
                                                    <div className={styles.faqAnswer}>{f.a}</div>
                                                </details>
                                            ))}
                                        </div>

                                        <div className={styles.agentEscalation}>
                                            <p>Didn't find your solution?</p>
                                            <button onClick={() => setHubStage('form')}>
                                                CHAT WITH MY AGENT <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {hubStage === 'form' && (
                                    <div className={styles.formView}>
                                        <div className={styles.hubTabs}>
                                            <button
                                                className={activeTab === 'chat' ? styles.activeTab : ''}
                                                onClick={() => setActiveTab('chat')}
                                            >
                                                <MessageSquare size={18} /> LIVE CHAT
                                            </button>
                                            <button
                                                className={`${styles.hubTab} ${activeTab === 'call' ? styles.activeTab : ''}`}
                                                onClick={() => setActiveTab('call')}
                                            >
                                                <Phone size={18} /> VOICE CALL
                                            </button>
                                        </div>

                                        <div className={styles.leadForm}>
                                            <div className={styles.formInfo}>
                                                <h4>Initialize Official Support</h4>
                                                <p>Please provide basic details to help our agents assist you better.</p>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Your Name</label>
                                                <input
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Official Email</label>
                                                <input
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="Verification email address"
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Support Query</label>
                                                <textarea
                                                    value={formData.query}
                                                    onChange={e => setFormData({ ...formData, query: e.target.value })}
                                                    placeholder="Briefly describe your issue..."
                                                />
                                            </div>
                                            <button
                                                className={styles.submitLeadBtn}
                                                onClick={() => {
                                                    setHubStage('agent');
                                                    if (activeTab === 'chat') handleStartChat();
                                                }}
                                            >
                                                CONNECT TO AGENT <ChevronRight size={18} />
                                            </button>
                                            <button className={styles.backBtn} onClick={() => setHubStage('faq')}>
                                                <ArrowLeft size={16} /> Back to FAQs
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {hubStage === 'agent' && (
                                    <div className={styles.agentView}>
                                        <div className={styles.hubTabs}>
                                            <button
                                                className={activeTab === 'chat' ? styles.activeTab : ''}
                                                onClick={() => setActiveTab('chat')}
                                            >
                                                <MessageSquare size={18} /> LIVE CHAT
                                            </button>
                                            <button
                                                className={`${styles.hubTab} ${activeTab === 'call' ? styles.activeTab : ''}`}
                                                onClick={() => setActiveTab('call')}
                                            >
                                                <Phone size={18} /> VOICE CALL
                                            </button>
                                        </div>

                                        {activeTab === 'chat' ? (
                                            <div className={styles.chatSection}>
                                                <div className={styles.activeChat}>
                                                    <div className={styles.connectionStatus}>
                                                        <div className={isAgentConnected ? styles.dotActive : styles.dotWaiting} />
                                                        {isAgentConnected ? 'Official Agent Connected' : 'Seeking Official Response...'}
                                                    </div>

                                                    {!isAgentConnected ? (
                                                        <div className={styles.waitingForAgent}>
                                                            <div className={styles.pulseContainer}>
                                                                <Shield size={48} className={styles.pulseShield} />
                                                                <div className={styles.pulseRing} />
                                                            </div>
                                                            <h3>SECURE CONNECTION INITIALIZED</h3>
                                                            <div className={styles.terminalContainer}>
                                                                <div className={styles.terminalText}>
                                                                    <span className={styles.typingCursor}>&gt;</span>
                                                                    Assignment Pending...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.messagesContainer}>
                                                            {messages.map((msg, i) => (
                                                                <div key={i} className={msg.senderId === String(user?.id) ? styles.myMsg : styles.agentMsg}>
                                                                    <div className={styles.msgBubble}>{msg.text}</div>
                                                                </div>
                                                            ))}
                                                            <div ref={messagesEndRef} />
                                                        </div>
                                                    )}
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
                                                </div>
                                                <div className={styles.callInitiation}>
                                                    {isStartingCall ? (
                                                        <div className={styles.callLoader}><div className={styles.spinner} /> Connecting...</div>
                                                    ) : (
                                                        <div className={styles.callButtons}>
                                                            <button disabled={!isAgentConnected} onClick={() => handleStartOutgoingCall('voice')} className={styles.voiceBtn}><Phone size={20} /> VOICE HUB</button>
                                                        </div>
                                                    )}
                                                    {!isAgentConnected && <p className={styles.note}>Waiting for Official Agent Assignment...</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
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
                                        {/* Removed video elements, only voice avatar remains */}
                                        <div className={styles.voiceOnlyAv}>
                                            <div className={styles.pulseWaves} />
                                            <div className={styles.callerAv}>{(incomingCallData?.callerName?.charAt(0) || '?')}</div>
                                        </div>
                                    </div>
                                    <div className={styles.callInfo}>
                                        <h3>{incomingCallData?.callerName}</h3>
                                        <span className={styles.timer}>{formatDuration(callDuration)}</span>
                                    </div>
                                    <div className={styles.controls}>
                                        <button className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`} onClick={() => { setIsMuted(!isMuted); rtcRef.current?.toggleAudio(!isMuted); }}>{isMuted ? <MicOff /> : <Mic />}</button>
                                        <button className={styles.hangupLarge} onClick={handleEndCall}><PhoneOff size={32} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <audio ref={remoteAudioRef} autoPlay />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportHub;
