import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { X, Mail, Lock, Scale, UserCheck, AlertCircle, Eye, EyeOff, Home, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthModal.module.css';

const AuthModal: React.FC = () => {
    const { isAuthModalOpen, closeAuthModal, authTab, login, openAdvocateReg, openClientReg, openLegalProviderReg } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(authTab);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [regStep, setRegStep] = useState<'choice' | 'form'>('choice');
    const [selectedRole, setSelectedRole] = useState<'client' | 'advocate' | null>(null);
    const [forgotEmail, setForgotEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [accountStatusWarning, setAccountStatusWarning] = useState<{ message: string; reason?: string } | null>(null);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginType, setLoginType] = useState<'user' | 'staff' | 'emergency'>('user');

    React.useEffect(() => {
        setActiveTab(authTab);
        setIsForgotPassword(false);
        setRegStep('choice');
        setSelectedRole(null);
        setError(null);
        setMessage(null);
        setAccountStatusWarning(null);
    }, [authTab, isAuthModalOpen]);

    if (!isAuthModalOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAccountStatusWarning(null);

        // INTERCEPT TEST ACCOUNTS
        if (password === 'pwd123' || password === 'advisor123') {
            let mockUser = null;
            if (email === 'free@lexi.com') {
                mockUser = { id: 'mock-free', unique_id: 'ADV-FREE', name: 'Free Advocate', email, role: 'advocate' as const, plan: 'Free' };
            } else if (email === 'pro@lexi.com') {
                mockUser = { id: 'mock-pro', unique_id: 'ADV-PRO', name: 'Pro Advocate', email, role: 'advocate' as const, plan: 'Pro Gold', isPremium: true };
            } else if (email === 'ultra@lexi.com') {
                mockUser = { id: 'mock-ultra', unique_id: 'ADV-ULTRA', name: 'Ultra Pro Advocate', email, role: 'advocate' as const, plan: 'Ultra Pro Platinum', isPremium: true };
            } else if (email === 'advisor@lexi.com' || email === 'advisor@gmail.com') {
                mockUser = { id: 'mock-advisor', unique_id: 'LSP-001', name: 'Elite Legal Advisor', email, role: 'legal_provider' as const, plan: 'Advisor Pro', isPremium: true };
            }

            if (mockUser) {
                // PASS MOCK TOKEN
                login(mockUser, 'mock-token-' + mockUser.id);
                closeAuthModal();

                let target = `/dashboard/advocate/${mockUser.unique_id || mockUser.id}`;
                if (mockUser.role === 'legal_provider') target = `/dashboard/advisor/${mockUser.unique_id || mockUser.id}`;
                if (email === 'advisor@gmail.com') target = `/dashboard/advisor/${mockUser.unique_id || mockUser.id}`;

                navigate(target, { replace: true });
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
                const u = response.data.user;
                const role = (u.role || '').toLowerCase();
                const uid = u.unique_id || u.id;
                let target = `/dashboard/client/${uid}`;

                if (role === 'admin' || role === 'superadmin') {
                    target = '/admin/dashboard';
                } else if (role === 'advocate') {
                    target = `/dashboard/advocate/${uid}`;
                } else if (role === 'verifier') {
                    target = '/dashboard/verifier';
                } else if (role === 'finance') {
                    target = '/dashboard/finance';
                } else if (role === 'legal_provider') {
                    target = `/dashboard/advisor/${uid}`;
                } else if ([
                    'manager', 'teamlead', 'hr', 'telecaller', 'support', 'customer_care',
                    'chat_support', 'live_chat', 'call_support', 'data_entry',
                    'personal_assistant', 'personal_agent', 'influencer', 'marketer', 'marketing_agency'
                ].includes(role)) {
                    target = '/staff/portal';
                } else if (role === 'email_support') {
                    target = `/dashboard/email_support/${uid}`;
                } else if (role === 'user') {
                    target = `/dashboard/user/${uid}`;
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
                login(response.data.user, response.data.token);
                closeAuthModal();

                const uid = response.data.user.unique_id || response.data.user.id;
                let target = `/dashboard/client/${uid}`;
                if (response.data.user.role === 'advocate') target = `/dashboard/advocate/${uid}`;
                else if (response.data.user.role === 'legal_provider') target = `/dashboard/advisor/${uid}`;

                navigate(target, { replace: true });
                console.log('Redirecting to:', target);
            }
        } catch (err: any) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.error || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterChoice = (role: 'client' | 'advocate' | 'provider') => {
        if (role === 'advocate') {
            openAdvocateReg();
        } else if (role === 'provider') {
            openLegalProviderReg();
        } else if (role === 'client') {
            openClientReg();
        } else {
            setSelectedRole(role);
            setRegStep('form');
        }
    };

    return (
        <>
            <div className={styles.overlay}>
                <motion.div
                    className={`${styles.modal} ${activeTab === 'register' && regStep === 'choice' ? styles.wideModal : ''}`}
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <button className={styles.closeBtn} onClick={closeAuthModal}><X size={20} /></button>

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
                        {accountStatusWarning ? (
                            <motion.div
                                key="warning"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.zoomWarningContainer}
                            >
                                <div className={styles.zoomIconWrapper}>
                                    <AlertCircle size={64} className={styles.pulseIcon} />
                                </div>
                                <h2 className={styles.zoomTitle}>Verification In Process</h2>
                                <p className={styles.zoomMessage}>{accountStatusWarning.message}</p>

                                {accountStatusWarning.reason && (
                                    <div className={styles.zoomReasonBox}>
                                        <strong>Reason for Delay/Rejection:</strong>
                                        <p>{accountStatusWarning.reason}</p>
                                    </div>
                                )}

                                <p className={styles.zoomFooterText}>
                                    Our team is reviewing your profile. This process typically takes 12-24 hours.
                                </p>

                                <button
                                    className={styles.goHomeBtn}
                                    onClick={() => {
                                        closeAuthModal();
                                        navigate('/');
                                    }}
                                >
                                    <Home size={18} /> Go Home
                                </button>

                                <button
                                    className={styles.backToLoginLink}
                                    onClick={() => setAccountStatusWarning(null)}
                                >
                                    Back to Login
                                </button>
                            </motion.div>
                        ) : (
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
                                            <div className={styles.loginTypeToggle}>
                                                <button
                                                    className={loginType === 'user' ? styles.activeLoginType : ''}
                                                    onClick={() => setLoginType('user')}
                                                >
                                                    Member Login
                                                </button>
                                                <button
                                                    className={loginType === 'staff' ? styles.activeLoginType : ''}
                                                    onClick={() => setLoginType('staff')}
                                                >
                                                    Staff & Partner
                                                </button>
                                            </div>
                                            <p className={styles.subtitle}>
                                                {loginType === 'user'
                                                    ? "Enter your details to access your dashboard"
                                                    : "Login using your designated ID and passcode"}
                                            </p>

                                            {error && (
                                                <div className={styles.errorBox}>
                                                    <AlertCircle size={18} />
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                            <form onSubmit={handleLogin}>
                                                <div className={styles.formGroup}>
                                                    <label>
                                                        {loginType === 'user' ? <Mail size={16} /> : <UserCheck size={16} />}
                                                        {loginType === 'user' ? " Email or Login ID" : " Login ID"}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={loginType === 'user' ? "name@example.com or username" : "EAD-XXXX-XXXX"}
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <div className={styles.labelWrapper}>
                                                        <label><Lock size={16} /> {loginType === 'user' ? "Password" : "Passcode"}</label>
                                                        <button type="button" className={styles.forgotLink} onClick={() => setIsForgotPassword(true)}>
                                                            Forgot Password?
                                                        </button>
                                                    </div>
                                                    <div className={styles.passwordWrapper}>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            required
                                                            value={password}
                                                            onChange={e => setPassword(e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={styles.togglePasswordBtn}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                                    {loading ? 'Logging in...' : 'Login to Account'}
                                                </button>

                                                {/* <div className="mt-4 text-center">
                                                    <button
                                                        type="button"
                                                        className="text-xs text-red-400 hover:text-red-300 underline"
                                                        onClick={() => setLoginType('emergency')}
                                                    >
                                                        Super Admin Emergency Login
                                                    </button>
                                                </div> */}
                                            </form>
                                        </motion.div>
                                    )
                                ) : loginType === 'emergency' ? (
                                    <motion.div
                                        key="emergency"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="border border-red-500/30 rounded-lg p-4 bg-red-900/10"
                                    >
                                        <h2 className="text-red-500 flex items-center gap-2 mb-2">
                                            <AlertTriangle size={24} /> Emergency Access
                                        </h2>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Use your Super Admin Recovery Key to regain access.
                                        </p>

                                        {error && (
                                            <div className={styles.errorBox}>
                                                <AlertCircle size={18} />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            setLoading(true);
                                            setError(null);
                                            try {
                                                const res = await authService.loginWithKey({ email, key: password }); // Using password field for key
                                                if (res.data.success) {
                                                    login(res.data.user, res.data.token);
                                                    closeAuthModal();
                                                    navigate('/admin/dashboard', { replace: true });
                                                }
                                            } catch (err: any) {
                                                setError(err.response?.data?.error || 'Invalid Emergency Key');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}>
                                            <div className={styles.formGroup}>
                                                <label className="text-red-400">Admin Email or Login ID</label>
                                                <input
                                                    type="text"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                    className="border-red-500/30 focus:border-red-500"
                                                    placeholder="Enter email or custom ID"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className="text-red-400">Recovery Key</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    className="border-red-500/30 focus:border-red-500 font-mono"
                                                    placeholder="Enter your saved key..."
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className={`${styles.submitBtn} bg-red-600 hover:bg-red-700 border-red-500`}
                                                disabled={loading}
                                            >
                                                {loading ? 'Verifying Key...' : 'Emergency Login'}
                                            </button>
                                            <button
                                                type="button"
                                                className="w-full mt-3 text-sm text-gray-400 hover:text-white"
                                                onClick={() => {
                                                    setLoginType('user');
                                                    setError(null);
                                                    setPassword('');
                                                }}
                                            >
                                                Cancel Emergency Mode
                                            </button>
                                        </form>
                                    </motion.div>
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
                                                    <div className={styles.regOption} onClick={() => handleRegisterChoice('provider')}>
                                                        <div className={styles.iconCircle}><Mail /></div>
                                                        <h3>I am a Legal Service Provider</h3>
                                                        <p>Offering documentation, drafting, and specialized legal support.</p>
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
                                                        <div className={styles.passwordWrapper}>
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                required
                                                                value={password}
                                                                onChange={e => setPassword(e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                className={styles.togglePasswordBtn}
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
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
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default AuthModal;
