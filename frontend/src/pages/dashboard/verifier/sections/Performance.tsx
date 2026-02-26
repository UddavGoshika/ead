import React from 'react';
import { StatCard } from '../../../../components/dashboard/shared/StatCard';
import { CheckCircle, Clock, Zap, AlertCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifierPerformance: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Avg Processing Time"
                    value="14m 20s"
                    icon={<Clock size={24} />}
                    color="blue"
                    trend={{ value: '2m', isPositive: true, label: 'faster' }}
                />
                <StatCard
                    title="Daily Throughput"
                    value="42 Items"
                    icon={<Zap size={24} />}
                    color="green"
                    trend={{ value: '15%', isPositive: true, label: 'week' }}
                />
                <StatCard
                    title="Rejection Rate"
                    value="8.4%"
                    icon={<AlertCircle size={24} />}
                    color="yellow"
                />
                <StatCard
                    title="Quality Score"
                    value="99.2%"
                    icon={<CheckCircle size={24} />}
                    color="green"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc' }}>Verification Trends</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', gap: '15px' }}>
                        {[65, 45, 75, 85, 60, 95, 80].map((h, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    style={{ width: '100%', background: '#3b82f6', borderRadius: '4px 4px 0 0', opacity: 0.8 }}
                                />
                                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc' }}>Common Rejection Reasons</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { reason: 'Invalid ID Format', count: 142, percent: 45 },
                            { reason: 'Blurry Photo', count: 86, percent: 28 },
                            { reason: 'Document Expired', count: 42, percent: 15 },
                            { reason: 'Name Mismatch', count: 32, percent: 12 },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '12px', background: '#0f172a', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{item.reason}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.count}</span>
                                </div>
                                <div style={{ height: '4px', background: '#334155', borderRadius: '2px' }}>
                                    <div style={{ width: `${item.percent}%`, height: '100%', background: '#ef4444', borderRadius: '2px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifierPerformance;
