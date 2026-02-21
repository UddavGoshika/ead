import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css";
import { useSettings } from "../../../context/SettingsContext";
import { useToast } from "../../../context/ToastContext";

const EcosystemConfiguration: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const { showToast } = useToast();
    const [links, setLinks] = useState<{ label: string; link: string; icon_url: string }[]>([]);

    useEffect(() => {
        if (settings) {
            setLinks(settings.ecosystem_links || []);
        }
    }, [settings]);

    const addLink = () => {
        setLinks([...links, { label: "New Product", link: "#", icon_url: "/assets/icon.png" }]);
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: keyof typeof links[0], value: string) => {
        const updated = [...links];
        updated[index] = { ...updated[index], [field]: value };
        setLinks(updated);
    };

    const saveSettings = async () => {
        const success = await updateSettings({
            ecosystem_links: links
        });
        if (success) {
            showToast("Ecosystem links saved successfully");
        } else {
            showToast("Failed to save settings", "error");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <h2>Ecosystem Bar Configuration</h2>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    💾 Save Changes
                </button>
            </div>

            <section className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4>Product Ecosystem Links</h4>
                    <button className={styles.saveBtn} style={{ padding: '5px 12px', fontSize: '0.8rem' }} onClick={addLink}>+ Add Product</button>
                </div>

                {links.map((link, index) => (
                    <div key={index} style={{
                        background: '#0f172a',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        border: '1px solid #1e293b'
                    }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Label</label>
                                <input
                                    className={styles.input}
                                    value={link.label}
                                    onChange={e => updateLink(index, "label", e.target.value)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Icon URL</label>
                                <input
                                    className={styles.input}
                                    value={link.icon_url}
                                    onChange={e => updateLink(index, "icon_url", e.target.value)}
                                />
                            </div>
                            <button onClick={() => removeLink(index)} style={{ background: '#f87171', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '22px' }}>Delete</button>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Target Link</label>
                            <input
                                className={styles.input}
                                value={link.link}
                                onChange={e => updateLink(index, "link", e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </section>

            <div className={styles.footer}>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    Save Ecosystem Settings
                </button>
            </div>
        </div>
    );
};

export default EcosystemConfiguration;
