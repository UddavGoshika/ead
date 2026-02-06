import React, { useState, useEffect } from "react";
import styles from "./GeneralSettings.module.css";
import api from "../../../services/api";
import { Loader2, Check } from "lucide-react";

const GeneralSettings: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings/site');
            if (res.data.success) {
                setSettings(res.data.settings);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async () => {
        try {
            setSaving(true);
            const res = await api.post('/settings/site', settings);
            if (res.data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (key: string) => {
        setSettings((prev: any) => ({
            ...prev,
            activations: {
                ...prev.activations,
                [key]: !prev.activations[key]
            }
        }));
    };

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" />
                <span>Loading settings...</span>
            </div>
        );
    }

    if (!settings) {
        return <div className={styles.error}>Failed to load settings. Please try again later.</div>;
    }

    return (
        <div className={styles.page}>
            {/* SAVED NOTIFICATION */}
            {saved && (
                <div className={styles.notification}>
                    <Check size={18} /> Settings updated successfully
                </div>
            )}

            {/* GENERAL SETTINGS */}
            <div className={styles.card}>
                <h3 className={styles.title}>General Settings</h3>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>System Name</label>
                        <input
                            type="text"
                            value={settings.site_name}
                            onChange={(e) => handleChange('site_name', e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Member Code Prefix</label>
                        <input
                            type="text"
                            value={settings.member_code_prefix}
                            onChange={(e) => handleChange('member_code_prefix', e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Male Member Minimum Age</label>
                        <input
                            type="number"
                            value={settings.male_min_age}
                            onChange={(e) => handleChange('male_min_age', Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Female Member Minimum Age</label>
                        <input
                            type="number"
                            value={settings.female_min_age}
                            onChange={(e) => handleChange('female_min_age', Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Member Profile Picture Privacy</label>
                        <select
                            value={settings.profile_pic_privacy}
                            onChange={(e) => handleChange('profile_pic_privacy', e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Premium Members">Premium Members</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Member Gallery Image Privacy</label>
                        <select
                            value={settings.gallery_privacy}
                            onChange={(e) => handleChange('gallery_privacy', e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Premium Members">Premium Members</option>
                        </select>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.updateBtn} onClick={handleUpdate} disabled={saving}>
                        {saving ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>

            {/* ACTIVATION */}
            <div className={styles.card}>
                <h3 className={styles.title}>Activation</h3>

                <div className={styles.toggleList}>
                    <Toggle
                        label="HTTPS Activation"
                        active={settings.activations.https}
                        onToggle={() => handleToggle('https')}
                    />
                    <Toggle
                        label="Maintenance Mode Activation"
                        active={settings.activations.maintenance}
                        onToggle={() => handleToggle('maintenance')}
                    />
                    <Toggle
                        label="Wallet System Activation"
                        active={settings.activations.wallet}
                        onToggle={() => handleToggle('wallet')}
                    />
                    <Toggle
                        label="Email/Phone Verification"
                        note="You need to configure SMTP correctly"
                        active={settings.activations.email_phone_verify}
                        onToggle={() => handleToggle('email_phone_verify')}
                    />
                    <Toggle
                        label="Registration Verification"
                        active={settings.activations.reg_verify}
                        onToggle={() => handleToggle('reg_verify')}
                    />
                    <Toggle
                        label="Member Verification"
                        active={settings.activations.member_verify}
                        onToggle={() => handleToggle('member_verify')}
                    />
                    <Toggle
                        label="Only Premium Member Can See Other Members Full Profile"
                        active={settings.activations.premium_only_profile}
                        onToggle={() => handleToggle('premium_only_profile')}
                    />
                    <Toggle
                        label="Member Profile Picture Approval by Admin"
                        active={settings.activations.pic_approval}
                        onToggle={() => handleToggle('pic_approval')}
                    />
                    <Toggle
                        label="Disable Image Encoding?"
                        active={settings.activations.disable_encoding}
                        onToggle={() => handleToggle('disable_encoding')}
                    />
                </div>
                <div className={styles.actions} style={{ marginTop: '20px' }}>
                    <button className={styles.updateBtn} onClick={handleUpdate} disabled={saving}>
                        {saving ? "Updating..." : "Update Activations"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Toggle = ({
    label,
    active,
    note,
    onToggle
}: {
    label: string;
    active?: boolean;
    note?: string;
    onToggle: () => void;
}) => (
    <div className={styles.toggleRow}>
        <div>
            <span>{label}</span>
            {note && <small>{note}</small>}
        </div>
        <label className={styles.switch}>
            <input type="checkbox" checked={active} onChange={onToggle} />
            <span className={styles.slider} />
        </label>
    </div>
);

export default GeneralSettings;
