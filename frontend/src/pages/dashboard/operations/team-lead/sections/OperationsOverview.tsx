import React from 'react';
import { StatCard } from '../../../../../components/dashboard/shared/StatCard';
import { PhoneCall, Target, TrendingUp, AlertTriangle, Zap, Clock, Users, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const OperationsOverview: React.FC = () => {
    const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'];
    const throughput = [45, 82, 98, 75, 52, 91, 110, 95];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <StatCard
                    title="Live Throughput"
                    value="95 /hr"
                    icon={<Zap size={20} />}
                    color="blue"
                    trend={{ value: '15%', isPositive: true, label: 'vs last hour' }}
                />
                <StatCard
                    title="Avg TAT"
                    value="12.4m"
                    icon={<Clock size={20} />}
                    color="green"
                />
                <StatCard
                    title="Work Backlog"
                    value="428 Items"
                    icon={<Wrench size={20} />}
                    color="yellow"
                />
                <StatCard
                    title="SLA Breaches"
                    value="4"
                    icon={<AlertTriangle size={20} />}
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
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>Real-time Throughput (Units/Hr)</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#10b98120', color: '#10b981', borderRadius: '4px' }}>Optimal Flow</span>
                        </div>
                    </div>

                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', gap: '15px' }}>
                        {hours.map((hour, i) => (
                            <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(throughput[i] / 120) * 100}%` }}
                                    style={{
                                        width: '100%',
                                        background: throughput[i] > 100 ? '#ef4444' : throughput[i] > 80 ? '#3b82f6' : '#10b981',
                                        borderRadius: '4px 4px 0 0',
                                        opacity: 0.8
                                    }}
                                />
                                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{hour}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <motion.div
                        style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={18} className="text-red-400" /> Bottleneck Indicators
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { area: 'Telecalling Queue', status: 'Congested', density: 85, color: '#ef4444' },
                                { area: 'Data Verification', status: 'Fluid', density: 32, color: '#10b981' },
                                { area: 'Account Onboarding', status: 'High Load', density: 68, color: '#f59e0b' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                        <span style={{ color: '#94a3b8' }}>{item.area}</span>
                                        <span style={{ color: item.color, fontWeight: 600 }}>{item.status}</span>
                                    </div>
                                    <div style={{ height: '4px', background: '#0f172a', borderRadius: '2px' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.density}%` }}
                                            style={{ height: '100%', background: item.color, borderRadius: '2px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', marginBottom: '12px' }}>
                            <Users size={18} className="text-blue-400" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Agent Utilization</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>38 / 42</span>
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>agents active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationsOverview;
