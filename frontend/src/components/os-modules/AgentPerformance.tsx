import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from '../dashboard/shared/DataTable';
import { User } from 'lucide-react';

interface AgentStat {
    id: string;
    agent_name: string;
    tickets_closed: number;
    calls_handled: number;
    sla_score: string;
    status: string;
}

const AgentPerformance: React.FC = () => {
    const [agents, setAgents] = useState<AgentStat[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/os/agents/performance');
            if (res.data.success) {
                setAgents(res.data.performance);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (agentId: string, action: string) => {
        if (action === 'warning') alert(`Warning sent to agent ${agentId}`);
        // Add actual API call here when needed
    };

    return (
        <div style={{ padding: '20px', background: '#0f172a', minHeight: '100%' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Agent Performance & KPIs</h3>
                <DataTable
                    columns={[
                        { header: 'Agent', accessor: (a: AgentStat) => <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="#94a3b8" /> {a.agent_name}</div> },
                        { header: 'Tickets Closed', accessor: 'tickets_closed' as const },
                        { header: 'Calls Handled', accessor: 'calls_handled' as const },
                        { header: 'SLA Score', accessor: (a: AgentStat) => <span style={{ color: parseFloat(a.sla_score) < 85 ? '#f59e0b' : '#10b981' }}>{a.sla_score}</span> },
                        { header: 'Status', accessor: (a: AgentStat) => <span style={{ color: a.status === 'Active' ? '#10b981' : '#64748b' }}>{a.status}</span> },
                        {
                            header: 'Actions', accessor: (a: AgentStat) => (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleAction(a.id, 'profile')} style={btnStyle}>Profile</button>
                                    <button onClick={() => handleAction(a.id, 'warning')} style={{ ...btnStyle, color: '#f59e0b', background: '#f59e0b20' }}>Warn</button>
                                </div>
                            )
                        }
                    ]}
                    data={agents}
                    keyExtractor={(a: AgentStat) => a.id}
                />
            </div>
        </div>
    );
};

const btnStyle = { background: '#334155', border: 'none', color: '#f8fafc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default AgentPerformance;
