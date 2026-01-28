import React, { useState } from 'react';
import styles from '../../admin/ContactQueries.module.css';
import {
    MdPersonAdd, MdWork, MdSchedule,
    MdCheckCircle, MdCancel, MdTrendingUp,
    MdLayers, MdFilterList
} from 'react-icons/md';

const RecruitmentHub: React.FC = () => {
    const [pipeline] = useState([
        { id: 'C-001', name: 'James Wilson', role: 'Support Agent', status: 'Applied', score: 85, date: '2026-01-25' },
        { id: 'C-002', name: 'Elena Rodriguez', role: 'Team Lead', status: 'Interviewing', score: 92, date: '2026-01-26' },
        { id: 'C-003', name: 'Marcus Chen', role: 'Finance Auditor', status: 'Verification', score: 88, date: '2026-01-27' },
        { id: 'C-004', name: 'Sarah Miller', role: 'Customer Success', status: 'Offered', score: 95, date: '2026-01-28' },
    ]);

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Enterprise Recruitment Hub</h1>
                    <p>Strategic talent acquisition and automated candidate lifecycle tracking.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtn}>
                        <MdFilterList /> Talent Filter
                    </button>
                    <button className={styles.actionBtn} style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                        <MdPersonAdd /> Post Requisition
                    </button>
                </div>
            </header>

            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdWork size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>14</h3>
                        <p>Open Positions</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <MdTrendingUp size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>8 Day</h3>
                        <p>Avg. Time to Hire</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdLayers size={24} />
                    </div>
                    <div className={styles.statData}>
                        <h3>42</h3>
                        <p>Active Pipeline</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridContainer} style={{ marginTop: '24px' }}>
                <div className={styles.gridHeader}>
                    <h3>Candidate Workflow Monitoring</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {['Applied', 'Interviewing', 'Verification', 'Offered'].map(step => (
                            <div key={step} style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{step}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {pipeline.filter(c => c.status === step).map(c => (
                                        <div key={c.id} style={{
                                            padding: '12px',
                                            background: 'rgba(30, 41, 59, 0.8)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.02)',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ fontSize: '12px', fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>{c.role}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '10px', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    Match: {c.score}%
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <MdCheckCircle size={14} color="#10b981" style={{ cursor: 'pointer' }} />
                                                    <MdCancel size={14} color="#ef4444" style={{ cursor: 'pointer' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.mainCard} style={{ marginTop: '24px' }}>
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Interview Schedule (Tomorrow)</h3>
                        <button className={styles.secondaryBtn}><MdSchedule /> Full Calendar</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { time: '10:00 AM', candidate: 'Sofia Vergara', panel: 'Operations Team' },
                            { time: '02:30 PM', candidate: 'Rick Sanchez', panel: 'Data Science Division' },
                            { time: '04:15 PM', candidate: 'Jane Doe', panel: 'HR Executive' }
                        ].map((inv, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                background: 'rgba(15, 23, 42, 0.4)',
                                padding: '12px',
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, minWidth: '70px' }}>{inv.time}</div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{inv.candidate}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Panel: {inv.panel}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentHub;
