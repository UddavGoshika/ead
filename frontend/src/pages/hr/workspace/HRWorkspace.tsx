import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../admin/ContactQueries.module.css';
import {
    MdPeopleAlt, MdTrendingUp, MdInsights,
    MdOutlineGroups, MdFlashOn, MdSecurity,
    MdInsertChartOutlined, MdMoreVert, MdPersonSearch
} from 'react-icons/md';

const HRWorkspace: React.FC = () => {
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
                console.error("Error fetching HR stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const pulseMetrics = [
        { label: 'Employee Engagement', value: stats?.hrMetrics?.engagementScore || 88, target: 95, color: '#10b981' },
        { label: 'System Retention', value: 97.4, target: 98, color: '#3b82f6' },
        { label: 'Onboarding Velocity', value: stats?.hrMetrics?.hiringPipeline || 14, target: 20, color: '#f59e0b' },
    ];

    return (
        <div className={styles.wrapper} style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', minHeight: '100vh', padding: '24px' }}>
            <header className={styles.pageHeader} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                <div className={styles.headerInfo}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '32px', background: '#ef4444', borderRadius: '4px' }} />
                        Global People Operations
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Enterprise structural health & human capital velocity matrix.</p>
                </div>
                <div className={styles.headerActions} style={{ gap: '12px' }}>
                    <button className={styles.secondaryBtn} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <MdSecurity /> ACCESS CONTROL
                    </button>
                    <button className={styles.actionBtn} onClick={() => navigate('/admin/staffs/registration')} style={{ background: '#ef4444', fontWeight: 700 }}>
                        <MdFlashOn /> QUICK ONBOARD
                    </button>
                </div>
            </header>

            {/* TOP METRIC STRIP */}
            <div className={styles.analyticsRow} style={{ marginTop: '30px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className={styles.statCard} style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdPeopleAlt size={22} />
                    </div>
                    <div className={styles.statData}>
                        <h3 style={{ fontSize: '1.8rem' }}>{loading ? '...' : (stats?.totalUsers || 0)}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Headcount</p>
                    </div>
                </div>

                <div className={styles.statCard} style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <MdTrendingUp size={22} />
                    </div>
                    <div className={styles.statData}>
                        <h3 style={{ fontSize: '1.8rem' }}>{loading ? '...' : `${stats?.hrMetrics?.attritionRate || 0}%`}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Annual Attrition</p>
                    </div>
                </div>

                <div className={styles.statCard} style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdInsights size={22} />
                    </div>
                    <div className={styles.statData}>
                        <h3 style={{ fontSize: '1.8rem' }}>{loading ? '...' : (stats?.hrMetrics?.engagementScore || 0)}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Engagement Index</p>
                    </div>
                </div>

                <div className={styles.statCard} style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.statIcon} style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdOutlineGroups size={22} />
                    </div>
                    <div className={styles.statData}>
                        <h3 style={{ fontSize: '1.8rem' }}>{loading ? '...' : (stats?.totalStaff || 0)}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Core Support Units</p>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* HEADCOUNT TREND & PULSE */}
                <div className={styles.gridContainer} style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className={styles.gridHeader} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Growth & Workforce Velocity</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Projected vs Actual Headcount Expansion.</p>
                        </div>
                        <button className={styles.secondaryBtn}><MdInsertChartOutlined /> Analytics Report</button>
                    </div>

                    <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
                        {stats?.hrMetrics?.headcountTrend?.map((val: number, idx: number) => (
                            <div key={idx} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(val / 150) * 100}%`,
                                    background: idx === 5 ? '#ef4444' : 'rgba(59, 130, 246, 0.5)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s ease'
                                }} />
                                <span style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>M{idx + 1}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: '#94a3b8' }}>Culture Diversity Mix</h4>
                                <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: '45%', background: '#3b82f6' }} />
                                    <div style={{ width: '30%', background: '#10b981' }} />
                                    <div style={{ width: '25%', background: '#f59e0b' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} /> Male (45%)</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Female (30%)</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} /> Non-Binary (25%)</span>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: '#94a3b8' }}>Strategic Engagement Pulse</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {pulseMetrics.map((m, idx) => (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                                <span>{m.label}</span>
                                                <span style={{ color: m.color, fontWeight: 700 }}>{m.value}%</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                                <div style={{ width: `${m.value}%`, height: '100%', background: m.color, borderRadius: '2px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PERSONNEL ALERTS & ACTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>HR Action Required</h3>
                            <button style={{ background: 'none', border: 'none', color: '#64748b' }}><MdMoreVert size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { title: 'Contract Renewal', name: 'Julian M.', date: 'Exp: 2 Days' },
                                { title: 'Performance Review', name: 'Sofia R.', date: 'Overdue' },
                                { title: 'Verification Needed', name: 'Marcus L.', date: 'Pending' }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.02)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.title}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Target: {item.name}</div>
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>{item.date}</span>
                                </div>
                            ))}
                        </div>
                        <button className={styles.secondaryBtn} style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>RESOLVE ALL QUEUES</button>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Personnel Quick Finder</h3>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <MdPersonSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, ID or role..."
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ flex: 1, padding: '8px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ACTIVE</button>
                            <button style={{ flex: 1, padding: '8px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>REMOTE</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRWorkspace;
