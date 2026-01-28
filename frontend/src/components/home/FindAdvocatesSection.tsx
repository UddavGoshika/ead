import React from 'react';
import styles from './FindAdvocatesSection.module.css';
import { Search, MapPin, Gavel, UserCheck } from 'lucide-react';

const categories = ["Criminal", "Civil", "Family", "Corporate", "Property"];

const FindAdvocatesSection: React.FC = () => {
    return (
        <section id="find-advocates" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.glassCard}>
                    <div className={styles.header}>
                        <h2>Find Your Advocate</h2>
                        <p>Search through thousands of verified legal professionals across India</p>
                    </div>

                    <div className={styles.quickSearch}>
                        <div className={styles.inputGroup}>
                            <Search size={20} />
                            <input type="text" placeholder="Specialization (e.g. Divorce)" />
                        </div>
                        <div className={styles.inputGroup}>
                            <MapPin size={20} />
                            <input type="text" placeholder="City or Pincode" />
                        </div>
                        <button className={styles.searchBtn}>Find Advocates</button>
                    </div>

                    <div className={styles.popularTags}>
                        <span>Popular:</span>
                        {categories.map(cat => (
                            <button key={cat} className={styles.tag}>{cat}</button>
                        ))}
                    </div>

                    <div className={styles.trustBadges}>
                        <div className={styles.badge}>
                            <UserCheck size={24} />
                            <span>10k+ Verified Advocates</span>
                        </div>
                        <div className={styles.badge}>
                            <Gavel size={24} />
                            <span>50k+ Cases Resolved</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FindAdvocatesSection;
