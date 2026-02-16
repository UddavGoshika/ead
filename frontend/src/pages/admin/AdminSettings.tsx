import React, { useState, useEffect } from 'react';
import styles from './AdminSettings.module.css';
import { settingsService } from '../../services/api';
import { Bell, Shield, Smartphone, Globe, ArrowRight, Server, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const AdminSettings: React.FC = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Local state for UI toggles
    const [notif, setNotif] = useState({
        email: true,
        push: true,
        sms: false,
        activityAlerts: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await settingsService.getSettings();
                if (data.success && (data as any).notificationSettings) {
                    setNotif((data as any).notificationSettings);
                }
            } catch (err) {
                console.error('Failed to load user settings');
            }
        };
        fetchSettings();
    }, []);

    const handleNotifChange = async (key: string) => {
        const newVal = !notif[key as keyof typeof notif];
        setNotif(prev => ({ ...prev, [key]: newVal }));

        try {
            await settingsService.updateNotifications({ [key]: newVal });
            showToast('Settings updated', 'success');
        } catch (err) {
            showToast('Failed to update settings', 'error');
            // Revert on error
            setNotif(prev => ({ ...prev, [key]: !newVal }));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your personal preferences and system configuration</p>
            </div>

            <div className={styles.grid}>
                {/* Personal Preferences */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.sectionTitle}>
                            <Bell size={20} className="text-primary" />
                            Notification Preferences
                        </div>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleLabel}>
                                <span className={styles.toggleTitle}>Email Notifications</span>
                                <span className={styles.toggleDesc}>Receive updates via verified email</span>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={notif.email}
                                    onChange={() => handleNotifChange('email')}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleLabel}>
                                <span className={styles.toggleTitle}>Push Notifications</span>
                                <span className={styles.toggleDesc}>Browser and mobile app alerts</span>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={notif.push}
                                    onChange={() => handleNotifChange('push')}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleLabel}>
                                <span className={styles.toggleTitle}>Activity Alerts</span>
                                <span className={styles.toggleDesc}>Notify on critical system events</span>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={notif.activityAlerts}
                                    onChange={() => handleNotifChange('activityAlerts')}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* System Links (Quick Access) */}
                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <div className={styles.sectionTitle}>
                            <Globe size={20} className="text-primary" />
                            System Configuration
                        </div>

                        <Link to="/admin/settings/general" className={styles.systemLink}>
                            <div className="flex items-center gap-3">
                                <Server size={18} />
                                <div>
                                    <div className="font-semibold">General Settings</div>
                                    <div className="text-xs text-secondary opacity-70">Site Info, Maintenance Mode</div>
                                </div>
                            </div>
                            <ArrowRight size={16} />
                        </Link>

                        <Link to="/admin/settings/email-templates" className={styles.systemLink}>
                            <div className="flex items-center gap-3">
                                <Mail size={18} />
                                <div>
                                    <div className="font-semibold">Email Templates</div>
                                    <div className="text-xs text-secondary opacity-70">Customize system emails</div>
                                </div>
                            </div>
                            <ArrowRight size={16} />
                        </Link>

                        <Link to="/admin/settings/smtp" className={styles.systemLink}>
                            <div className="flex items-center gap-3">
                                <Server size={18} />
                                <div>
                                    <div className="font-semibold">SMTP Server</div>
                                    <div className="text-xs text-secondary opacity-70">Email delivery configuration</div>
                                </div>
                            </div>
                            <ArrowRight size={16} />
                        </Link>

                        <Link to="/admin/manager-permissions" className={styles.systemLink}>
                            <div className="flex items-center gap-3">
                                <Shield size={18} />
                                <div>
                                    <div className="font-semibold">Role Permissions</div>
                                    <div className="text-xs text-secondary opacity-70">Access control for managers</div>
                                </div>
                            </div>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
