import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ForcePasswordChange.module.css';
import { MdLock, MdCheckCircle, MdSecurity } from 'react-icons/md';

const ForcePasswordChange: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Simulate password update
        setSuccess(true);
        setTimeout(() => {
            if (user) {
                const updatedUser = { ...user, mustChangePassword: false };
                login(updatedUser); // Update local state

                // Redirect based on role
                let target = '/dashboard/client';
                const role = user.role.toUpperCase();
                if (role === 'ADMIN') target = '/dashboard/admin';
                else if (role === 'VERIFIER') target = '/dashboard/verifier';
                else if (role === 'FINANCE') target = '/dashboard/finance';
                else if (role === 'SUPPORT') target = '/dashboard/support';
                else if (role === 'MANAGER') target = '/dashboard/manager';
                else if (role === 'TEAM LEAD') target = '/dashboard/teamlead';
                else if (role === 'HR') target = '/dashboard/hr';

                navigate(target, { replace: true });
            }
        }, 2000);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.card}>
                <div className={styles.iconHeader}>
                    <MdSecurity size={48} color="#3b82f6" />
                </div>
                <h2>Security Update Required</h2>
                <p>To ensure the security of your account, please update your temporary password before proceeding.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <div className={styles.inputIcon}>
                            <MdLock />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm New Password</label>
                        <div className={styles.inputIcon}>
                            <MdLock />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={success}>
                        {success ? 'Updating Security...' : 'Update & Access Dashboard'}
                    </button>
                </form>

                {success && (
                    <div className={styles.successOverlay}>
                        <MdCheckCircle size={60} color="#10b981" />
                        <h3>Password Secured!</h3>
                        <p>Loading your professional ecosystem dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForcePasswordChange;
