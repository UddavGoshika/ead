import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, User, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await authService.initiateResetOtp({ token: token!, identifier });
            if (res.data.success) {
                setStep(2);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Verification failed. Link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }
        setError(null);
        setStep(3);
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await authService.resetPassword({ token, otp, password });
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={styles.card}
                >
                    <div className={styles.successIcon}><CheckCircle size={64} /></div>
                    <h1>Password Reset Successful</h1>
                    <p>Your password has been updated securely. You will be redirected to the login page shortly.</p>
                    <button className={styles.submitBtn} onClick={() => navigate('/')}>Login Now</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.stepIndicator}>
                    <div className={`${styles.stepDot} ${step >= 1 ? styles.activeDot : ''}`} />
                    <div className={`${styles.stepLine} ${step >= 2 ? styles.activeLine : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 2 ? styles.activeDot : ''}`} />
                    <div className={`${styles.stepLine} ${step >= 3 ? styles.activeLine : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 3 ? styles.activeDot : ''}`} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <h1>Verify Identity</h1>
                            <p className={styles.subtitle}>Enter your registered Email or Login ID associated with this reset link.</p>

                            {error && <div className={styles.errorBox}><AlertCircle size={18} /><span>{error}</span></div>}

                            <form onSubmit={handleInitiate}>
                                <div className={styles.formGroup}>
                                    <label><User size={16} /> Email or Login ID</label>
                                    <input type="text" placeholder="name@example.com or ID" required value={identifier} onChange={e => setIdentifier(e.target.value)} />
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Continue'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <h1>Confirm Verification</h1>
                            <p className={styles.subtitle}>Enter the 6-digit code sent to your registered email address.</p>

                            {error && <div className={styles.errorBox}><AlertCircle size={18} /><span>{error}</span></div>}

                            <form onSubmit={handleVerifyOtp}>
                                <div className={styles.formGroup}>
                                    <label><ShieldCheck size={16} /> OTP Code</label>
                                    <input type="text" maxLength={6} placeholder="123456" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className={styles.otpInput} />
                                </div>
                                <button type="submit" className={styles.submitBtn}>Verify Code</button>
                                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>&larr; Back</button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <h1>Set New Password</h1>
                            <p className={styles.subtitle}>Create a strong password for your account.</p>

                            {error && <div className={styles.errorBox}><AlertCircle size={18} /><span>{error}</span></div>}

                            <form onSubmit={handleReset}>
                                <div className={styles.formGroup}>
                                    <label><KeyRound size={16} /> New Password</label>
                                    <div className={styles.passwordWrapper}>
                                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
                                        <button type="button" className={styles.toggleBtn} onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label><Lock size={16} /> Confirm Password</label>
                                    <input type="password" placeholder="••••••••" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Updating Password...' : 'Change Password'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ResetPassword;
