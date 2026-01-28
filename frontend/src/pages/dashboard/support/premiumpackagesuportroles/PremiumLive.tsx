import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './PremiumLive.module.css';
import {
    Search, Activity, MessageSquare, ArrowLeft,
    Clock, Globe, UserCheck, MoreHorizontal,
    MapPin, Zap, CreditCard, Download as DownloadIcon,
    Share2, MessageCircle, UserPlus, PlusCircle,
    Ban, Crown, Bot, Eye, Video, Headphones, Users,
    Wifi, Satellite, AlertTriangle, StopCircle,
    Maximize2, Minimize2, X, RefreshCw, AlertCircle,
    Mic, Volume2, Shield, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportMixedUI from '../../../../components/support/SupportMixedUI';
import SupportUserTable from '../../../../components/support/SupportUserTable';

export interface SupportUser {
    id: string;
    name: string;
    role: 'advocate' | 'client' | 'monitor' | 'bot';
    status: 'online' | 'offline' | 'away' | 'busy' | 'in-session' | 'recording';
    lastActivity: string;
    priority: 'High' | 'Medium' | 'Low' | 'Critical';
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
    connection?: {
        ping: number;
        jitter: number;
        packetLoss: number;
        bandwidth: string;
        uptime: string;
    };
    geodata?: {
        latitude: number;
        longitude: number;
        city: string;
        country: string;
        timezone: string;
        isp: string;
    };
    session?: {
        id: string;
        type: 'voice' | 'video' | 'mixed' | 'monitor';
        startTime: string;
        duration: number;
        participants: number;
        encryption: boolean;
        recording: boolean;
    };
    metrics?: {
        sentiment: number;
        engagement: number;
        responseTime: number;
        satisfaction: number;
    };
}

interface LiveSession {
    id: string;
    title: string;
    type: 'voice' | 'video' | 'mixed' | 'monitor';
    participants: SupportUser[];
    startTime: string;
    duration: number;
    status: 'active' | 'paused' | 'ended' | 'recording';
    encryption: boolean;
    recording: boolean;
    geolocation: {
        lat: number;
        lng: number;
        accuracy: number;
    };
    metrics: {
        bitrate: number;
        framerate: number;
        packetLoss: number;
        jitter: number;
    };
}

interface GeoAlert {
    id: string;
    name: string;
    location: string;
    radius: number;
    trigger: 'enter' | 'exit' | 'proximity';
    active: boolean;
    triggered: boolean;
}

interface BotCommand {
    id: string;
    command: string;
    description: string;
    shortcut: string;
    category: 'moderation' | 'automation' | 'monitoring' | 'utility';
}

const MOCK_USERS: SupportUser[] = [
    {
        id: 'live-1',
        name: 'Sarah Williams',
        role: 'client',
        status: 'online',
        lastActivity: 'Active now',
        priority: 'High',
        location: 'Mumbai, Maharashtra',
        email: 'sarah.w@example.com',
        phone: '+91 91234 56789',
        dob: '22/11/1992',
        gender: 'Female',
        degree: 'MBA',
        university: 'IIM Bangalore',
        college: 'Main Campus',
        gradYear: '2015',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
        connection: {
            ping: 24,
            jitter: 2,
            packetLoss: 0.1,
            bandwidth: '50 Mbps',
            uptime: '99.8%'
        },
        geodata: {
            latitude: 19.0760,
            longitude: 72.8777,
            city: 'Mumbai',
            country: 'India',
            timezone: 'IST (UTC+5:30)',
            isp: 'Jio Fiber'
        },
        session: {
            id: 'sess-001',
            type: 'mixed',
            startTime: '10:30 AM',
            duration: 45,
            participants: 3,
            encryption: true,
            recording: true
        },
        metrics: {
            sentiment: 0.85,
            engagement: 0.92,
            responseTime: 1.2,
            satisfaction: 4.8
        }
    },
    {
        id: 'live-2',
        name: 'System Bot Alpha',
        role: 'bot',
        status: 'online',
        lastActivity: 'Processing',
        priority: 'Medium',
        location: 'Server Cluster 01',
        email: 'bot@system.com',
        phone: 'N/A',
        dob: 'N/A',
        gender: 'N/A',
        degree: 'AI System',
        university: 'Deep Learning Core',
        college: 'Neural Network',
        gradYear: '2024'
    },
    {
        id: 'live-3',
        name: 'Monitor Agent Beta',
        role: 'monitor',
        status: 'in-session',
        lastActivity: 'Monitoring 3 sessions',
        priority: 'High',
        location: 'Control Center',
        email: 'monitor@system.com',
        phone: '+91 98765 43210',
        dob: '15/08/1988',
        gender: 'Male',
        degree: 'Network Engineering',
        university: 'MIT',
        college: 'Engineering',
        gradYear: '2012'
    },
    {
        id: 'live-4',
        name: 'Dr. Raj Patel',
        role: 'advocate',
        status: 'busy',
        lastActivity: 'In consultation',
        priority: 'Critical',
        location: 'Delhi, India',
        email: 'raj.p@example.com',
        phone: '+91 99887 76655',
        dob: '10/05/1975',
        gender: 'Male',
        degree: 'MD Psychiatry',
        university: 'AIIMS',
        college: 'Medical College',
        gradYear: '2000'
    }
];

const BOT_COMMANDS: BotCommand[] = [
    { id: 'cmd-1', command: '/transcribe', description: 'Start real-time transcription', shortcut: 'Ctrl+T', category: 'automation' },
    { id: 'cmd-2', command: '/sentiment', description: 'Analyze conversation sentiment', shortcut: 'Ctrl+S', category: 'monitoring' },
    { id: 'cmd-3', command: '/record', description: 'Start/stop recording', shortcut: 'Ctrl+R', category: 'utility' },
    { id: 'cmd-4', command: '/mute_all', description: 'Mute all participants', shortcut: 'Ctrl+M', category: 'moderation' },
    { id: 'cmd-5', command: '/geo_alert', description: 'Set geofence alert', shortcut: 'Ctrl+G', category: 'monitoring' },
    { id: 'cmd-6', command: '/join_bot', description: 'Add AI assistant to session', shortcut: 'Ctrl+B', category: 'automation' },
    { id: 'cmd-7', command: '/encrypt', description: 'Toggle end-to-end encryption', shortcut: 'Ctrl+E', category: 'utility' },
    { id: 'cmd-8', command: '/analytics', description: 'Show session analytics', shortcut: 'Ctrl+A', category: 'monitoring' },
];

const PremiumLive: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<SupportUser | null>(MOCK_USERS[0]);
    const [activeInteraction, setActiveInteraction] = useState<'mixed' | 'help' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'advocate' | 'client' | 'monitor' | 'bot'>('all');
    const [membersHandled, setMembersHandled] = useState(12);
    const [activeTab, setActiveTab] = useState<'dossier' | 'timeline' | 'history' | 'files' | 'subscription' | 'notes'>('dossier');
    const [overlayType, setOverlayType] = useState<string | null>(null);

    // Live session states
    const [liveSessions] = useState<LiveSession[]>([
        {
            id: 'sess-001',
            title: 'Emergency Consultation',
            type: 'mixed',
            participants: [MOCK_USERS[0], MOCK_USERS[3]],
            startTime: '10:30 AM',
            duration: 45,
            status: 'active',
            encryption: true,
            recording: true,
            geolocation: { lat: 19.0760, lng: 72.8777, accuracy: 50 },
            metrics: { bitrate: 2500, framerate: 30, packetLoss: 0.1, jitter: 2 }
        }
    ]);

    const [geoAlerts, setGeoAlerts] = useState<GeoAlert[]>([
        { id: 'alert-1', name: 'Mumbai Metro', location: '19.0760,72.8777', radius: 1000, trigger: 'enter', active: true, triggered: false },
        { id: 'alert-2', name: 'Delhi Office', location: '28.7041,77.1025', radius: 500, trigger: 'proximity', active: true, triggered: true },
    ]);

    const [activeSession, setActiveSession] = useState<LiveSession | null>(liveSessions[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRecording, setIsRecording] = useState(true);
    const [isEncrypted, setIsEncrypted] = useState(true);
    const [isAutoRT, setIsAutoRT] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(true);
    const [botActive] = useState(true);
    const [pingTime, setPingTime] = useState(24);
    const [signalStrength, setSignalStrength] = useState(95);
    const [bitrate, setBitrate] = useState(2500);
    const [selectedBotCommand, setSelectedBotCommand] = useState<string | null>(null);
    const [showBotCommands, setShowBotCommands] = useState(false);
    const [showGeoAlerts, setShowGeoAlerts] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [sessionTimer, setSessionTimer] = useState(0);
    const [recordingTimer, setRecordingTimer] = useState(0);
    const [activeCamera, setActiveCamera] = useState<'front' | 'back' | 'screen'>('front');
    const [audioVolume, setAudioVolume] = useState(80);
    const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
    const [networkStatus, setNetworkStatus] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');

    const timerRef = useRef<any>(null);
    const recordingTimerRef = useRef<any>(null);
    const pingIntervalRef = useRef<any>(null);

    // Simulate live session timer
    useEffect(() => {
        if (activeSession?.status === 'active') {
            timerRef.current = setInterval(() => {
                setSessionTimer(prev => prev + 1);
            }, 1000);
        }

        if (isRecording) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTimer(prev => prev + 1);
            }, 1000);
        }

        // Simulate network ping
        pingIntervalRef.current = setInterval(() => {
            setPingTime(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 10)));
            setSignalStrength(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 5)));
            setBitrate(prev => Math.max(1000, Math.min(5000, prev + (Math.random() - 0.5) * 200)));
        }, 3000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        };
    }, [activeSession?.status, isRecording]);

    // Update network status based on metrics
    useEffect(() => {
        if (pingTime < 30 && signalStrength > 90) {
            setNetworkStatus('excellent');
        } else if (pingTime < 50 && signalStrength > 80) {
            setNetworkStatus('good');
        } else if (pingTime < 80 && signalStrength > 70) {
            setNetworkStatus('fair');
        } else {
            setNetworkStatus('poor');
        }
    }, [pingTime, signalStrength]);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || u.role === filter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filter]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRoleAction = (action: string) => {
        switch (action.toLowerCase()) {
            case 'bot':
                setShowBotCommands(true);
                setOverlayType('bot');
                break;
            case 'auto-rt':
                setIsAutoRT(!isAutoRT);
                if (!isAutoRT) {
                    // Simulate auto-RT activation
                    setTimeout(() => {
                        alert('Auto-RT enabled: Real-time transcription active');
                    }, 500);
                }
                break;
            case 'monitor':
                setIsMonitoring(!isMonitoring);
                break;
            case 'join':
                if (activeSession) {
                    setActiveInteraction('mixed');
                }
                break;
            case 'close':
                if (activeInteraction) {
                    setActiveInteraction(null);
                    setMembersHandled(prev => prev + 1);
                }
                if (activeSession) {
                    setActiveSession(prev => prev ? { ...prev, status: 'ended' } : null);
                }
                break;
            case 'geoalert':
                setShowGeoAlerts(true);
                setOverlayType('geoalert');
                break;
            case 'record':
                setIsRecording(!isRecording);
                if (!isRecording) {
                    setRecordingTimer(0);
                }
                break;
            case 'encrypt':
                setIsEncrypted(!isEncrypted);
                break;
            case 'fullscreen':
                setIsFullscreen(!isFullscreen);
                break;
            default:
                setOverlayType(action.toLowerCase());
        }
    };

    const handleBotCommand = (command: BotCommand) => {
        setSelectedBotCommand(command.command);

        // Simulate command execution
        setTimeout(() => {
            alert(`Bot command executed: ${command.command}\n${command.description}`);
            setShowBotCommands(false);
            setOverlayType(null);
        }, 1000);
    };

    const toggleGeoAlert = (alertId: string) => {
        setGeoAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, active: !alert.active } : alert
        ));
    };

    const createNewGeoAlert = () => {
        const newAlert: GeoAlert = {
            id: `alert-${Date.now()}`,
            name: `Alert ${geoAlerts.length + 1}`,
            location: `${(Math.random() * 180 - 90).toFixed(4)}, ${(Math.random() * 360 - 180).toFixed(4)}`,
            radius: Math.floor(Math.random() * 2000) + 500,
            trigger: ['enter', 'exit', 'proximity'][Math.floor(Math.random() * 3)] as 'enter' | 'exit' | 'proximity',
            active: true,
            triggered: Math.random() > 0.7
        };
        setGeoAlerts(prev => [...prev, newAlert]);
    };

    const handleVideoQualityChange = (quality: 'low' | 'medium' | 'high' | 'ultra') => {
        setVideoQuality(quality);
        // Simulate quality change
        setBitrate(quality === 'low' ? 1000 : quality === 'medium' ? 1500 : quality === 'high' ? 2500 : 5000);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dossier':
                return (
                    <>
                        <section className={styles.dataSection}>
                            <div className={styles.sectionTitle}>
                                <UserCheck size={16} />
                                <span>LIVE INTERVENTION METRICS</span>
                            </div>
                            <div className={styles.dataGrid}>
                                {selectedUser && Object.entries({
                                    'Full Name': selectedUser.name,
                                    'Internal ID': selectedUser.id,
                                    'Location Scan': selectedUser.location,
                                    'Email Address': selectedUser.email,
                                    'Phone Number': selectedUser.phone,
                                    'Date of Birth': selectedUser.dob,
                                    'Gender': selectedUser.gender,
                                    'Degree': selectedUser.degree,
                                    'University': selectedUser.university,
                                    'Graduation Year': selectedUser.gradYear,
                                    'Priority': selectedUser.priority,
                                    'Ping Status': `${pingTime}ms (${networkStatus})`
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
                                <Globe size={16} />
                                <span>GEOSPATIAL MONITOR</span>
                                <button
                                    className={styles.refreshBtn}
                                    onClick={() => {
                                        setPingTime(24);
                                        setSignalStrength(95);
                                    }}
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className={styles.roleWidgetGrid}>
                                <div className={styles.widgetCard}>
                                    <h4>Active Pulse</h4>
                                    <div className={styles.signalContainer}>
                                        <div className={`${styles.signalPulse} ${styles[networkStatus]}`} />
                                        <div className={styles.signalInfo}>
                                            <span className={styles.signalLabel}>{networkStatus.toUpperCase()}</span>
                                            <span className={styles.signalValue}>{signalStrength}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.widgetCard}>
                                    <h4>Connection Metrics</h4>
                                    <div className={styles.metricsList}>
                                        <div className={styles.metricItem}>
                                            <span>Ping:</span>
                                            <span className={styles.metricValue}>{pingTime}ms</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span>Bitrate:</span>
                                            <span className={styles.metricValue}>{bitrate} kbps</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span>Packet Loss:</span>
                                            <span className={styles.metricValue}>0.1%</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span>Jitter:</span>
                                            <span className={styles.metricValue}>2ms</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.widgetCard}>
                                    <h4>Geo Alerts</h4>
                                    <div className={styles.alertStatus}>
                                        <div className={styles.alertIndicator}>
                                            <div className={`${styles.alertDot} ${geoAlerts.some(a => a.triggered) ? styles.triggered : ''}`} />
                                            <span>{geoAlerts.filter(a => a.active).length} Active</span>
                                        </div>
                                        <button
                                            className={styles.pulseBtn}
                                            onClick={() => handleRoleAction('GeoAlert')}
                                        >
                                            <AlertCircle size={14} /> Set Alert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.dataSection}>
                            <div className={styles.sectionTitle}>
                                <Activity size={16} />
                                <span>LIVE SESSION CONTROLS</span>
                            </div>
                            <div className={styles.controlsGrid}>
                                <div className={styles.controlCard}>
                                    <div className={styles.controlHeader}>
                                        <Video size={16} />
                                        <h4>Video Settings</h4>
                                    </div>
                                    <div className={styles.controlOptions}>
                                        <select
                                            className={styles.controlSelect}
                                            value={videoQuality}
                                            onChange={(e) => handleVideoQualityChange(e.target.value as any)}
                                        >
                                            <option value="low">Low (360p)</option>
                                            <option value="medium">Medium (720p)</option>
                                            <option value="high">High (1080p)</option>
                                            <option value="ultra">Ultra (4K)</option>
                                        </select>
                                        <div className={styles.cameraOptions}>
                                            <button
                                                className={`${styles.cameraBtn} ${activeCamera === 'front' ? styles.active : ''}`}
                                                onClick={() => setActiveCamera('front')}
                                            >
                                                Front
                                            </button>
                                            <button
                                                className={`${styles.cameraBtn} ${activeCamera === 'back' ? styles.active : ''}`}
                                                onClick={() => setActiveCamera('back')}
                                            >
                                                Back
                                            </button>
                                            <button
                                                className={`${styles.cameraBtn} ${activeCamera === 'screen' ? styles.active : ''}`}
                                                onClick={() => setActiveCamera('screen')}
                                            >
                                                Screen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.controlCard}>
                                    <div className={styles.controlHeader}>
                                        <Mic size={16} />
                                        <h4>Audio Settings</h4>
                                    </div>
                                    <div className={styles.controlOptions}>
                                        <div className={styles.volumeControl}>
                                            <Volume2 size={14} />
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={audioVolume}
                                                onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                                                className={styles.volumeSlider}
                                            />
                                            <span>{audioVolume}%</span>
                                        </div>
                                        <div className={styles.audioPresets}>
                                            <button className={styles.presetBtn}>Meeting</button>
                                            <button className={styles.presetBtn}>Music</button>
                                            <button className={styles.presetBtn}>Podcast</button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.controlCard}>
                                    <div className={styles.controlHeader}>
                                        <Shield size={16} />
                                        <h4>Security</h4>
                                    </div>
                                    <div className={styles.securityStatus}>
                                        <div className={`${styles.statusItem} ${isEncrypted ? styles.active : ''}`}>
                                            <Shield size={12} />
                                            <span>Encryption: {isEncrypted ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        <div className={`${styles.statusItem} ${isRecording ? styles.active : ''}`}>
                                            <Video size={12} />
                                            <span>Recording: {isRecording ? 'On' : 'Off'}</span>
                                        </div>
                                        <div className={styles.statusItem}>
                                            <Key size={12} />
                                            <span>Session Key: *******</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className={styles.tableWrapper}>
                            <SupportUserTable users={MOCK_USERS} />
                        </div>
                    </>
                );

            case 'timeline':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <Activity size={16} />
                            <span>LIVE TRAFFIC MONITOR</span>
                        </div>

                        <div className={styles.trafficOverview}>
                            <div className={styles.trafficStats}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>
                                        <Users size={20} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{activeSession?.participants.length || 0}</div>
                                        <div className={styles.statLabel}>Active Participants</div>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>
                                        <Clock size={20} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{formatTime(sessionTimer)}</div>
                                        <div className={styles.statLabel}>Session Duration</div>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>
                                        <DataFlow size={20} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{bitrate} kbps</div>
                                        <div className={styles.statLabel}>Bitrate</div>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>
                                        <Shield size={20} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{isEncrypted ? 'Yes' : 'No'}</div>
                                        <div className={styles.statLabel}>Encrypted</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sessionFeed}>
                            <h4>Live Session Feed</h4>
                            <div className={styles.feedContainer}>
                                {activeSession && (
                                    <div className={styles.sessionCard}>
                                        <div className={styles.sessionHeader}>
                                            <div className={styles.sessionInfo}>
                                                <h5>{activeSession.title}</h5>
                                                <div className={styles.sessionMeta}>
                                                    <span className={styles.sessionType}>{activeSession.type.toUpperCase()}</span>
                                                    <span className={styles.sessionStatus}>{activeSession.status}</span>
                                                    <span className={styles.sessionTimer}>{formatTime(sessionTimer)}</span>
                                                </div>
                                            </div>
                                            <div className={styles.sessionActions}>
                                                <button className={styles.sessionBtn}>
                                                    <Eye size={14} />
                                                </button>
                                                <button className={styles.sessionBtn}>
                                                    <DownloadIcon size={14} />
                                                </button>
                                                <button className={styles.sessionBtn}>
                                                    <Share2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.sessionBody}>
                                            <div className={styles.participantsList}>
                                                {activeSession.participants.map((participant, idx) => (
                                                    <div key={idx} className={styles.participant}>
                                                        <div className={styles.participantAvatar}>
                                                            {participant.image ? (
                                                                <img src={participant.image} alt={participant.name} />
                                                            ) : (
                                                                participant.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className={styles.participantInfo}>
                                                            <div className={styles.participantName}>{participant.name}</div>
                                                            <div className={styles.participantRole}>{participant.role}</div>
                                                        </div>
                                                        <div className={`${styles.participantStatus} ${styles[participant.status]}`} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.sessionMetrics}>
                                                <div className={styles.metricRow}>
                                                    <span>Video Quality:</span>
                                                    <span>{videoQuality.toUpperCase()}</span>
                                                </div>
                                                <div className={styles.metricRow}>
                                                    <span>Network Status:</span>
                                                    <span className={styles[networkStatus]}>{networkStatus.toUpperCase()}</span>
                                                </div>
                                                <div className={styles.metricRow}>
                                                    <span>Recording:</span>
                                                    <span>{isRecording ? `Active (${formatTime(recordingTimer)})` : 'Inactive'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.networkGraph}>
                            <h4>Network Performance</h4>
                            <div className={styles.graphContainer}>
                                <div className={styles.graph}>
                                    {[65, 72, 68, 75, 80, 85, 82, 78, 85, 90, 95, 92].map((value, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.graphBar}
                                            style={{ height: `${value}%` }}
                                        />
                                    ))}
                                </div>
                                <div className={styles.graphLabels}>
                                    <span>1h</span>
                                    <span>Now</span>
                                </div>
                            </div>
                        </div>
                    </section>
                );

            case 'subscription':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <CreditCard size={16} />
                            <span>ACCOUNT & SUBSCRIPTION</span>
                        </div>

                        <div className={styles.accountOverview}>
                            <div className={styles.accountCard}>
                                <div className={styles.accountHeader}>
                                    <div className={styles.accountType}>
                                        <Crown size={16} />
                                        <span>PREMIUM LIVE</span>
                                    </div>
                                    <div className={styles.accountStatus}>
                                        <span className={styles.statusActive}>ACTIVE</span>
                                    </div>
                                </div>
                                <div className={styles.accountDetails}>
                                    <div className={styles.detailRow}>
                                        <label>Plan Features:</label>
                                        <ul className={styles.featuresList}>
                                            <li>Unlimited Live Sessions</li>
                                            <li>Advanced Geospatial Tracking</li>
                                            <li>AI-Powered Bot Assistance</li>
                                            <li>End-to-End Encryption</li>
                                            <li>Cloud Recording (1000 hours)</li>
                                            <li>24/7 Priority Support</li>
                                        </ul>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <label>Billing Cycle:</label>
                                        <span>Monthly</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <label>Next Payment:</label>
                                        <span>15th March 2024</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <label>Amount:</label>
                                        <span className={styles.amount}>$99.99/month</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.usageStats}>
                            <h4>Usage Statistics</h4>
                            <div className={styles.usageGrid}>
                                <div className={styles.usageCard}>
                                    <div className={styles.usageIcon}>
                                        <Video size={20} />
                                    </div>
                                    <div className={styles.usageContent}>
                                        <div className={styles.usageValue}>45.2 hours</div>
                                        <div className={styles.usageLabel}>Video This Month</div>
                                    </div>
                                </div>
                                <div className={styles.usageCard}>
                                    <div className={styles.usageIcon}>
                                        <Headphones size={20} />
                                    </div>
                                    <div className={styles.usageContent}>
                                        <div className={styles.usageValue}>28.7 hours</div>
                                        <div className={styles.usageLabel}>Audio This Month</div>
                                    </div>
                                </div>
                                <div className={styles.usageCard}>
                                    <div className={styles.usageIcon}>
                                        <DownloadIcon size={20} />
                                    </div>
                                    <div className={styles.usageContent}>
                                        <div className={styles.usageValue}>125.4 GB</div>
                                        <div className={styles.usageLabel}>Data Transferred</div>
                                    </div>
                                </div>
                                <div className={styles.usageCard}>
                                    <div className={styles.usageIcon}>
                                        <Users size={20} />
                                    </div>
                                    <div className={styles.usageContent}>
                                        <div className={styles.usageValue}>342</div>
                                        <div className={styles.usageLabel}>Participants Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`${styles.dashboardContainer} ${isFullscreen ? styles.fullscreen : ''}`}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.queueHeader}>
                        <div className={styles.queueTitleArea}>
                            <Globe size={18} color="#3b82f6" />
                            <h3>LIVE INTERVENTION</h3>
                        </div>
                        <div className={styles.queueStats}>
                            <span className={styles.queueCount}>{filteredUsers.length}</span>
                            <div className={styles.liveIndicator}>
                                <div className={styles.liveDot} />
                                <span>LIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Geospatial scan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterBar}>
                        {['all', 'advocate', 'client', 'monitor', 'bot'].map((f) => (
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
                        <span>LIVE SESSIONS: {membersHandled}</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((membersHandled / 10) * 100, 100)}%` }}
                        />
                    </div>
                    <div className={styles.sessionInfo}>
                        <div className={styles.sessionStat}>
                            <Users size={10} />
                            <span>{activeSession?.participants.length || 0} in session</span>
                        </div>
                        <div className={styles.sessionStat}>
                            <Clock size={10} />
                            <span>{formatTime(sessionTimer)}</span>
                        </div>
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
                            <div className={styles.userActions}>
                                {user.session && (
                                    <div className={styles.sessionBadge}>
                                        <Video size={10} />
                                    </div>
                                )}
                                <ArrowLeft size={14} className={styles.arrowIndicator} style={{ transform: 'rotate(180deg)' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.systemStatus}>
                        <div className={styles.statusItem}>
                            <Wifi size={12} />
                            <span>Network: {networkStatus}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <Shield size={12} color={isEncrypted ? "#10b981" : "#ef4444"} />
                            <span>Encryption: {isEncrypted ? 'ON' : 'OFF'}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <Video size={12} color={isRecording ? "#ef4444" : "#6b7280"} />
                            <span>Recording: {isRecording ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                    <button
                        className={styles.fullscreenBtn}
                        onClick={() => handleRoleAction('fullscreen')}
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
                            {activeInteraction === 'mixed' && (
                                <SupportMixedUI
                                    user={selectedUser}
                                    onClose={() => setActiveInteraction(null)}
                                    onComplete={() => {
                                        setMembersHandled(prev => prev + 1);
                                        setActiveInteraction(null);
                                    }}
                                    isRecording={isRecording}
                                    onRecordingToggle={() => handleRoleAction('Record')}
                                    isEncrypted={isEncrypted}
                                    onEncryptionToggle={() => handleRoleAction('Encrypt')}
                                    callDuration={sessionTimer}
                                    messages={[]}
                                    onSendMessage={() => { }}
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
                                        <div className={styles.heroHeader}>
                                            <h1>{selectedUser.name}</h1>
                                            {selectedUser.session && (
                                                <div className={styles.sessionBadge}>
                                                    <Video size={12} />
                                                    <span>IN SESSION</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.heroBadges}>
                                            <span className={`${styles.roleBadge} ${styles[selectedUser.role]}`}>
                                                {selectedUser.role.toUpperCase()}
                                            </span>
                                            <span className={styles.idBadge}>ID: {selectedUser.id}</span>
                                            <span className={`${styles.priorityBadge} ${styles[selectedUser.priority.toLowerCase()]}`}>
                                                {selectedUser.priority}
                                            </span>
                                            {selectedUser.geodata && (
                                                <span className={styles.geoBadge}>
                                                    <MapPin size={10} />
                                                    {selectedUser.geodata.city}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.headerUtility}>
                                    <button
                                        className={`${styles.utilBtn} ${isMonitoring ? styles.active : ''}`}
                                        onClick={() => handleRoleAction('Monitor')}
                                        title="Toggle Monitoring"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className={`${styles.utilBtn} ${botActive ? styles.active : ''}`}
                                        onClick={() => handleRoleAction('Bot')}
                                        title="Bot Commands"
                                    >
                                        <Bot size={18} />
                                    </button>
                                    <button
                                        className={`${styles.utilBtn} ${isAutoRT ? styles.active : ''}`}
                                        onClick={() => handleRoleAction('Auto-RT')}
                                        title="Auto Real-time Transcription"
                                    >
                                        <MessageSquare size={18} />
                                    </button>
                                    <button
                                        className={styles.utilBtn}
                                        onClick={() => setShowParticipants(!showParticipants)}
                                        title="Show Participants"
                                    >
                                        <Users size={18} />
                                    </button>
                                    <button className={styles.moreBtn}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </header>

                            <nav className={styles.tabNav}>
                                {[
                                    { id: 'dossier', label: 'BIO DATA', icon: <UserCheck size={14} /> },
                                    { id: 'timeline', label: 'LIVE TRAFFIC', icon: <Activity size={14} /> },
                                    { id: 'subscription', label: 'ACCOUNT', icon: <CreditCard size={14} /> }
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

                            <div className={styles.liveControls}>
                                <div className={styles.controlGroup}>
                                    <div className={styles.recordingStatus}>
                                        <div className={`${styles.recordingIndicator} ${isRecording ? styles.active : ''}`}>
                                            <div className={styles.recordingDot} />
                                            <span>REC {formatTime(recordingTimer)}</span>
                                        </div>
                                        <button
                                            className={styles.controlBtn}
                                            onClick={() => handleRoleAction('Record')}
                                        >
                                            {isRecording ? <StopCircle size={16} /> : <Video size={16} />}
                                        </button>
                                    </div>
                                    <div className={styles.audioControls}>
                                        <Volume2 size={16} />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={audioVolume}
                                            onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                                            className={styles.volumeRange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.sessionInfoBar}>
                                    <div className={styles.sessionTimerDisplay}>
                                        <Clock size={14} />
                                        <span>{formatTime(sessionTimer)}</span>
                                    </div>
                                    <div className={styles.networkInfo}>
                                        <Wifi size={14} />
                                        <span>{pingTime}ms • {signalStrength}%</span>
                                    </div>
                                    <div className={styles.encryptionStatus}>
                                        <Shield size={14} />
                                        <span>{isEncrypted ? 'SECURE' : 'UNSECURED'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.roleActionCloud}>
                                <button
                                    className={`${styles.roleActionBtn} ${botActive ? styles.active : ''}`}
                                    onClick={() => handleRoleAction('Bot')}
                                >
                                    <Bot size={16} /> BOT
                                </button>
                                <button
                                    className={`${styles.roleActionBtn} ${isAutoRT ? styles.active : ''}`}
                                    onClick={() => handleRoleAction('Auto-RT')}
                                >
                                    <Share2 size={16} /> AUTO-RT
                                </button>
                                <button
                                    className={`${styles.roleActionBtn} ${isMonitoring ? styles.active : ''}`}
                                    onClick={() => handleRoleAction('Monitor')}
                                >
                                    <Eye size={16} /> MONITOR
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Join')}
                                >
                                    <UserPlus size={16} /> JOIN
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Close')}
                                >
                                    <Ban size={16} /> CLOSE
                                </button>
                            </div>

                            <div className={styles.primaryActionWrapper}>
                                <button
                                    className={styles.primaryActionBtn}
                                    onClick={() => setActiveInteraction('mixed')}
                                >
                                    <MessageCircle size={22} />
                                    <div className={styles.actionText}>
                                        <span>JOIN LIVE INTERVENTION</span>
                                        <span className={styles.sessionInfo}>
                                            {activeSession?.participants.length || 0} participants • {formatTime(sessionTimer)}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Globe size={64} className={styles.beaconIcon} />
                            <h2>SCANNING GLOBAL NODES</h2>
                            <p>Select an active session to initialize geospatial intervention.</p>
                            <div className={styles.emptyStats}>
                                <div className={styles.statItem}>
                                    <Satellite size={20} />
                                    <span>{MOCK_USERS.length} Nodes Online</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Activity size={20} />
                                    <span>{membersHandled} Sessions Today</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Shield size={20} />
                                    <span>Encrypted Network</span>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bot Commands Panel */}
            <AnimatePresence>
                {showBotCommands && (
                    <motion.div
                        className={styles.botCommandsPanel}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className={styles.panelHeader}>
                            <h4>Bot Commands</h4>
                            <button className={styles.closePanel} onClick={() => setShowBotCommands(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className={styles.commandsList}>
                            {BOT_COMMANDS.map(cmd => (
                                <button
                                    key={cmd.id}
                                    className={`${styles.commandBtn} ${selectedBotCommand === cmd.command ? styles.selected : ''}`}
                                    onClick={() => handleBotCommand(cmd)}
                                >
                                    <div className={styles.commandHeader}>
                                        <span className={styles.commandText}>{cmd.command}</span>
                                        <span className={styles.commandShortcut}>{cmd.shortcut}</span>
                                    </div>
                                    <div className={styles.commandDescription}>{cmd.description}</div>
                                    <div className={`${styles.commandCategory} ${styles[cmd.category]}`}>
                                        {cmd.category}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Geo Alerts Panel */}
            <AnimatePresence>
                {showGeoAlerts && (
                    <motion.div
                        className={styles.geoAlertsPanel}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className={styles.panelHeader}>
                            <h4>Geo Alerts</h4>
                            <div className={styles.panelActions}>
                                <button className={styles.panelBtn} onClick={createNewGeoAlert}>
                                    <PlusCircle size={14} />
                                </button>
                                <button className={styles.closePanel} onClick={() => setShowGeoAlerts(false)}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.alertsList}>
                            {geoAlerts.map(alert => (
                                <div key={alert.id} className={`${styles.alertItem} ${alert.triggered ? styles.triggered : ''}`}>
                                    <div className={styles.alertHeader}>
                                        <div className={styles.alertInfo}>
                                            <h5>{alert.name}</h5>
                                            <div className={styles.alertMeta}>
                                                <span>{alert.location}</span>
                                                <span>Radius: {alert.radius}m</span>
                                            </div>
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={alert.active}
                                                onChange={() => toggleGeoAlert(alert.id)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                    <div className={styles.alertFooter}>
                                        <span className={styles.triggerType}>{alert.trigger.toUpperCase()}</span>
                                        {alert.triggered && (
                                            <span className={styles.triggeredBadge}>
                                                <AlertTriangle size={12} />
                                                TRIGGERED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Participants Panel */}
            <AnimatePresence>
                {showParticipants && activeSession && (
                    <motion.div
                        className={styles.participantsPanel}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className={styles.panelHeader}>
                            <h4>Session Participants</h4>
                            <button className={styles.closePanel} onClick={() => setShowParticipants(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className={styles.participantsList}>
                            {activeSession.participants.map((participant, idx) => (
                                <div key={idx} className={styles.participantCard}>
                                    <div className={styles.participantAvatar}>
                                        {participant.image ? (
                                            <img src={participant.image} alt={participant.name} />
                                        ) : (
                                            participant.name.charAt(0)
                                        )}
                                    </div>
                                    <div className={styles.participantDetails}>
                                        <div className={styles.participantName}>{participant.name}</div>
                                        <div className={styles.participantRole}>{participant.role}</div>
                                        <div className={styles.participantStats}>
                                            <span>{participant.connection?.ping || 0}ms</span>
                                            <span>{participant.connection?.bandwidth || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className={`${styles.participantStatus} ${styles[participant.status]}`} />
                                </div>
                            ))}
                        </div>
                        <div className={styles.panelFooter}>
                            <span>{activeSession.participants.length} participants in session</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                <h2>LIVE PROTOCOL</h2>
                                <button onClick={() => setOverlayType(null)}>
                                    <Ban size={20} />
                                </button>
                            </div>
                            <div className={styles.overlayBody}>
                                <p>Executing live {overlayType} sequence...</p>
                                <div className={styles.loader} />
                                <div className={styles.overlayProgress}>
                                    <div className={styles.progressBar}>
                                        <motion.div
                                            className={styles.progressFill}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                        />
                                    </div>
                                    <span>Initializing geospatial protocols...</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper component for DataFlow icon
const DataFlow: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4m0 12v4m8-10h4M4 12H2m17.657-5.657l-2.828 2.828m-9.9 9.9l-2.828 2.828m14.142 0l2.828-2.828M6.343 6.343L3.515 3.515" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

export default PremiumLive;
