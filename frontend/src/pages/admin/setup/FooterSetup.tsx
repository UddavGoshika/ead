import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css"; // Reusing styles for consistency
import { useSettings } from "../../../context/SettingsContext";

const FooterConfiguration: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [footerText, setFooterText] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");

    const [socialLinks, setSocialLinks] = useState<any[]>([]);
    const [footerPages, setFooterPages] = useState<any[]>([]);

    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [editingSocialIndex, setEditingSocialIndex] = useState<number | null>(null);
    const [socialForm, setSocialForm] = useState({ platform: '', url: '', icon: 'Link', active: true });

    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
    const [pageForm, setPageForm] = useState({ title: '', link: '', active: true });

    useEffect(() => {
        if (settings) {
            setFooterText(settings.footer_text || "");
            setContactEmail(settings.contact_email || "");
            setContactPhone(settings.contact_phone || "");

            // Normalized Social Links
            if (Array.isArray(settings.social_links)) {
                setSocialLinks(settings.social_links);
            } else if (settings.social_links) {
                // Fallback migration for display
                const converted = Object.entries(settings.social_links as any).map(([k, v]) => ({
                    platform: k.charAt(0).toUpperCase() + k.slice(1),
                    url: v as string,
                    icon: k,
                    active: true
                }));
                // Filter out default '#' values if desired, or keep them
                setSocialLinks(converted);
            }

            if (settings.footer_pages) {
                setFooterPages(settings.footer_pages);
            }
        }
    }, [settings]);

    const handleSaveSocial = () => {
        if (editingSocialIndex !== null) {
            const updated = [...socialLinks];
            updated[editingSocialIndex] = socialForm;
            setSocialLinks(updated);
        } else {
            setSocialLinks([...socialLinks, socialForm]);
        }
        setIsSocialModalOpen(false);
        setEditingSocialIndex(null);
        setSocialForm({ platform: '', url: '', icon: 'Link', active: true });
    };

    const handleDeleteSocial = (index: number) => {
        if (window.confirm('Delete this social link?')) {
            setSocialLinks(socialLinks.filter((_, i) => i !== index));
        }
    };

    const handleSavePage = () => {
        if (editingPageIndex !== null) {
            const updated = [...footerPages];
            updated[editingPageIndex] = pageForm;
            setFooterPages(updated);
        } else {
            setFooterPages([...footerPages, pageForm]);
        }
        setIsPageModalOpen(false);
        setEditingPageIndex(null);
        setPageForm({ title: '', link: '', active: true });
    };

    const handleDeletePage = (index: number) => {
        if (window.confirm('Delete this page link?')) {
            setFooterPages(footerPages.filter((_, i) => i !== index));
        }
    };

    const saveSettings = async () => {
        const success = await updateSettings({
            footer_text: footerText,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            social_links: socialLinks,
            footer_pages: footerPages
        });
        if (success) {
            alert("Footer settings saved successfully");
        } else {
            alert("Failed to save settings");
        }
    };

    if (loading) return <div>Loading...</div>;

    const availableIcons = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'YouTube', 'Pinterest', 'Threads', 'Telegram', 'Link'];

    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <h2>Footer Configuration</h2>
                <button className={styles.saveBtn} onClick={saveSettings}>
                    💾 Save Changes
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <section className={styles.section}>
                    <h4>Contact Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            className={styles.input}
                            placeholder="Footer Text"
                            value={footerText}
                            onChange={e => setFooterText(e.target.value)}
                        />
                        <input
                            className={styles.input}
                            placeholder="Email"
                            value={contactEmail}
                            onChange={e => setContactEmail(e.target.value)}
                        />
                        <input
                            className={styles.input}
                            placeholder="Phone"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                        />
                    </div>
                </section>
            </div>

            {/* SOCIAL LINKS MANAGER */}
            <section className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4>Social Media Links</h4>
                    <button
                        className={styles.saveBtn}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => {
                            setSocialForm({ platform: '', url: '', icon: 'Link', active: true });
                            setEditingSocialIndex(null);
                            setIsSocialModalOpen(true);
                        }}
                    >
                        + Add Social
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {socialLinks.map((link, idx) => (
                        <div key={idx} style={{
                            background: '#1e293b',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: '200px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{link.platform}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</div>
                            </div>
                            <button onClick={() => {
                                setSocialForm(link);
                                setEditingSocialIndex(idx);
                                setIsSocialModalOpen(true);
                            }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>✎</button>
                            <button onClick={() => handleDeleteSocial(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER PAGES MANAGER */}
            <section className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4>Footer Custom Pages</h4>
                    <button
                        className={styles.saveBtn}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => {
                            setPageForm({ title: '', link: '', active: true });
                            setEditingPageIndex(null);
                            setIsPageModalOpen(true);
                        }}
                    >
                        + Add Page
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {footerPages.map((page, idx) => (
                        <div key={idx} style={{
                            background: '#1e293b',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: '200px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{page.title}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{page.link}</div>
                            </div>
                            <button onClick={() => {
                                setPageForm(page);
                                setEditingPageIndex(idx);
                                setIsPageModalOpen(true);
                            }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>✎</button>
                            <button onClick={() => handleDeletePage(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* SOCIAL MODAL */}
            {isSocialModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
                        <h3>{editingSocialIndex !== null ? 'Edit' : 'Add'} Social Link</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <input className={styles.input} placeholder="Platform Name (e.g. Facebook)" value={socialForm.platform} onChange={e => setSocialForm({ ...socialForm, platform: e.target.value })} />
                            <input className={styles.input} placeholder="URL" value={socialForm.url} onChange={e => setSocialForm({ ...socialForm, url: e.target.value })} />
                            <select className={styles.input} value={socialForm.icon} onChange={e => setSocialForm({ ...socialForm, icon: e.target.value })}>
                                {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                            </select>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                                <input type="checkbox" checked={socialForm.active} onChange={e => setSocialForm({ ...socialForm, active: e.target.checked })} />
                                Active
                            </label>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className={styles.saveBtn} onClick={handleSaveSocial}>Save</button>
                                <button className={styles.saveBtn} style={{ background: '#334155' }} onClick={() => setIsSocialModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PAGE MODAL */}
            {isPageModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
                        <h3>{editingPageIndex !== null ? 'Edit' : 'Add'} Footer Page</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <input className={styles.input} placeholder="Page Title (e.g. Privacy Policy)" value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} />
                            <input className={styles.input} placeholder="Link / Path (e.g. /privacy)" value={pageForm.link} onChange={e => setPageForm({ ...pageForm, link: e.target.value })} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                                <input type="checkbox" checked={pageForm.active} onChange={e => setPageForm({ ...pageForm, active: e.target.checked })} />
                                Active
                            </label>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className={styles.saveBtn} onClick={handleSavePage}>Save</button>
                                <button className={styles.saveBtn} style={{ background: '#334155' }} onClick={() => setIsPageModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterConfiguration;
