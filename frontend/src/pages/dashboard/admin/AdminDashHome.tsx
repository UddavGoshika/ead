import React, { useState, useEffect } from 'react';
import styles from '../shared/DashboardSection.module.css';
import { MdPeople, MdVerifiedUser, MdGavel, MdConfirmationNumber } from 'react-icons/md';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const AdminDashHome: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/admin/stats');
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className={styles.loading}><Loader2 className={styles.spinner} /> Loading Stats...</div>;

    const statCards = [
        { label: 'Total Advocates', value: stats?.totalAdvocates || 0, icon: <MdPeople />, color: '#3b82f6' },
        { label: 'Pending Approvals', value: stats?.pendingAdvocates || 0, icon: <MdVerifiedUser />, color: '#f59e0b' },
        { label: 'Total Clients', value: stats?.totalClients || 0, icon: <MdGavel />, color: '#10b981' },
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: <MdConfirmationNumber />, color: '#ef4444' },
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
                {statCards.map((stat, idx) => (
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
                <h3 className={styles.sectionTitle}>System Integrity</h3>
                <div style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: '#4ade80' }}>
                    Database connection active. Real-time synchronization enabled across all management clusters.
                </div>
            </div>
        </div>
    );
};

export default AdminDashHome;
