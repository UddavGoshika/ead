import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Target, Users, DollarSign, BarChart2 } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface LeadSource { source: string; percentage: number; }
interface Funnel { top_of_funnel: number; marketing_qualified: number; sales_qualified: number; closed_won: number; }
interface ROI { blended_cac: string; ltv_cac_ratio: string; payback_period: string; }

const LeadIntelligence: React.FC = () => {
    const [sources, setSources] = useState<LeadSource[]>([]);
    const [funnel, setFunnel] = useState<Funnel | null>(null);
    const [roi, setRoi] = useState<ROI | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sRes, fRes, rRes] = await Promise.all([
                    axios.get('/api/marketing/lead-sources'),
                    axios.get('/api/marketing/funnel'),
                    axios.get('/api/marketing/roi')
                ]);
                setSources(sRes.data.data);
                setFunnel(fRes.data.data);
                setRoi(rRes.data.data);
            } catch (err) {
                console.error("OS Failed to fetch Lead Intelligence data:", err);
            }
        };
        fetchData();
    }, []);

    if (!funnel || !roi) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Lead Intelligence...</div>;

    const funnelData = [
        { stage: 'Top of Funnel (Visitors)', count: funnel.top_of_funnel, dropoff: '-' },
        { stage: 'Marketing Qualified (MQL)', count: funnel.marketing_qualified, dropoff: `${(100 - (funnel.marketing_qualified / funnel.top_of_funnel * 100)).toFixed(1)}%` },
        { stage: 'Sales Qualified (SQL)', count: funnel.sales_qualified, dropoff: `${(100 - (funnel.sales_qualified / funnel.marketing_qualified * 100)).toFixed(1)}%` },
        { stage: 'Closed Won', count: funnel.closed_won, dropoff: `${(100 - (funnel.closed_won / funnel.sales_qualified * 100)).toFixed(1)}%` }
    ];

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <MetricCard title="Blended CAC" value={roi.blended_cac} icon={<DollarSign color="#10b981" />} subtitle="Target: < $150" />
                <MetricCard title="LTV : CAC Ratio" value={roi.ltv_cac_ratio} icon={<BarChart2 color="#3b82f6" />} subtitle="Healthy range (> 3.0)" />
                <MetricCard title="Payback Period" value={roi.payback_period} icon={<Target color="#8b5cf6" />} subtitle="Months to break even" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={18} color="#f59e0b" /> Lead Soruces
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Source Channel', accessor: 'source' as const },
                            {
                                header: 'Volume Share', accessor: (s: LeadSource) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '100px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${s.percentage}%`, background: '#3b82f6', height: '6px' }} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.percentage}%</span>
                                    </div>
                                )
                            }
                        ]}
                        data={sources}
                        keyExtractor={(s: LeadSource) => s.source}
                    />
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="#10b981" /> Conversion Funnel Diagnostics
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Funnel Stage', accessor: 'stage' as const },
                            { header: 'Volume', accessor: (f: any) => f.count.toLocaleString() },
                            { header: 'Dropoff from Prev', accessor: (f: any) => <span style={{ color: f.dropoff === '-' ? '#64748b' : '#f43f5e' }}>{f.dropoff}</span> }
                        ]}
                        data={funnelData}
                        keyExtractor={(f: any) => f.stage}
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

export default LeadIntelligence;
