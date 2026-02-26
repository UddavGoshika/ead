import React from 'react';
import { StatCard } from '../../../../components/dashboard/shared/StatCard';
import { DollarSign, FileText, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const FinanceOverview: React.FC = () => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const revenueData = [45, 52, 48, 61, 55, 68];
    const expenseData = [32, 38, 35, 42, 39, 45];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <StatCard
                    title="Revenue (MTD)"
                    value="₹2,45,000"
                    icon={<DollarSign size={20} />}
                    color="green"
                    trend={{ value: '12%', isPositive: true, label: 'vs last month' }}
                />
                <StatCard
                    title="Total OpEx"
                    value="₹1,12,000"
                    icon={<Wallet size={20} />}
                    color="red"
                    trend={{ value: '5%', isPositive: false, label: 'vs last month' }}
                />
                <StatCard
                    title="Net Burn Rate"
                    value="₹45,000"
                    icon={<TrendingUp size={20} />}
                    color="blue"
                />
                <StatCard
                    title="Runway"
                    value="18 Months"
                    icon={<AlertCircle size={20} />}
                    color="yellow"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>Cashflow Visualization</h3>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Revenue
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f43f5e' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} /> Expenses
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', gap: '20px' }}>
                        {months.map((month, i) => (
                            <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: '200px' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${revenueData[i]}%` }}
                                        style={{ width: '12px', background: '#10b981', borderRadius: '4px 4px 0 0' }}
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${expenseData[i]}%` }}
                                        style={{ width: '12px', background: '#f43f5e', borderRadius: '4px 4px 0 0' }}
                                    />
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '8px' }}>{month}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc' }}>AR Aging Buckets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: 'Current (< 30d)', value: '₹4,50,000', percent: 65, color: '#10b981' },
                            { label: '31 - 60 Days', value: '₹1,20,000', percent: 20, color: '#f59e0b' },
                            { label: '61 - 90 Days', value: '₹45,000', percent: 10, color: '#ef4444' },
                            { label: '90+ Days', value: '₹15,000', percent: 5, color: '#7c3aed' },
                        ].map((bucket, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                    <span style={{ color: '#94a3b8' }}>{bucket.label}</span>
                                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{bucket.value}</span>
                                </div>
                                <div style={{ height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${bucket.percent}%` }}
                                        style={{ height: '100%', background: bucket.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <AlertCircle size={16} className="text-red-400" />
                            Action Required
                        </div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
                            3 high-value invoices are approaching 90+ days. Follow up recommended.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FinanceOverview;
