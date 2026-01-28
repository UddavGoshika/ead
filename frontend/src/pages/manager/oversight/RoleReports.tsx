import React, { useState } from 'react';
import styles from '../managerdash.module.css';
import {
    MdAnalytics, MdGroupWork, MdFilterList,
    MdPictureAsPdf, MdIosShare, MdSearch
} from 'react-icons/md';

const RoleReports: React.FC = () => {
    const [reports] = useState([
        { id: 'REP-001', title: 'Q1 Staff Productivity Analysis', date: '2026-01-20', role: 'All Staffs', type: 'Performance', status: 'Final' },
        { id: 'REP-002', title: 'Dept. Budget Allocation Rev B', date: '2026-01-15', role: 'Finance', type: 'Financial', status: 'Draft' },
        { id: 'REP-003', title: 'System Security Audit Log', date: '2026-01-10', role: 'Admin/Manager', type: 'Security', status: 'Final' },
        { id: 'REP-004', title: 'Advocate Verification Velocity', date: '2026-01-05', role: 'Verifier', type: 'Operational', status: 'Final' },
        { id: 'REP-005', title: 'Support SLA Compliance Report', date: '2025-12-28', role: 'Support', type: 'SLA', status: 'Archived' },
    ]);

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h1>Role Intelligence & Reports</h1>
                    <p>Cross-functional intelligence reporting across all system operational roles.</p>
                </div>
            </header>

            <div className={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className={styles.searchWrapper}>
                            <MdSearch size={20} className={styles.searchIcon} />
                            <input type="text" className={styles.search} placeholder="Filter reports..." />
                        </div>
                        <button className={styles.actionButton} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <MdFilterList size={18} /> Filter
                        </button>
                    </div>
                    <button className={styles.actionButton}>
                        <MdAnalytics size={18} /> Request New Analytics
                    </button>
                </div>

                <div className={styles.summaryGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
                    <div className={styles.summaryCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Reports</h3>
                        <p style={{ fontSize: '1.6rem', marginTop: '4px' }}>42</p>
                    </div>
                    <div className={styles.summaryCard} style={{ borderLeft: '4px solid #10b981' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Intelligence Rate</h3>
                        <p style={{ fontSize: '1.6rem', marginTop: '4px' }}>94%</p>
                    </div>
                    <div className={styles.summaryCard} style={{ borderLeft: '4px solid #f59e0b' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Threads</h3>
                        <p style={{ fontSize: '1.6rem', marginTop: '4px' }}>12</p>
                    </div>
                    <div className={styles.summaryCard} style={{ borderLeft: '4px solid #a855f7' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Exported PDFs</h3>
                        <p style={{ fontSize: '1.6rem', marginTop: '4px' }}>156</p>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>Intelligence Title</th>
                                <th>Operational Role</th>
                                <th>Intel Type</th>
                                <th>Generated</th>
                                <th>State</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(rep => (
                                <tr key={rep.id}>
                                    <td style={{ color: '#64748b', fontSize: '11px' }}>{rep.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <MdGroupWork size={20} color="#60a5fa" />
                                            <strong>{rep.title}</strong>
                                        </div>
                                    </td>
                                    <td><span className={styles.roleBadge}>{rep.role}</span></td>
                                    <td style={{ color: '#94a3b8' }}>{rep.type}</td>
                                    <td>{rep.date}</td>
                                    <td>
                                        <span className={`${styles.badge} ${rep.status === 'Final' ? styles.approved : (rep.status === 'Draft' ? styles.pending : styles.deactivated)}`}>
                                            {rep.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className={styles.actionButton} title="View Profile" style={{ padding: '6px' }}>
                                                <MdPictureAsPdf size={16} />
                                            </button>
                                            <button className={styles.actionButton} title="Share" style={{ padding: '6px', background: 'rgba(255,255,255,0.05)' }}>
                                                <MdIosShare size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleReports;
