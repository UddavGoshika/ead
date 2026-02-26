import React from 'react';
import { StatCard } from '../../../../../components/dashboard/shared/StatCard';
import { Users, MousePointerClick, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const MarketingOverview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Total Leads"
                    value="1,245"
                    icon={<Users size={24} />}
                    color="blue"
                    trend={{ value: '18%', isPositive: true, label: 'month' }}
                />
                <StatCard
                    title="Conversion Rate"
                    value="4.2%"
                    icon={<Target size={24} />}
                    color="green"
                    trend={{ value: '0.5%', isPositive: true, label: 'month' }}
                />
                <StatCard
                    title="Click-Through Rate"
                    value="2.8%"
                    icon={<MousePointerClick size={24} />}
                    color="purple"
                    trend={{ value: '0.2%', isPositive: false, label: 'month' }}
                />
                <StatCard
                    title="ROI"
                    value="145%"
                    icon={<TrendingUp size={24} />}
                    color="yellow"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Lead Generation by Channel</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '8px', color: '#64748b' }}>
                        [Line Chart Placeholder - Social vs Search vs Direct]
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Top Performing Campaigns</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'Diwali Legal Special', leads: 450, col: '#10b981' },
                            { name: 'Corporate Retainer Ads', leads: 320, col: '#3b82f6' },
                            { name: 'Family Law Webinar', leads: 180, col: '#8b5cf6' },
                        ].map((camp, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: i !== 2 ? '1px solid #334155' : 'none' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '0.9rem' }}>{camp.name}</h4>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Active</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{camp.leads}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Leads</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MarketingOverview;
