import React from 'react';
import { StatCard } from '../../../../components/dashboard/shared/StatCard';
import { Users, UserPlus, FileText, TrendingUp, Filter, UserCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const HROverview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Total Headcount"
                    value="124"
                    icon={<Users size={24} />}
                    color="blue"
                    trend={{ value: '4', isPositive: true, label: 'new joiners' }}
                />
                <StatCard
                    title="Open Positions"
                    value="18"
                    icon={<UserPlus size={24} />}
                    color="green"
                />
                <StatCard
                    title="Avg Attrition"
                    value="2.4%"
                    icon={<TrendingUp size={24} />}
                    color="yellow"
                />
                <StatCard
                    title="Pending Reviews"
                    value="12"
                    icon={<FileText size={24} />}
                    color="red"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>Hiring Funnel</h3>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Last 30 Days</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { step: 'Applied', count: 450, color: '#3b82f6', width: '100%' },
                            { step: 'Screening', count: 120, color: '#6366f1', width: '70%' },
                            { step: 'Interviews', count: 45, color: '#a855f7', width: '45%' },
                            { step: 'Offer Sent', count: 12, color: '#ec4899', width: '25%' },
                            { step: 'Hired', count: 8, color: '#10b981', width: '15%' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '100px', fontSize: '0.85rem', color: '#94a3b8' }}>{item.step}</div>
                                <div style={{ flex: 1, height: '32px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: item.width }}
                                        style={{ height: '100%', background: item.color, display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }}
                                    >
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{item.count}</span>
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc' }}>Employee Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { dept: 'Support', count: 45, percent: 36 },
                            { dept: 'Operations', count: 38, percent: 30 },
                            { dept: 'Sales & Mktg', count: 22, percent: 18 },
                            { dept: 'Management', count: 19, percent: 16 },
                        ].map((dept, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                    <span style={{ color: '#94a3b8' }}>{dept.dept}</span>
                                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{dept.count} Members</span>
                                </div>
                                <div style={{ height: '6px', background: '#0f172a', borderRadius: '3px' }}>
                                    <div style={{ width: `${dept.percent}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '32px', padding: '20px', background: '#3b82f610', borderRadius: '12px', border: '1px dashed #3b82f630' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', fontWeight: 600, marginBottom: '8px' }}>
                            <UserCheck size={18} /> Recruitment Alert
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            You have <span style={{ color: '#fff' }}>4 pending interviews</span> this afternoon. Check your schedule.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HROverview;
