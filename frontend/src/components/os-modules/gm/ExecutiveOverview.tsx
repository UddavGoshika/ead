import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { TrendingUp, Users, AlertTriangle, Building2, DollarSign } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface RevenueData { mrr: number; arr: number; net_retention: string; churn_rate: string; historic: { month: string; value: number }[]; }
interface GrowthData { new_users: number; active_users: number; expansion_revenue: number; conversion_rate: string; }
interface DeptData { name: string; score: number; status: string; }
interface RiskData { id: string; title: string; severity: string; date: string; }

const ExecutiveOverview: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [growth, setGrowth] = useState<GrowthData | null>(null);
    const [departments, setDepartments] = useState<DeptData[]>([]);
    const [risks, setRisks] = useState<RiskData[]>([]);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [rRes, gRes, dRes, riskRes] = await Promise.all([
                    axios.get('/api/executive/revenue'),
                    axios.get('/api/executive/growth'),
                    axios.get('/api/executive/departments'),
                    axios.get('/api/executive/risk')
                ]);
                setRevenue(rRes.data.data);
                setGrowth(gRes.data.data);
                setDepartments(dRes.data.data);
                setRisks(riskRes.data.data);
            } catch (err) {
                console.error("OS Failed to fetch GM data:", err);
            }
        };
        fetchInitial();

        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');

        newSocket.on('REVENUE_UPDATE', (data: { daily: number }) => {
            setRevenue(prev => prev ? { ...prev, mrr: prev.mrr + (data.daily / 30) } : null);
        });

        newSocket.on('RISK_ALERT', (data: { level: string; type: string }) => {
            setRisks(prev => [{
                id: Math.random().toString(),
                title: `Realtime Alert: ${data.type}`,
                severity: data.level,
                date: new Date().toISOString()
            }, ...prev]);
        });

        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    if (!revenue || !growth) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Executive Overview...</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* KPI METRICS ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <MetricCard title="MRR Snapshot" value={formatCurrency(revenue.mrr)} icon={<DollarSign color="#10b981" />} subtitle={`Net Retention: ${revenue.net_retention}`} />
                <MetricCard title="Active User Base" value={growth.active_users.toLocaleString()} icon={<Users color="#3b82f6" />} subtitle={`+${growth.new_users} recent conversions`} />
                <MetricCard title="ARR" value={formatCurrency(revenue.arr)} icon={<TrendingUp color="#8b5cf6" />} subtitle={`Expansion: ${formatCurrency(growth.expansion_revenue)}`} />
                <MetricCard title="Global Churn" value={revenue.churn_rate} icon={<AlertTriangle color="#f59e0b" />} subtitle={`Conversion Rate: ${growth.conversion_rate}`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* DEPARTMENTS CARD */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={20} color="#94a3b8" /> Department Health
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Department', accessor: 'name' as const },
                            {
                                header: 'Performance Score', accessor: (d: DeptData) => (
                                    <div style={{ width: '100%', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${d.score}%`, background: d.score > 90 ? '#10b981' : d.score > 80 ? '#3b82f6' : '#f59e0b', height: '8px' }} />
                                    </div>
                                )
                            },
                            { header: 'Status', accessor: (d: DeptData) => <span style={{ color: d.status === 'Healthy' ? '#10b981' : '#f59e0b' }}>{d.status}</span> }
                        ]}
                        data={departments}
                        keyExtractor={(d: DeptData) => d.name}
                    />
                </div>

                {/* RISK FLAGS CARD */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={20} color="#f43f5e" /> Active Risk Flags
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Timestamp', accessor: (r: RiskData) => new Date(r.date).toLocaleTimeString() },
                            { header: 'Alert Title', accessor: 'title' as const },
                            { header: 'Severity', accessor: (r: RiskData) => <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: r.severity === 'High' ? '#f43f5e20' : '#f59e0b20', color: r.severity === 'High' ? '#f43f5e' : '#f59e0b' }}>{r.severity}</span> }
                        ]}
                        data={risks}
                        keyExtractor={(r: RiskData) => r.id}
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

export default ExecutiveOverview;
