import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SupportUI.module.css';

export interface ChatMessage {
    id: string;
    sender: 'agent' | 'user';
    content: string;
    timestamp: string;
}

interface SupportChatUIProps {
    user: { name: string; id: string; image?: string };
    onClose: () => void;
    onComplete: () => void;
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
}

const SupportChatUI: React.FC<SupportChatUIProps> = ({ user, onClose, onComplete, messages, onSendMessage }) => {
    const [input, setInput] = React.useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className={styles.chatContainer}>
            <header className={styles.uiHeader}>
                <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                        {user.image ? <img src={user.image} alt="" /> : user.name.charAt(0)}
                    </div>
                    <div>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userStatus}><span className={styles.pulseDot} /> Secure Chat Active</div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.completeBtn} onClick={onComplete}>COMPLETE SESSION</button>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
            </header>

            <div className={styles.messageList} ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.messageWrapper} ${msg.sender === 'agent' ? styles.agentWrapper : styles.userWrapper}`}
                        >
                            <div className={styles.messageBubble}>
                                {msg.content}
                                <span className={styles.timestamp}>{msg.timestamp}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <footer className={styles.chatInputArea}>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        placeholder="Type encrypted message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className={styles.sendBtn} onClick={handleSend}><Send size={18} /></button>
                </div>
            </footer>
        </div>
    );
};

export default SupportChatUI;
