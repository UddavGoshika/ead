import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import { Building2, Network, ShieldCheck, Briefcase } from 'lucide-react';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const MarketingAgencyWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Agency Partnership Terminal</h1>
                    <p>External agency coordination and performance auditing system.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <Building2 size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>12</h3>
                        <p>Partner Agencies</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <Network size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>₹45.8L</h3>
                        <p>Managed Budget</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>100%</h3>
                        <p>Compliance Score</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><Briefcase size={18} /> Active Agency Contracts</h3>
                    </div>
                    <div className={styles.statusGrid}>
                        {['BlueMedia Inc', 'DigitalPulse', 'GrowthHackers', 'Skybound'].map((agency, i) => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <strong>{agency}</strong>
                                    <span className={`${styles.pBadge} ${styles.urgent}`}>L{i + 1} SVC</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>Renewal: 1{i}/12/2026</p>
                                    <p>Status: Fully Operational</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Agency Manager" />
                </div>
            </div>
        </div>
    );
};

export default MarketingAgencyWorkspace;
