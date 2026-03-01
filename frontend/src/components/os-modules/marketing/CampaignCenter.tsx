import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone, DollarSign, Activity, Percent } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface Campaign { id: string; name: string; budget: number; spent: number; leads: number; }
interface Budget { total_budget: number; utilized: number; remaining: number; }
interface Conversions { visitors: number; signups: number; paid_conversions: number; rate: string; }

const CampaignCenter: React.FC = () => {
    const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
    const [pausedCampaigns, setPausedCampaigns] = useState<Campaign[]>([]);
    const [budget, setBudget] = useState<Budget | null>(null);
    const [conversions, setConversions] = useState<Conversions | null>(null);

    const fetchData = async () => {
        try {
            const [aRes, pRes, bRes, cRes] = await Promise.all([
                axios.get('/api/marketing/campaigns?status=active'),
                axios.get('/api/marketing/campaigns?status=paused'),
                axios.get('/api/marketing/budget'),
                axios.get('/api/marketing/conversions')
            ]);
            setActiveCampaigns(aRes.data.data);
            setPausedCampaigns(pRes.data.data);
            setBudget(bRes.data.data);
            setConversions(cRes.data.data);
        } catch (err) {
            console.error("OS Failed to fetch Campaign Center data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const togglePause = async (id: string, active: boolean) => {
        // We'll use the pause endpoint for both pausing and unpausing in this mock scenario
        await axios.patch('/api/marketing/campaign/pause', { campaignId: id, pause: active });
        fetchData();
    };

    const adjustBudget = async (id: string) => {
        const amt = prompt('Enter new daily budget:');
        if (amt) {
            await axios.patch('/api/marketing/campaign/budget', { campaignId: id, budget: Number(amt) });
            fetchData();
        }
    };

    if (!budget || !conversions) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Campaign Center...</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <MetricCard title="Total Budget" value={formatCurrency(budget.total_budget)} icon={<DollarSign color="#10b981" />} subtitle={`Remaining: ${formatCurrency(budget.remaining)}`} />
                <MetricCard title="Total Visitors" value={conversions.visitors.toLocaleString()} icon={<Activity color="#3b82f6" />} subtitle={`Signups: ${conversions.signups.toLocaleString()}`} />
                <MetricCard title="Paid Conversions" value={conversions.paid_conversions.toLocaleString()} icon={<DollarSign color="#8b5cf6" />} subtitle="LTV Optimized" />
                <MetricCard title="Conversion Rate" value={conversions.rate} icon={<Percent color="#f59e0b" />} subtitle="Sitewide Average" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Megaphone size={18} color="#10b981" /> Active Campaigns
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Campaign Name', accessor: 'name' as const },
                            { header: 'Spent / Budget', accessor: (c: Campaign) => `${formatCurrency(c.spent)} / ${formatCurrency(c.budget)}` },
                            { header: 'Leads Gen', accessor: 'leads' as const },
                            {
                                header: 'Actions', accessor: (c: Campaign) => (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => togglePause(c.id, true)} style={{ ...btnStyle, background: '#f59e0b20', color: '#f59e0b' }}>Pause</button>
                                        <button onClick={() => adjustBudget(c.id)} style={btnStyle}>Budget</button>
                                    </div>
                                )
                            }
                        ]}
                        data={activeCampaigns}
                        keyExtractor={(c: Campaign) => c.id}
                    />
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Megaphone size={18} color="#64748b" /> Paused Campaigns
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Campaign Name', accessor: 'name' as const },
                            { header: 'Spent / Budget', accessor: (c: Campaign) => `${formatCurrency(c.spent)} / ${formatCurrency(c.budget)}` },
                            { header: 'Leads Gen', accessor: 'leads' as const },
                            {
                                header: 'Actions', accessor: (c: Campaign) => (
                                    <button onClick={() => togglePause(c.id, false)} style={{ ...btnStyle, background: '#10b98120', color: '#10b981' }}>Resume</button>
                                )
                            }
                        ]}
                        data={pausedCampaigns}
                        keyExtractor={(c: Campaign) => c.id}
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

export default CampaignCenter;
