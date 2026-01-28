import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import {
    AlertTriangle, CheckCircle, Clock,
    Globe, Smartphone, Mail
} from 'lucide-react';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const CustomerCareWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Support Command Center</h1>
                    <p>High-priority resolution workspace for customer care specialists.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>12</h3>
                        <p>Critical SLAs</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>45</h3>
                        <p>Pending Queries</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>98%</h3>
                        <p>Satisfied Resolution</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#ef4444" }} /> Urgent Escalations</h3>
                        <button>Interact All</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar}>U{i}</div>
                                    <span className={`${styles.pBadge} ${styles.urgent}`}>Urgent</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Premium Member {i}</strong>
                                    <p>Payment failed but amount deducted from bank...</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>2 mins ago</span>
                                    <Smartphone size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#3b82f6" }} /> Recent Channel Signals</h3>
                        <button>Sync Threads</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>S{i}</div>
                                    <span className={`${styles.pBadge} ${styles.medium}`}>New</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Support Thread {i}</strong>
                                    <p>I need help with updating my legal profile...</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{i * 5} mins ago</span>
                                    {i % 2 === 0 ? <Mail size={14} /> : <Globe size={14} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Customer Care Agent" />
                </div>
            </div>
        </div>
    );
};

export default CustomerCareWorkspace;
