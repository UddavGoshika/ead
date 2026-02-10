import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Home, ExternalLink, HelpCircle } from 'lucide-react';
import styles from './PendingPopup.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingPopupProps {
    status: string;
    rejectionReason?: string;
    onClose: () => void;
}

const PendingPopup: React.FC<PendingPopupProps> = ({ status, rejectionReason, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.popup}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className={styles.header}>
                        <div className={styles.iconWrapper}>
                            <ShieldAlert size={40} className={styles.pulseIcon} />
                        </div>
                        <h2>Verification in Process</h2>
                        <div className={styles.statusBadge}>{status.toUpperCase()}</div>
                    </div>

                    <div className={styles.content}>
                        <p>
                            Welcome to the platform! Your profile is currently being reviewed by our trust and safety team.
                            While your account is <strong>{status}</strong>, some interactive features like messaging or case management might be restricted.
                        </p>

                        {rejectionReason && (
                            <div className={styles.reasonBox}>
                                <strong>Important Note:</strong>
                                <p>{rejectionReason}</p>
                            </div>
                        )}

                        <div className={styles.processInfo}>
                            <div className={styles.infoItem}>
                                <HelpCircle size={16} />
                                <span>Verification takes 12-24 hours usually.</span>
                            </div>
                            <div className={styles.infoItem}>
                                <ExternalLink size={16} />
                                <span>You can explore the site and update your profile.</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.exploreBtn} onClick={onClose}>
                            Explore Now
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PendingPopup;
