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




import React, { useState, useEffect } from 'react';
import styles from './ChatWidget.module.css';
import { MessageSquare, X, Send, Bot, Headphones, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contactService } from '../../services/api';

type ChatMessage = {
    type: 'bot' | 'user';
    text: string;
    showAgentBtn?: boolean;
};

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [showAgentForm, setShowAgentForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: user?.role === 'legal_provider' ? 'legal_advisor' : (user?.role || 'client'),
        query: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                role: user.role === 'legal_provider' ? 'legal_advisor' : (user.role || 'client')
            }));
        }
    }, [user]);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            type: 'bot',
            text: 'Hello! I am LexiAI, your Smart Legal Assistant. How can I help you today?',
            showAgentBtn: true,
        }
    ]);

    const getDynamicResponse = (input: string): string => {
        // ... (rest of search/logic remains same, just keeping the relevant part)
        const text = input.toLowerCase();
        // (I will keep the knowledge base as is in the replacement)

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
            },
            {
                keys: ['bci', 'bar council', 'legal', 'compliant', 'norms', 'rules', 'regulation', 'guidelines', 'standard', 'professional'],
                reply: "Our platform strictly adheres to Bar Council of India (BCI) norms. We do NOT facilitate any fee sharing on cases, nor do we provide legal services directly. We are simply a digital bridge connecting clients with independent advocates. All advocates on our platform practice independently and are solely responsible for their legal services."
            },
            {
                keys: ['platform', 'website', 'about', 'what is', 'how work', 'e-advocate', 'service'],
                reply: "E-Advocate Services is a secure digital bridge that connects clients with verified advocates. We strictly follow BCI guidelines - we don't collect fees on cases, don't share profits, and don't provide legal advice. Think of us as a sophisticated matchmaking platform for legal needs where advocates and clients can discover each other."
            },
            {
                keys: ['find advocate', 'search lawyer', 'look for', 'need lawyer', 'hire', 'consult', 'specialist', 'expert'],
                reply: "Finding the right advocate is easy! Use our 'Browse Profiles' or 'Search' feature to filter advocates by practice area (Divorce, Criminal, Corporate, Civil, Family, Property, etc.), location, experience level, languages spoken, and client ratings. Each profile shows their specialization, years of practice, and verification status."
            },
            {
                keys: ['recommend', 'suggest', 'match', 'best fit', 'suitable'],
                reply: "Our smart recommendation system can suggest advocates based on your case type and location. Simply describe your legal need when registering, and we'll show you profiles of advocates who specialize in that area. You're in complete control - browse, compare, and choose who you'd like to connect with."
            },
            {
                keys: ['register', 'sign up', 'join', 'create account', 'become member'],
                reply: "Registration is free and simple! Choose your account type: 'Advocate' if you're a legal professional looking for clients, or 'Client' if you need legal assistance. Both get you access to our secure platform where you can manage your profile, communications, and connections."
            },
            {
                keys: ['advocate registration', 'lawyer join', 'legal professional', 'bar member'],
                reply: "Advocates, welcome! During registration, you'll provide your basic info, practice areas, and contact details. To get verified, you'll need to upload your Bar Council enrollment certificate and ID proof. This helps us maintain trust and authenticity on our platform."
            },
            {
                keys: ['client registration', 'user signup', 'need help'],
                reply: "Clients can register by providing basic contact information and optionally describing their legal need. This helps us show you the most relevant advocate profiles. Registration is free - you only pay for premium features if you choose to use them."
            },
            {
                keys: ['verify advocate', 'verification status', 'check verification', 'authentic', 'genuine', 'real lawyer'],
                reply: "Verification is our priority! Advocates who complete verification get a blue verified badge on their profile. We manually review their Bar Council enrollment, identity proof, and practice details. This process ensures you're connecting with genuine legal professionals who are authorized to practice."
            },
            {
                keys: ['upload document', 'submit proof', 'bar id', 'enrollment number', 'sanad'],
                reply: "To get verified, advocates should navigate to their dashboard and click on 'Verification'. Upload your Bar Council enrollment certificate (Sanad), identity proof (Aadhar/PAN), and a recent photo. Our team reviews within 2-3 business days and notifies you once verified."
            },
            {
                keys: ['badge', 'verified', 'trust badge', 'blue tick'],
                reply: "The blue verified badge indicates an advocate whose credentials have been manually verified by our team. Look for this badge when choosing an advocate - it adds an extra layer of trust to your connection."
            },
            {
                keys: ['wallet', 'coin', 'coins', 'balance', 'credit', 'virtual currency'],
                reply: "Wallet coins are our platform's virtual currency used for premium features - like viewing contact details of highly sought-after advocates or boosting your own profile visibility. You can purchase coins securely through the platform, and your balance is visible in your dashboard."
            },
            {
                keys: ['buy coin', 'purchase credit', 'add money', 'recharge'],
                reply: "To add coins to your wallet, go to your dashboard and select 'Wallet' → 'Add Coins'. We offer secure payment options including UPI, cards, and net banking. Your wallet balance updates instantly after successful payment."
            },
            {
                keys: ['spend coin', 'use coin', 'coin deduction'],
                reply: "Coins can be used for: 1) Viewing premium advocate contact details, 2) Featuring your advocate profile in search results, 3) Unlocking advanced search filters. You'll always see the coin cost before confirming any action."
            },
            {
                keys: ['membership', 'plan', 'subscription', 'premium', 'silver', 'gold', 'platinum'],
                reply: "Our membership plans (Silver, Gold, Platinum) offer advocates enhanced visibility and features. Benefits include: profile badge, priority in searches, more wallet coins, featured listings, and analytics. Check our 'Pricing' page for detailed comparison of all plans."
            },
            {
                keys: ['upgrade', 'switch plan', 'change membership'],
                reply: "Ready to upgrade? Log in to your advocate dashboard, go to 'Settings' → 'Membership', and select your desired plan. The new benefits will be active immediately after payment confirmation."
            },
            {
                keys: ['free vs paid', 'compare plans', 'benefits'],
                reply: "Free accounts give you basic profile visibility and standard search. Premium plans (Silver/Gold/Platinum) add features like verification badges, more wallet coins, priority listing in searches, and detailed analytics. Perfect for advocates looking to grow their practice!"
            },
            {
                keys: ['connect', 'contact advocate', 'message', 'reach out', 'get in touch'],
                reply: "Once you find an advocate you like, you can send them a connection request through the platform. Some advocates may require a small coin deduction to reveal their contact details - this ensures genuine connections and prevents spam."
            },
            {
                keys: ['chat', 'messaging', 'inbox', 'conversation'],
                reply: "Our in-platform messaging system lets you communicate securely with advocates. All messages are encrypted and private. You can access your conversations from the 'Messages' section in your dashboard."
            },
            {
                keys: ['schedule', 'appointment', 'meeting', 'consult'],
                reply: "Many advocates list their availability on their profile. You can request a consultation time that works for you. Actual legal consultations happen independently between you and the advocate - we just facilitate the initial connection."
            },
            {
                keys: ['fee sharing', 'commission', 'cut', 'percentage', 'share'],
                reply: "IMPORTANT: We NEVER take any cut or commission from legal fees! Our platform strictly follows BCI rules prohibiting fee sharing between non-lawyers and advocates. Advocates and clients negotiate and settle fees directly. We only charge for optional platform features (like profile boosts), never for legal services."
            },
            {
                keys: ['legal advice', 'consultation', 'case strategy', 'opinion'],
                reply: "We do NOT provide any legal advice, opinions, or case strategies. All legal services are provided independently by advocates on our platform. Any legal consultation, advice, or representation happens directly between you and the advocate you choose."
            },
            {
                keys: ['ethical', 'professional conduct', 'rules'],
                reply: "All advocates on our platform are expected to follow BCI professional conduct rules. If you experience any unethical behavior, please report it through our platform and we will investigate."
            },
            {
                keys: ['divorce', 'family', 'marriage', 'matrimonial', 'child custody', 'alimony'],
                reply: "Family law specialists handle divorce, child custody, alimony, domestic violence cases, and other family matters. Search for 'Family Law' in our directory to find experienced advocates in this field."
            },
            {
                keys: ['criminal', 'police', 'bail', 'FIR', 'court case', 'offence'],
                reply: "Criminal law advocates handle cases related to offenses, bail applications, criminal trials, and appeals. Many have experience in both trial courts and high courts. Use our search filters to find criminal law specialists."
            },
            {
                keys: ['corporate', 'business', 'company', 'contract', 'commercial'],
                reply: "Corporate lawyers assist with business registration, contracts, compliance, intellectual property, and commercial disputes. Filter by 'Corporate Law' to connect with business law experts."
            },
            {
                keys: ['civil', 'property', 'land', 'dispute', 'tenant', 'owner'],
                reply: "Civil litigation covers property disputes, land matters, recovery suits, and other non-criminal cases. Our platform has many experienced civil lawyers - search by 'Civil Law' to find them."
            },
            {
                keys: ['tax', 'income tax', 'gst', 'customs', 'excise'],
                reply: "Tax law specialists handle income tax matters, GST issues, customs, and excise cases. Find qualified tax advocates by filtering for 'Tax Law' in your search."
            },
            {
                keys: ['consumer', 'complaint', 'goods', 'services', 'defect'],
                reply: "Consumer protection lawyers help with cases against defective products, poor services, unfair trade practices, and consumer forum complaints. Search for 'Consumer Law' specialists."
            },
            {
                keys: ['technical issue', 'problem', 'error', 'bug', 'not working'],
                reply: "Experiencing a technical glitch? Please describe the issue in detail and our support team will assist you. You can also use the 'Report Problem' option in your dashboard for faster resolution."
            },
            {
                keys: ['forgot password', 'login issue', "can't sign in"],
                reply: "No worries! Click on 'Forgot Password' on the login page and follow the instructions sent to your registered email. Still having trouble? Contact support with your registered email address."
            },
            {
                keys: ['update profile', 'edit info', 'change details'],
                reply: "You can update your profile information anytime from your dashboard. Advocates can edit practice areas, bio, and availability. Profile photo updates help build trust with potential clients."
            },
            {
                keys: ['privacy', 'data', 'secure', 'confidential', 'private'],
                reply: "Your privacy matters! We use encryption for all data transmission, never share your personal information without consent, and follow strict data protection practices. Read our Privacy Policy for complete details."
            },
            {
                keys: ['delete account', 'remove profile', 'close account'],
                reply: "To delete your account, go to Settings → Account → 'Delete Account'. Please note this action is permanent and will remove your profile and data from our platform. For advocates, active connections will be notified."
            },
            {
                keys: ['blog', 'article', 'legal news', 'update', 'knowledge'],
                reply: "Our 'Blogs' section features articles on legal awareness, rights, recent judgments, and practical legal tips. Written by legal professionals, it's a great resource for understanding basic legal concepts."
            },
            {
                keys: ['faq', 'help center', 'guide', 'tutorial'],
                reply: "Visit our Help Center for detailed guides, FAQs, and video tutorials on using all platform features. It's your go-to resource for getting the most out of E-Advocate Services."
            },
            {
                keys: ['feedback', 'suggestion', 'improve', 'idea'],
                reply: "We love hearing from our users! Share your suggestions or feedback through the 'Contact Us' form. Your input helps us make the platform better for everyone."
            },
            {
                keys: ['complaint', 'report', 'issue with advocate', 'unprofessional'],
                reply: "If you experience any unprofessional behavior or have concerns about an advocate, please report it immediately through your dashboard or contact our support team. We take all complaints seriously and investigate thoroughly."
            },
            {
                keys: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
                reply: "Hello! 👋 Welcome to E-Advocate Services. I'm your virtual assistant, here to help you navigate our platform. What can I assist you with today?"
            },
            {
                keys: ['thank', 'thanks', 'appreciate'],
                reply: "You're very welcome! 😊 Is there anything else I can help you with? Feel free to ask if you have more questions about our platform."
            },
            {
                keys: ['bye', 'goodbye', 'see you', 'later'],
                reply: "Goodbye! Thank you for visiting E-Advocate Services. If you need assistance in the future, we're just a message away. Have a great day!"
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

    const handleConnectToAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await contactService.submitInquiry({
                name: formData.name,
                email: user?.email || 'visitor@eadvocate.in',
                message: formData.query,
                category: 'Support Chat',
                subject: `Direct Support Connection: ${formData.role}`,
                source: 'LexiAI Chat Widget'
            });

            // Success message in chat
            setChatHistory(prev => [...prev, {
                type: 'bot',
                text: `Thank you ${formData.name}! Your request has been sent to our agent dashboard. An expert will reach out to you shortly.`
            }]);
            setShowAgentForm(false);
        } catch (err) {
            console.error(err);
            alert("Failed to connect. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                        {/* AGENT FORM OVERLAY */}
                        {showAgentForm && (
                            <div className={styles.agentForm}>
                                <div className={styles.formHeader}>
                                    <h4>Connect to Agent</h4>
                                    <button onClick={() => setShowAgentForm(false)} className={styles.closeBtn}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <form className={styles.connectForm} onSubmit={handleConnectToAgent}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>I am a:</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="client">Client</option>
                                            <option value="advocate">Advocate</option>
                                            <option value="legal_advisor">Legal Advisor</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Your Query</label>
                                        <textarea
                                            required
                                            value={formData.query}
                                            onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                                            placeholder="Tell us what you need help with..."
                                            rows={4}
                                        />
                                    </div>

                                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : 'Connect with Agent'}
                                    </button>
                                </form>
                            </div>
                        )}

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
                                                    onClick={() => setShowAgentForm(true)}
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

