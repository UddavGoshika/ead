import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/api';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
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
            const res = await authService.resetPassword({ token, password });
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>
                        <CheckCircle size={48} />
                    </div>
                    <h1>Password Reset Successful</h1>
                    <p>Your password has been updated. You will be redirected to the home page shortly, where you can log in with your new password.</p>
                    <button className={styles.submitBtn} onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Reset Your Password</h1>
                <p className={styles.subtitle}>Enter a new password for your account</p>

                {error && (
                    <div className={styles.errorBox}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label><Lock size={16} /> New Password</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><Lock size={16} /> Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
