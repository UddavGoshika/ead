import React from 'react';
import styles from '../shared/DashboardSection.module.css';

const AdvocateApprovals: React.FC = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>Advocate Approvals</h2>
                <p className={styles.subtitle}>Review and manage advocate registration requests.</p>
            </header>

            <div className={styles.section}>
                <div style={{ padding: '24px', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <th style={{ padding: '12px' }}>Name</th>
                                <th style={{ padding: '12px' }}>Specialization</th>
                                <th style={{ padding: '12px' }}>Date Applied</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    No pending approvals found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvocateApprovals;
