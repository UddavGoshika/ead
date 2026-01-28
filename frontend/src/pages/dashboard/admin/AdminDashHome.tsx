import React from 'react';
import styles from '../shared/DashboardSection.module.css';
import { MdPeople, MdVerifiedUser, MdGavel, MdConfirmationNumber } from 'react-icons/md';

const AdminDashHome: React.FC = () => {
    const stats = [
        { label: 'Total Advocates', value: '450', icon: <MdPeople />, color: '#3b82f6' },
        { label: 'Pending Approvals', value: '28', icon: <MdVerifiedUser />, color: '#f59e0b' },
        { label: 'Active Cases', value: '1,240', icon: <MdGavel />, color: '#10b981' },
        { label: 'Open Tickets', value: '15', icon: <MdConfirmationNumber />, color: '#ef4444' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>Administrative Overview</h2>
                <p className={styles.subtitle}>Welcome to the Operations & Oversight Panel.</p>
            </header>

            <div className={styles.statsGrid} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{
                        background: '#0f172a',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: `${stat.color}15`,
                            color: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Recent Activity</h3>
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                    No recent activity to display.
                </div>
            </div>
        </div>
    );
};

export default AdminDashHome;
