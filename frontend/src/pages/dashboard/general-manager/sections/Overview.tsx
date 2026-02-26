import React from 'react';
import { StatCard } from '../../../../components/dashboard/shared/StatCard';
import { Users, DollarSign, Activity, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Overview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Total Revenue"
                    value="₹1,245,000"
                    icon={<DollarSign size={24} />}
                    color="green"
                    trend={{ value: '12%', isPositive: true, label: 'month' }}
                />
                <StatCard
                    title="Active Staff"
                    value="142"
                    icon={<Users size={24} />}
                    color="blue"
                    trend={{ value: '4', isPositive: true, label: 'month' }}
                />
                <StatCard
                    title="System Health"
                    value="99.9%"
                    icon={<Activity size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Pending Approvals"
                    value="18"
                    icon={<FileCheck size={24} />}
                    color="yellow"
                    trend={{ value: '2', isPositive: false, label: 'week' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Revenue vs Expenses Overview</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '8px', color: '#64748b' }}>
                        [Chart Visualization Placeholder]
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: i !== 4 ? '1px solid #334155' : 'none' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }} />
                                <div>
                                    <p style={{ margin: '0 0 4px 0', color: '#e2e8f0', fontSize: '0.9rem' }}>HR Department onboarded 2 new agents.</p>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>2 hours ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Overview;
