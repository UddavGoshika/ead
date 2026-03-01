import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { PhoneCall, List, Mic, PhoneForwarded, XCircle, CheckCircle } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface LiveCall { id: string; caller: string; agent: string; duration: string; status: string; }
interface QueueCall { id: string; caller: string; waitTime: string; priority: string; }

const CallControlCenter: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);
    const [queue, setQueue] = useState<QueueCall[]>([]);

    const fetchData = async () => {
        try {
            const [lRes, qRes] = await Promise.all([
                axios.get('/api/calls/live'),
                axios.get('/api/calls/queue')
            ]);
            setLiveCalls(lRes.data.data);
            setQueue(qRes.data.data);
        } catch (err) {
            console.error("OS Failed to fetch Call Center data", err);
        }
    };

    useEffect(() => {
        fetchData();

        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');

        newSocket.on('CALL_UPDATE', (data: LiveCall[]) => {
            setLiveCalls(data);
        });

        newSocket.on('CALL_QUEUE_CHANGE', (data: QueueCall[]) => {
            setQueue(data);
        });

        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    const handleAction = async (endpoint: string, id: string) => {
        await axios.post(endpoint, { callId: id });
        fetchData();
    };

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={18} color="#f59e0b" /> Waiting Queue
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Caller ID', accessor: 'caller' as const },
                            { header: 'Wait Time', accessor: 'waitTime' as const },
                            { header: 'Priority', accessor: (q: QueueCall) => <span style={{ color: q.priority === 'High' ? '#f43f5e' : '#10b981' }}>{q.priority}</span> },
                            {
                                header: 'Actions', accessor: (q: QueueCall) => (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleAction('/api/calls/accept', q.id)} title="Accept" style={iconBtnStyle}><CheckCircle size={16} color="#10b981" /></button>
                                        <button onClick={() => handleAction('/api/calls/reject', q.id)} title="Reject" style={iconBtnStyle}><XCircle size={16} color="#f43f5e" /></button>
                                    </div>
                                )
                            }
                        ]}
                        data={queue}
                        keyExtractor={(q: QueueCall) => q.id}
                    />
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PhoneCall size={18} color="#10b981" /> Live Calls
                    </h3>
                    <DataTable
                        columns={[
                            { header: 'Agent', accessor: 'agent' as const },
                            { header: 'Caller', accessor: 'caller' as const },
                            { header: 'Duration', accessor: 'duration' as const },
                            {
                                header: 'Actions', accessor: (l: LiveCall) => (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleAction('/api/calls/transfer', l.id)} title="Transfer" style={iconBtnStyle}><PhoneForwarded size={16} color="#3b82f6" /></button>
                                        <button onClick={() => handleAction('/api/calls/record', l.id)} title="Toggle Record" style={iconBtnStyle}><Mic size={16} color="#f43f5e" /></button>
                                    </div>
                                )
                            }
                        ]}
                        data={liveCalls}
                        keyExtractor={(l: LiveCall) => l.id}
                    />
                </div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Call Logs & Recordings Archive</h3>
                <p style={{ color: '#94a3b8' }}>Connects to /api/calls/logs and /api/calls/recordings endpoints (Currently Empty in Stub)</p>
            </div>

        </div>
    );
};

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' };

export default CallControlCenter;
