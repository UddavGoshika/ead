import React from 'react';
import { StatCard } from '../../../../../components/dashboard/shared/StatCard';
import { MessageSquare, Clock, Headphones, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SupportOverview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Active Tickets"
                    value="156"
                    icon={<MessageSquare size={24} />}
                    color="blue"
                    trend={{ value: '12', isPositive: false, label: 'yesterday' }}
                />
                <StatCard
                    title="Avg Response Time"
                    value="2.4m"
                    icon={<Clock size={24} />}
                    color="yellow"
                    trend={{ value: '0.5m', isPositive: true, label: 'week' }}
                />
                <StatCard
                    title="Active Calls"
                    value="8"
                    icon={<Headphones size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Resolution Rate"
                    value="94%"
                    icon={<CheckCircle size={24} />}
                    color="green"
                    trend={{ value: '1%', isPositive: true, label: 'month' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>Top Performing Agents</h3>
                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer' }}>View All</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'Sarah Jenkins', solved: 45, rating: '4.9/5' },
                            { name: 'Mike Ross', solved: 38, rating: '4.8/5' },
                            { name: 'Anita Patel', solved: 34, rating: '4.7/5' },
                        ].map((agent, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: i !== 2 ? '1px solid #334155' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {agent.name.charAt(0)}
                                    </div>
                                    <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{agent.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#10b981' }}>{agent.solved} Solved</span>
                                    <span style={{ color: '#facc15' }}>⭐ {agent.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Ticket Volume Analysis</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '8px', color: '#64748b' }}>
                        [Bar Chart Placeholder - Tickets by Hour]
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SupportOverview;
