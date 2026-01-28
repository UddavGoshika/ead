import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './PremiumChat.module.css';
import {
    Search, Shield, Target, Activity,
    MessageSquare, Phone, ArrowLeft,
    Clock, Cpu, UserCheck, MoreHorizontal,
    Mail, PhoneCall, Calendar, MapPin, GraduationCap, School, Zap,
    FileText, Upload, Star, Lock, History, List, CreditCard,
    ShieldAlert, Download, Share2, MessageCircle,
    UserPlus, PlusCircle, Ban, Timer, Printer, Crown, Image as ImageIcon,
    Paperclip, Smile, Send, X, Check, Mic, Volume2,
    Video, Headphones, Camera, Eye, EyeOff, Filter,
    Trash2, Copy, Edit2, Save, RefreshCw, AlertCircle,
    ThumbsUp, ThumbsDown, Heart, Brain, Bot,
    BarChart, TrendingUp, Hash, AtSign,
    Type, Bold, Italic, Link, Code,
    Image, File, FileCode,
    Video as VideoIcon, Music,
    Key, Globe, Wifi,
    Battery, Bell, Settings, User, LogOut,
    ChevronRight, ChevronLeft, Maximize2, Minimize2,
    Grid, Layout, Columns, Rows, PanelLeft,
    PanelRight, Sidebar, SidebarClose, SidebarOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportChatUI from '../../../../components/support/SupportChatUI';
import SupportUserTable from '../../../../components/support/SupportUserTable';

export interface SupportUser {
    id: string;
    name: string;
    role: 'advocate' | 'client';
    status: 'online' | 'offline' | 'away' | 'busy' | 'typing';
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
    files?: Array<{
        id: string;
        name: string;
        type: string;
        size: string;
        date: string;
        url?: string;
    }>;
    subscription?: {
        plan: 'Basic' | 'Pro' | 'Enterprise';
        status: 'active' | 'expired' | 'pending';
        renewal: string;
        payment: string;
    };
    chatHistory?: Array<{
        id: string;
        message: string;
        timestamp: string;
        sender: 'user' | 'agent';
        read: boolean;
        type: 'text' | 'file' | 'image';
    }>;
    sentiment?: {
        score: number;
        label: 'positive' | 'neutral' | 'negative';
        keywords: string[];
    };
}

interface ChatMessage {
    id: string;
    content: string;
    timestamp: string;
    sender: 'user' | 'agent';
    type: 'text' | 'file' | 'image' | 'system';
    status: 'sent' | 'delivered' | 'read';
    reactions?: string[];
    file?: {
        name: string;
        type: string;
        size: string;
        url?: string;
    };
}

interface QuickPhrase {
    id: string;
    category: string;
    content: string;
    shortcut: string;
}

interface FileUpload {
    id: string;
    name: string;
    type: string;
    size: string;
    progress: number;
    status: 'uploading' | 'completed' | 'failed';
}

const MOCK_USERS: SupportUser[] = [
    {
        id: 'chat-1',
        name: 'Adv. Rajesh Kumar',
        role: 'advocate',
        status: 'online',
        lastActivity: 'Active now',
        priority: 'High',
        location: 'New Delhi, Delhi',
        email: 'rajesh.k@example.com',
        phone: '+91 98765 43210',
        dob: '15/06/1985',
        gender: 'Male',
        degree: 'LLB',
        university: 'Delhi University',
        college: 'Faculty of Law',
        gradYear: '2010',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
        notes: [
            'Specializes in corporate law',
            'VIP client - handle carefully',
            'Prefers detailed explanations'
        ],
        files: [
            { id: 'file-1', name: 'legal_doc.pdf', type: 'pdf', size: '2.4 MB', date: '2024-01-15' },
            { id: 'file-2', name: 'contract_review.docx', type: 'docx', size: '1.8 MB', date: '2024-01-14' }
        ],
        subscription: {
            plan: 'Enterprise',
            status: 'active',
            renewal: '2024-12-31',
            payment: 'Credit Card'
        },
        chatHistory: [
            { id: 'msg-1', message: 'Hello, I need assistance with a legal document', timestamp: '10:30 AM', sender: 'user', read: true, type: 'text' },
            { id: 'msg-2', message: 'I can help with that. What type of document?', timestamp: '10:32 AM', sender: 'agent', read: true, type: 'text' },
            { id: 'msg-3', message: 'It\'s a corporate merger agreement', timestamp: '10:33 AM', sender: 'user', read: true, type: 'text' }
        ],
        sentiment: {
            score: 0.85,
            label: 'positive',
            keywords: ['professional', 'urgent', 'detailed']
        }
    },
    {
        id: 'chat-2',
        name: 'Sarah Williams',
        role: 'client',
        status: 'away',
        lastActivity: '2m ago',
        priority: 'Medium',
        location: 'Mumbai, Maharashtra',
        email: 'sarah.w@example.com',
        phone: '+91 91234 56789',
        dob: '22/11/1992',
        gender: 'Female',
        degree: 'MBA',
        university: 'IIM Bangalore',
        college: 'Main Campus',
        gradYear: '2015',
        notes: [
            'New client',
            'Business consultation needed',
            'Quick decision maker'
        ],
        files: [
            { id: 'file-3', name: 'business_plan.pdf', type: 'pdf', size: '3.2 MB', date: '2024-01-13' }
        ],
        subscription: {
            plan: 'Pro',
            status: 'active',
            renewal: '2024-06-30',
            payment: 'PayPal'
        },
        chatHistory: [
            { id: 'msg-4', message: 'Hi, I need business consultation', timestamp: '09:15 AM', sender: 'user', read: true, type: 'text' }
        ],
        sentiment: {
            score: 0.65,
            label: 'neutral',
            keywords: ['inquiry', 'business', 'consultation']
        }
    },
    {
        id: 'chat-3',
        name: 'Dr. Priya Sharma',
        role: 'advocate',
        status: 'busy',
        lastActivity: 'In meeting',
        priority: 'High',
        location: 'Bangalore, Karnataka',
        email: 'priya.s@example.com',
        phone: '+91 99887 66554',
        dob: '10/08/1978',
        gender: 'Female',
        degree: 'PhD Law',
        university: 'NLSIU',
        college: 'Main Campus',
        gradYear: '2005'
    },
    {
        id: 'chat-4',
        name: 'Michael Chen',
        role: 'client',
        status: 'typing',
        lastActivity: 'Typing...',
        priority: 'Low',
        location: 'Chennai, Tamil Nadu',
        email: 'michael.c@example.com',
        phone: '+91 88776 55443',
        dob: '05/03/1988',
        gender: 'Male',
        degree: 'BSc',
        university: 'IIT Madras',
        college: 'Engineering',
        gradYear: '2010'
    }
];

const QUICK_PHRASES: QuickPhrase[] = [
    { id: '1', category: 'greeting', content: 'Hello! How can I assist you today?', shortcut: '#greeting' },
    { id: '2', category: 'legal', content: 'I understand you need legal assistance. Let me connect you with our legal expert.', shortcut: '#legal_esc' },
    { id: '3', category: 'id', content: 'For security purposes, could you please verify your identity?', shortcut: '#id_req' },
    { id: '4', category: 'followup', content: 'I\'ll follow up with you shortly on this matter.', shortcut: '#followup' },
    { id: '5', category: 'closing', content: 'Is there anything else I can help you with today?', shortcut: '#closing' },
    { id: '6', category: 'urgent', content: 'This appears to be urgent. Let me prioritize your request.', shortcut: '#urgent' },
];

const EMOJI_CATEGORIES = {
    smileys: ['😀', '😊', '😎', '🤔', '😢', '😡', '🤗', '🥳'],
    symbols: ['✅', '❌', '⚠️', '❗', '❓', '💡', '⭐', '🔥'],
    objects: ['📁', '📎', '📄', '📋', '🔒', '🔑', '⚖️', '💰'],
    flags: ['🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵']
};

const PremiumChat: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<SupportUser | null>(MOCK_USERS[0]);
    const [activeInteraction, setActiveInteraction] = useState<'chat' | 'help' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'advocate' | 'client'>('all');
    const [membersHandled, setMembersHandled] = useState(8);
    const [activeTab, setActiveTab] = useState<'dossier' | 'timeline' | 'history' | 'files' | 'subscription' | 'notes'>('dossier');
    const [isVIP, setIsVIP] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [notes, setNotes] = useState<string>('');
    const [overlayType, setOverlayType] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showQuickPhrases, setShowQuickPhrases] = useState(false);
    const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [sentimentScore, setSentimentScore] = useState(0.85);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
    const [isEncrypted, setIsEncrypted] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [transferTarget, setTransferTarget] = useState('');
    const [showTransfer, setShowTransfer] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const typingTimeoutRef = useRef<any | null>(null);

    // Initialize chat messages
    useEffect(() => {
        if (selectedUser?.chatHistory) {
            const messages: ChatMessage[] = selectedUser.chatHistory.map(msg => ({
                id: msg.id,
                content: msg.message,
                timestamp: msg.timestamp,
                sender: msg.sender,
                type: msg.type as any,
                status: 'read'
            }));
            setChatMessages(messages);
        }
    }, [selectedUser]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Simulate typing indicator
    useEffect(() => {
        if (selectedUser?.status === 'typing') {
            const interval = setInterval(() => {
                setIsTyping(prev => !prev);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    // Simulate sentiment changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedUser && chatMessages.length > 0) {
                const newScore = Math.min(Math.max(sentimentScore + (Math.random() - 0.5) * 0.1, 0.1), 0.99);
                setSentimentScore(Number(newScore.toFixed(2)));
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [sentimentScore, selectedUser, chatMessages.length]);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.phone.includes(searchTerm);
            const matchesFilter = filter === 'all' || u.role === filter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filter]);

    const handleRoleAction = (action: string) => {
        switch (action.toLowerCase()) {
            case 'file':
                setShowFileUpload(true);
                break;
            case 'emoji':
                setShowEmojiPicker(true);
                break;
            case 'canned':
                setShowQuickPhrases(true);
                break;
            case 'transfer':
                setShowTransfer(true);
                setOverlayType('transfer');
                break;
            case 'suggest':
                generateAISuggestions();
                break;
            case 'close':
                if (activeInteraction) {
                    setActiveInteraction(null);
                    setMembersHandled(prev => prev + 1);
                }
                break;
            case 'audio':
                toggleAudioRecording();
                break;
            default:
                setOverlayType(action.toLowerCase());
        }
    };

    const generateAISuggestions = () => {
        setIsGeneratingAI(true);
        setTimeout(() => {
            setAiSuggestions([
                'Based on the conversation, I suggest asking about specific legal requirements.',
                'Consider providing a timeline for document review.',
                'Offer to schedule a follow-up call for detailed discussion.'
            ]);
            setIsGeneratingAI(false);
        }, 1500);
    };

    const sendMessage = () => {
        if (!newMessage.trim() && fileUploads.length === 0) return;

        if (newMessage.trim()) {
            const message: ChatMessage = {
                id: `msg-${Date.now()}`,
                content: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'agent',
                type: 'text',
                status: 'sent'
            };

            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
            setUnreadCount(prev => prev + 1);

            // Simulate user response
            setTimeout(() => {
                const responses = [
                    'Thank you for your assistance.',
                    'I understand, please proceed.',
                    'Could you clarify that point?',
                    'That sounds good to me.'
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];

                const userMessage: ChatMessage = {
                    id: `msg-${Date.now() + 1}`,
                    content: response,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: 'user',
                    type: 'text',
                    status: 'delivered'
                };

                setChatMessages(prev => [...prev, userMessage]);
                setUnreadCount(prev => prev + 1);
            }, 2000);
        }

        // Handle file uploads
        if (fileUploads.length > 0) {
            fileUploads.forEach(upload => {
                if (upload.status === 'completed') {
                    const fileMessage: ChatMessage = {
                        id: `file-${Date.now()}`,
                        content: `File: ${upload.name}`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        sender: 'agent',
                        type: 'file',
                        status: 'sent',
                        file: {
                            name: upload.name,
                            type: upload.type,
                            size: upload.size
                        }
                    };
                    setChatMessages(prev => [...prev, fileMessage]);
                }
            });
            setFileUploads([]);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const upload: FileUpload = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type.split('/')[1] || 'file',
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                progress: 0,
                status: 'uploading'
            };

            setFileUploads(prev => [...prev, upload]);

            // Simulate upload progress
            const interval = setInterval(() => {
                setFileUploads(prev => prev.map(u =>
                    u.id === upload.id
                        ? { ...u, progress: Math.min(u.progress + 10, 100) }
                        : u
                ));
            }, 200);

            setTimeout(() => {
                clearInterval(interval);
                setFileUploads(prev => prev.map(u =>
                    u.id === upload.id
                        ? { ...u, status: 'completed', progress: 100 }
                        : u
                ));
            }, 2000);
        });
    };

    const toggleAudioRecording = async () => {
        if (!isRecordingAudio) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                audioRecorderRef.current = recorder;
                audioChunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    audioChunksRef.current.push(e.data);
                };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    // Here you would typically upload the audio blob to your server
                    console.log('Audio recording complete:', audioBlob);

                    // Add audio message to chat
                    const audioMessage: ChatMessage = {
                        id: `audio-${Date.now()}`,
                        content: 'Voice message',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        sender: 'agent',
                        type: 'file',
                        status: 'sent',
                        file: {
                            name: `recording_${new Date().getTime()}.webm`,
                            type: 'audio',
                            size: `${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB`
                        }
                    };
                    setChatMessages(prev => [...prev, audioMessage]);
                };

                recorder.start();
                setIsRecordingAudio(true);

                // Start duration timer
                const startTime = Date.now();
                const timer = setInterval(() => {
                    setAudioDuration(Math.floor((Date.now() - startTime) / 1000));
                }, 1000);

                // Stop after 30 seconds max
                setTimeout(() => {
                    if (isRecordingAudio) {
                        recorder.stop();
                        setIsRecordingAudio(false);
                        setAudioDuration(0);
                        clearInterval(timer);
                    }
                }, 30000);

            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Microphone access denied. Please enable microphone permissions.');
            }
        } else {
            if (audioRecorderRef.current) {
                audioRecorderRef.current.stop();
                setIsRecordingAudio(false);
                setAudioDuration(0);
            }
        }
    };

    const handleQuickPhraseSelect = (phrase: QuickPhrase) => {
        setNewMessage(phrase.content);
        setShowQuickPhrases(false);
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    };

    const handleTransfer = () => {
        if (transferTarget) {
            // Simulate transfer
            setTimeout(() => {
                alert(`Chat transferred to ${transferTarget}`);
                setShowTransfer(false);
                setTransferTarget('');
                setOverlayType(null);
            }, 1500);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSentimentColor = (score: number) => {
        if (score >= 0.7) return '#10b981'; // Green for positive
        if (score >= 0.4) return '#f59e0b'; // Yellow for neutral
        return '#ef4444'; // Red for negative
    };

    const getSentimentLabel = (score: number) => {
        if (score >= 0.7) return 'Positive';
        if (score >= 0.4) return 'Neutral';
        return 'Negative';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dossier':
                return (
                    <>
                        <section className={styles.dataSection}>
                            <div className={styles.sectionTitle}>
                                <Search size={16} />
                                <span>IDENTITY DOSSIER</span>
                            </div>
                            <div className={styles.dataGrid}>
                                {selectedUser && Object.entries({
                                    'Full Name': selectedUser.name,
                                    'Internal ID': selectedUser.id,
                                    'Email Address': selectedUser.email,
                                    'Phone Number': selectedUser.phone,
                                    'Date of Birth': selectedUser.dob,
                                    'Gender': selectedUser.gender,
                                    'Location': selectedUser.location,
                                    'Priority Level': selectedUser.priority,
                                    'Academic Degree': selectedUser.degree,
                                    'University': selectedUser.university,
                                    'College/Institution': selectedUser.college,
                                    'Graduation Year': selectedUser.gradYear
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
                                <MessageSquare size={16} />
                                <span>CHAT TOOLS & SENTIMENT</span>
                            </div>
                            <div className={styles.roleWidgetGrid}>
                                <div className={styles.widgetCard}>
                                    <h4>Quick Phrases</h4>
                                    <div className={styles.chipCloud}>
                                        {QUICK_PHRASES.slice(0, 3).map(phrase => (
                                            <span
                                                key={phrase.id}
                                                className={styles.chip}
                                                onClick={() => handleQuickPhraseSelect(phrase)}
                                                title={phrase.content}
                                            >
                                                {phrase.shortcut}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        className={styles.viewAllBtn}
                                        onClick={() => setShowQuickPhrases(true)}
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className={styles.widgetCard}>
                                    <h4>Sentiment Analysis</h4>
                                    <div className={styles.sentimentMeter}>
                                        <div className={styles.sentimentTrack}>
                                            <motion.div
                                                className={styles.sentimentFill}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sentimentScore * 100}%` }}
                                                style={{ backgroundColor: getSentimentColor(sentimentScore) }}
                                            />
                                        </div>
                                        <div className={styles.sentimentInfo}>
                                            <span style={{ color: getSentimentColor(sentimentScore) }}>
                                                {getSentimentLabel(sentimentScore).toUpperCase()} ({sentimentScore.toFixed(2)})
                                            </span>
                                            <div className={styles.sentimentKeywords}>
                                                {selectedUser?.sentiment?.keywords.map((kw, idx) => (
                                                    <span key={idx} className={styles.keyword}>#{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.widgetCard}>
                                    <h4>AI Suggestions</h4>
                                    <button
                                        className={`${styles.pulseBtn} ${isGeneratingAI ? styles.generating : ''}`}
                                        onClick={() => handleRoleAction('Suggest')}
                                        disabled={isGeneratingAI}
                                    >
                                        <Bot size={14} />
                                        {isGeneratingAI ? 'Generating...' : 'Generate'}
                                    </button>
                                    {aiSuggestions.length > 0 && (
                                        <div className={styles.aiSuggestions}>
                                            {aiSuggestions.map((suggestion, idx) => (
                                                <div key={idx} className={styles.suggestion}>
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {selectedUser?.notes && selectedUser.notes.length > 0 && (
                            <section className={styles.dataSection}>
                                <div className={styles.sectionTitle}>
                                    <FileText size={16} />
                                    <span>NOTES</span>
                                </div>
                                <div className={styles.notesList}>
                                    {selectedUser.notes.map((note, idx) => (
                                        <div key={idx} className={styles.noteItem}>
                                            <div className={styles.noteContent}>{note}</div>
                                            <button className={styles.noteAction}>
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    ))}
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
                            <span>CHAT TIMELINE</span>
                        </div>
                        <div className={styles.timelineContainer}>
                            {chatMessages.map((msg, idx) => (
                                <div key={msg.id} className={`${styles.timelineItem} ${styles[msg.sender]}`}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineHeader}>
                                            <span className={styles.timelineSender}>
                                                {msg.sender === 'agent' ? 'You' : selectedUser?.name}
                                            </span>
                                            <span className={styles.timelineTime}>{msg.timestamp}</span>
                                        </div>
                                        <div className={styles.timelineMessage}>
                                            {msg.type === 'file' ? (
                                                <div className={styles.fileMessage}>
                                                    <Paperclip size={12} />
                                                    <span>{msg.content}</span>
                                                    <Download size={12} className={styles.downloadIcon} />
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <div className={styles.messageStatus}>
                                            <span className={styles[msg.status]}>{msg.status}</span>
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className={styles.reactions}>
                                                    {msg.reactions.map((r, i) => (
                                                        <span key={i}>{r}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {idx < chatMessages.length - 1 && (
                                        <div className={styles.timelineConnector}></div>
                                    )}
                                </div>
                            ))}
                            {chatMessages.length === 0 && (
                                <div className={styles.emptyTimeline}>
                                    <MessageSquare size={32} />
                                    <p>No chat history available</p>
                                </div>
                            )}
                        </div>
                    </section>
                );

            case 'history':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <History size={16} />
                            <span>CHAT HISTORY</span>
                            <div className={styles.historyStats}>
                                <div className={styles.stat}>
                                    <MessageSquare size={12} />
                                    <span>{chatMessages.length} messages</span>
                                </div>
                                <div className={styles.stat}>
                                    <User size={12} />
                                    <span>{selectedUser?.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chatHistory}>
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`${styles.historyMessage} ${styles[msg.sender]}`}>
                                    <div className={styles.messageHeader}>
                                        <span className={styles.senderName}>
                                            {msg.sender === 'agent' ? 'You' : selectedUser?.name}
                                        </span>
                                        <span className={styles.messageTime}>{msg.timestamp}</span>
                                    </div>
                                    <div className={styles.messageContent}>
                                        {msg.content}
                                    </div>
                                    <div className={styles.messageActions}>
                                        <button className={styles.actionBtn}>
                                            <Copy size={12} />
                                        </button>
                                        <button className={styles.actionBtn}>
                                            <Share2 size={12} />
                                        </button>
                                        <button className={styles.actionBtn}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );

            case 'files':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <FileText size={16} />
                            <span>SHARED FILES</span>
                            <button
                                className={styles.uploadBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={14} />
                                Upload
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                multiple
                                onChange={handleFileSelect}
                            />
                        </div>

                        {fileUploads.length > 0 && (
                            <div className={styles.uploadQueue}>
                                <h4>Upload Queue</h4>
                                {fileUploads.map(upload => (
                                    <div key={upload.id} className={styles.uploadItem}>
                                        <div className={styles.uploadInfo}>
                                            <FileText size={16} />
                                            <div>
                                                <div className={styles.uploadName}>{upload.name}</div>
                                                <div className={styles.uploadMeta}>
                                                    <span>{upload.type.toUpperCase()}</span>
                                                    <span>{upload.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.uploadProgress}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={`${styles.progressFill} ${styles[upload.status]}`}
                                                    style={{ width: `${upload.progress}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>{upload.progress}%</span>
                                            {upload.status === 'completed' && (
                                                <Check size={14} className={styles.completedIcon} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.filesGrid}>
                            {selectedUser?.files?.map(file => (
                                <div key={file.id} className={styles.fileCard}>
                                    <div className={styles.fileIcon}>
                                        {file.type === 'pdf' ? <FileText size={24} /> :
                                            file.type === 'docx' ? <FileText size={24} /> :
                                                <File size={24} />}
                                    </div>
                                    <div className={styles.fileInfo}>
                                        <h4>{file.name}</h4>
                                        <div className={styles.fileMeta}>
                                            <span>{file.type.toUpperCase()}</span>
                                            <span>{file.size}</span>
                                            <span>{file.date}</span>
                                        </div>
                                    </div>
                                    <div className={styles.fileActions}>
                                        <button className={styles.fileBtn} title="Download">
                                            <Download size={14} />
                                        </button>
                                        <button className={styles.fileBtn} title="Share">
                                            <Share2 size={14} />
                                        </button>
                                        <button className={styles.fileBtn} title="Preview">
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </div>
                            )) || (
                                    <div className={styles.noFiles}>
                                        <File size={32} />
                                        <p>No files shared yet</p>
                                    </div>
                                )}
                        </div>
                    </section>
                );

            case 'subscription':
                return (
                    <section className={styles.dataSection}>
                        <div className={styles.sectionTitle}>
                            <CreditCard size={16} />
                            <span>SUBSCRIPTION & BILLING</span>
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
                                        <label>Encryption:</label>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={isEncrypted}
                                                onChange={() => setIsEncrypted(!isEncrypted)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.chatFeatures}>
                                    <h4>Chat Features</h4>
                                    <div className={styles.featuresGrid}>
                                        <div className={styles.feature}>
                                            <Shield size={14} />
                                            <span>End-to-end Encryption</span>
                                        </div>
                                        <div className={styles.feature}>
                                            <Bot size={14} />
                                            <span>AI Assistant</span>
                                        </div>
                                        <div className={styles.feature}>
                                            <Paperclip size={14} />
                                            <span>File Sharing (100MB)</span>
                                        </div>
                                        <div className={styles.feature}>
                                            <BarChart size={14} />
                                            <span>Analytics Dashboard</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noSubscription}>
                                <CreditCard size={32} />
                                <p>No subscription data available</p>
                            </div>
                        )}
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
                                placeholder="Add case notes here..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={6}
                            />
                            <div className={styles.noteToolbar}>
                                <button className={styles.toolBtn}>
                                    <Bold size={14} />
                                </button>
                                <button className={styles.toolBtn}>
                                    <Italic size={14} />
                                </button>
                                <button className={styles.toolBtn}>
                                    <List size={14} />
                                </button>
                                <button className={styles.toolBtn}>
                                    <Link size={14} />
                                </button>
                                <div className={styles.spacer} />
                                <button className={styles.saveBtn}>
                                    <Save size={14} />
                                    Save Note
                                </button>
                            </div>
                        </div>

                        <div className={styles.savedNotes}>
                            <h4>Saved Notes</h4>
                            {selectedUser?.notes?.map((note, idx) => (
                                <div key={idx} className={styles.savedNote}>
                                    <div className={styles.noteHeader}>
                                        <span className={styles.noteDate}>Today, 10:30 AM</span>
                                        <button className={styles.noteAction}>
                                            <Edit2 size={12} />
                                        </button>
                                    </div>
                                    <p className={styles.noteText}>{note}</p>
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
        <div className={styles.dashboardContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.queueHeader}>
                        <div className={styles.queueTitleArea}>
                            <Crown size={18} color="#ef4444" />
                            <h3>SECURE CHAT QUEUE</h3>
                        </div>
                        <div className={styles.queueStats}>
                            <span className={styles.queueCount}>{filteredUsers.length}</span>
                            <div className={styles.unreadBadge}>{unreadCount}</div>
                        </div>
                    </div>

                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Identify node..."
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
                        <span>CHATS HANDLED: {membersHandled}</span>
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
                                setUnreadCount(0);
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
                                <div className={styles.miniName}>
                                    {user.name}
                                    {user.status === 'typing' && (
                                        <span className={styles.typingIndicator}>
                                            <span className={styles.dot}>•</span>
                                            <span className={styles.dot}>•</span>
                                            <span className={styles.dot}>•</span>
                                        </span>
                                    )}
                                </div>
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
                                {user.status === 'online' && (
                                    <div className={styles.unreadIndicator}>
                                        <MessageSquare size={10} />
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
                            <Shield size={12} color={isEncrypted ? "#10b981" : "#6b7280"} />
                            <span>Encryption: {isEncrypted ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <Wifi size={12} color="#3b82f6" />
                            <span>Connection: Stable</span>
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
                            {activeInteraction === 'chat' && selectedUser && (
                                <SupportChatUI
                                    user={selectedUser}
                                    messages={chatMessages.map(msg => ({
                                        id: msg.id,
                                        sender: msg.sender,
                                        content: msg.content,
                                        timestamp: msg.timestamp
                                    }))}
                                    onSendMessage={(text) => {
                                        setNewMessage(text);
                                        sendMessage();
                                    }}
                                    onClose={() => setActiveInteraction(null)}
                                    onComplete={() => {
                                        setActiveInteraction(null);
                                        setMembersHandled(prev => prev + 1);
                                    }}
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
                                            {selectedUser.status === 'typing' && (
                                                <div className={styles.typingBadge}>
                                                    <span>Typing</span>
                                                    <div className={styles.typingDots}>
                                                        <span>.</span>
                                                        <span>.</span>
                                                        <span>.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.heroBadges}>
                                            <span className={`${styles.roleBadge} ${styles[selectedUser.role]}`}>
                                                {selectedUser.role.toUpperCase()}
                                            </span>
                                            <span className={styles.idBadge}>ID: {selectedUser.id}</span>
                                            {isVIP && (
                                                <span className={styles.vipBadge}>
                                                    <Star size={10} fill="#fbbf24" /> VIP
                                                </span>
                                            )}
                                            {isLocked && (
                                                <span className={styles.lockBadge}>
                                                    <Lock size={10} /> LOCKED
                                                </span>
                                            )}
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
                                    <button className={styles.utilBtn} title="Download Chat">
                                        <Download size={18} />
                                    </button>
                                    <button className={styles.utilBtn} title="Security Alert" style={{ color: '#ef4444' }}>
                                        <ShieldAlert size={18} />
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
                                    { id: 'history', label: 'HISTORY', icon: <History size={14} /> },
                                    { id: 'files', label: 'FILES', icon: <Paperclip size={14} /> },
                                    { id: 'subscription', label: 'BILLING', icon: <CreditCard size={14} /> },
                                    { id: 'notes', label: 'NOTES', icon: <Edit2 size={14} /> }
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
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('File')}
                                >
                                    <Paperclip size={16} /> FILE
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Canned')}
                                >
                                    <MessageSquare size={16} /> QUICK
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Emoji')}
                                >
                                    <Smile size={16} /> EMOJI
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Audio')}
                                >
                                    <Mic size={16} /> VOICE
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Transfer')}
                                >
                                    <History size={16} /> TRANSFER
                                </button>
                                <button
                                    className={styles.roleActionBtn}
                                    onClick={() => handleRoleAction('Close')}
                                >
                                    <Ban size={16} /> CLOSE
                                </button>
                            </div>

                            <div className={styles.chatInputWrapper}>
                                <div className={styles.inputContainer}>
                                    <div className={styles.inputTools}>
                                        <button
                                            className={styles.toolBtn}
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <Smile size={18} />
                                        </button>
                                        <button
                                            className={styles.toolBtn}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        <button
                                            className={`${styles.toolBtn} ${isRecordingAudio ? styles.recording : ''}`}
                                            onClick={() => handleRoleAction('Audio')}
                                        >
                                            <Mic size={18} />
                                            {isRecordingAudio && (
                                                <span className={styles.recordingTime}>{formatTime(audioDuration)}</span>
                                            )}
                                        </button>
                                    </div>
                                    <textarea
                                        className={styles.messageInput}
                                        placeholder="Type your message here..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                    />
                                    <button
                                        className={styles.sendBtn}
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim() && fileUploads.length === 0}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>

                                {fileUploads.length > 0 && (
                                    <div className={styles.uploadPreview}>
                                        {fileUploads.map(upload => (
                                            <div key={upload.id} className={styles.uploadPreviewItem}>
                                                <FileText size={14} />
                                                <span>{upload.name}</span>
                                                <div className={styles.previewProgress}>
                                                    <div className={styles.previewBar} style={{ width: `${upload.progress}%` }} />
                                                </div>
                                                <button
                                                    className={styles.removeUpload}
                                                    onClick={() => setFileUploads(prev => prev.filter(f => f.id !== upload.id))}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.primaryActionWrapper}>
                                <button
                                    className={styles.primaryActionBtn}
                                    onClick={() => setActiveInteraction('chat')}
                                >
                                    <MessageSquare size={22} />
                                    <div className={styles.chatActionText}>
                                        <span>ESTABLISH SECURE CHAT</span>
                                        <span className={styles.chatStats}>
                                            {chatMessages.length} messages • {unreadCount} unread
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Cpu size={64} className={styles.beaconIcon} />
                            <h2>SCANNER ACTIVE</h2>
                            <p>Select a node from the live queue to initiate secure chat protocol.</p>
                            <div className={styles.emptyStats}>
                                <div className={styles.statItem}>
                                    <User size={24} />
                                    <span>{MOCK_USERS.length} Active</span>
                                </div>
                                <div className={styles.statItem}>
                                    <MessageSquare size={20} />
                                    <span>{membersHandled} Handled Today</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Shield size={20} />
                                    <span>Encrypted</span>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Emoji Picker */}
            <AnimatePresence>
                {showEmojiPicker && (
                    <motion.div
                        className={styles.emojiPicker}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className={styles.emojiHeader}>
                            <div className={styles.emojiCategories}>
                                {Object.keys(EMOJI_CATEGORIES).map(category => (
                                    <button
                                        key={category}
                                        className={`${styles.emojiCategoryBtn} ${activeEmojiCategory === category ? styles.active : ''}`}
                                        onClick={() => setActiveEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            <button className={styles.closeEmoji} onClick={() => setShowEmojiPicker(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className={styles.emojiGrid}>
                            {EMOJI_CATEGORIES[activeEmojiCategory].map(emoji => (
                                <button
                                    key={emoji}
                                    className={styles.emojiBtn}
                                    onClick={() => handleEmojiSelect(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Phrases Picker */}
            <AnimatePresence>
                {showQuickPhrases && (
                    <motion.div
                        className={styles.quickPhrasesPicker}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className={styles.phrasesHeader}>
                            <h4>Quick Phrases</h4>
                            <button className={styles.closePhrases} onClick={() => setShowQuickPhrases(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className={styles.phrasesList}>
                            {QUICK_PHRASES.map(phrase => (
                                <button
                                    key={phrase.id}
                                    className={styles.phraseBtn}
                                    onClick={() => handleQuickPhraseSelect(phrase)}
                                >
                                    <div className={styles.phraseShortcut}>{phrase.shortcut}</div>
                                    <div className={styles.phraseContent}>{phrase.content}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Upload Modal */}
            <AnimatePresence>
                {showFileUpload && (
                    <motion.div
                        className={styles.fileUploadModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className={styles.uploadModalContent}>
                            <div className={styles.uploadHeader}>
                                <h3>Upload Files</h3>
                                <button onClick={() => setShowFileUpload(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.uploadBody}>
                                <div className={styles.uploadZone}>
                                    <Upload size={48} />
                                    <p>Drag & drop files here or click to browse</p>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </div>
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
                                <h2>{overlayType.toUpperCase()} PROTOCOL</h2>
                                <button onClick={() => setOverlayType(null)}>
                                    <Ban size={20} />
                                </button>
                            </div>

                            {overlayType === 'transfer' && (
                                <div className={styles.overlayBody}>
                                    <h3>Transfer Chat</h3>
                                    <div className={styles.transferForm}>
                                        <select
                                            className={styles.transferSelect}
                                            value={transferTarget}
                                            onChange={(e) => setTransferTarget(e.target.value)}
                                        >
                                            <option value="">Select agent...</option>
                                            {MOCK_USERS.filter(u => u.role === 'advocate').map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.status})
                                                </option>
                                            ))}
                                        </select>
                                        <div className={styles.transferActions}>
                                            <button
                                                className={styles.confirmBtn}
                                                onClick={handleTransfer}
                                                disabled={!transferTarget}
                                            >
                                                <Check size={16} /> Confirm Transfer
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => {
                                                    setShowTransfer(false);
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

                            {!['transfer'].includes(overlayType) && (
                                <div className={styles.overlayBody}>
                                    <p>Initiating automated {overlayType} sequence...</p>
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

export default PremiumChat;
