import React, { useState, useEffect } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import styles from './ManagerPermissions.module.css';
import {
    MdSecurity, MdCheckCircle, MdCancel,
    MdSave, MdRefresh, MdInfo
} from 'react-icons/md';

const ManagerPermissions: React.FC = () => {
    const { settings, loading, updateSettings, refreshSettings } = useSettings();
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (settings) {
            setPermissions(settings.manager_permissions || {});
        }
    }, [settings]);

    if (loading) {
        return <div className={styles.container}><p>Loading settings...</p></div>;
    }

    const handleToggle = (id: string) => {
        setPermissions(prev => {
            const current = prev[id] !== false; // Default to true if undefined
            return {
                ...prev,
                [id]: !current
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const success = await updateSettings({ manager_permissions: permissions });
            if (success) {
                setMessage({ type: 'success', text: 'Manager permissions updated successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update permissions.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setIsSaving(false);
        }
    };

    const sections = [
        {
            group: 'Core Dashboard',
            items: [
                { id: 'dashboard', name: 'Main Dashboard Analytics' },
            ]
        },
        {
            group: 'Operations Oversight',
            items: [
                { id: 'oversight', name: 'Entire Oversight Section' },
                { id: 'tl-performance', name: 'Team Lead Stats' },
                { id: 'hr-progress', name: 'HR Operations' },
                { id: 'role-reports', name: 'Role Intelligence' },
            ]
        },
        {
            group: 'Communications',
            items: [
                { id: 'communications', name: 'Entire Communications Section' },
                { id: 'inform-admin', name: 'Inform Super Admin Portal' },
            ]
        },
        {
            group: 'Member Management',
            items: [
                { id: 'members', name: 'Member Directory & Lists' },
                { id: 'free-members', name: 'Free Members View' },
                { id: 'premium-members', name: 'Premium Members View' },
                { id: 'bulk-member-add', name: 'Bulk Add Capabilities' },
                { id: 'profile-attributes', name: 'Attribute Management' },
            ]
        },
        {
            group: 'Financial Systems',
            items: [
                { id: 'premium-packages', name: 'Package Management' },
                { id: 'package-payments', name: 'Payment Tracking' },
                { id: 'wallet', name: 'Wallet Operations' },
                { id: 'offline-payment-system', name: 'Offline Payment Control' },
            ]
        },
        {
            group: 'Platform Tools',
            items: [
                { id: 'blog-system', name: 'Blog Management' },
                { id: 'marketing', name: 'Marketing & Newsletters' },
                { id: 'support-ticket', name: 'Support System' },
                { id: 'otp-system', name: 'OTP Security Settings' },
                { id: 'referral', name: 'Referral Engine' },
            ]
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <MdSecurity size={32} color="#3b82f6" />
                    <div>
                        <h1>Manager Permission Control</h1>
                        <p>Dynamically enable or disable specific sections and pages for the Manager Dashboard.</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn} onClick={refreshSettings}>
                        <MdRefresh /> Reload
                    </button>
                    <button className={styles.primaryBtn} onClick={handleSave} disabled={isSaving}>
                        <MdSave /> {isSaving ? 'Saving...' : 'Save Permissions'}
                    </button>
                </div>
            </header>

            {message && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.type === 'success' ? <MdCheckCircle /> : <MdCancel />}
                    {message.text}
                </div>
            )}

            <div className={styles.infoBox}>
                <MdInfo />
                <span>
                    <strong>Note:</strong> Disabling a parent section will automatically restrict all its child pages.
                    Restricted items will appear grayed out and non-interactive in the Manager Panel.
                </span>
            </div>

            <div className={styles.grid}>
                {sections.map(section => (
                    <div key={section.group} className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>{section.group}</h2>
                        <div className={styles.itemList}>
                            {section.items.map(item => (
                                <div key={item.id} className={styles.permissionItem}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <code className={styles.itemId}>{item.id}</code>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={permissions[item.id] !== false}
                                            onChange={() => handleToggle(item.id)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerPermissions;
