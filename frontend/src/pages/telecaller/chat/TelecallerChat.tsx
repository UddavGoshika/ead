import React, { useState } from 'react';
import { MdSend, MdFace, MdAttachFile, MdMoreVert, MdSearch } from 'react-icons/md';
import styles from './TelecallerChat.module.css';

interface Message {
    id: string;
    text: string;
    sender: 'agent' | 'user';
    timestamp: string;
}

const TelecallerChat: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hello! How can I help you today?', sender: 'user', timestamp: '10:00 AM' },
        { id: '2', text: 'I am looking for some legal assistance regarding a contract.', sender: 'user', timestamp: '10:01 AM' },
        { id: '3', text: 'Certainly! I can help you with that. Could you provide some more details?', sender: 'agent', timestamp: '10:02 AM' },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            text: message,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMsg]);
        setMessage('');
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Active Chats</h2>
                    <div className={styles.searchBar}>
                        <MdSearch />
                        <input type="text" placeholder="Search conversations..." />
                    </div>
                </div>
                <div className={styles.chatList}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`${styles.chatItem} ${i === 1 ? styles.activeChat : ''}`}>
                            <div className={styles.avatar}>U{i}</div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatName}>User {i}</div>
                                <div className={styles.lastMsg}>Last message preview here...</div>
                            </div>
                            <div className={styles.chatMeta}>
                                <div className={styles.chatTime}>10:0{i} AM</div>
                                {i === 1 && <div className={styles.unreadCount}>2</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.mainChat}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <div className={styles.activeAvatar}>U1</div>
                        <div>
                            <h3>User 1</h3>
                            <span className={styles.status}>Online</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <MdMoreVert />
                    </div>
                </div>

                <div className={styles.messageList}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'agent' ? styles.agentWrapper : styles.userWrapper}`}>
                            <div className={styles.message}>
                                <div className={styles.msgText}>{msg.text}</div>
                                <div className={styles.msgTime}>{msg.timestamp}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.inputArea}>
                    <button className={styles.iconBtn}><MdAttachFile /></button>
                    <input
                        type="text"
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className={styles.iconBtn}><MdFace /></button>
                    <button className={styles.sendBtn} onClick={handleSend}><MdSend /></button>
                </div>
            </div>
        </div>
    );
};

export default TelecallerChat;
