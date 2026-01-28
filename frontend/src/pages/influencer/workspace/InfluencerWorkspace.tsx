import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import { BarChart3, Layers, Globe, TrendingUp } from 'lucide-react';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const InfluencerWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Influencer Strategic Hub</h1>
                    <p>Manage digital presence and brand advocacy metrics in real-time.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}>
                        <Globe size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>840K</h3>
                        <p>Total Reach</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>12.4%</h3>
                        <p>Avg Engagement</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>42</h3>
                        <p>Active Campaigns</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><Layers size={18} /> Social Channel Performance</h3>
                    </div>
                    <div className={styles.statusGrid}>
                        {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map((platform, i) => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <strong>{platform}</strong>
                                    <span className={`${styles.pBadge} ${styles.medium}`}>ACTIVE</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>Followers: {100 + (i * 50)}K</p>
                                    <p>Growth: +{(i + 1) * 2}% this month</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Influencer" />
                </div>
            </div>
        </div>
    );
};

export default InfluencerWorkspace;
