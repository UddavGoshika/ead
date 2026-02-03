import React from 'react';
import { Coins, Zap, X } from 'lucide-react';
import styles from './TokenTopupModal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onTopup: () => void;
}

const TokenTopupModal: React.FC<Props> = ({ isOpen, onClose, onTopup }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.iconWrapper}>
                    <div className={styles.glowBg}></div>
                    <Coins size={64} className={styles.mainIcon} />
                </div>

                <h2 className={styles.title}>Your tokens are empty!</h2>
                <p className={styles.description}>
                    You've reached the limit of your current plan. Top up your tokens or upgrade to a higher plan to continue interacting with premium profiles.
                </p>

                <div className={styles.actionRow}>
                    <button className={styles.secondaryBtn} onClick={onClose}>
                        Later
                    </button>
                    <button className={styles.primaryBtn} onClick={() => {
                        onTopup();
                        onClose();
                    }}>
                        <Zap size={18} fill="currentColor" />
                        <span>Topup Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenTopupModal;
