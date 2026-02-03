import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Book, Shield, MessageCircle, Phone, Mail, FileText, Scale, ArrowLeft } from 'lucide-react';
import styles from './HelpModal.module.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HelpModal: React.FC = () => {
    const { isHelpModalOpen, closeHelpModal } = useAuth();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    const handleNavigation = (path: string) => {
        closeHelpModal();
        navigate(path);
        // Scroll to top or specific section if needed
        if (path.includes('#')) {
            const id = path.split('#')[1];
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    };

    const helpCategories = [
        {
            icon: <Book size={24} />,
            title: "User Guide",
            description: "Learn how to use the platform effectively as a client or advocate.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Platform User Guide</h3>
                    <p>Our platform connects clients with verified advocates seamlessly. Here is how to get started:</p>
                    <ul>
                        <li><strong>For Clients:</strong> Register, post your legal issue, or browse advocate profiles directly to book consultations.</li>
                        <li><strong>For Advocates:</strong> Create a profile, upload verification documents, and start receiving client leads.</li>
                    </ul>
                    <button className={styles.actionBtn} onClick={() => handleNavigation('/site-how-it-works')}>
                        View Full "How It Works" Guide
                    </button>
                </div>
            )
        },
        {
            icon: <Shield size={24} />,
            title: "Trust & Safety",
            description: "Your security is our priority. Read about our verification process.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Trust & Safety Assurance</h3>
                    <p>We maintain a secure environment through rigorous verification:</p>
                    <ul>
                        <li><strong>Identity Verification:</strong> All users are verified via mobile OTP.</li>
                        <li><strong>Bar Council Verification:</strong> Advocates must provide valid enrollment numbers.</li>
                        <li><strong>Data Encryption:</strong> All chats and documents are end-to-end encrypted.</li>
                    </ul>
                    <button className={styles.actionBtn} onClick={() => handleNavigation('/fraud-alert')}>
                        Read Fraud Alert Policy
                    </button>
                </div>
            )
        },
        {
            icon: <Scale size={24} />,
            title: "Legal Resources",
            description: "Access a library of legal documents, acts, and court procedures.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Legal Resources Library</h3>
                    <p>Access official judicial portals and essential legal templates:</p>
                    <div className={styles.linkList}>
                        <a href="https://ecourts.gov.in" target="_blank" rel="noopener noreferrer">eCourts Services Portal</a>
                        <a href="https://main.sci.gov.in/" target="_blank" rel="noopener noreferrer">Supreme Court of India</a>
                        <a href="https://filing.ecourts.gov.in/" target="_blank" rel="noopener noreferrer">e-Filing Portal</a>
                    </div>
                </div>
            )
        },
        {
            icon: <MessageCircle size={24} />,
            title: "Live Chat Support",
            description: "Connect with our support team for immediate assistance.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Live Chat Support</h3>
                    <p>Our support team is available Mon-Sat, 9:00 AM to 6:00 PM IST.</p>
                    <div className={styles.chatBoxPlaceholder}>
                        <p>Chat is currently: <span style={{ color: 'green', fontWeight: 'bold' }}>Online</span></p>
                        <p>Typical response time: &lt; 5 minutes</p>
                    </div>
                    <button className={styles.actionBtn} onClick={() => window.location.href = "mailto:support@eadvocateservices.com"}>
                        Start Chat (Email for now)
                    </button>
                </div>
            )
        },
        {
            icon: <Phone size={24} />,
            title: "Call Us",
            description: "Talk to our experts available 24/7 for urgent consultations.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Phone Support</h3>
                    <p>We are just a call away for urgent inquiries.</p>
                    <a href="tel:+917093704706" className={styles.contactLink}>
                        <Phone size={18} /> +91 70937 04706
                    </a>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                        Standard call rates apply. Available 24/7.
                    </p>
                </div>
            )
        },
        {
            icon: <Mail size={24} />,
            title: "Email Support",
            description: "Send us your queries and we'll respond within 24 hours.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Email Support</h3>
                    <p>Send us your detailed queries, feedback, or complaints.</p>
                    <a href="mailto:support@eadvocateservices.com" className={styles.contactLink}>
                        <Mail size={18} /> support@eadvocateservices.com
                    </a>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                        We aim to respond to all emails within 24 hours.
                    </p>
                </div>
            )
        },
        {
            icon: <FileText size={24} />,
            title: "FAQ",
            description: "Quick answers to common questions about accounts and services.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Frequently Asked Questions</h3>
                    <p>Find answers to common questions regarding account management, payments, and legal services.</p>
                    <button className={styles.actionBtn} onClick={() => handleNavigation('/#faq')}>
                        Go to FAQ Section
                    </button>
                </div>
            )
        },
        {
            icon: <HelpCircle size={24} />,
            title: "Other Help",
            description: "Submit a ticket for specific issues not covered above.",
            details: (
                <div className={styles.detailContent}>
                    <h3>Contact & Tickets</h3>
                    <p>If you couldn't find what you were looking for, please submit a detailed inquiry.</p>
                    <button className={styles.actionBtn} onClick={() => handleNavigation('/#contact')}>
                        Go to Contact Form
                    </button>
                </div>
            )
        }
    ];

    if (!isHelpModalOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={closeHelpModal}>
                <motion.div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            {activeCategory !== null && (
                                <button className={styles.backBtn} onClick={() => setActiveCategory(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <HelpCircle className={styles.titleIcon} />
                            <h2>{activeCategory !== null ? helpCategories[activeCategory].title : "Help & Support Center"}</h2>
                        </div>
                        <button className={styles.closeBtn} onClick={closeHelpModal}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        {activeCategory === null ? (
                            <>
                                <p className={styles.intro}>
                                    How can we help you today? Select a category below to find the information you need.
                                </p>
                                <div className={styles.grid}>
                                    {helpCategories.map((cat, idx) => (
                                        <motion.div
                                            key={idx}
                                            className={styles.card}
                                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                                            onClick={() => setActiveCategory(idx)}
                                        >
                                            <div className={styles.iconWrapper}>
                                                {cat.icon}
                                            </div>
                                            <div className={styles.cardInfo}>
                                                <h3>{cat.title}</h3>
                                                <p>{cat.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={styles.detailContainer}
                            >
                                {helpCategories[activeCategory].details}
                            </motion.div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <p>© 2025 E-Advocate Services. Committed to your legal success.</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HelpModal;
