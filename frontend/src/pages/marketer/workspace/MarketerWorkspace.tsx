import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import { Target, PieChart, Users, Megaphone } from 'lucide-react';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const MarketerWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Marketing Operations Center</h1>
                    <p>Strategic campaign management and lead generation intelligence.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <Target size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>1.2K</h3>
                        <p>Leads Generated</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <Megaphone size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>18</h3>
                        <p>Live Funnels</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>₹12.5L</h3>
                        <p>Ad Spend Audit</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><PieChart size={18} /> ROI Analysis</h3>
                    </div>
                    <div className={styles.statusGrid}>
                        {['Search Ads', 'Social Ads', 'Email Mktg', 'Affiliates'].map((channel, i) => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <strong>{channel}</strong>
                                    <span className={`${styles.pBadge} ${styles.low}`}>ROI: {(i + 2.5).toFixed(1)}x</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>Conversion: {(i + 1.2).toFixed(1)}%</p>
                                    <p>CAC: ₹{450 - (i * 20)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Marketer" />
                </div>
            </div>
        </div>
    );
};

export default MarketerWorkspace;
