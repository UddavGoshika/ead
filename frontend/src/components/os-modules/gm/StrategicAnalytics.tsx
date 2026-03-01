import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface ForecastData { projected_q4_revenue: number; confidence_interval: string; key_drivers: string[]; }
interface CashflowData { operating_cash: number; burn_rate: number; runway: string; }
interface ExpenseData { category: string; amount: number; }
interface SubData { enterprise: number; pro: number; basic: number; upgrade_velocity: string; }

const StrategicAnalytics: React.FC = () => {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [cashflow, setCashflow] = useState<CashflowData | null>(null);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubData | null>(null);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [fRes, cRes, eRes, sRes] = await Promise.all([
                    axios.get('/api/executive/forecast'),
                    axios.get('/api/executive/cashflow'),
                    axios.get('/api/executive/expenses'),
                    axios.get('/api/executive/subscriptions')
                ]);
                setForecast(fRes.data.data);
                setCashflow(cRes.data.data);
                setExpenses(eRes.data.data);
                setSubscriptions(sRes.data.data);
            } catch (err) {
                console.error("OS Failed to fetch Strategic Analytics:", err);
            }
        };
        fetchInitial();
    }, []);

    if (!forecast || !cashflow || !subscriptions) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Strategic Analytics...</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <MetricCard title="Projected Revenue" value={formatCurrency(forecast.projected_q4_revenue)} icon={<TrendingDown color="#10b981" />} subtitle={`Confidence: ${forecast.confidence_interval}`} />
                <MetricCard title="Operating Cash" value={formatCurrency(cashflow.operating_cash)} icon={<DollarSign color="#3b82f6" />} subtitle={`Runway: ${cashflow.runway}`} />
                <MetricCard title="Monthly Burn Rate" value={formatCurrency(cashflow.burn_rate)} icon={<Activity color="#f43f5e" />} subtitle="Stabilized" />
                <MetricCard title="Upgrade Velocity" value={subscriptions.upgrade_velocity} icon={<PieChart color="#8b5cf6" />} subtitle={`Enterprise: ${subscriptions.enterprise}`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* EXPENSE LOGS CARD */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Expense Analysis</h3>
                    <DataTable
                        columns={[
                            { header: 'Category', accessor: 'category' as const },
                            { header: 'Amount', accessor: (e: ExpenseData) => formatCurrency(e.amount) }
                        ]}
                        data={expenses}
                        keyExtractor={(e: ExpenseData) => e.category}
                    />
                </div>

                {/* DRIVERS LOGS CARD */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Strategic Drivers & Subscription Health</h3>
                    <div style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '12px' }}>
                        <strong>Key Drivers:</strong> {forecast.key_drivers.join(', ')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pro Tier</div>
                            <div style={{ fontSize: '1.2rem', color: '#3b82f6' }}>{subscriptions.pro.toLocaleString()}</div>
                        </div>
                        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Basic Tier</div>
                            <div style={{ fontSize: '1.2rem', color: '#10b981' }}>{subscriptions.basic.toLocaleString()}</div>
                        </div>
                    </div>
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

export default StrategicAnalytics;
