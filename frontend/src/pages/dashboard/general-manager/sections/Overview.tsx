import React from 'react';
import { StatCard } from '../../../../components/dashboard/shared/StatCard';
import { TrendingUp, Users, DollarSign, Activity, Calendar, ShieldCheck, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Overview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Total Revenue (YTD)"
                    value="₹4.2M"
                    icon={<DollarSign size={24} />}
                    color="green"
                    trend={{ value: '12%', isPositive: true, label: 'vs target' }}
                />
                <StatCard
                    title="Total Users"
                    value="15.2k"
                    icon={<Users size={24} />}
                    color="blue"
                    trend={{ value: '1,200', isPositive: true, label: 'new this month' }}
                />
                <StatCard
                    title="System Health"
                    value="99.9%"
                    icon={<ShieldCheck size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Avg Daily Leads"
                    value="42"
                    icon={<TrendingUp size={24} />}
                    color="yellow"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>Department Performance</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>Weekly</button>
                            <button style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', borderRadius: '6px', fontSize: '0.8rem', color: '#fff' }}>Monthly</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', height: '200px', alignItems: 'flex-end', paddingBottom: '20px' }}>
                        {[
                            { dept: 'Legal', value: 85, color: '#3b82f6' },
                            { dept: 'Finance', value: 92, color: '#10b981' },
                            { dept: 'HR', value: 78, color: '#f59e0b' },
                            { dept: 'Mktg', value: 65, color: '#a855f7' },
                            { dept: 'Ops', value: 88, color: '#ec4899' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${item.value}%` }}
                                    style={{ width: '32px', background: item.color, borderRadius: '6px 6px 0 0', opacity: 0.8 }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.dept}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <motion.div
                        style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h4 style={{ margin: '0 0 16px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} className="text-blue-400" /> Operational Alerts
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { msg: 'SLA Breach in Support (4 tickets)', type: 'high' },
                                { msg: 'Server Load high (Node-02)', type: 'medium' },
                                { msg: 'New marketing campaign live', type: 'info' },
                            ].map((alert, i) => (
                                <div key={i} style={{ padding: '10px', background: alert.type === 'high' ? '#ef444415' : alert.type === 'medium' ? '#f59e0b15' : '#3b82f615', borderRadius: '6px', fontSize: '0.8rem', color: alert.type === 'high' ? '#ef4444' : alert.type === 'medium' ? '#f59e0b' : '#3b82f6', borderLeft: `3px solid ${alert.type === 'high' ? '#ef4444' : alert.type === 'medium' ? '#f59e0b' : '#3b82f6'}` }}>
                                    {alert.msg}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        style={{ background: '#3b82f6', padding: '20px', borderRadius: '12px', color: '#fff' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <Briefcase size={20} />
                            <h4 style={{ margin: 0 }}>Executive Summary</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', opacity: 0.9 }}>
                            Revenue is up by 12% this quarter. Staff churn is down. Marketing ROAS stabilized at 3.5x. Recommend increasing budget for paid search.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
