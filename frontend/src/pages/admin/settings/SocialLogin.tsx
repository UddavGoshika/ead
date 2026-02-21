import React, { useState, useEffect } from "react";
import styles from "./SocialLogin.module.css";
import api from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const SocialLoginSettings: React.FC = () => {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        google: { activation: false, client_id: "", client_secret: "" },
        facebook: { activation: false, app_id: "", app_secret: "" },
        twitter: { activation: false, client_id: "", client_secret: "" }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/site');
                if (res.data.success && res.data.settings.social_login) {
                    setConfig(res.data.settings.social_login);
                }
            } catch (err) {
                console.error("Error fetching social login settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (platform: 'google' | 'facebook' | 'twitter') => {
        try {
            await api.post('/settings/site', { social_login: config });
            showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} login settings saved successfully`);
        } catch (err) {
            console.error("Error saving social login settings:", err);
            showToast("Failed to save settings", "error");
        }
    };

    if (loading) return <div>Loading Social Login Settings...</div>;

    return (
        <div className={styles.page}>
            {/* GOOGLE */}
            <div className={styles.card}>
                <h3>Google Login Credential</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.google.activation}
                            onChange={e => setConfig({ ...config, google: { ...config.google, activation: e.target.checked } })}
                        />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>Client ID</label>
                    <input
                        placeholder="Google Client ID"
                        value={config.google.client_id}
                        onChange={e => setConfig({ ...config, google: { ...config.google, client_id: e.target.value } })}
                    />
                </div>

                <div className={styles.field}>
                    <label>Client Secret</label>
                    <input
                        placeholder="Google Client Secret"
                        value={config.google.client_secret}
                        onChange={e => setConfig({ ...config, google: { ...config.google, client_secret: e.target.value } })}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={() => handleSave('google')}>Save</button>
                </div>
            </div>

            {/* FACEBOOK */}
            <div className={styles.card}>
                <h3>Facebook Login Credential</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.facebook.activation}
                            onChange={e => setConfig({ ...config, facebook: { ...config.facebook, activation: e.target.checked } })}
                        />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>App ID</label>
                    <input
                        placeholder="Facebook App ID"
                        value={config.facebook.app_id}
                        onChange={e => setConfig({ ...config, facebook: { ...config.facebook, app_id: e.target.value } })}
                    />
                </div>

                <div className={styles.field}>
                    <label>App Secret</label>
                    <input
                        placeholder="Facebook App Secret"
                        value={config.facebook.app_secret}
                        onChange={e => setConfig({ ...config, facebook: { ...config.facebook, app_secret: e.target.value } })}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={() => handleSave('facebook')}>Save</button>
                </div>
            </div>

            {/* TWITTER */}
            <div className={styles.card}>
                <h3>Twitter Login Credential</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.twitter.activation}
                            onChange={e => setConfig({ ...config, twitter: { ...config.twitter, activation: e.target.checked } })}
                        />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>Client ID</label>
                    <input
                        placeholder="Twitter Client ID"
                        value={config.twitter.client_id}
                        onChange={e => setConfig({ ...config, twitter: { ...config.twitter, client_id: e.target.value } })}
                    />
                </div>

                <div className={styles.field}>
                    <label>Client Secret</label>
                    <input
                        placeholder="Twitter Client Secret"
                        value={config.twitter.client_secret}
                        onChange={e => setConfig({ ...config, twitter: { ...config.twitter, client_secret: e.target.value } })}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={() => handleSave('twitter')}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default SocialLoginSettings;
