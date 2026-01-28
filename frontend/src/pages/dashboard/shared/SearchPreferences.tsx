import React, { useState } from 'react';
import styles from './DashboardSection.module.css';
import { Search, Filter } from 'lucide-react';

interface Props {
    backToHome?: () => void;
    showToast?: (msg: string) => void;
}

const SearchPreferences: React.FC<Props> = ({ backToHome, showToast }) => {
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (showToast) showToast('Search preferences saved!');
        }, 1000);
    };

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.header}>
                <h1>Search Preferences</h1>
                <p>Customize how you find the best legal matching for your needs.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label><Filter size={14} style={{ marginRight: '6px' }} /> Default Category</label>
                        <select className={styles.select}>
                            <option>All Categories</option>
                            <option>Corporate Law</option>
                            <option>Civil Rights</option>
                            <option>Criminal Defense</option>
                            <option>Family Law</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label><Search size={14} style={{ marginRight: '6px' }} /> Default Location</label>
                        <input className={styles.input} placeholder="Enter City or State" defaultValue="Mumbai" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Minimum Experience</label>
                        <select className={styles.select}>
                            <option>Any Experience</option>
                            <option>5+ Years</option>
                            <option>10+ Years</option>
                            <option>20+ Years</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Preferred Court</label>
                        <select className={styles.select}>
                            <option>Supreme Court</option>
                            <option>High Court</option>
                            <option>District Court</option>
                            <option>Tribunal</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Saved Filter Presets</h3>
                    <div className={styles.itemCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '600' }}>Senior Corporate Advocates</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>15+ Years, Mumbai, High Court</div>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer' }}>Apply</button>
                    </div>
                </div>

                <div className={styles.actionRow} style={{ marginTop: '40px' }}>
                    {backToHome && (
                        <button className={styles.cancelBtn} onClick={backToHome}>Cancel</button>
                    )}
                    <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchPreferences;
