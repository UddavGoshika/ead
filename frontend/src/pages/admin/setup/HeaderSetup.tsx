import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css";
import { useSettings } from "../../../context/SettingsContext";

/* ================= COMPONENT ================= */
const HeaderConfiguration: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [siteName, setSiteName] = useState("");
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [marqueeText, setMarqueeText] = useState("");
    const [logoLeft, setLogoLeft] = useState("");
    const [logoRight, setLogoRight] = useState("");
    const [logoHero, setLogoHero] = useState("");
    const [menuItems, setMenuItems] = useState<{ label: string; link: string }[]>([]);

    useEffect(() => {
        if (settings) {
            setSiteName(settings.site_name);
            setHeroTitle(settings.hero_title);
            setHeroSubtitle(settings.hero_subtitle);
            setMarqueeText(settings.marquee_text);
            setLogoLeft(settings.logo_url_left);
            setLogoRight(settings.logo_url_right);
            setLogoHero(settings.logo_url_hero);
            setMenuItems(settings.header_menu || []);
        }
    }, [settings]);

    const addMenuItem = () => {
        setMenuItems([...menuItems, { label: "New Link", link: "/" }]);
    };

    const removeMenuItem = (index: number) => {
        setMenuItems(menuItems.filter((_, i) => i !== index));
    };

    const updateMenuItem = (index: number, field: "label" | "link", value: string) => {
        const updated = [...menuItems];
        updated[index] = { ...updated[index], [field]: value };
        setMenuItems(updated);
    };

    const saveSettings = async () => {
        const success = await updateSettings({
            site_name: siteName,
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            marquee_text: marqueeText,
            logo_url_left: logoLeft,
            logo_url_right: logoRight,
            logo_url_hero: logoHero,
            header_menu: menuItems
        });
        if (success) {
            alert("Header settings saved successfully");
        } else {
            alert("Failed to save settings");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.wrapper}>
            {/* ================= HEADER ================= */}
            <div className={styles.topHeader}>
                <h2>Advanced Header & Hero Configuration</h2>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    💾 Save Changes
                </button>
            </div>

            {/* ================= LOGOS ================= */}
            <section className={styles.section}>
                <h4>Website Logos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Navbar Left Logo</label>
                        <input
                            className={styles.input}
                            value={logoLeft}
                            onChange={e => setLogoLeft(e.target.value)}
                            placeholder="/assets/logo-left.png"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Navbar Right Logo</label>
                        <input
                            className={styles.input}
                            value={logoRight}
                            onChange={e => setLogoRight(e.target.value)}
                            placeholder="/assets/logo-right.png"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Hero Section Logo</label>
                        <input
                            className={styles.input}
                            value={logoHero}
                            onChange={e => setLogoHero(e.target.value)}
                            placeholder="/assets/logo-hero.png"
                        />
                    </div>
                </div>
            </section>

            {/* ================= SITE NAME ================= */}
            <section className={styles.section}>
                <h4>Site Name</h4>
                <input
                    className={styles.input}
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                />
            </section>

            {/* ================= HERO TITLE ================= */}
            <section className={styles.section}>
                <h4>Hero Title</h4>
                <input
                    className={styles.input}
                    value={heroTitle}
                    onChange={e => setHeroTitle(e.target.value)}
                />
            </section>

            {/* ================= HERO SUBTITLE ================= */}
            <section className={styles.section}>
                <h4>Hero Subtitle</h4>
                <textarea
                    className={styles.textarea}
                    style={{ height: '80px' }}
                    value={heroSubtitle}
                    onChange={e => setHeroSubtitle(e.target.value)}
                />
            </section>

            {/* ================= NAVIGATION MENU ================= */}
            <section className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4>Navigation Menu Items</h4>
                    <button className={styles.saveBtn} style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={addMenuItem}>+ Add Item</button>
                </div>
                {menuItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            className={styles.input}
                            style={{ flex: 1 }}
                            value={item.label}
                            onChange={e => updateMenuItem(index, "label", e.target.value)}
                            placeholder="Label"
                        />
                        <input
                            className={styles.input}
                            style={{ flex: 2 }}
                            value={item.link}
                            onChange={e => updateMenuItem(index, "link", e.target.value)}
                            placeholder="Link (e.g. /about or https://...)"
                        />
                        <button onClick={() => removeMenuItem(index)} style={{ background: '#f87171', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Del</button>
                    </div>
                ))}
            </section>

            {/* ================= MARQUEE ================= */}
            <section className={styles.section}>
                <h4>Top Bar Marquee Text</h4>
                <input
                    className={styles.input}
                    value={marqueeText}
                    onChange={e => setMarqueeText(e.target.value)}
                />
            </section>

            {/* ================= FOOTER SAVE ================= */}
            <div className={styles.footer}>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    Save Header Settings
                </button>
            </div>
        </div>
    );
};

export default HeaderConfiguration;
