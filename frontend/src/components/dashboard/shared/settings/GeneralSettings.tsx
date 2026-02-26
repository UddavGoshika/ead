import React, { useState } from 'react';
import { Save, Upload, Globe, Shield, Mail } from 'lucide-react';
import styles from './SettingsForms.module.css';

const GeneralSettings: React.FC = () => {
    const [companyName, setCompanyName] = useState('Eadvocate Enterprise');
    const [timezone, setTimezone] = useState('UTC-05:00 Eastern Time');
    const [currency, setCurrency] = useState('USD ($)');

    return (
        <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
                <h2>General System Settings</h2>
                <p>Configure the basic branding and locale settings for the ERP.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3><Globe size={18} /> Branding & Identity</h3>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.logoUploadGroup}>
                            <div className={styles.currentLogo}>EA</div>
                            <div className={styles.uploadControls}>
                                <h4>Company Logo</h4>
                                <p>Recommended size: 256x256px (PNG or SVG)</p>
                                <button className={styles.uploadBtn}>
                                    <Upload size={16} /> Choose File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3><Globe size={18} /> Localization & Defaults</h3>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>System Timezone</label>
                            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={styles.selectField}>
                                <option>UTC-08:00 Pacific Time</option>
                                <option>UTC-05:00 Eastern Time</option>
                                <option>UTC+00:00 Greenwich Mean Time</option>
                                <option>UTC+05:30 Indian Standard Time</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Default Currency</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={styles.selectField}>
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
                                <option>INR (₹)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3><Mail size={18} /> Email Settings (SMTP)</h3>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>SMTP Host</label>
                            <input type="text" placeholder="smtp.example.com" className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>SMTP Port</label>
                            <input type="text" placeholder="587" className={styles.inputField} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input type="text" placeholder="api_key_id" className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input type="password" placeholder="••••••••••••" className={styles.inputField} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actionFooter}>
                <button className={styles.saveBtn}>
                    <Save size={18} /> Save Configurations
                </button>
            </div>
        </div>
    );
};

export default GeneralSettings;
