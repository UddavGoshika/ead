import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminProfile.module.css';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { User, Lock, Mail, Save, Shield, Key, Camera, AlertTriangle, AlertOctagon, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminProfile: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        profilePic: '',
        loginId: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Custom Recovery Key State
    const [customKey, setCustomKey] = useState('');
    const [keyLoading, setKeyLoading] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                profilePic: user.image_url || '',
                loginId: user.loginId || ''
            });
        }
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await authService.uploadProfileImage(formData);
            if (res.data.success) {
                setProfileData(prev => ({ ...prev, profilePic: res.data.imageUrl }));
                refreshUser({ ...user, image_url: res.data.imageUrl });
                showToast('Profile image updated', 'success');
            }
        } catch (err) {
            showToast('Failed to upload image', 'error');
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await authService.updateProfile({
                name: profileData.name,
                email: profileData.email,
                profilePic: profileData.profilePic,
                loginId: profileData.loginId
            });
            if (res.data.success) {
                showToast('Profile updated successfully', 'success');
                setIsEditingProfile(false);
                refreshUser({
                    ...user,
                    name: profileData.name,
                    email: profileData.email,
                    image_url: profileData.profilePic,
                    loginId: profileData.loginId
                });
            }
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await authService.changePassword({
                email: user?.email,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (res.data.success) {
                showToast('Password changed successfully', 'success');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to change password', 'error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleUpdateRecoveryKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customKey) return;
        if (!window.confirm('Update your recovery key? Make sure to remember it!')) return;

        setKeyLoading(true);
        try {
            const res = await authService.setSuperAdminKey(customKey);
            if (res.data.success) {
                showToast('Recovery key updated', 'success');
                setCustomKey('');
                setShowKey(false);
            }
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to update key', 'error');
        } finally {
            setKeyLoading(false);
        }
    };

    const handleMaintenanceToggle = async () => {
        if (!window.confirm('Enable Global Maintenance Mode? This will prevent non-admins from logging in.')) return;
        try {
            await authService.toggleMaintenance(true);
            showToast('Maintenance Mode Enabled', 'success');
        } catch (err) {
            showToast('Action Failed', 'error');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.subtitle}>Manage your account settings and security</p>
            </div>

            <div className={styles.grid}>
                {/* Profile Information Card */}
                <div className={styles.card}>
                    <div className={styles.profileInfo}>
                        <div className={styles.avatarWrapper} onClick={() => isEditingProfile && fileInputRef.current?.click()}>
                            <div className={styles.avatar}>
                                {profileData.profilePic ? (
                                    <img src={profileData.profilePic} alt="Profile" className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                )}
                            </div>
                            {isEditingProfile && (
                                <div className={styles.avatarOverlay}>
                                    <Camera size={24} />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                                accept="image/*"
                            />
                        </div>
                        <h2>{user?.name || 'Admin User'}</h2>
                        <span className={styles.roleBadge}>{user?.role?.toUpperCase()}</span>
                    </div>

                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <User size={20} className={styles.icon} />
                            <span className="font-serif italic text-white">Personal</span> Information
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    disabled={!isEditingProfile}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Login ID / Custom Username</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.loginId}
                                    onChange={(e) => setProfileData({ ...profileData, loginId: e.target.value })}
                                    disabled={!isEditingProfile}
                                    placeholder="Enter custom login ID (names, numbers, etc)"
                                />
                                <User size={16} className={styles.inputIcon} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    disabled={!isEditingProfile}
                                />
                                <Mail size={16} className={styles.inputIcon} />
                            </div>
                        </div>

                        {isEditingProfile ? (
                            <div className={styles.buttonGroup}>
                                <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={() => setIsEditingProfile(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.button} disabled={profileLoading}>
                                    {profileLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        ) : (
                            <button type="button" className={styles.button} onClick={() => setIsEditingProfile(true)}>
                                Edit Profile
                            </button>
                        )}
                    </form>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>{new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}</div>
                            <div className={styles.statLabel}>Member Since</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>Active</div>
                            <div className={styles.statLabel}>Account Status</div>
                        </div>
                    </div>
                </div>

                <div className={styles.rightCol}>
                    {/* Security Settings Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>
                                <Shield size={20} className={styles.icon} />
                                <span className="font-serif italic">Security</span> Settings
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Password</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        className={styles.input}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className={styles.inputIconClickable}
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Password</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        className={styles.input}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        className={styles.inputIconClickable}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={styles.input}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="Repeat new password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.inputIconClickable}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className={styles.button} disabled={isChangingPassword}>
                                {isChangingPassword ? 'Updating...' : <><Lock size={18} /> Update Password</>}
                            </button>
                        </form>
                    </div>

                    {/* Emergency Access Card */}
                    <div className={`${styles.card} ${styles.dangerZone}`}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.cardTitle} ${styles.dangerTitle}`}>
                                <AlertTriangle size={20} className="text-red-500" />
                                <span className="font-serif italic text-red-500">Emergency</span> Controls
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h4 className={styles.sectionHeader}>
                                <Key size={18} className="text-primary-gold" /> Custom Recovery Key
                            </h4>
                            <p className={styles.sectionDescription}>
                                Set a high-security custom recovery key. You can use this to login if you forget your password or lose access to your email.
                            </p>

                            <form onSubmit={handleUpdateRecoveryKey} className="space-y-6">
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showKey ? "text" : "password"}
                                        className={styles.input}
                                        value={customKey}
                                        onChange={(e) => setCustomKey(e.target.value)}
                                        placeholder="Enter secure recovery key..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.inputIconClickable}
                                        onClick={() => setShowKey(!showKey)}
                                    >
                                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className={`${styles.button} ${styles.secondaryButton} ${styles.spacedButton}`}
                                    disabled={keyLoading || !customKey}
                                >
                                    {keyLoading ? 'Updating Key...' : 'Secure Recovery Key'}
                                </button>
                            </form>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.section}>
                            <h4 className={styles.sectionHeader}>
                                <AlertOctagon size={18} className="text-red-500" /> Platform Shield
                            </h4>
                            <p className={styles.sectionDescription}>
                                Enable maintenance mode to restrict access to the entire platform. Only authorized administrators will be able to bypass this shield.
                            </p>
                            <button
                                className={`${styles.button} ${styles.dangerButton} ${styles.spacedButton}`}
                                onClick={handleMaintenanceToggle}
                            >
                                <Shield size={18} /> Enable Maintenance Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
