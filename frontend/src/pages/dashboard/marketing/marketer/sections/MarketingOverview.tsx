import React from 'react';
import { StatCard } from '../../../../../components/dashboard/shared/StatCard';
import { Target, TrendingUp, Users, MousePointer2, Share2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const MarketingOverview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <StatCard
                    title="Total Impressions"
                    value="1.2M"
                    icon={<Share2 size={20} />}
                    color="blue"
                    trend={{ value: '8%', isPositive: true, label: 'this week' }}
                />
                <StatCard
                    title="CTR (Avg)"
                    value="3.24%"
                    icon={<MousePointer2 size={20} />}
                    color="purple"
                />
                <StatCard
                    title="New Leads"
                    value="842"
                    icon={<Target size={20} />}
                    color="green"
                    trend={{ value: '15%', isPositive: true, label: 'vs last week' }}
                />
                <StatCard
                    title="CPC"
                    value="₹12.40"
                    icon={<TrendingUp size={20} />}
                    color="yellow"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Lead Conversion Funnel</h3>
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        {[
                            { step: 'Awareness', count: '45,000', width: '100%', color: '#3b82f6' },
                            { step: 'Interest', count: '12,500', width: '80%', color: '#6366f1' },
                            { step: 'Consideration', count: '4,200', width: '60%', color: '#8b5cf6' },
                            { step: 'Conversion', count: '842', width: '35%', color: '#10b981' },
                        ].map((item, i) => (
                            <div key={i} style={{ width: item.width, background: item.color, padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                <span>{item.step}</span>
                                <span>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Top Channels</h3>
                        <button style={{ color: '#3b82f6', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>View All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { channel: 'Meta Ads', value: 45, color: '#0668E1' },
                            { channel: 'Google Search', value: 30, color: '#EA4335' },
                            { channel: 'Direct Traffic', value: 15, color: '#10b981' },
                            { channel: 'Email Campaign', value: 10, color: '#f59e0b' },
                        ].map((channel, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                    <span style={{ color: '#94a3b8' }}>{channel.channel}</span>
                                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{channel.value}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${channel.value}%`, height: '100%', background: channel.color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>SQLs This Month</div>
                            <div style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 700 }}>142</div>
                        </div>
                        <div style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>MQL Ratio</div>
                            <div style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 700 }}>18.4%</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MarketingOverview;
