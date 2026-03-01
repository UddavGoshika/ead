import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Phone, Users, Clock, AlertCircle } from 'lucide-react';
import { DataTable } from '../dashboard/shared/DataTable';

interface LiveCall {
    id: string;
    caller_number: string;
    intent: string;
    wait_time: string;
    status: string;
    assigned_agent: string;
}

const LiveOverview: React.FC = () => {
    const [calls, setCalls] = useState<LiveCall[]>([]);
    const [stats, setStats] = useState({ activeAgents: 0, unassignedTickets: 0, avgWait: '0:00', slaBreaches: 0 });
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchData();

        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');

        newSocket.on('CALL_STATUS_UPDATED', () => {
            fetchData();
        });

        // Mock event listeners for UI simulation
        newSocket.on('SERVER_METRIC_UPDATE', () => {
            setStats(prev => ({ ...prev, activeAgents: Math.floor(Math.random() * 20) + 5 }));
        });

        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/os/calls/live');
            if (res.data.success) {
                setCalls(res.data.liveCalls);
                // Fake stats for mockup
                setStats({
                    activeAgents: 12,
                    unassignedTickets: 4,
                    avgWait: '0:45',
                    slaBreaches: 1
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (callId: string, action: string) => {
        try {
            await axios.post('/api/os/calls/action', { callId, action });
            fetchData();
        } catch (err) {
            console.error("Action error", err);
        }
    };

    const columns = [
        { header: 'Caller Number/Email', accessor: 'caller_number' as const },
        { header: 'Intent', accessor: 'intent' as const },
        { header: 'Wait Time', accessor: 'wait_time' as const },
        { header: 'Status', accessor: (c: LiveCall) => <span style={{ color: c.status === 'ringing' ? '#f59e0b' : '#10b981' }}>{c.status}</span> },
        { header: 'Assigned Agent', accessor: 'assigned_agent' as const },
        {
            header: 'Actions', accessor: (c: LiveCall) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAction(c.id, 'force-route')} style={btnStyle}>Force Route</button>
                    <button onClick={() => handleAction(c.id, 'monitor')} style={btnStyle}>Monitor</button>
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <KpiCard icon={<Users />} title="Active Agents" value={stats.activeAgents} color="#3b82f6" />
                <KpiCard icon={<Phone />} title="Unassigned Tickets" value={stats.unassignedTickets} color="#f59e0b" />
                <KpiCard icon={<Clock />} title="Avg Wait Time" value={stats.avgWait} color="#10b981" />
                <KpiCard icon={<AlertCircle />} title="SLA Breaches" value={stats.slaBreaches} color="#ef4444" />
            </div>

            {/* Live Call Table */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Live Call Monitor</h3>
                <DataTable
                    columns={columns}
                    data={calls}
                    keyExtractor={(row: LiveCall) => row.id}
                />
            </div>

            {/* Heatmap Placeholder */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Agent Availability Heatmap (Loading Layout...)
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ icon: any, title: string, value: string | number, color: string }> = ({ icon, title, value, color }) => (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: `${color}20`, color, padding: '12px', borderRadius: '8px' }}>{icon}</div>
        <div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>{title}</div>
            <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
        </div>
    </div>
);

const btnStyle = { background: '#334155', border: 'none', color: '#f8fafc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default LiveOverview;
