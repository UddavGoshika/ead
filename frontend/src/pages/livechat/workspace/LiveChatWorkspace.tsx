import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import {
    MdMessage, MdChatBubbleOutline, MdMarkChatUnread,
    MdAssignmentInd, MdFlashOn
} from 'react-icons/md';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const LiveChatWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Chat Control Center</h1>
                    <p>Real-time digital interaction monitoring and rapid response analytics.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
                        <MdMessage size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>56</h3>
                        <p>Total Sessions</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdFlashOn size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>45s</h3>
                        <p>Avg Response</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdMarkChatUnread size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>12</h3>
                        <p>Unclaimed Signals</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#ef4444" }} /> Priority Chat Signals</h3>
                        <button>Intercept All</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>C{i}</div>
                                    <span className={`${styles.pBadge} ${styles.urgent}`}>WAITING {i}m</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Advocate {i}</strong>
                                    <p>Technical issue with document signing API...</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>Session ID: CHAT-90{i}</span>
                                    <MdChatBubbleOutline size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#3b82f6" }} /> Recent Chat Threads</h3>
                        <button>View Archive</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>S{i}</div>
                                    <span className={`${styles.pBadge} ${styles.medium}`}>Archived</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Client Support {i}</strong>
                                    <p>Status: Succesfully Onboarded</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{i * 15} mins ago</span>
                                    <MdAssignmentInd size={14} color="#22c55e" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Live Chat Agent" />
                </div>
            </div>
        </div>
    );
};

export default LiveChatWorkspace;
