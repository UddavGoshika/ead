import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Paperclip, Smile, Mic,
    Check, CheckCheck,
    X, Zap,
    Download, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MultiOptionChat.module.css';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'file';
    fileName?: string;
}

interface MultiOptionChatProps {
    user: any;
    onClose: () => void;
    onComplete: () => void;
}

const TEMPLATES = [
    { id: 't1', label: 'Greeting', text: "Hello! I'm your dedicated premium support executive. How can I assist you with your legal matters today?" },
    { id: 't2', label: 'ID Request', text: "To proceed, could you please upload a clear scanned copy of your government-issued ID for verification?" },
    { id: 't3', label: 'Escalation', text: "I am escalating your query to our senior legal department. Please stay connected while I transfer the session." },
    { id: 't4', label: 'Closing', text: "Thank you for choosing our premium support. Your session details have been archived in your dossier. Have a great day!" }
];

const MultiOptionChat: React.FC<MultiOptionChatProps> = ({ user, onClose, onComplete }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "System: Secure connection established. End-to-end encryption active.", sender: 'agent', timestamp: '10:00 AM', status: 'read', type: 'text' },
        { id: '2', text: `Agent joined the session to assist ${user.name}`, sender: 'agent', timestamp: '10:01 AM', status: 'read', type: 'text' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sentiment] = useState(0.85);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            type: 'text'
        };
        setMessages([...messages, newMessage]);
        setInputValue('');

        // Simulate delivery/read
        setTimeout(() => {
            setMessages((prev: Message[]) => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
        }, 1500);
    };

    const handleTemplate = (text: string) => {
        setInputValue(text);
        setIsMenuOpen(false);
    };

    return (
        <div className={styles.chatWrapper}>
            <div className={styles.chatHeader}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user.image ? <img src={user.image} alt="" /> : user.name.charAt(0)}
                    </div>
                    <div>
                        <h3>{user.name}</h3>
                        <p>Secure Session Active • {user.location}</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.sentimentBox}>
                        <span>SENTIMENT</span>
                        <div className={styles.gauge}><div style={{ width: `${sentiment * 100}%` }} /></div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>
            </div>

            <div className={styles.messageArea} ref={scrollRef}>
                {messages.map((m) => (
                    <div key={m.id} className={`${styles.messageBubble} ${m.sender === 'agent' ? styles.agentMsg : styles.userMsg}`}>
                        <div className={styles.bubbleContent}>
                            {m.type === 'text' ? (
                                <p>{m.text}</p>
                            ) : (
                                <div className={styles.fileBox}>
                                    <FileText size={20} />
                                    <span>{m.fileName}</span>
                                    <Download size={16} />
                                </div>
                            )}
                            <div className={styles.bubbleMeta}>
                                <span>{m.timestamp}</span>
                                {m.sender === 'agent' && (
                                    m.status === 'read' ? <CheckCheck size={12} color="#3b82f6" /> : <Check size={12} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.inputArea}>
                <div className={styles.actionToolbar}>
                    <button className={styles.toolBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Zap size={18} />
                        <span>QUICK TEMPLATES</span>
                    </button>
                    <button className={styles.toolBtn}><Paperclip size={18} /> ATTACH</button>
                    <button className={styles.toolBtn}><Smile size={18} /> EMOJI</button>
                    <button className={styles.toolBtn}><Mic size={18} /> VOICE</button>
                    <div className={styles.spacer} />
                    <button className={styles.completeBtn} onClick={onComplete}>RESOLVE SESSION</button>
                </div>

                <div className={styles.inputBox}>
                    <textarea
                        placeholder="Type secure response..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />
                    <button className={styles.sendBtn} onClick={handleSend} disabled={!inputValue.trim()}>
                        <Send size={20} />
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className={styles.templateMenu}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <div className={styles.menuHeader}>
                                <span>PROFESSIONAL RESPONSES</span>
                                <button onClick={() => setIsMenuOpen(false)}><X size={14} /></button>
                            </div>
                            <div className={styles.templateGrid}>
                                {TEMPLATES.map(t => (
                                    <button key={t.id} onClick={() => handleTemplate(t.text)}>
                                        <strong>{t.label}</strong>
                                        <p>{t.text.substring(0, 45)}...</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MultiOptionChat;
