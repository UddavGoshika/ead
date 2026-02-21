import React, { useState, useEffect } from "react";
import styles from "./ThirdPartySettings.module.css";
import api from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const ThirdPartySettings: React.FC = () => {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        google_recaptcha: {
            activation: false,
            site_key: "",
            secret_key: "",
            v3_score: "0.5",
            enable_for_registration: false,
            enable_for_contact: false
        },
        google_analytics: {
            activation: false,
            tracking_id: ""
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/site');
                if (res.data.success && res.data.settings.third_party_settings) {
                    setConfig(res.data.settings.third_party_settings);
                }
            } catch (err) {
                console.error("Error fetching third party settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (section: 'google_recaptcha' | 'google_analytics') => {
        try {
            const updatedConfig = { ...config };
            await api.post('/settings/site', { third_party_settings: updatedConfig });
            showToast(`${section === 'google_recaptcha' ? 'reCAPTCHA' : 'Analytics'} settings saved successfully`);
        } catch (err) {
            console.error("Error saving third party settings:", err);
            showToast("Failed to save settings", "error");
        }
    };

    if (loading) return <div>Loading Third Party Settings...</div>;

    return (
        <div className={styles.page}>
            {/* GOOGLE reCAPTCHA */}
            <div className={styles.fullCard}>
                <h2>Google reCAPTCHA</h2>

                <div className={styles.grid}>
                    {/* SETTINGS */}
                    <div className={styles.card}>
                        <h3>Google reCAPTCHA Setting</h3>

                        <div className={styles.row}>
                            <label>Activation</label>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={config.google_recaptcha.activation}
                                    onChange={e => setConfig({
                                        ...config,
                                        google_recaptcha: { ...config.google_recaptcha, activation: e.target.checked }
                                    })}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>

                        <div className={styles.field}>
                            <label>Site KEY</label>
                            <input
                                placeholder="Site KEY"
                                value={config.google_recaptcha.site_key}
                                onChange={e => setConfig({
                                    ...config,
                                    google_recaptcha: { ...config.google_recaptcha, site_key: e.target.value }
                                })}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>SECRET KEY</label>
                            <input
                                placeholder="SECRET KEY"
                                value={config.google_recaptcha.secret_key}
                                onChange={e => setConfig({
                                    ...config,
                                    google_recaptcha: { ...config.google_recaptcha, secret_key: e.target.value }
                                })}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Accept V3 Score</label>
                            <select
                                value={config.google_recaptcha.v3_score}
                                onChange={e => setConfig({
                                    ...config,
                                    google_recaptcha: { ...config.google_recaptcha, v3_score: e.target.value }
                                })}
                            >
                                <option value="0.3">0.3</option>
                                <option value="0.5">0.5</option>
                                <option value="0.7">0.7</option>
                                <option value="0.9">0.9</option>
                            </select>
                            <small>
                                reCAPTCHA v3 score (0–1) estimates if a request is human or bot.
                            </small>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.saveBtn} onClick={() => handleSave('google_recaptcha')}>Save</button>
                        </div>
                    </div>

                    {/* INFO */}
                    <div className={styles.card}>
                        <h3>How to Interpret the reCAPTCHA V3 Scores</h3>

                        <ul className={styles.infoList}>
                            <li>
                                <b>Score 0.0 - 0.3:</b> Very likely a bot — block or verify.
                            </li>
                            <li>
                                <b>Score 0.3 - 0.5:</b> Suspicious activity.
                            </li>
                            <li>
                                <b>Score 0.5 - 0.7:</b> Possibly human.
                            </li>
                            <li>
                                <b>Score 0.7 - 0.9:</b> Likely human.
                            </li>
                            <li>
                                <b>Score 0.9 - 1.0:</b> Very likely human.
                            </li>
                            <li>
                                No credentials yet?{" "}
                                <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noreferrer" className={styles.link}>
                                    Register reCAPTCHA v3 here
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ENABLE FOR */}
                <div className={styles.card}>
                    <h3>Enable reCAPTCHA For</h3>

                    <div className={styles.toggleGrid}>
                        <div className={styles.row}>
                            <span>User Registration</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={config.google_recaptcha.enable_for_registration}
                                    onChange={e => setConfig({
                                        ...config,
                                        google_recaptcha: { ...config.google_recaptcha, enable_for_registration: e.target.checked }
                                    })}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>

                        <div className={styles.row}>
                            <span>Contact Us Form</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={config.google_recaptcha.enable_for_contact}
                                    onChange={e => setConfig({
                                        ...config,
                                        google_recaptcha: { ...config.google_recaptcha, enable_for_contact: e.target.checked }
                                    })}
                                />
                                <span className={styles.slider} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* GOOGLE ANALYTICS */}
            <div className={styles.fullCard}>
                <h2>Google Analytics Settings</h2>

                <div className={styles.card}>
                    <div className={styles.row}>
                        <label>Activation</label>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={config.google_analytics.activation}
                                onChange={e => setConfig({
                                    ...config,
                                    google_analytics: { ...config.google_analytics, activation: e.target.checked }
                                })}
                            />
                            <span className={styles.slider} />
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label>Tracking ID</label>
                        <input
                            placeholder="Tracking ID"
                            value={config.google_analytics.tracking_id}
                            onChange={e => setConfig({
                                ...config,
                                google_analytics: { ...config.google_analytics, tracking_id: e.target.value }
                            })}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.saveBtn} onClick={() => handleSave('google_analytics')}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThirdPartySettings;
