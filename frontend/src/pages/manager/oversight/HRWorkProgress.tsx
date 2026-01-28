import React, { useState } from 'react';
import styles from '../managerdash.module.css';
import {
    MdAssignmentInd, MdHowToReg, MdBadge,
    MdTrendingUp, MdPieChart, MdTimeline
} from 'react-icons/md';

const HRWorkProgress: React.FC = () => {
    const [hrStats] = useState([
        { id: 1, activity: 'Open Requisitions', count: 14, trend: '+2 this week', icon: MdAssignmentInd, color: '#3b82f6' },
        { id: 2, activity: 'Onboarding Progress', count: 8, trend: '6 completed', icon: MdHowToReg, color: '#10b981' },
        { id: 3, activity: 'Total Staff Count', count: 124, trend: '+5% month', icon: MdBadge, color: '#f59e0b' },
    ]);

    const [recentHires] = useState([
        { id: 'H-001', name: 'James Wilson', role: 'Support Agent', dept: 'Operations', status: 'Hired', date: '2026-01-25' },
        { id: 'H-002', name: 'Elena Rodriguez', role: 'Team Lead', dept: 'Engineering', status: 'Verification', date: '2026-01-26' },
        { id: 'H-003', name: 'Marcus Chen', role: 'Finance Auditor', dept: 'Finance', status: 'Onboarding', date: '2026-01-27' },
    ]);

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h1>HR Operations Progress</h1>
                    <p>Oversight of talent acquisition, staff onboarding, and HR efficiency metrics.</p>
                </div>
            </header>

            <div className={styles.summaryGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {hrStats.map(stat => (
                    <div key={stat.id} className={styles.summaryCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.activity}</h3>
                                <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{stat.count}</p>
                                <span style={{ fontSize: '0.75rem', color: stat.color }}>{stat.trend}</span>
                            </div>
                            <div style={{ padding: '10px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.topSection} style={{ marginTop: '24px' }}>
                <div className={styles.graphCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#bfdbfe' }}>Recruitment Pipeline Health</h3>
                        <MdTrendingUp color="#10b981" />
                    </div>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px' }}>
                        {[65, 40, 85, 55, 90, 70, 80].map((h, i) => (
                            <div key={i} style={{ width: '30px', background: 'linear-gradient(to top, #3b82f6, #60a5fa)', height: `${h}%`, borderRadius: '6px 6px 0 0', opacity: 0.8 }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.7rem', color: '#64748b', marginTop: '10px' }}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className={styles.rightStats}>
                    <div className={styles.statBox} style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <MdPieChart size={24} color="#a855f7" />
                            <h4>Departmental Distribution</h4>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px', fontSize: '0.85rem' }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Operations</span><span>42%</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Engineering</span><span>28%</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Support</span><span>30%</span>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.statBox}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <MdTimeline size={24} color="#ec4899" />
                            <h4>Retention Rate</h4>
                        </div>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '12px', color: '#ec4899' }}>96.4%</p>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Above industry average (88%)</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableWrapper} style={{ marginTop: '24px' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>Recent Recruitment Activity</h3>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Candidate ID</th>
                            <th>Full Name</th>
                            <th>Target Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Date Applied</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentHires.map(hire => (
                            <tr key={hire.id}>
                                <td style={{ color: '#60a5fa', fontWeight: 600 }}>{hire.id}</td>
                                <td>{hire.name}</td>
                                <td>{hire.role}</td>
                                <td>{hire.dept}</td>
                                <td>
                                    <span className={`${styles.badge} ${hire.status === 'Hired' ? styles.approved : styles.pending}`}>
                                        {hire.status}
                                    </span>
                                </td>
                                <td>{hire.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HRWorkProgress;
