import React, { useState, useEffect } from "react";
import styles from "./SmtpSettings.module.css";
import api from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const SmtpSettings: React.FC = () => {
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        host: "",
        port: 587,
        user: "",
        pass: "",
        sender_email: "",
        sender_name: "",
        encryption: "tls"
    });
    const [loading, setLoading] = useState(true);
    const [testEmail, setTestEmail] = useState("");
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        const fetchSmtp = async () => {
            try {
                const res = await api.get('/settings/site');
                if (res.data.success && res.data.settings.smtp_settings) {
                    setConfig(res.data.settings.smtp_settings);
                    setTestEmail(res.data.settings.contact_email || "");
                }
            } catch (err) {
                console.error("Error fetching SMTP settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSmtp();
    }, []);

    const handleUpdate = async () => {
        try {
            await api.post('/settings/site', { smtp_settings: config });
            showToast("SMTP settings updated successfully");
        } catch (err) {
            console.error("Error updating SMTP:", err);
            showToast("Failed to update SMTP settings", "error");
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            showToast("Please enter an email address", "error");
            return;
        }
        try {
            setTesting(true);
            const res = await api.post('/settings/test-email', {
                email: testEmail,
                smtp_settings: config
            });
            if (res.data.success) {
                showToast("Test email sent! Please check your inbox.");
            }
        } catch (err: any) {
            console.error("Test email error:", err);
            showToast(err.response?.data?.error || "Failed to send test email", "error");
        } finally {
            setTesting(false);
        }
    };

    if (loading) return <div className={styles.page}>Loading SMTP settings...</div>;

    return (
        <div className={styles.page}>
            {/* SMTP SETTINGS */}
            <div className={styles.card}>
                <h3>SMTP Settings</h3>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>MAIL HOST</label>
                        <input value={config.host} onChange={e => setConfig({ ...config, host: e.target.value })} />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL PORT</label>
                        <input value={config.port} onChange={e => setConfig({ ...config, port: parseInt(e.target.value) || 0 })} />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL FROM ADDRESS</label>
                        <input value={config.sender_email} onChange={e => setConfig({ ...config, sender_email: e.target.value })} />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL USERNAME</label>
                        <input value={config.user} onChange={e => setConfig({ ...config, user: e.target.value })} />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL PASSWORD</label>
                        <input type="password" value={config.pass} onChange={e => setConfig({ ...config, pass: e.target.value })} />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL ENCRYPTION</label>
                        <input value={config.encryption} onChange={e => setConfig({ ...config, encryption: e.target.value })} />
                    </div>

                    <div className={styles.field}>
                        <label>MAIL FROM NAME</label>
                        <input value={config.sender_name} onChange={e => setConfig({ ...config, sender_name: e.target.value })} />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={handleUpdate}>Update</button>
                </div>
            </div>

            {/* INSTRUCTION */}
            <div className={styles.card}>
                <h3>Instruction</h3>

                <p className={styles.warning}>
                    Please be careful when you are configuring SMTP. For incorrect
                    configuration you will get error at the time of order place, new
                    registration, sending newsletter.
                </p>

                <div className={styles.instructionBlock}>
                    <h4>For Non-SSL</h4>
                    <ul>
                        <li>Select sendmail for Mail Driver if you face any issue</li>
                        <li>Set Mail Host according to your server manual settings</li>
                        <li>Set Mail port as 587</li>
                        <li>Set Mail Encryption as ssl if tls fails</li>
                    </ul>
                </div>

                <div className={styles.instructionBlock}>
                    <h4>For SSL</h4>
                    <ul>
                        <li>Select sendmail for Mail Driver if you face any issue</li>
                        <li>Set Mail Host according to your server manual settings</li>
                        <li>Set Mail port as 465</li>
                        <li>Set Mail Encryption as ssl</li>
                    </ul>
                </div>
            </div>

            {/* TEST SMTP */}
            <div className={styles.card}>
                <h3>Test SMTP configuration</h3>

                <div className={styles.inline}>
                    <input
                        placeholder="admin@example.com"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                    />
                    <button
                        className={styles.primaryBtn}
                        onClick={handleTestEmail}
                        disabled={testing}
                    >
                        {testing ? "Sending..." : "Send test email"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmtpSettings;
