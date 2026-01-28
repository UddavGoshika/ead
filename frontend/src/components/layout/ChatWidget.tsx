// import React, { useState } from 'react';
// import styles from './ChatWidget.module.css';
// import { MessageSquare, X, Send, Bot } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const ChatWidget: React.FC = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [message, setMessage] = useState("");
//     const [chatHistory, setChatHistory] = useState([
//         { type: 'bot', text: 'Hello! I am your Legal Assistant. How can I help you today?' }
//     ]);

//     const handleSend = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!message.trim()) return;

//         setChatHistory(prev => [...prev, { type: 'user', text: message }]);
//         setMessage("");

//         // Simulate bot response
//         setTimeout(() => {
//             setChatHistory(prev => [...prev, {
//                 type: 'bot',
//                 text: "Thank you for your message. I'm analyzing your query and will connect you with a specialist if needed."
//             }]);
//         }, 1000);
//     };

//     return (
//         <div className={styles.chatWidget}>
//             <AnimatePresence>
//                 {isOpen && (
//                     <motion.div
//                         className={styles.chatWindow}
//                         initial={{ opacity: 0, y: 20, scale: 0.95 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: 20, scale: 0.95 }}
//                     >
//                         <div className={styles.header}>
//                             <div className={styles.headerInfo}>
//                                 <div className={styles.botIcon}>
//                                     <Bot size={20} />
//                                 </div>
//                                 <div>
//                                     <h3>LexiAI-Smart Advocate </h3>
//                                     <span>Online</span>
//                                 </div>
//                             </div>
//                             <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <div className={styles.messages}>
//                             {chatHistory.map((msg, i) => (
//                                 <div key={i} className={`${styles.message} ${msg.type === 'user' ? styles.userMsg : styles.botMsg}`}>
//                                     <div className={styles.bubble}>
//                                         {msg.text}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <form className={styles.inputArea} onSubmit={handleSend}>
//                             <input
//                                 type="text"
//                                 placeholder="Type your message..."
//                                 value={message}
//                                 onChange={(e) => setMessage(e.target.value)}
//                             />
//                             <button type="submit">
//                                 <Send size={18} />
//                             </button>
//                         </form>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <button
//                 className={`${styles.toggleBtn} ${isOpen ? styles.hidden : ''}`}
//                 onClick={() => setIsOpen(true)}
//             >
//                 <MessageSquare size={24} />
//             </button>
//         </div>
//     );
// };

// export default ChatWidget;




import React, { useState } from 'react';
import styles from './ChatWidget.module.css';
import { MessageSquare, X, Send, Bot, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type ChatMessage = {
    type: 'bot' | 'user';
    text: string;
    showAgentBtn?: boolean;
};

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            type: 'bot',
            text: 'Hello! I am LexiAI, your Smart Legal Assistant. How can I help you today?',
            showAgentBtn: true,
        }
    ]);

    const getDynamicResponse = (input: string): string => {
        const text = input.toLowerCase();

        const knowledgeBase = [
            {
                keys: ['advocate', 'lawyer', 'legal', 'find', 'search'],
                reply: "You can find expert advocates by clicking 'Browse Profiles' in the menu. We have specialists in Divorce, Criminal, Corporate, and Civil law."
            },
            {
                keys: ['register', 'join', 'signup', 'account', 'create'],
                reply: "Joining is easy! Click 'Register' at the top. You can choose to be an 'Advocate' (to find clients) or a 'Client' (to get legal help)."
            },
            {
                keys: ['price', 'cost', 'plan', 'package', 'membership', 'premium', 'silver', 'gold', 'platinum'],
                reply: "Our membership plans (Silver, Gold, Platinum) offer premium benefits like featured placement, verified badges, and extra wallet coins to grow your practice."
            },
            {
                keys: ['wallet', 'coin', 'balance', 'credit', 'payment'],
                reply: "Your wallet stores coins used for viewing premium profiles or featuring your own. You can manage your balance directly from your member dashboard."
            },
            {
                keys: ['verify', 'verification', 'document', 'badge', 'approve'],
                reply: "Verification builds trust! Advocates should upload their Bar ID and Identity proof in the 'Verification' section of their dashboard for admin review."
            },
            {
                keys: ['hello', 'hi', 'hey', 'assistant'],
                reply: "Hello! I'm here to help you navigate our E-Advocate platform. What's on your mind today?"
            },
            {
                keys: ['contact', 'help', 'support', 'agent', 'talk'],
                reply: "Need a human touch? You can click the 'Chat with Agent' button above or visit our Contact page to get direct support."
            },
            {
                keys: ['blog', 'article', 'news', 'read'],
                reply: "Stay updated with the latest legal insights! Visit our 'Blogs' section for articles on law, rights, and industry news."
            },
            {
                keys: ['about', 'mission', 'who', 'company'],
                reply: "We are a digital bridge connecting quality advocates with people who need them. Our mission is to make legal help accessible for everyone."
            },
            {
                keys: ['case', 'file', 'issue', 'problem'],
                reply: "Dealing with a legal issue? Register as a Client to 'File a Case' and get matched with advocates who can solve your specific problem."
            }
        ];

        for (const item of knowledgeBase) {
            if (item.keys.some(k => text.includes(k))) {
                return item.reply;
            }
        }

        return "That's an interesting question! While I'm still learning, I can connect you with a specialized support agent who can help you further.";
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = message;
        // Add user message
        setChatHistory(prev => [...prev, { type: 'user', text: userMsg }]);
        setMessage("");

        // Process Dynamic Bot Response
        setTimeout(() => {
            const botReply = getDynamicResponse(userMsg);
            setChatHistory(prev => [
                ...prev,
                {
                    type: 'bot',
                    text: botReply,
                    showAgentBtn: true,
                }
            ]);
        }, 800);
    };

    const handleAgentRedirect = () => {
        navigate('/contact'); // Changed to /contact as a default support route
    };

    return (
        <div className={styles.chatWidget}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatWindow}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        <div className={styles.header}>
                            <div className={styles.headerInfo}>
                                <div className={styles.botIcon}>
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3>LexiAI – Smart Advocate</h3>
                                    <span>Online</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.messages}>
                            {chatHistory.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`${styles.message} ${msg.type === 'user'
                                        ? styles.userMsg
                                        : styles.botMsg
                                        }`}
                                >
                                    <div className={styles.bubble}>
                                        {msg.text}

                                        {/* AGENT BUTTON FOR BOT RESPONSES */}
                                        {msg.type === 'bot' && msg.showAgentBtn && (
                                            <div className={styles.agentCta}>
                                                <button
                                                    onClick={handleAgentRedirect}
                                                    className={styles.agentBtn}
                                                >
                                                    <Headphones size={16} />
                                                    Chat with Agent
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form className={styles.inputArea} onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit">
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                className={`${styles.toggleBtn} ${isOpen ? styles.hidden : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare size={24} />
            </button>
        </div>
    );
};

export default ChatWidget;
