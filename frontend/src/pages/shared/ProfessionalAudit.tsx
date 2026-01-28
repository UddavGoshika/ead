import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../admin/ContactQueries.module.css';
import { MdSecurity, MdFilterList, MdDownload } from 'react-icons/md';

interface AuditLog {
    _id: string;
    timestamp: string;
    initiator: string;
    action: string;
    target: string;
    status: 'success' | 'warning' | 'error';
}

const ProfessionalAudit: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('/api/admin/audit-logs');
                if (res.data.success) {
                    setLogs(res.data.logs);
                }
            } catch (err) {
                console.error("Error fetching audit logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Professional Audit Logs</h1>
                    <p>Immutable record of all high-privilege operations and system transitions.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtn}><MdFilterList size={18} /> Filters</button>
                    <button className={styles.actionBtn}><MdDownload size={18} /> Export Data</button>
                </div>
            </header>

            <div className={styles.gridContainer} style={{ marginTop: '24px' }}>
                <div className={styles.gridHeader}>
                    <h3><MdSecurity style={{ marginRight: '8px' }} /> Transactional Integrity Record</h3>
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    {loading ? (
                        <p style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading audit records...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>TIMESTAMP</th>
                                    <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>INITIATOR</th>
                                    <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>ACTION</th>
                                    <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>TARGET ENTITY</th>
                                    <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', fontSize: '14px' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>{log.initiator}</td>
                                        <td style={{ padding: '12px' }}>
                                            <code style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px' }}>
                                                {log.action}
                                            </code>
                                        </td>
                                        <td style={{ padding: '12px', color: '#cbd5e1' }}>{log.target}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                background: log.status === 'success' ? 'rgba(16,185,129,0.1)' : log.status === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: log.status === 'success' ? '#10b981' : log.status === 'warning' ? '#f59e0b' : '#ef4444'
                                            }}>
                                                {log.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No audit records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfessionalAudit;
