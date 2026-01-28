import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../admin/ContactQueries.module.css';
import { MdPayments, MdAccountBalanceWallet, MdTrendingUp, MdInsights } from 'react-icons/md';

const StaffPayroll: React.FC = () => {
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
                console.error("Error fetching payroll stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const teams = [
        { team: 'Operations (Manager)', amount: stats ? `$${(stats.totalManagers * 5000).toLocaleString()}` : '...', bonus: '+15%', status: 'PROVISIONED' },
        { team: 'Team Lead Division', amount: stats ? `$${(stats.totalTeamLeads * 3500).toLocaleString()}` : '...', bonus: '+8%', status: 'PENDING' },
        { team: 'General Staff', amount: stats ? `$${(stats.totalStaff * 2000).toLocaleString()}` : '...', bonus: '+12%', status: 'APPROVED' },
        { team: 'Field Advocates', amount: stats ? `$${(stats.totalAdvocates * 1500).toLocaleString()}` : '...', bonus: '+5%', status: 'PROVISIONED' },
    ];

    const totalDisbursement = stats ? (stats.totalManagers * 5000 + stats.totalTeamLeads * 3500 + stats.totalStaff * 2000 + stats.totalAdvocates * 1500) : 0;

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Incentive & Payroll Analytics</h1>
                    <p>Automated disbursement tracking and performance-based reward distribution.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtn}><MdPayments size={18} /> Initialize Batch</button>
                    <button className={styles.actionBtn}><MdAccountBalanceWallet size={18} /> Wallet Audit</button>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdTrendingUp size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>{loading ? '...' : `$${totalDisbursement.toLocaleString()}`}</h3>
                        <p>Est. Monthly Disbursement</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <MdInsights size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>{loading ? '...' : (stats?.activeUnits > 0 ? '94%' : '0%')}</h3>
                        <p>Incentive Eligibility</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridContainer} style={{ marginTop: '24px' }}>
                <div className={styles.gridHeader}>
                    <h3>Team Contribution & Bonus Multipliers</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {teams.map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                background: 'rgba(30, 41, 59, 0.5)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.team}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Performance Multiplier: {item.bonus}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: '#10b981' }}>{item.amount}</div>
                                    <div style={{ fontSize: '10px', color: item.status === 'PENDING' ? '#f59e0b' : '#3b82f6' }}>{item.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPayroll;
