import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Activity, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface Metrics { active_tickets: number; unassigned: number; avg_resolution: string; csat: string; }
interface LiveStatus { system_status: string; active_sessions: number; lag: string; }
interface QueueHealth { wait_time: string; abandonment_rate: string; callers_in_queue: number; }
interface AgentStatus { online: number; on_call: number; wrap_up: number; offline: number; }

const SupportOverview: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
    const [queue, setQueue] = useState<QueueHealth | null>(null);
    const [agents, setAgents] = useState<AgentStatus | null>(null);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [mRes, lsRes, qRes, aRes] = await Promise.all([
                    axios.get('/api/support/metrics'),
                    axios.get('/api/support/live-status'),
                    axios.get('/api/support/queue-health'),
                    axios.get('/api/support/agent-status')
                ]);
                setMetrics(mRes.data.data);
                setLiveStatus(lsRes.data.data);
                setQueue(qRes.data.data);
                setAgents(aRes.data.data);
            } catch (err) {
                console.error("OS Failed to fetch Support Overview data", err);
            }
        };
        fetchInitial();

        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');

        newSocket.on('SUPPORT_QUEUE_UPDATE', (data: { count: number; waitTime: string }) => {
            setQueue(prev => prev ? { ...prev, callers_in_queue: data.count, wait_time: data.waitTime } : null);
        });

        newSocket.on('AGENT_STATUS_CHANGE', (data: AgentStatus) => {
            setAgents(data);
        });

        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    if (!metrics || !queue || !agents) return <div style={{ color: '#94a3b8', padding: '20px' }}>Loading Support Overview...</div>;

    const agentData = [
        { state: 'Online (Ready)', count: agents.online },
        { state: 'On Call', count: agents.on_call },
        { state: 'Wrap Up', count: agents.wrap_up },
        { state: 'Offline', count: agents.offline }
    ];

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <MetricCard title="Active Tickets" value={metrics.active_tickets} icon={<Activity color="#3b82f6" />} subtitle={`${metrics.unassigned} unassigned`} />
                <MetricCard title="Avg Resolution" value={metrics.avg_resolution} icon={<Clock color="#10b981" />} subtitle="SLA Target: 4.0h" />
                <MetricCard title="Live Callers" value={queue.callers_in_queue} icon={<Users color="#f59e0b" />} subtitle={`Hold: ${queue.wait_time}`} />
                <MetricCard title="CSAT Score" value={metrics.csat} icon={<CheckCircle color="#8b5cf6" />} subtitle="L7 Days Average" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="#10b981" /> Real-time Agent Status
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'State', accessor: 'state' as const },
                            { header: 'Headcount', accessor: 'count' as const }
                        ]}
                        data={agentData}
                        keyExtractor={(a) => a.state}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} color="#f59e0b" /> Queue Health & Abandonment
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: '#94a3b8' }}>Abandonment Rate</span>
                            <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>{queue.abandonment_rate}</span>
                        </div>
                        <div style={{ width: '100%', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: queue.abandonment_rate, background: '#f43f5e', height: '8px' }} />
                        </div>
                    </div>

                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="#3b82f6" /> System Status ({liveStatus?.system_status})
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Event Lag</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{liveStatus?.lag}</span>
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

export default SupportOverview;
