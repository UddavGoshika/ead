import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ManagerWorkspace.module.css';
import {
    MdTrendingUp, MdPeople, MdAssignmentInd,
    MdAssessment, MdPieChart,
    MdMoreVert, MdFlashOn, MdSecurity
} from 'react-icons/md';
import RevenueChart from '../../admin/revenuechart';

const ManagerWorkspace: React.FC = () => {
    const navigate = useNavigate();
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

    const teams = [
        { name: 'Elite Telecallers', lead: 'Sarah Jenkins', agents: 12, performance: 98, color: '#3b82f6' },
        { name: 'Premium Support', lead: 'Michael Ross', agents: 8, performance: 94, color: '#8b5cf6' },
        { name: 'Live Response', lead: 'Elena Gilbert', agents: 15, performance: 89, color: '#10b981' },
        { name: 'VIP Concierge', lead: 'David Bond', agents: 5, performance: 100, color: '#f59e0b' },
    ];

    return (
        <div className={styles.workspace}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Operations Command</h1>
                    <p>Real-time enterprise oversight & strategic performance auditing.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn}>
                        <MdFlashOn /> Global Reset
                    </button>
                    <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={() => navigate('/manager/reports')}>
                        <MdAssessment /> Generate Exec Report
                    </button>
                </div>
            </header>

            <div className={styles.topStats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <MdTrendingUp size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Total Ecosystem Growth</h4>
                        <div className={styles.statValue}>
                            {loading ? '...' : `+${((stats?.totalUsers / 10) || 0).toFixed(1)}%`}
                            <span className={`${styles.statTrend} ${styles.trendUp}`}>↑ 12%</span>
                        </div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                        <MdPeople size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Active Personnel</h4>
                        <div className={styles.statValue}>
                            {loading ? '...' : (stats?.totalUsers || 0).toLocaleString()}
                            <span className={`${styles.statTrend} ${styles.trendUp}`}>+{stats?.activeUnits || 0} Active</span>
                        </div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <MdPieChart size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>System Efficiency</h4>
                        <div className={styles.statValue}>
                            {loading ? '...' : '96.4%'}
                            <span className={`${styles.statTrend} ${styles.trendUp}`}>↑ 0.5%</span>
                        </div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
                        <MdSecurity size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Unresolved Escalations</h4>
                        <div className={styles.statValue}>
                            {loading ? '...' : String(stats?.pendingAdvocates || 0).padStart(2, '0')}
                            <span className={`${styles.statTrend} ${styles.trendDown}`}>↓ 14%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.glassPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Operational Revenue Audit</h2>
                        <div className={styles.headerActions}>
                            <button className={styles.secondaryBtn}>Daily</button>
                            <button className={styles.secondaryBtn}>Monthly</button>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        <RevenueChart />
                    </div>
                </div>

                <div className={styles.glassPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Team Performance</h2>
                        <button className={styles.secondaryBtn} onClick={() => navigate('/manager/staff/all')}>View All</button>
                    </div>
                    <div className={styles.teamList}>
                        {teams.map((team, idx) => (
                            <div key={idx} className={styles.teamItem}>
                                <div className={styles.teamAvatar} style={{ background: team.color }}>
                                    {team.name[0]}
                                </div>
                                <div className={styles.teamInfo}>
                                    <span className={styles.teamName}>{team.name}</span>
                                    <span className={styles.teamLead}>{team.lead}</span>
                                </div>
                                <div className={styles.teamMetrics}>
                                    <span className={styles.metricValue}>{team.performance}%</span>
                                    <span className={styles.metricLabel}>Efficiency</span>
                                </div>
                                <MdMoreVert color="#64748b" style={{ cursor: 'pointer' }} />
                            </div>
                        ))}
                    </div>
                    <button className={`${styles.actionBtn} ${styles.primaryBtn}`} style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }} onClick={() => navigate('/manager/resources')}>
                        <MdAssignmentInd /> Reallocate Resources
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagerWorkspace;
