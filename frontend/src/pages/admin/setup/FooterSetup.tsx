import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css"; // Reusing styles for consistency
import { useSettings } from "../../../context/SettingsContext";

const FooterConfiguration: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [footerText, setFooterText] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [instagram, setInstagram] = useState("");
    const [facebook, setFacebook] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [twitter, setTwitter] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    useEffect(() => {
        if (settings) {
            setFooterText(settings.footer_text);
            setContactEmail(settings.contact_email);
            setContactPhone(settings.contact_phone);
            setInstagram(settings.social_links.instagram);
            setFacebook(settings.social_links.facebook);
            setLinkedin(settings.social_links.linkedin);
            setTwitter(settings.social_links.twitter);
            setWhatsapp(settings.social_links.whatsapp);
        }
    }, [settings]);

    const saveSettings = async () => {
        const success = await updateSettings({
            footer_text: footerText,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            social_links: {
                instagram,
                facebook,
                linkedin,
                twitter,
                whatsapp
            }
        });
        if (success) {
            alert("Footer settings saved successfully");
        } else {
            alert("Failed to save settings");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <h2>Footer Configuration</h2>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    💾 Save Changes
                </button>
            </div>

            <section className={styles.section}>
                <h4>Footer Copyright Text</h4>
                <input
                    className={styles.input}
                    value={footerText}
                    onChange={e => setFooterText(e.target.value)}
                />
            </section>

            <section className={styles.section}>
                <h4>Contact Email</h4>
                <input
                    className={styles.input}
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                />
            </section>

            <section className={styles.section}>
                <h4>Contact Phone</h4>
                <input
                    className={styles.input}
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                />
            </section>

            <h3 style={{ margin: '20px 0 10px 0', borderBottom: '1px solid #1e293b', paddingBottom: '5px' }}>Social Links</h3>

            <section className={styles.section}>
                <h4>Instagram</h4>
                <input className={styles.input} value={instagram} onChange={e => setInstagram(e.target.value)} />
            </section>

            <section className={styles.section}>
                <h4>Facebook</h4>
                <input className={styles.input} value={facebook} onChange={e => setFacebook(e.target.value)} />
            </section>

            <section className={styles.section}>
                <h4>LinkedIn</h4>
                <input className={styles.input} value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            </section>

            <section className={styles.section}>
                <h4>Twitter</h4>
                <input className={styles.input} value={twitter} onChange={e => setTwitter(e.target.value)} />
            </section>

            <section className={styles.section}>
                <h4>WhatsApp</h4>
                <input className={styles.input} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </section>

            <div className={styles.footer}>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    Save Footer Settings
                </button>
            </div>
        </div>
    );
};

export default FooterConfiguration;
