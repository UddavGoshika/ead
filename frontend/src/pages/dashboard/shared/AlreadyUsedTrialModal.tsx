import React from 'react';
import styles from './PremiumTryonModal.module.css';
import { Sparkles, CheckCircle2, X, Zap, Crown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AlreadyUsedTrialModalProps {
    onClose: () => void;
}

const AlreadyUsedTrialModal: React.FC<AlreadyUsedTrialModalProps> = ({ onClose }) => {
    const { user } = useAuth();

    const handleClose = () => {
        sessionStorage.setItem('hasSeenAlreadyUsedPopup', 'true');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className={styles.content}>
                    <div className={styles.iconWrapper} style={{ background: 'rgba(250, 204, 21, 0.1)' }}>
                        <Crown className={styles.sparkleIcon} size={40} color="#facc15" />
                    </div>
                    <h2 className={styles.title}>Your Trial has Expired!</h2>
                    <p className={styles.subtitle}>
                        You've already experienced the trial. To continue enjoying unmasked profiles and priority connections, please upgrade to a permanent plan.
                    </p>

                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <CheckCircle2 size={18} className={styles.checkIcon} />
                            <span>Unlimited Contact Access</span>
                        </div>
                        <div className={styles.featureItem}>
                            <Zap size={18} className={styles.zapIcon} />
                            <span>Priority in Client Searches</span>
                        </div>
                        <div className={styles.featureItem}>
                            <Crown size={18} color="#facc15" />
                            <span>Exclusive Professional Badge</span>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button
                            className={styles.activateBtn}
                            onClick={() => window.location.href = '/dashboard?page=upgrade'}
                            style={{ background: '#facc15', color: '#000' }}
                        >
                            Upgrade to Premium Now
                        </button>
                        <button className={styles.skipBtn} onClick={handleClose}>
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlreadyUsedTrialModal;
