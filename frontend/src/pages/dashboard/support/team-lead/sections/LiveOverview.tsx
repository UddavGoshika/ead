import React from 'react';
import { StatCard } from '../../../../../components/dashboard/shared/StatCard';
import { MessageSquare, Clock, AlertTriangle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveOverview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Live Chat Queue"
                    value="18"
                    icon={<MessageSquare size={24} />}
                    color="blue"
                    trend={{ value: 'Active', isPositive: true, label: 'now' }}
                />
                <StatCard
                    title="Avg Wait Time"
                    value="4m 12s"
                    icon={<Clock size={24} />}
                    color="yellow"
                    trend={{ value: '+30s', isPositive: false, label: 'vs avg' }}
                />
                <StatCard
                    title="SLA Breaches"
                    value="3"
                    icon={<AlertTriangle size={24} />}
                    color="red"
                    trend={{ value: 'Urgent', isPositive: false, label: 'action needed' }}
                />
                <StatCard
                    title="Online Agents"
                    value="12 / 15"
                    icon={<Users size={24} />}
                    color="green"
                    trend={{ value: '80%', isPositive: true, label: 'occupancy' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} className="text-blue-400" />
                        Queue Distribution
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'General Queries', count: 8, color: '#3b82f6' },
                            { label: 'Billing Support', count: 5, color: '#10b981' },
                            { label: 'Technical Issues', count: 3, color: '#f59e0b' },
                            { label: 'Legal Verification', count: 2, color: '#ef4444' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#94a3b8' }}>{item.label}</span>
                                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{item.count}</span>
                                </div>
                                <div style={{ height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(item.count / 18) * 100}%`, height: '100%', background: item.color }} />
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
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} className="text-green-400" />
                        Agent Status
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { name: 'Rahul S.', status: 'On Call', time: '12m', color: '#3b82f6' },
                            { name: 'Priya M.', status: 'Chatting', time: '5m', color: '#10b981' },
                            { name: 'Amit K.', status: 'Available', time: '3m', color: '#10b981' },
                            { name: 'Sana L.', status: 'Away', time: '15m', color: '#64748b' },
                            { name: 'Vikram J.', status: 'Wrap up', time: '2m', color: '#f59e0b' },
                            { name: 'Nisha R.', status: 'Break', time: '20m', color: '#ef4444' }
                        ].map((agent, i) => (
                            <div key={i} style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#f8fafc', fontWeight: 500 }}>{agent.name}</span>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: agent.color }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem' }}>
                                    <span style={{ color: '#94a3b8' }}>{agent.status}</span>
                                    <span style={{ color: '#64748b' }}>{agent.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveOverview;
