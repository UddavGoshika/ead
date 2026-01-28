import React from 'react';
import styles from '../shared/DashboardSection.module.css';

const Disputes: React.FC = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>Disputes & Escalations</h2>
                <p className={styles.subtitle}>Manage platform disputes and user escalations.</p>
            </header>

            <div className={styles.section}>
                <div style={{ padding: '24px', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                        No active disputes found.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Disputes;
