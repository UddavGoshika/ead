import React from 'react';
import styles from './PremiumTryonModal.module.css';
import { Sparkles, Clock, CheckCircle2, X, Zap } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface PremiumTryonModalProps {
    onClose: () => void;
}

const PremiumTryonModal: React.FC<PremiumTryonModalProps> = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const [step, setStep] = React.useState<'info' | 'confirm' | 'success'>('info');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleClose = () => {
        localStorage.setItem('hasDismissedPremiumTrial', 'true');
        onClose();
    };

    const handleActivate = async () => {
        if (!user?.id) return;
        if (user?.status === 'Pending' || user?.status === 'Reverify') {
            alert("Your account is under verification. Premium trial cannot be activated yet.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/activate-demo', { userId: user.id });
            if (res.data.success) {
                // Refresh user data to reflect changes immediately
                const token = localStorage.getItem('token');
                const meRes = await axios.get('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (meRes.data.success) {
                    refreshUser(meRes.data.user);
                }
                setStep('success');
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to activate trial.");
            setStep('info');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className={styles.content}>
                    {step === 'info' && (
                        <>
                            <div className={styles.iconWrapper}>
                                <Sparkles className={styles.sparkleIcon} size={40} />
                            </div>
                            <h2 className={styles.title}>{user?.demoUsed ? 'Go Premium Today!' : 'Unlock Premium Trial'}</h2>
                            <p className={styles.subtitle}>
                                {user?.demoUsed
                                    ? "Upgrade your account to unlock all premium features forever and connect with everyone instantly."
                                    : "Experience the power of Pro Lite Silver for the next 12 hours. Totally free, no commitment."}
                            </p>
                            <div className={styles.features}>
                                <div className={styles.featureItem}>
                                    <CheckCircle2 size={18} className={styles.checkIcon} />
                                    <span>Unmasked Profile Details & Chats</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <Zap size={18} className={styles.zapIcon} />
                                    <span>Priority Matching & Visibility</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <Clock size={18} className={styles.clockIcon} />
                                    <span>{user?.demoUsed ? 'Unlock permanent priority access' : 'Valid for 12 hours from activation'}</span>
                                </div>
                            </div>
                            <div className={styles.footer}>
                                {!user?.demoUsed && (
                                    <button className={styles.activateBtn} onClick={() => setStep('confirm')}>
                                        Activate 1-Day Trial
                                    </button>
                                )}
                                <button className={styles.upgradeNowBtn} onClick={() => window.location.href = '/dashboard?page=upgrade'}>
                                    Upgrade to Premium
                                </button>
                                <button className={styles.skipBtn} onClick={handleClose}>
                                    Maybe Later
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'confirm' && (
                        <>
                            <div className={`${styles.iconWrapper} ${styles.confirmIcon}`}>
                                <Zap size={40} fill="currentColor" />
                            </div>
                            <h2 className={styles.title}>Ready to Start?</h2>
                            <p className={styles.subtitle}>
                                Once activated, your <strong>12-hour Premium access</strong> begins immediately. You can only use this free trial once.
                            </p>
                            <div className={styles.footer}>
                                <button
                                    className={styles.activateBtn}
                                    onClick={handleActivate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Activating...' : 'Yes, Activate Now!'}
                                </button>
                                <button className={styles.skipBtn} onClick={() => setStep('info')}>
                                    Go Back
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'success' && (
                        <>
                            <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className={styles.title}>Welcome to Premium!</h2>
                            <p className={styles.subtitle}>
                                Your trial is now active. Explore unmasked profiles and connect with anyone for the next 12 hours.
                            </p>
                            <div className={styles.footer}>
                                <button className={styles.activateBtn} onClick={onClose}>
                                    Let's Explore
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PremiumTryonModal;
