import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { X, Mail, Lock, Scale, UserCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthModal.module.css';

const AuthModal: React.FC = () => {
    const { isAuthModalOpen, closeAuthModal, authTab, login, openAdvocateReg, openClientReg } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(authTab);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [regStep, setRegStep] = useState<'choice' | 'form'>('choice');
    const [selectedRole, setSelectedRole] = useState<'client' | 'advocate' | null>(null);
    const [forgotEmail, setForgotEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    React.useEffect(() => {
        setActiveTab(authTab);
        setIsForgotPassword(false);
        setRegStep('choice');
        setSelectedRole(null);
        setError(null);
        setMessage(null);
    }, [authTab, isAuthModalOpen]);

    if (!isAuthModalOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // INTERCEPT TEST ACCOUNTS
        if (password === 'pwd123') {
            let mockUser = null;
            if (email === 'free@lexi.com') {
                mockUser = { id: 'mock-free', unique_id: 'ADV-FREE', name: 'Free Advocate', email, role: 'advocate' as const, plan: 'Free' };
            } else if (email === 'pro@lexi.com') {
                mockUser = { id: 'mock-pro', unique_id: 'ADV-PRO', name: 'Pro Advocate', email, role: 'advocate' as const, plan: 'Pro Gold', isPremium: true };
            } else if (email === 'ultra@lexi.com') {
                mockUser = { id: 'mock-ultra', unique_id: 'ADV-ULTRA', name: 'Ultra Pro Advocate', email, role: 'advocate' as const, plan: 'Ultra Pro Platinum', isPremium: true };
            }

            if (mockUser) {
                // PASS MOCK TOKEN
                login(mockUser, 'mock-token-' + mockUser.id);
                closeAuthModal();
                navigate('/dashboard/advocate', { replace: true });
                setLoading(false);
                return;
            }
        }

        try {
            const response = await authService.login({ email, password });
            if (response.data.user) {
                console.log('Login successful, user:', response.data.user);
                // PASS TOKEN TO CONTEXT
                login(response.data.user, response.data.token);

                // Close modal first
                closeAuthModal();

                if (response.data.user.mustChangePassword) {
                    navigate('/auth/force-password-change', { replace: true });
                    return;
                }

                // Redirect based on role
                let target = '/dashboard/client';
                if (response.data.user.role === 'admin') {
                    target = '/admin/dashboard';
                } else if (response.data.user.role === 'advocate') {
                    target = '/dashboard/advocate';
                } else if (response.data.user.role === 'ADMIN') {
                    target = '/dashboard/admin';
                } else if (response.data.user.role === 'VERIFIER') {
                    target = '/dashboard/verifier';
                } else if (response.data.user.role === 'FINANCE') {
                    target = '/dashboard/finance';
                } else if (response.data.user.role === 'SUPPORT') {
                    target = '/dashboard/support';
                } else if (response.data.user.role === 'USER') {
                    target = '/dashboard/user';
                }

                console.log('Redirecting to:', target);
                navigate(target, { replace: true });
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            setError(err.response?.data?.error || err.message || 'Authentication error.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await authService.forgotPassword(forgotEmail);
            if (res.data.success) {
                setMessage(res.data.message);
                setForgotEmail('');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register({
                email,
                password,
                role: selectedRole
            });
            if (response.data.success && response.data.user) {
                console.log('Registration successful, user:', response.data.user);
                login(response.data.user);

                // Close modal
                closeAuthModal();

                // Redirect based on role
                const target = response.data.user.role === 'client' ? '/dashboard/client' : '/dashboard/advocate';
                console.log('Redirecting to:', target);
                navigate(target, { replace: true });
            }
        } catch (err: any) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.error || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterChoice = (role: 'client' | 'advocate') => {
        setSelectedRole(role);
        if (role === 'advocate') {
            openAdvocateReg();
        } else if (role === 'client') {
            openClientReg();
        } else {
            setRegStep('form');
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={closeAuthModal}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <button className={styles.closeBtn} onClick={closeAuthModal}><X size={20} />X</button>

                    <div className={styles.tabs}>
                        <button
                            className={activeTab === 'login' ? styles.activeTab : ''}
                            onClick={() => { setActiveTab('login'); setIsForgotPassword(false); setMessage(null); setError(null); }}
                        >
                            Login
                        </button>
                        <button
                            className={activeTab === 'register' ? styles.activeTab : ''}
                            onClick={() => { setActiveTab('register'); setIsForgotPassword(false); setMessage(null); setError(null); }}
                        >
                            Register
                        </button>
                    </div>

                    <div className={styles.content}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'login' ? (
                                isForgotPassword ? (
                                    <motion.div
                                        key="forgot"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <h2>Reset Password</h2>
                                        <p className={styles.subtitle}>Enter your email to receive a reset link</p>

                                        {error && (
                                            <div className={styles.errorBox}>
                                                <AlertCircle size={18} />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        {message && (
                                            <div className={styles.successBox}>
                                                <UserCheck size={18} />
                                                <span>{message}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleForgotPassword}>
                                            <div className={styles.formGroup}>
                                                <label><Mail size={16} /> Email Address</label>
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    required
                                                    value={forgotEmail}
                                                    onChange={e => setForgotEmail(e.target.value)}
                                                />
                                            </div>
                                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                                {loading ? 'Sending...' : 'Send Reset Link'}
                                            </button>
                                        </form>
                                        <button className={styles.backToLogin} onClick={() => setIsForgotPassword(false)}>
                                            &larr; Back to Login
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <h2>Welcome Back</h2>
                                        <p className={styles.subtitle}>Enter your details to access your dashboard</p>

                                        {error && (
                                            <div className={styles.errorBox}>
                                                <AlertCircle size={18} />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleLogin}>
                                            <div className={styles.formGroup}>
                                                <label><Mail size={16} /> Email Address</label>
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    required
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <div className={styles.labelWrapper}>
                                                    <label><Lock size={16} /> Password</label>
                                                    <button type="button" className={styles.forgotLink} onClick={() => setIsForgotPassword(true)}>
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    required
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                />
                                            </div>
                                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                                {loading ? 'Logging in...' : 'Login to Account'}
                                            </button>
                                        </form>
                                    </motion.div>
                                )
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    {regStep === 'choice' ? (
                                        <>
                                            <h2>Join E-Advocate</h2>
                                            <p className={styles.subtitle}>Choose your account type to get started</p>

                                            <div className={styles.regOptions}>
                                                <div className={styles.regOption} onClick={() => handleRegisterChoice('client')}>
                                                    <div className={styles.iconCircle}><UserCheck /></div>
                                                    <h3>I am a Client</h3>
                                                    <p>Looking for professional legal assistance and case management.</p>
                                                </div>
                                                <div className={styles.regOption} onClick={() => handleRegisterChoice('advocate')}>
                                                    <div className={styles.iconCircle}><Scale /></div>
                                                    <h3>I am an Advocate</h3>
                                                    <p>Providing legal services and managing professional portfolio.</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.backBtn} onClick={() => setRegStep('choice')}>
                                                &larr; Back to choice
                                            </button>
                                            <h2>{selectedRole === 'client' ? 'Client' : 'Advocate'} Registration</h2>
                                            <p className={styles.subtitle}>Create your account as an {selectedRole}</p>

                                            {error && (
                                                <div className={styles.errorBox}>
                                                    <AlertCircle size={18} />
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                            <form onSubmit={handleRegister}>
                                                <div className={styles.formGroup}>
                                                    <label><Mail size={16} /> Email Address</label>
                                                    <input
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label><Lock size={16} /> Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        required
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                                    {loading ? 'Creating Account...' : 'Create Account'}
                                                </button>
                                            </form>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default AuthModal;
