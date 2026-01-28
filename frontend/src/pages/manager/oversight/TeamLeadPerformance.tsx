import React, { useState } from 'react';
import styles from '../managerdash.module.css';
import RevenueChart from '../../admin/revenuechart';
import {
    MdGroups, MdSpeed, MdWarning, MdCheckCircle,
    MdTrendingUp, MdTimer
} from 'react-icons/md';

const TeamLeadPerformance: React.FC = () => {
    const [tlStats] = useState([
        { id: 1, name: 'Sarah Chen', team: 'Frontend Core', performance: 94, velocity: 85, tasks: 42, alerts: 0 },
        { id: 2, name: 'Marcus Johnson', team: 'UX/Product', performance: 87, velocity: 72, tasks: 28, alerts: 2 },
        { id: 3, name: 'Alex Rodriguez', team: 'DevOps Ops', performance: 92, velocity: 90, tasks: 35, alerts: 0 },
    ]);

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h1>Team Lead Performance Oversight</h1>
                    <p>Strategic monitoring of engineering and product leadership efficiency.</p>
                </div>
            </header>

            <div className={styles.summaryGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className={styles.summaryCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdGroups size={24} color="#60a5fa" />
                        <h3>Active Leads</h3>
                    </div>
                    <p>{tlStats.length}</p>
                </div>
                <div className={styles.summaryCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdTrendingUp size={24} color="#10b981" />
                        <h3>Avg Performance</h3>
                    </div>
                    <p className={styles.green}>91%</p>
                </div>
                <div className={styles.summaryCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdSpeed size={24} color="#f59e0b" />
                        <h3>Team Velocity</h3>
                    </div>
                    <p className={styles.orange}>82.3</p>
                </div>
                <div className={styles.summaryCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdWarning size={24} color="#ef4444" />
                        <h3>Critical Alerts</h3>
                    </div>
                    <p className={styles.red}>2</p>
                </div>
            </div>

            <section className={styles.topSection}>
                <div className={styles.graphCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.2rem', color: '#bfdbfe' }}>Aggregated Velocity Trends</h2>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Last 30 Days</div>
                    </div>
                    <RevenueChart />
                </div>

                <div className={styles.rightStats}>
                    <div className={styles.statBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4>Top Performing Lead</h4>
                            <MdCheckCircle color="#10b981" />
                        </div>
                        <p style={{ fontSize: '1.4rem' }}>Sarah Chen</p>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Frontend Core Team</div>
                    </div>
                    <div className={styles.statBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4>Under Review</h4>
                            <MdTimer color="#f59e0b" />
                        </div>
                        <p style={{ fontSize: '1.4rem' }}>Marcus Johnson</p>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Product Backlog Scaling</div>
                    </div>
                </div>
            </section>

            <div className={styles.tableWrapper} style={{ marginTop: '24px' }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Team Lead</th>
                            <th>Operational Team</th>
                            <th>Performance</th>
                            <th>Velocity</th>
                            <th>Tasks Done</th>
                            <th>Alerts</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tlStats.map(tl => (
                            <tr key={tl.id}>
                                <td>
                                    <div className={styles.nameCell}>
                                        <div className={styles.avatarPlaceholder}>{tl.name[0]}</div>
                                        <div>
                                            <strong>{tl.name}</strong>
                                        </div>
                                    </div>
                                </td>
                                <td><span className={styles.roleBadge}>{tl.team}</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px' }}>
                                            <div style={{ width: `${tl.performance}%`, background: tl.performance > 90 ? '#10b981' : '#f59e0b', height: '100%', borderRadius: '3px' }} />
                                        </div>
                                        <span>{tl.performance}%</span>
                                    </div>
                                </td>
                                <td>{tl.velocity} pts</td>
                                <td>{tl.tasks}</td>
                                <td>
                                    <span className={`${styles.badge} ${tl.alerts > 0 ? styles.blocked : styles.active}`}>
                                        {tl.alerts} Issues
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.actionButton}>Full Report</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamLeadPerformance;
