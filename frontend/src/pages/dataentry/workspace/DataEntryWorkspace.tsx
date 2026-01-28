import React from 'react';
import styles from '../../admin/ContactQueries.module.css';
import {
    MdUploadFile, MdAddCircle, MdCheckCircle,
    MdError, MdListAlt
} from 'react-icons/md';
import DailyWorkLog from '../../../components/shared/DailyWorkLog';

const DataEntryWorkspace: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Entry Control Systems</h1>
                    <p>Manage member manifestations and manual data ingestion pipelines.</p>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <MdCheckCircle size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>1,240</h3>
                        <p>Successful Imports</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdListAlt size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>45</h3>
                        <p>Batches Processed</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdError size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>3</h3>
                        <p>Failed Validations</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#10b981" }} /> Quick Operations</h3>
                    </div>
                    <div className={styles.statusGrid}>
                        <div className={styles.queryCard} style={{ padding: '30px', textAlign: 'center' }}>
                            <MdUploadFile size={48} color="#10b981" style={{ marginBottom: '15px' }} />
                            <strong>Bulk Import</strong>
                            <p>Upload CSV/Excel manifests</p>
                        </div>
                        <div className={styles.queryCard} style={{ padding: '30px', textAlign: 'center' }}>
                            <MdAddCircle size={48} color="#3b82f6" style={{ marginBottom: '15px' }} />
                            <strong>Manual Add</strong>
                            <p>Single member registration</p>
                        </div>
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#3b82f6" }} /> Recent Operations</h3>
                        <button>View History</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={styles.queryCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>B{i}</div>
                                    <span className={`${styles.pBadge} ${styles.medium}`}>Success</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>Batch_Manifest_00{i}.csv</strong>
                                    <p>{100 + i * 20} members processed successfully</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{i * 2} hours ago</span>
                                    <MdCheckCircle size={14} color="#10b981" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <DailyWorkLog role="Data Entry Agent" />
                </div>
            </div>
        </div>
    );
};

export default DataEntryWorkspace;
