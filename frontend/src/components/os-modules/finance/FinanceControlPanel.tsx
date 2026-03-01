import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Activity, FileText, CheckCircle, Clock } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface RevenueData { total_revenue: number; monthly_recurring: number; yoy_growth: string; breakdown: { source: string; amount: number }[]; }
interface ExpenseData { total_expenses: number; burn_rate: number; breakdown: { category: string; amount: number }[]; }
interface Refund { id: string; customer: string; amount: number; reason: string; status: string; }
interface Payout { id: string; affiliate: string; amount: number; status: string; }

const FinanceControlPanel: React.FC = () => {
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [expenses, setExpenses] = useState<ExpenseData | null>(null);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);

    const fetchData = async () => {
        try {
            const [revRes, expRes, refRes, payRes] = await Promise.all([
                axios.get('/api/finance/revenue'),
                axios.get('/api/finance/expenses'),
                axios.get('/api/finance/refunds'),
                axios.get('/api/finance/payouts')
            ]);
            setRevenue(revRes.data.data);
            setExpenses(expRes.data.data);
            setRefunds(refRes.data.data);
            setPayouts(payRes.data.data);
        } catch (err) {
            console.error("OS Failed to fetch Finance data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefundAction = async (id: string) => {
        await axios.post('/api/finance/refund/approve', { refundId: id });
        fetchData(); // Re-fetch to simulate update
    };

    const handlePayoutAction = async (id: string) => {
        await axios.patch('/api/finance/payout/mark-paid', { payoutId: id });
        fetchData(); // Re-fetch
    };

    if (!revenue || !expenses) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Finance Control Panel...</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <MetricCard title="Total Revenue" value={formatCurrency(revenue.total_revenue)} icon={<DollarSign color="#10b981" />} subtitle={`YoY Growth: ${revenue.yoy_growth}`} />
                <MetricCard title="Monthly Recurring" value={formatCurrency(revenue.monthly_recurring)} icon={<Activity color="#3b82f6" />} subtitle="Stabilized" />
                <MetricCard title="Total Expenses" value={formatCurrency(expenses.total_expenses)} icon={<FileText color="#f43f5e" />} subtitle={`Burn Rate: ${formatCurrency(expenses.burn_rate)}/mo.`} />
                <MetricCard title="Pending Refunds" value={refunds.filter(r => r.status === 'Pending').length} icon={<Clock color="#f59e0b" />} subtitle="Action Required" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Refund Queue</h3>
                    <DataTable
                        columns={[
                            { header: 'ID', accessor: 'id' as const },
                            { header: 'Customer', accessor: 'customer' as const },
                            { header: 'Amount', accessor: (r: Refund) => formatCurrency(r.amount) },
                            { header: 'Status', accessor: (r: Refund) => <span style={{ color: r.status === 'Approved' ? '#10b981' : '#f59e0b' }}>{r.status}</span> },
                            { header: 'Action', accessor: (r: Refund) => r.status === 'Pending' ? <button onClick={() => handleRefundAction(r.id)} style={btnStyle}>Approve</button> : <span style={{ color: '#64748b' }}><CheckCircle size={16} /></span> }
                        ]}
                        data={refunds}
                        keyExtractor={(r: Refund) => r.id}
                    />
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Partner Payouts</h3>
                    <DataTable
                        columns={[
                            { header: 'Partner', accessor: 'affiliate' as const },
                            { header: 'Amount', accessor: (p: Payout) => formatCurrency(p.amount) },
                            { header: 'Status', accessor: (p: Payout) => <span style={{ color: p.status === 'Paid' ? '#10b981' : '#f43f5e' }}>{p.status}</span> },
                            { header: 'Action', accessor: (p: Payout) => p.status === 'Unpaid' ? <button onClick={() => handlePayoutAction(p.id)} style={btnStyle}>Mark Paid</button> : <span style={{ color: '#64748b' }}><CheckCircle size={16} /></span> }
                        ]}
                        data={payouts}
                        keyExtractor={(p: Payout) => p.id}
                    />
                </div>
            </div>

            {/* Third Row For the Required 3 Data Blocks minimum */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Revenue Breakdown</h3>
                    <DataTable
                        columns={[
                            { header: 'Source', accessor: 'source' as const },
                            { header: 'Amount', accessor: (r: any) => formatCurrency(r.amount) }
                        ]}
                        data={revenue.breakdown}
                        keyExtractor={(r: any) => r.source}
                    />
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Expense Breakdown</h3>
                    <DataTable
                        columns={[
                            { header: 'Category', accessor: 'category' as const },
                            { header: 'Amount', accessor: (e: any) => formatCurrency(e.amount) }
                        ]}
                        data={expenses.breakdown}
                        keyExtractor={(e: any) => e.category}
                    />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle: string }) => (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{title}</span>
            {icon}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</div>
    </div>
);

const btnStyle = { background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default FinanceControlPanel;
