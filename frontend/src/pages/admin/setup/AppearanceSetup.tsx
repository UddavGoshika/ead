import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css";
import { useSettings } from "../../../context/SettingsContext";

const AppearanceConfiguration: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [primaryColor, setPrimaryColor] = useState("#3b82f6");
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        if (settings) {
            setPrimaryColor(settings.appearance.primary_color);
            setDarkMode(settings.appearance.dark_mode);
        }
    }, [settings]);

    const saveSettings = async () => {
        const success = await updateSettings({
            appearance: {
                primary_color: primaryColor,
                dark_mode: darkMode
            }
        });
        if (success) {
            alert("Appearance settings saved successfully");
        } else {
            alert("Failed to save settings");
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

            <div className={styles.footer}>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    Save Appearance Settings
                </button>
            </div>
        </div>
    );
};

export default AppearanceConfiguration;
