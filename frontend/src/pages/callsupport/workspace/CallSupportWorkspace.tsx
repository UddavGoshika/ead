import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import {
    MdPhoneInTalk, MdSettingsPhone, MdPhonePaused,
    MdPhoneForwarded, MdRecordVoiceOver
} from 'react-icons/md';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const CallSupportWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Voice Operations Center</h1>
                    <p>Real-time queue monitoring and call resolution intelligence.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdPhoneInTalk size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>24</h3>
                        <p>Active Calls</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdRecordVoiceOver size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>8s</h3>
                        <p>Avg Connect Time</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdPhonePaused size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>5</h3>
                        <p>Waiting in Queue</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#ef4444" }} /> Critical Call Queues</h3>
                        <button>Manage Queue</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>V{i}</div>
                                    <span className={`${styles.pBadge} ${styles.urgent}`}>WAITING {i * 2}m</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Premium Member {i}</strong>
                                    <p>Emergency legal consultation request...</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>Inbound Route {i}</span>
                                    <MdSettingsPhone size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#3b82f6" }} /> Recent Resolutions</h3>
                        <button>Archive Logs</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>L{i}</div>
                                    <span className={`${styles.pBadge} ${styles.medium}`}>Resolved</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Case Follow-up {i}</strong>
                                    <p>Call duration: {10 + i} mins</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{i * 10} mins ago</span>
                                    <MdPhoneForwarded size={14} color="#22c55e" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Call Support Agent" />
                </div>
            </div>
        </div>
    );
};

export default CallSupportWorkspace;
