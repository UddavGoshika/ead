import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css";
import { useSettings } from "../../../context/SettingsContext";
import { useToast } from "../../../context/ToastContext";

const AppearanceConfiguration: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [primaryColor, setPrimaryColor] = useState("#3b82f6");
    const [darkMode, setDarkMode] = useState(true);
    const [invoiceHeader, setInvoiceHeader] = useState("/assets/id-proof.jpeg");

    useEffect(() => {
        if (settings) {
            setPrimaryColor(settings.appearance.primary_color);
            setDarkMode(settings.appearance.dark_mode);
            setInvoiceHeader(settings.invoice_header_url || "/assets/left-logo.jpeg");
        }
    }, [settings]);

    const { showToast } = useToast();

    const saveSettings = async () => {
        const success = await updateSettings({
            appearance: {
                primary_color: primaryColor,
                dark_mode: darkMode
            },
            invoice_header_url: invoiceHeader
        });
        if (success) {
            showToast("Appearance settings saved successfully");
        } else {
            showToast("Failed to save settings", "error");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <h2>Appearance Configuration</h2>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    💾 Save Changes
                </button>
            </div>

            <section className={styles.section}>
                <h4>Primary Color</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        style={{ width: '50px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }}
                    />
                    <input
                        className={styles.input}
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        placeholder="#3b82f6"
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h4>Theme Mode</h4>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="radio"
                            checked={darkMode}
                            onChange={() => setDarkMode(true)}
                        />
                        Dark Mode (Default)
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="radio"
                            checked={!darkMode}
                            onChange={() => setDarkMode(false)}
                        />
                        Light Mode
                    </label>
                </div>
            </section>

            <section className={styles.section}>
                <h4>Invoice Branding</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>Custom Logo for Invoices (Appears at Top Left)</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            className={styles.input}
                            value={invoiceHeader}
                            onChange={e => setInvoiceHeader(e.target.value)}
                            placeholder="/assets/left-logo.jpeg"
                            style={{ flex: 1 }}
                        />
                        {invoiceHeader && (
                            <img
                                src={invoiceHeader}
                                alt="Preview"
                                style={{ height: '40px', background: 'white', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        )}
                    </div>
                </div>
            </section>

            <div className={styles.footer}>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    Save Appearance Settings
                </button>
            </div>
        </div>
    );
};

export default AppearanceConfiguration;
