import React, { useState, useEffect } from "react";
import styles from "./PushNotification.module.css";
import api from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const FirebasePushSettings: React.FC = () => {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        activation: false,
        fcm_api_key: "",
        fcm_auth_domain: "",
        fcm_project_id: "",
        fcm_storage_bucket: "",
        fcm_messaging_sender_id: "",
        fcm_app_id: "",
        firebase_server_key: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/site');
                if (res.data.success && res.data.settings.push_notification) {
                    setConfig(res.data.settings.push_notification);
                }
            } catch (err) {
                console.error("Error fetching push notification settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/settings/site', { push_notification: config });
            showToast("Push notification settings saved successfully");
        } catch (err) {
            console.error("Error saving push notification settings:", err);
            showToast("Failed to save settings", "error");
        }
    };

    if (loading) return <div>Loading Push Notification Settings...</div>;

    return (
        <div className={styles.page}>
            {/* SETTINGS */}
            <div className={styles.card}>
                <h3>Firebase Push Notification</h3>

                <div className={styles.row}>
                    <label>Activation</label>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={config.activation}
                            onChange={e => setConfig({ ...config, activation: e.target.checked })}
                        />
                        <span className={styles.slider} />
                    </label>
                </div>

                <div className={styles.field}>
                    <label>FCM API KEY</label>
                    <input
                        placeholder="FCM API KEY"
                        value={config.fcm_api_key}
                        onChange={e => setConfig({ ...config, fcm_api_key: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label>FCM AUTH DOMAIN</label>
                    <input
                        placeholder="FCM AUTH DOMAIN"
                        value={config.fcm_auth_domain}
                        onChange={e => setConfig({ ...config, fcm_auth_domain: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label>FCM PROJECT ID</label>
                    <input
                        placeholder="FCM PROJECT ID"
                        value={config.fcm_project_id}
                        onChange={e => setConfig({ ...config, fcm_project_id: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label>FCM STORAGE BUCKET</label>
                    <input
                        placeholder="FCM STORAGE BUCKET"
                        value={config.fcm_storage_bucket}
                        onChange={e => setConfig({ ...config, fcm_storage_bucket: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label>FCM MESSAGING SENDER ID</label>
                    <input
                        placeholder="FCM MESSAGING SENDER ID"
                        value={config.fcm_messaging_sender_id}
                        onChange={e => setConfig({ ...config, fcm_messaging_sender_id: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label>FCM APP ID</label>
                    <input
                        placeholder="FCM APP ID"
                        value={config.fcm_app_id}
                        onChange={e => setConfig({ ...config, fcm_app_id: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label>FIREBASE SERVER KEY</label>
                    <input
                        placeholder="FIREBASE SERVER KEY"
                        value={config.firebase_server_key}
                        onChange={e => setConfig({ ...config, firebase_server_key: e.target.value })}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className={styles.card}>
                <h3>
                    Please be careful when you are configuring Firebase Push Notification.
                </h3>

                <ol className={styles.instructions}>
                    <li>
                        Log in to Google Firebase and create a new app if you don’t have any.
                    </li>
                    <li>Go to Project Settings and select the General tab.</li>
                    <li>Select Config to find Firebase Config Credentials.</li>
                    <li>
                        Copy your App’s credentials and paste them into the appropriate
                        fields.
                    </li>
                    <li>
                        Select Cloud Messaging tab and enable Cloud Messaging API.
                    </li>
                    <li>
                        After enabling Cloud Messaging API, copy the Server Key and paste it
                        into FIREBASE SERVER KEY field.
                    </li>
                    <li>
                        Configure the <b>firebase-messaging-sw.js</b> file and keep it in the
                        root directory of your cPanel.
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default FirebasePushSettings;
