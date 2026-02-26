import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from './HROverview.module.css';

const TimeOffAttendance: React.FC = () => {
    const [activeTab, setActiveTab] = useState('requests');

    const mockRequests = [
        { id: '1', employee: 'John Doe', type: 'Annual Leave', dates: 'Oct 28 - Nov 5', days: 8, status: 'Pending' },
        { id: '2', employee: 'Jane Smith', type: 'Sick Leave', dates: 'Oct 25 - Oct 26', days: 2, status: 'Approved' },
        { id: '3', employee: 'Mike Johnson', type: 'Personal', dates: 'Nov 12', days: 1, status: 'Pending' },
        { id: '4', employee: 'Sarah Williams', type: 'Maternity', dates: 'Dec 1 - Mar 1', days: 90, status: 'Approved' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' };
            case 'Pending': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' };
            case 'Rejected': return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' };
            default: return { color: '#94a3b8', background: 'transparent' };
        }
    };

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>PTO & Attendance</h2>
                    <p className={styles.sectionSubtitle}>Manage leave workflows, track attendance, and view schedules.</p>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Leave Requests
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'attendance' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    Daily Attendance Grid
                </button>
            </div>

            {activeTab === 'requests' && (
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Pending & Recent Leave Requests</h3>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.customTable}>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>Date Range</th>
                                    <th>Days</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className={styles.heavyCell}>{req.employee}</td>
                                        <td>{req.type}</td>
                                        <td><div className={styles.flexCell}><Calendar size={14} /> {req.dates}</div></td>
                                        <td>{req.days} days</td>
                                        <td>
                                            <span className={styles.statusBadge} style={getStatusStyle(req.status)}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {req.status === 'Pending' ? (
                                                <div className={styles.actionRow}>
                                                    <button className={styles.iconBtnSuccess} title="Approve"><CheckCircle size={18} /></button>
                                                    <button className={styles.iconBtnDanger} title="Reject"><XCircle size={18} /></button>
                                                </div>
                                            ) : (
                                                <span className={styles.mutedText}>Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>Today's Attendance Overview</h3>
                        <span className={styles.dateLabel}>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className={styles.attendanceGrid}>
                        {/* Placeholder for attendance grid UI */}
                        <div className={styles.attendanceStats}>
                            <div className={styles.statBox}>
                                <h4>Total Staff</h4>
                                <p>154</p>
                            </div>
                            <div className={styles.statBox} style={{ borderColor: '#10b981' }}>
                                <h4 style={{ color: '#10b981' }}>Present</h4>
                                <p>142</p>
                            </div>
                            <div className={styles.statBox} style={{ borderColor: '#ef4444' }}>
                                <h4 style={{ color: '#ef4444' }}>Absent</h4>
                                <p>4</p>
                            </div>
                            <div className={styles.statBox} style={{ borderColor: '#f59e0b' }}>
                                <h4 style={{ color: '#f59e0b' }}>On Leave</h4>
                                <p>8</p>
                            </div>
                        </div>

                        <div className={styles.emptyStateContainer} style={{ padding: '40px' }}>
                            <Clock size={48} color="#334155" style={{ marginBottom: '16px' }} />
                            <p style={{ color: '#94a3b8' }}>Detailed attendance grid will populate upon backend integration.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeOffAttendance;
