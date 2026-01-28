import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import {
    MdAssignment, MdStar, MdHourglassEmpty,
    MdDoneAll, MdPeopleAlt
} from 'react-icons/md';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const AssistantWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Concierge Workspace</h1>
                    <p>Managed assignments and high-priority member portfolio intelligence.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdAssignment size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>8</h3>
                        <p>Total Assignments</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <MdStar size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>4.9</h3>
                        <p>Trust Score</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdPeopleAlt size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>120</h3>
                        <p>Managed Members</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#f59e0b" }} /> Active Assignments</h3>
                        <button>New Task</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>T{i}</div>
                                    <span className={`${styles.pBadge} ${styles.urgent}`}>IN PROGRESS</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>VIP Onboarding #{i}</strong>
                                    <p>Finalize verification for Premium Advocate Alpha...</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>Due: Today</span>
                                    <MdHourglassEmpty size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#10b981" }} /> Completed Milestones</h3>
                        <button>Reports</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>M{i}</div>
                                    <span className={`${styles.pBadge} ${styles.medium}`}>Success</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Member Milestone {i}</strong>
                                    <p>Status: All documents verified & approved</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{i} day ago</span>
                                    <MdDoneAll size={14} color="#10b981" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Personal Assistant" />
                </div>
            </div>
        </div>
    );
};

export default AssistantWorkspace;
