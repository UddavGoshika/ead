import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './PremiumCall.module.css';
import {
    Search, Shield, Target, Activity,
    MessageSquare, Phone, ArrowLeft,
    Clock, UserCheck, MoreHorizontal,
    PhoneCall, Zap,
    FileText, Upload, Star, Lock, History, CreditCard,
    Download, Share2,
    Ban, Printer, Crown,
    Mic, Pause, Repeat, Receipt, Check, X, Play, StopCircle,
    Volume2, Headphones, Save, Trash2,
    Maximize2, Minimize2,
    Users, Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportCallUI from '../../../../components/support/SupportCallUI';
import SupportUserTable from '../../../../components/support/SupportUserTable';

export interface SupportUser {
    id: string;
    name: string;
    role: 'advocate' | 'client';
    status: 'online' | 'offline' | 'away' | 'busy' | 'in-call';
    lastActivity: string;
    priority: 'High' | 'Medium' | 'Low';
    location: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    degree: string;
    university: string;
    college: string;
    gradYear: string;
    image?: string;
    notes?: string[];
    recordings?: Array<{
        id: string;
        name: string;
        date: string;
        duration: string;
        size: string;
        url?: string;
    }>;
    subscription?: {
        plan: 'Basic' | 'Pro' | 'Enterprise';
        status: 'active' | 'expired' | 'pending';
        renewal: string;
        payment: string;
    };
    timeline?: Array<{
        id: string;
        action: string;
        timestamp: string;
        details: string;
        user: string;
    }>;
}

const MOCK_USERS: SupportUser[] = [
    {
        id: 'call-1',
        name: 'Dr. Amit Patel',
        role: 'advocate',
        status: 'online',
        lastActivity: 'Active now',
        priority: 'High',
        location: 'Bangalore, Karnataka',
        email: 'amit.p@example.com',
        phone: '+91 99876 54321',
        dob: '05/03/1980',
        gender: 'Male',
        degree: 'PhD Law',
        university: 'NLSIU',
        college: 'Main Campus',
        gradYear: '2005',
        image: 'https://images.unsplash.com/photo-1556155099-870a7662039?auto=format&fit=crop&q=80&w=200&h=200',
        notes: [
            'Prefers morning calls',
            'Specializes in corporate law',
            'VIP client - handle with care'
        ],
        recordings: [
            { id: 'rec-1', name: 'Initial Consultation', date: '2024-01-15', duration: '45:23', size: '45 MB' },
            { id: 'rec-2', name: 'Case Review', date: '2024-01-20', duration: '32:10', size: '32 MB' }
        ],
        subscription: {
            plan: 'Enterprise',
            status: 'active',
            renewal: '2024-12-31',
            payment: 'Credit Card'
        },
        timeline: [
            { id: 'tl-1', action: 'Call Initiated', timestamp: '10:30 AM', details: 'Initial consultation call', user: 'System' },
            { id: 'tl-2', action: 'Document Shared', timestamp: '10:45 AM', details: 'Legal brief uploaded', user: 'Dr. Amit Patel' }
        ]
    },
    {
        id: 'call-2',
        name: 'Priya Sharma',
        role: 'client',
        status: 'online',
        lastActivity: '5m ago',
        priority: 'High',
        location: 'Chennai, Tamil Nadu',
        email: 'priya.s@example.com',
        phone: '+91 87654 32109',
        dob: '10/08/1990',
        gender: 'Female',
        degree: 'BTech',
        university: 'IIT Madras',
        college: 'Engineering Dept',
        gradYear: '2012',
        notes: [
            'Technical background',
            'Quick decision maker'
        ],
        recordings: [
            { id: 'rec-3', name: 'First Call', date: '2024-01-10', duration: '25:15', size: '25 MB' }
        ],
        subscription: {
            plan: 'Pro',
            status: 'active',
            renewal: '2024-06-30',
            payment: 'PayPal'
        },
        timeline: [
            { id: 'tl-3', action: 'Account Created', timestamp: '09:15 AM', details: 'New client registration', user: 'System' },
            { id: 'tl-4', action: 'Subscription Upgraded', timestamp: '09:30 AM', details: 'Upgraded to Pro plan', user: 'Priya Sharma' }
        ]
    },
    {
        id: 'call-3',
        name: 'Rajesh Kumar',
        role: 'advocate',
        status: 'in-call',
        lastActivity: 'In call',
        priority: 'Medium',
        location: 'Mumbai, Maharashtra',
        email: 'rajesh.k@example.com',
        phone: '+91 98765 43210',
        dob: '15/07/1975',
        gender: 'Male',
        degree: 'LLM',
        university: 'Mumbai University',
        college: 'Law College',
        gradYear: '2000'
    },
    {
        id: 'call-4',
        name: 'Sneha Verma',
        role: 'client',
        status: 'away',
        lastActivity: '2h ago',
        priority: 'Low',
        location: 'Delhi',
        email: 'sneha.v@example.com',
        phone: '+91 76543 21098',
        dob: '22/11/1988',
        gender: 'Female',
        degree: 'MBA',
        university: 'Delhi University',
        college: 'Business School',
        gradYear: '2010'
    }
];

interface Recording {
    id: string;
    name: string;
    date: string;
    duration: string;
    size: string;
    isPlaying: boolean;
}

interface Note {
    id: string;
    content: string;
    timestamp: string;
    author: string;
}

const PremiumCall: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<SupportUser | null>(MOCK_USERS[0]);
    const [activeInteraction, setActiveInteraction] = useState<'call' | 'help' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'advocate' | 'client'>('all');
    const [membersHandled, setMembersHandled] = useState(5);
    const [activeTab, setActiveTab] = useState<'dossier' | 'timeline' | 'history' | 'files' | 'subscription' | 'notes'>('dossier');
    const [isVIP, setIsVIP] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [overlayType, setOverlayType] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(80);
    const [callDuration, setCallDuration] = useState(0);
    const [recordingTimer, setRecordingTimer] = useState(0);
    const [recordings, setRecordings] = useState<Recording[]>([
        { id: '1', name: 'Call_001.mp3', date: '2024-01-15', duration: '45:23', size: '45 MB', isPlaying: false },
        { id: '2', name: 'Meeting_042.mp3', date: '2024-01-14', duration: '32:10', size: '32 MB', isPlaying: false },
        { id: '3', name: 'Consultation_003.mp3', date: '2024-01-13', duration: '28:45', size: '29 MB', isPlaying: false },
    ]);
    const [notes, setNotes] = useState<Note[]>([
        { id: '1', content: 'Client requested callback tomorrow at 10 AM', timestamp: '10:30 AM', author: 'Agent 01' },
        { id: '2', content: 'Discussed legal options for case #4521', timestamp: '09:45 AM', author: 'Dr. Amit' },
        { id: '3', content: 'Important documents shared via secure link', timestamp: 'Yesterday', author: 'System' },
    ]);
    const [newNote, setNewNote] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [callQuality, setCallQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
    const [transferTarget, setTransferTarget] = useState<string>('');
    const [callSummary, setCallSummary] = useState('');
    const [autoRecording, setAutoRecording] = useState(true);

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const callTimerRef = useRef<any>(null);

    // Simulate real-time call timer
    useEffect(() => {
        if (activeInteraction === 'call' && !isOnHold) {
            callTimerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }

        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, [activeInteraction, isOnHold]);

    // Simulate recording timer
    useEffect(() => {
        let timer: any;
        if (isRecording) {
            timer = setInterval(() => {
                setRecordingTimer(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRecording]);

    // Simulate call quality changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeInteraction === 'call') {
                const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good', 'poor'];
                const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
                setCallQuality(randomQuality);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [activeInteraction]);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.phone.includes(searchTerm);
            const matchesFilter = filter === 'all' || u.role === filter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filter]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRoleAction = (action: string) => {
        switch (action.toLowerCase()) {
            case 'record':
                setIsRecording(!isRecording);
                if (!isRecording) {
                    setRecordingTimer(0);
                }
                break;
            case 'hold':
                setIsOnHold(!isOnHold);
                break;
            case 'mute':
                setIsMuted(!isMuted);
                break;
            case 'transfer':
                setOverlayType('transfer');
                break;
            case 'summary':
                generateCallSummary();
                setOverlayType('summary');
                break;
            case 'close':
                if (activeInteraction) {
                    setActiveInteraction(null);
                    setCallDuration(0);
                    setIsRecording(false);
                    setIsOnHold(false);
                    setMembersHandled(prev => prev + 1);
                }
                break;
            case 'transcribe':
                setIsTranscribing(!isTranscribing);
                if (!isTranscribing) {
                    simulateTranscription();
                }
                break;
            default:
                setOverlayType(action.toLowerCase());
        }
    };

    const simulateTranscription = () => {
        setIsTranscribing(true);
        setTimeout(() => {
            setTranscription(`Transcript generated at ${new Date().toLocaleTimeString()}:
            
            Agent: Hello, thank you for calling premium support.
            Client: I need assistance with my case documents.
            Agent: I can help you with that. What seems to be the issue?
            Client: The document upload is failing repeatedly.
            Agent: Let me check the system status...`);
            setIsTranscribing(false);
        }, 2000);
    };

    const generateCallSummary = () => {
        const summary = `Call Summary - ${new Date().toLocaleDateString()}
        
        Duration: ${formatTime(callDuration)}
        Participants: ${selectedUser?.name} (${selectedUser?.role})
        Status: ${isOnHold ? 'On Hold' : 'Completed'}
        Recording: ${isRecording ? 'Active' : 'Not Recorded'}
        
        Key Points Discussed:
        1. Case review and documentation
        2. Next steps identified
        3. Follow-up scheduled
        
        Actions Required:
        - Send documents via secure link
        - Schedule next consultation
        - Update case file
        
        Generated: ${new Date().toLocaleTimeString()}`;
        setCallSummary(summary);
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const newRecording: Recording = {
                id: Date.now().toString(),
                name: files[0].name,
                date: new Date().toISOString().split('T')[0],
                duration: '00:00',
                size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
                isPlaying: false
            };
            setRecordings(prev => [newRecording, ...prev]);
        }
    };

    const handleRecordingPlay = (id: string) => {
        setRecordings(prev => prev.map(rec => ({
            ...rec,
            isPlaying: rec.id === id ? !rec.isPlaying : false
        })));
        setSelectedRecording(id === selectedRecording ? null : id);
    };

    const handleAddNote = () => {
        if (newNote.trim()) {
            const note: Note = {
                id: Date.now().toString(),
                content: newNote,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                author: 'You'
            };
            setNotes(prev => [note, ...prev]);
            setNewNote('');
        }
    };

    const handleDeleteNote = (id: string) => {
        setNotes(prev => prev.filter(note => note.id !== id));
    };

    const handleTransferCall = () => {
        if (transferTarget) {
            // Simulate transfer process
            setTimeout(() => {
                alert(`Call transferred to ${transferTarget}`);
                setTransferTarget('');
                setOverlayType(null);
            }, 1500);
        }
    };

    const handleDownloadRecording = (recording: Recording) => {
        // Simulate download
        const element = document.createElement('a');
        const file = new Blob([`Simulated recording: ${recording.name}`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = recording.name;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleShareRecording = (recording: Recording) => {
        navigator.clipboard.writeText(`https://secure.example.com/recordings/${recording.id}`)
            .then(() => alert('Share link copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dossier':
                return (
                    <>
                        <section className={styles.dataSection}>
                            <div className={styles.sectionTitle}>
                                <Target size={16} />
                                <span>COMMUNICATION PROFILE</span>
                            </div>
                            <div className={styles.dataGrid}>
                                {selectedUser && Object.entries({
                                    'Full Name': selectedUser.name,
                                    'Internal ID': selectedUser.id,
                                    'Voice Line': selectedUser.phone,
                                    'Email Address': selectedUser.email,
                                    'Date of Birth': selectedUser.dob,
                                    'Gender': selectedUser.gender,
                                    'Legal Degree': selectedUser.degree,
                                    'University': selectedUser.university,
                                    'College/Institution': selectedUser.college,
                                    'Graduation Year': selectedUser.gradYear,
                                    'Current Location': selectedUser.location,
                                    'Uplink Priority': selectedUser.priority
                                }).map(([label, value]) => (
                                    <div key={label} className={styles.dataItem}>
                                        <label>{label}</label>
                                        <p>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.dataSection}>
                            <div className={styles.sectionTitle}>
                                <Activity size={16} />
                                <span>TELEPHONY HUB</span>
                            </div>
                            <div className={styles.roleWidgetGrid}>
                                <div className={styles.widgetCard}>
                                    <h4>Recording Status</h4>
                                    <div className={styles.toggleRow}>
                                        <span>Auto-Vault</span>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={autoRecording}
                                                onChange={(e) => setAutoRecording(e.target.checked)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                    <div className={styles.toggleRow}>
                                        <span>Active Recording</span>
                                        <div className={`${styles.statusIndicator} ${isRecording ? styles.active : styles.inactive}`}>
                                            {isRecording ? 'ON' : 'OFF'}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.widgetCard}>
                                    <h4>Call Analytics</h4>
                                    <div className={styles.miniList}>
                                        <div className={styles.miniListItem}>
                                            <Clock size={12} />
                                            <span>Duration: {formatTime(callDuration)}</span>
                                        </div>
                                        <div className={styles.miniListItem}>
                                            <Signal size={12} />
                                            <span>Quality: {callQuality}</span>
                                        </div>
                                        <div className={styles.miniListItem}>
                                            <Volume2 size={12} />
                                            <span>Volume: {volume}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.widgetCard}>
                                    <h4>Live Transcription</h4>
                                    <button
                                        className={`${styles.pulseBtn} ${isTranscribing ? styles.active : ''}`}
                                        onClick={() => handleRoleAction('Transcribe')}
                                    >
                                        {isTranscribing ? 'Transcribing...' : transcription ? 'View' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {transcription && (
                            <section className={styles.dataSection}>
                                <div className={styles.sectionTitle}>
                                    <FileText size={16} />
                                    <span>LIVE TRANSCRIPTION</span>
                                </div>
                                <div className={styles.transcriptionBox}>
                                    <pre>{transcription}</pre>
                                </div>
                            </section>
                        )}

                        <div className={styles.tableWrapper}>
                            <SupportUserTable users={MOCK_USERS} />
                        </div>
                    </>
                );

            case 'timeline':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <Clock size={16} />
                            <span>ACTIVITY TIMELINE</span>
                            <button className={styles.refreshBtn} onClick={() => {/* Refresh timeline */ }}>
                                <Repeat size={14} />
                            </button>
                        </div>
                        <div className={styles.timelineContainer}>
                            {selectedUser?.timeline?.map((event, index) => (
                                <div key={event.id} className={styles.timelineItem}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineHeader}>
                                            <span className={styles.timelineAction}>{event.action}</span>
                                            <span className={styles.timelineTime}>{event.timestamp}</span>
                                        </div>
                                        <p className={styles.timelineDetails}>{event.details}</p>
                                        <span className={styles.timelineUser}>by {event.user}</span>
                                    </div>
                                    {index < (selectedUser.timeline?.length || 0) - 1 && (
                                        <div className={styles.timelineConnector}></div>
                                    )}
                                </div>
                            )) || (
                                    <div className={styles.emptyTimeline}>
                                        <Clock size={32} />
                                        <p>No timeline events found</p>
                                    </div>
                                )}
                        </div>
                    </section>
                );

            case 'history':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <Headphones size={16} />
                            <span>VOICE RECORDINGS</span>
                            <div className={styles.recordingActions}>
                                <button className={styles.iconBtn} onClick={handleFileUpload}>
                                    <Upload size={14} />
                                    <span>Upload</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="audio/*"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    className={`${styles.iconBtn} ${isRecording ? styles.recording : ''}`}
                                    onClick={() => handleRoleAction('Record')}
                                >
                                    <Mic size={14} />
                                    <span>{isRecording ? 'Stop' : 'Record'}</span>
                                </button>
                            </div>
                        </div>

                        {isRecording && (
                            <div className={styles.recordingStatus}>
                                <div className={styles.recordingIndicator}>
                                    <div className={styles.recordingPulse}></div>
                                    <span>Recording in progress... {formatTime(recordingTimer)}</span>
                                </div>
                                <button className={styles.stopBtn} onClick={() => handleRoleAction('Record')}>
                                    <StopCircle size={16} />
                                    Stop
                                </button>
                            </div>
                        )}

                        <div className={styles.recordingsGrid}>
                            {recordings.map(recording => (
                                <div key={recording.id} className={styles.recordingCard}>
                                    <div className={styles.recordingHeader}>
                                        <FileText size={16} />
                                        <div className={styles.recordingInfo}>
                                            <h4>{recording.name}</h4>
                                            <div className={styles.recordingMeta}>
                                                <span>{recording.date}</span>
                                                <span>{recording.duration}</span>
                                                <span>{recording.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.recordingControls}>
                                        <button
                                            className={`${styles.controlBtn} ${recording.isPlaying ? styles.playing : ''}`}
                                            onClick={() => handleRecordingPlay(recording.id)}
                                        >
                                            {recording.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                        </button>
                                        <button
                                            className={styles.controlBtn}
                                            onClick={() => handleDownloadRecording(recording)}
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            className={styles.controlBtn}
                                            onClick={() => handleShareRecording(recording)}
                                        >
                                            <Share2 size={14} />
                                        </button>
                                        <button className={styles.controlBtn}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {recording.isPlaying && (
                                        <div className={styles.audioWaveform}>
                                            {[...Array(20)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={styles.waveBar}
                                                    style={{
                                                        height: `${20 + Math.random() * 30}px`,
                                                        animationDelay: `${i * 0.05}s`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );

            case 'subscription':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <CreditCard size={16} />
                            <span>BILLING & SUBSCRIPTION</span>
                        </div>

                        {selectedUser?.subscription ? (
                            <div className={styles.subscriptionCard}>
                                <div className={styles.subscriptionHeader}>
                                    <div className={styles.planBadge}>
                                        <Crown size={14} />
                                        <span>{selectedUser.subscription.plan} PLAN</span>
                                    </div>
                                    <div className={`${styles.statusBadge} ${styles[selectedUser.subscription.status]}`}>
                                        {selectedUser.subscription.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className={styles.subscriptionDetails}>
                                    <div className={styles.detailRow}>
                                        <label>Payment Method:</label>
                                        <span>{selectedUser.subscription.payment}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <label>Renewal Date:</label>
                                        <span>{selectedUser.subscription.renewal}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <label>Auto-Renew:</label>
                                        <label className={styles.switch}>
                                            <input type="checkbox" defaultChecked />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.subscriptionActions}>
                                    <button className={styles.actionBtn}>
                                        <CreditCard size={14} />
                                        Update Payment
                                    </button>
                                    <button className={styles.actionBtn}>
                                        <History size={14} />
                                        View Invoices
                                    </button>
                                    <button className={styles.actionBtn}>
                                        <Printer size={14} />
                                        Print Receipt
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noSubscription}>
                                <CreditCard size={32} />
                                <p>No subscription data available</p>
                            </div>
                        )}

                        <div className={styles.billingHistory}>
                            <h4>Recent Transactions</h4>
                            <table className={styles.billingTable}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { date: '2024-01-15', desc: 'Monthly Subscription', amount: '$99.00', status: 'Paid' },
                                        { date: '2024-01-10', desc: 'Additional Services', amount: '$49.00', status: 'Paid' },
                                        { date: '2023-12-15', desc: 'Monthly Subscription', amount: '$99.00', status: 'Paid' },
                                    ].map((txn, idx) => (
                                        <tr key={idx}>
                                            <td>{txn.date}</td>
                                            <td>{txn.desc}</td>
                                            <td>{txn.amount}</td>
                                            <td><span className={styles.statusPaid}>{txn.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                );

            case 'notes':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <FileText size={16} />
                            <span>CASE NOTES</span>
                        </div>

                        <div className={styles.notesEditor}>
                            <textarea
                                className={styles.noteInput}
                                placeholder="Add a new note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={3}
                            />
                            <div className={styles.noteActions}>
                                <button className={styles.saveBtn} onClick={handleAddNote}>
                                    <Save size={14} />
                                    Save Note
                                </button>
                                <button className={styles.attachBtn}>
                                    <Upload size={14} />
                                    Attach File
                                </button>
                            </div>
                        </div>

                        <div className={styles.notesList}>
                            {notes.map(note => (
                                <div key={note.id} className={styles.noteCard}>
                                    <div className={styles.noteHeader}>
                                        <div className={styles.noteAuthor}>
                                            <UserCheck size={12} />
                                            <span>{note.author}</span>
                                        </div>
                                        <div className={styles.noteTime}>{note.timestamp}</div>
                                        <button
                                            className={styles.deleteNoteBtn}
                                            onClick={() => handleDeleteNote(note.id)}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <p className={styles.noteContent}>{note.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`${styles.dashboardContainer} ${isRecording ? styles.recordingActive : ''} ${isOnHold ? styles.holdActive : ''}`}>
            <audio ref={audioRef} />

            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.queueHeader}>
                        <div className={styles.queueTitleArea}>
                            <Crown size={18} color="#ef4444" />
                            <h3>VOICE ENCRYPTION HUB</h3>
                        </div>
                        <span className={styles.queueCount}>{filteredUsers.length}</span>
                    </div>

                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Signal search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterBar}>
                        {['all', 'advocate', 'client'].map((f) => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                                onClick={() => setFilter(f as any)}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.reportCard}>
                    <div className={styles.reportStat}>
                        <Zap size={14} color="#3b82f6" />
                        <span>UPLINKS TODAY: {membersHandled}</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((membersHandled / 20) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className={styles.userList}>
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selectedUser : ''}`}
                            onClick={() => {
                                setSelectedUser(user);
                                setActiveInteraction(null);
                            }}
                        >
                            <div className={styles.miniAvatar}>
                                {user.image ? (
                                    <img src={user.image} alt={user.name} />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <div className={`${styles.statusDot} ${styles[user.status]}`} />
                            </div>
                            <div className={styles.miniInfo}>
                                <div className={styles.miniName}>{user.name}</div>
                                <div className={styles.miniMeta}>
                                    <span className={styles.roleTag}>{user.role.toUpperCase()}</span>
                                    <span className={styles.activityTag}>{user.lastActivity}</span>
                                </div>
                                <div className={styles.priorityTag}>
                                    <div className={`${styles.priorityDot} ${styles[user.priority.toLowerCase()]}`} />
                                    {user.priority}
                                </div>
                            </div>
                            <ArrowLeft size={14} className={styles.arrowIndicator} style={{ transform: 'rotate(180deg)' }} />
                        </div>
                    ))}
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.systemStatus}>
                        <div className={styles.statusItem}>
                            <Signal size={12} />
                            <span>Connection: {callQuality}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <Shield size={12} />
                            <span>Encryption: Active</span>
                        </div>
                    </div>
                    <button
                        className={styles.fullscreenBtn}
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </aside>

            <main className={styles.mainPane}>
                <AnimatePresence mode="wait">
                    {activeInteraction && selectedUser ? (
                        <motion.div
                            key="interaction"
                            className={styles.interactionOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {activeInteraction === 'call' && (
                                <SupportCallUI
                                    user={selectedUser}
                                    onClose={() => {
                                        setActiveInteraction(null);
                                        setCallDuration(0);
                                        setIsRecording(false);
                                        setIsOnHold(false);
                                    }}
                                    onComplete={() => {
                                        setMembersHandled(prev => prev + 1);
                                        setActiveInteraction(null);
                                        setCallDuration(0);
                                    }}
                                    isOnHold={isOnHold}
                                    onHoldToggle={() => setIsOnHold(!isOnHold)}
                                    callDuration={callDuration}
                                    isRecording={isRecording}
                                    onRecordingToggle={() => handleRoleAction('Record')}
                                    isMuted={isMuted}
                                    onMuteToggle={() => handleRoleAction('Mute')}
                                    volume={volume}
                                    onVolumeChange={setVolume}
                                />
                            )}
                        </motion.div>
                    ) : selectedUser ? (
                        <motion.div
                            key="dossier"
                            className={styles.dossier}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <header className={styles.dossierHeader}>
                                <div className={styles.heroSection}>
                                    <div className={styles.profileImgWrapper}>
                                        {selectedUser.image ? (
                                            <img src={selectedUser.image} alt={selectedUser.name} className={styles.mainAvatar} />
                                        ) : (
                                            <div className={styles.mainAvatar}>{selectedUser.name.charAt(0)}</div>
                                        )}
                                        <div className={`${styles.userStatus} ${styles[selectedUser.status]}`} />
                                    </div>
                                    <div className={styles.heroText}>
                                        <h1>{selectedUser.name}</h1>
                                        <div className={styles.heroBadges}>
                                            <span className={`${styles.roleBadge} ${styles[selectedUser.role]}`}>
                                                {selectedUser.role.toUpperCase()}
                                            </span>
                                            <span className={styles.idBadge}>ID: {selectedUser.id}</span>
                                            {isVIP && <span className={styles.vipBadge}><Star size={10} fill="#fbbf24" /> VIP</span>}
                                            <span className={`${styles.priorityBadge} ${styles[selectedUser.priority.toLowerCase()]}`}>
                                                {selectedUser.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.headerUtility}>
                                    <button
                                        className={`${styles.utilBtn} ${isVIP ? styles.active : ''}`}
                                        onClick={() => setIsVIP(!isVIP)}
                                        title={isVIP ? 'Remove VIP' : 'Mark as VIP'}
                                    >
                                        <Star size={18} fill={isVIP ? "#fbbf24" : "none"} />
                                    </button>
                                    <button
                                        className={`${styles.utilBtn} ${isLocked ? styles.active : ''}`}
                                        onClick={() => setIsLocked(!isLocked)}
                                        title={isLocked ? 'Unlock Profile' : 'Lock Profile'}
                                    >
                                        <Lock size={18} />
                                    </button>
                                    <button className={styles.utilBtn} title="Print Dossier">
                                        <Printer size={18} />
                                    </button>
                                    <button className={styles.utilBtn} title="Export Data">
                                        <Download size={18} />
                                    </button>
                                    <button className={styles.moreBtn}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </header>

                            <nav className={styles.tabNav}>
                                {[
                                    { id: 'dossier', label: 'DOSSIER', icon: <FileText size={14} /> },
                                    { id: 'timeline', label: 'TIMELINE', icon: <Clock size={14} /> },
                                    { id: 'history', label: 'RECORDINGS', icon: <Headphones size={14} /> },
                                    { id: 'subscription', label: 'BILLING', icon: <CreditCard size={14} /> },
                                    { id: 'notes', label: 'NOTES', icon: <MessageSquare size={14} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                                        onClick={() => setActiveTab(tab.id as any)}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className={styles.scrollArea}>
                                {renderTabContent()}
                            </div>

                            <div className={styles.roleActionCloud}>
                                <button
                                    className={`${styles.roleActionBtn} ${isRecording ? styles.recordingBtnActive : ''}`}
                                    onClick={() => handleRoleAction('Record')}
                                >
                                    <Mic size={16} /> {isRecording ? `STOP (${formatTime(recordingTimer)})` : 'RECORD'}
                                </button>
                                <button
                                    className={`${styles.roleActionBtn} ${isOnHold ? styles.holdBtnActive : ''}`}
                                    onClick={() => handleRoleAction('Hold')}
                                >
                                    <Pause size={16} /> {isOnHold ? 'RESUME' : 'HOLD'}
                                </button>
                                <button
                                    className={`${styles.roleActionBtn} ${isMuted ? styles.mutedBtnActive : ''}`}
                                    onClick={() => handleRoleAction('Mute')}
                                >
                                    <Volume2 size={16} /> {isMuted ? 'UNMUTE' : 'MUTE'}
                                </button>
                                <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Transfer')}>
                                    <Repeat size={16} /> TRANSFER
                                </button>
                                <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Summary')}>
                                    <Receipt size={16} /> SUMMARY
                                </button>
                                <button className={styles.roleActionBtn} onClick={() => handleRoleAction('Close')}>
                                    <Ban size={16} /> CLOSE
                                </button>
                            </div>

                            <div className={styles.primaryActionWrapper}>
                                <button
                                    className={styles.primaryActionBtn}
                                    onClick={() => setActiveInteraction('call')}
                                >
                                    <Phone size={22} />
                                    <div className={styles.callActionText}>
                                        <span>INITIATE ENCRYPTED VOICE CALL</span>
                                        {callDuration > 0 && (
                                            <span className={styles.callTimer}>Last call: {formatTime(callDuration)}</span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className={styles.emptyState}>
                            <PhoneCall size={64} className={styles.beaconIcon} />
                            <h2>UPLINK READY</h2>
                            <p>Select a node from the queue to establish an encrypted voice channel.</p>
                            <div className={styles.emptyStats}>
                                <div className={styles.statItem}>
                                    <Users size={20} />
                                    <span>{MOCK_USERS.length} Contacts</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Zap size={20} />
                                    <span>{membersHandled} Handled Today</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Shield size={20} />
                                    <span>Secure Connection</span>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {overlayType && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className={styles.overlayContent}>
                            <div className={styles.overlayHeader}>
                                <h2>VOICE PROTOCOL</h2>
                                <button onClick={() => setOverlayType(null)}><Ban size={20} /></button>
                            </div>

                            {overlayType === 'transfer' && (
                                <div className={styles.overlayBody}>
                                    <h3>Transfer Call</h3>
                                    <div className={styles.transferForm}>
                                        <select
                                            className={styles.transferSelect}
                                            value={transferTarget}
                                            onChange={(e) => setTransferTarget(e.target.value)}
                                        >
                                            <option value="">Select recipient...</option>
                                            {MOCK_USERS.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.role})
                                                </option>
                                            ))}
                                        </select>
                                        <div className={styles.transferActions}>
                                            <button
                                                className={styles.confirmBtn}
                                                onClick={handleTransferCall}
                                                disabled={!transferTarget}
                                            >
                                                <Check size={16} /> Confirm Transfer
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => {
                                                    setOverlayType(null);
                                                    setTransferTarget('');
                                                }}
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {overlayType === 'summary' && (
                                <div className={styles.overlayBody}>
                                    <h3>Call Summary</h3>
                                    <div className={styles.summaryContent}>
                                        <textarea
                                            className={styles.summaryTextarea}
                                            value={callSummary}
                                            onChange={(e) => setCallSummary(e.target.value)}
                                            rows={10}
                                        />
                                        <div className={styles.summaryActions}>
                                            <button className={styles.actionBtn}>
                                                <Save size={16} /> Save
                                            </button>
                                            <button className={styles.actionBtn}>
                                                <Printer size={16} /> Print
                                            </button>
                                            <button className={styles.actionBtn}>
                                                <Share2 size={16} /> Share
                                            </button>
                                            <button
                                                className={styles.closeBtn}
                                                onClick={() => {
                                                    setOverlayType(null);
                                                }}
                                            >
                                                <X size={16} /> Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!['transfer', 'summary'].includes(overlayType) && (
                                <div className={styles.overlayBody}>
                                    <p>System executing {overlayType} command...</p>
                                    <div className={styles.loader} />
                                    <div className={styles.overlayProgress}>
                                        <div className={styles.progressBar}>
                                            <motion.div
                                                className={styles.progressFill}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 2, ease: "easeInOut" }}
                                            />
                                        </div>
                                        <span>Processing...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumCall;
