import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Book, Shield, MessageCircle, Phone, Mail, FileText, Scale } from 'lucide-react';
import styles from './HelpModal.module.css';
import { useAuth } from '../../context/AuthContext';

const helpCategories = [
    {
        icon: <Book size={24} />,
        title: "User Guide",
        description: "Learn how to use the platform effectively as a client or advocate.",
        link: "#"
    },
    {
        icon: <Shield size={24} />,
        title: "Trust & Safety",
        description: "Your security is our priority. Read about our verification process.",
        link: "#"
    },
    {
        icon: <Scale size={24} />,
        title: "Legal Resources",
        description: "Access a library of legal documents, acts, and court procedures.",
        link: "#"
    },
    {
        icon: <MessageCircle size={24} />,
        title: "Live Chat Support",
        description: "Connect with our support team for immediate assistance.",
        link: "#"
    },
    {
        icon: <Phone size={24} />,
        title: "Call Us",
        description: "Talk to our experts available 24/7 for urgent consultations.",
        link: "tel:+917093704706"
    },
    {
        icon: <Mail size={24} />,
        title: "Email Support",
        description: "Send us your queries and we'll respond within 24 hours.",
        link: "mailto:support@eadvocateservices.com"
    },
    {
        icon: <FileText size={24} />,
        title: "FAQ",
        description: "Quick answers to common questions about accounts and services.",
        link: "/faq"
    },
    {
        icon: <HelpCircle size={24} />,
        title: "Other Help",
        description: "Submit a ticket for specific issues not covered above.",
        link: "#"
    }
];

const HelpModal: React.FC = () => {
    const { isHelpModalOpen, closeHelpModal } = useAuth();

    if (!isHelpModalOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={closeHelpModal}>
                <motion.div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <HelpCircle className={styles.titleIcon} />
                            <h2>Help & Support Center</h2>
                        </div>
                        <button className={styles.closeBtn} onClick={closeHelpModal}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        <p className={styles.intro}>
                            How can we help you today? Select a category below to find the information you need.
                        </p>

                        <div className={styles.grid}>
                            {helpCategories.map((cat, idx) => (
                                <motion.a
                                    href={cat.link}
                                    key={idx}
                                    className={styles.card}
                                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                                >
                                    <div className={styles.iconWrapper}>
                                        {cat.icon}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3>{cat.title}</h3>
                                        <p>{cat.description}</p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
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
