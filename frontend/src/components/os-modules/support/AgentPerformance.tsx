import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Target, Activity, CheckCircle, AlertOctagon } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface StateData { agent: string; tickets: number; calls: number; csat: string; status: string; }
interface SLAData { overall_compliance: string; breaches_today: number; highest_risk_agent: string; }
interface CSATData { average: string; volume: number; sentiment: string; }

const AgentPerformance: React.FC = () => {
    const [stats, setStats] = useState<StateData[]>([]);
    const [sla, setSla] = useState<SLAData | null>(null);
    const [csat, setCsat] = useState<CSATData | null>(null);
    const [range, setRange] = useState('daily');

    const fetchData = async (r: string) => {
        try {
            const [sRes, slaRes, cRes] = await Promise.all([
                axios.get(`/api/agents/stats?range=${r}`),
                axios.get('/api/agents/sla'),
                axios.get('/api/agents/csat')
            ]);
            setStats(sRes.data.data);
            setSla(slaRes.data.data);
            setCsat(cRes.data.data);
            setRange(r);
        } catch (err) {
            console.error("OS Failed to fetch Agent Performance data", err);
        }
    };

    useEffect(() => {
        fetchData('daily');
    }, []);

    const handleWarning = async (agent: string) => {
        await axios.post('/api/agents/warning', { agent });
        alert(`Warning issued to ${agent}`);
    };

    const handleBonus = async (agent: string) => {
        await axios.post('/api/agents/bonus', { agent });
        alert(`Bonus assigned to ${agent}`);
    };

    if (!sla || !csat) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Performance Data...</div>;

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <MetricCard title="Overall SLA Compliance" value={sla.overall_compliance} icon={<Target color="#10b981" />} subtitle={`${sla.breaches_today} breaches today`} />
                <MetricCard title="Average CSAT Score" value={csat.average} icon={<Award color="#3b82f6" />} subtitle={`Based on ${csat.volume} ratings`} />
                <MetricCard title="Sentiment Analysis" value={csat.sentiment} icon={<Activity color="#8b5cf6" />} subtitle={`Highest Risk: ${sla.highest_risk_agent}`} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => fetchData('daily')} style={range === 'daily' ? activeTabStyle : tabStyle}>Daily Stats</button>
                <button onClick={() => fetchData('weekly')} style={range === 'weekly' ? activeTabStyle : tabStyle}>Weekly Stats</button>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UsersIcon /> Individual Agent Metrics
                </h3>
                <DataTable
                    columns={[
                        { header: 'Agent Name', accessor: 'agent' as const },
                        { header: 'Tickets Solved', accessor: 'tickets' as const },
                        { header: 'Calls Handled', accessor: 'calls' as const },
                        { header: 'CSAT', accessor: (s: StateData) => <span style={{ color: Number(s.csat) > 9.5 ? '#10b981' : '#f59e0b' }}>{s.csat}</span> },
                        { header: 'Current Status', accessor: (s: StateData) => <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: '#334155' }}>{s.status}</span> },
                        {
                            header: 'Actions', accessor: (s: StateData) => (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleWarning(s.agent)} title="Issue Warning" style={iconBtnStyle}><AlertOctagon size={16} color="#f43f5e" /></button>
                                    <button onClick={() => handleBonus(s.agent)} title="Assign Bonus" style={iconBtnStyle}><CheckCircle size={16} color="#10b981" /></button>
                                </div>
                            )
                        }
                    ]}
                    data={stats}
                    keyExtractor={(s: StateData) => s.agent}
                />
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

const UsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const tabStyle = { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' };
const activeTabStyle = { ...tabStyle, background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' };
const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' };

export default AgentPerformance;
