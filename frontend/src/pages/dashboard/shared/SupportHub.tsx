import React, { useState, useEffect, useRef } from 'react';
import {
    Phone, Video, MessageSquare, Send, X,
    Mic, MicOff, VideoOff, PhoneOff, Shield,
    Activity, Headphones, Bot, ChevronRight, ArrowLeft
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
    const [callMode, setCallMode] = useState<'voice' | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [incomingCallData, setIncomingCallData] = useState<any>(null);
    const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

    const lastActivityRef = useRef<number>(Date.now());
    const rtcRef = useRef<WebRTCService | null>(null);
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

    // --- POPUP STAGES ---
    const [hubStage, setHubStage] = useState<'faq' | 'form' | 'agent'>('faq');
    const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', query: '' });
    const dragControls = useDragControls();

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

    const handleStartChat = async () => {
        if (sessionId || isStartingChat || !user?.id || !isFirebaseReady) return;
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
            alert(`Failed to initialize session: ${err.message || 'Connection Error'}`);
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
            return () => { unsubMessages(); unsubSession(); };
        }
    }, [sessionId, user?.id]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !sessionId) return;
        await chatService.sendMessage(sessionId, {
            senderId: String(user?.id),
            senderName: user?.name || 'Client',
            text: messageInput.trim(),
            type: 'text'
        });
        setMessageInput('');
        lastActivityRef.current = Date.now();
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleAnswerCall = async () => {
        if (!incomingCallId) return;
        setIsStartingCall(true);
        try {
            const service = new WebRTCService();
            rtcRef.current = service;
            await service.startLocalStream(false);
            await service.answerCall(incomingCallId);
            rtcRef.current.pc.ontrack = (event) => {
                if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
            };
            setIsInCall(true);
            setIsIncomingCall(false);
            setCallMode('voice');
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
        rtcRef.current?.hangup();
        rtcRef.current = null;
    };

    const handleStartOutgoingCall = async (mode: 'voice') => {
        if (!assignedStaffId) {
            alert("No official agent is currently assigned. Please send a message in chat first.");
            return;
        }
        setIsInCall(true);
        setCallMode(mode);
        setIsStartingCall(true);
        setCallDuration(0);
        try {
            const service = new WebRTCService();
            rtcRef.current = service;
            await service.startLocalStream(false);
            const callId = await service.createCall(assignedStaffId, user?.name || 'Client', mode);
            rtcRef.current.pc.ontrack = (event) => {
                if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
            };
        } catch (err) {
            console.error("Call Start Error:", err);
            alert("Connection Failed.");
            setIsInCall(false);
        } finally {
            setIsStartingCall(false);
        }
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    const [isDragging, setIsDragging] = useState(false);
    const constraintsRef = useRef(null);

    return (
        <>
            {/* CONSTRAINTS CONTAINER FOR DRAG */}
            <div ref={constraintsRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4999 }} />

            {/* GRAVITY DRAGGABLE BOT BALL */}
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragMomentum={true}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                initial={false}
                className={styles.fab}
                onClick={() => {
                    if (!isDragging) {
                        setIsOpen(true);
                        if (!sessionId) setHubStage('faq');
                    }
                }}
            >
                <div className={styles.botIconWrapper}>
                    <Bot size={30} />
                </div>
                <span className={styles.fabLabel}>Lexi</span>
            </motion.div>

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
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div
                                className={styles.hubHeader}
                                style={{ cursor: 'grab' }}
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <div className={styles.headerTitle}>
                                    <div className={styles.lexiAvatar}><Bot size={24} /></div>
                                    <div>
                                        <h3>Ask Lexi</h3>
                                        <p>{hubStage === 'faq' ? 'Virtual Assistant' : 'Official Support Relay'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {sessionId && (
                                        <button className={styles.endChatBtn} onClick={handleCloseChat} title="End Session">
                                            <PhoneOff size={16} color="#ef4444" />
                                        </button>
                                    )}
                                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                        <X size={16} />X
                                    </button>
                                </div>
                            </div>

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
                                                className={activeTab === 'call' ? styles.activeTab : ''}
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
                                                className={activeTab === 'call' ? styles.activeTab : ''}
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
                                                                <Shield size={60} className={styles.pulseShield} />
                                                            </div>
                                                            <h3 className={styles.secureHeader}>SECURE CONNECTION INITIALIZED</h3>
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
                                                            placeholder="Type your message..."
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
                                                <div className={styles.callInitiation}>
                                                    {isStartingCall ? (
                                                        <div className={styles.callLoader}>Connecting...</div>
                                                    ) : (
                                                        <button disabled={!isAgentConnected} onClick={() => handleStartOutgoingCall('voice')} className={styles.voiceBtn}>
                                                            <Phone size={20} /> START VOICE CALL
                                                        </button>
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

            {/* CALL MODAL */}
            <AnimatePresence>
                {(isIncomingCall || isInCall) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.fullCallOverlay}
                    >
                        <div className={styles.callContainer}>
                            <div className={styles.voiceOnlyAv}>
                                <div className={styles.pulseWaves} />
                                <div className={styles.callerAv}><Bot size={32} /></div>
                            </div>
                            <h2>{incomingCallData?.callerName || 'Official Admin'}</h2>
                            <span className={styles.timer}>{formatDuration(callDuration)}</span>
                            <div className={styles.controls}>
                                {!isInCall ? (
                                    <>
                                        <button className={styles.hangup} onClick={() => setIsIncomingCall(false)}><PhoneOff size={24} /></button>
                                        <button className={styles.answer} onClick={handleAnswerCall}><Phone size={24} /></button>
                                    </>
                                ) : (
                                    <button className={styles.hangupLarge} onClick={handleEndCall}><PhoneOff size={32} /></button>
                                )}
                            </div>
                        </div>
                        <audio ref={remoteAudioRef} autoPlay />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportHub;
