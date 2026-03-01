import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { PhoneCall, PhoneOff, MicOff, Pause, GitMerge, Voicemail } from 'lucide-react';
import { DataTable } from '../dashboard/shared/DataTable';

interface CallItem {
    id: string;
    caller_id: string;
    timestamp: string;
}

const CallQueue: React.FC = () => {
    const [queue, setQueue] = useState<CallItem[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchQueue();
        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');
        newSocket.on('CALL_QUEUE_UPDATE', fetchQueue);
        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await axios.get('/api/os/calls/queue');
            if (res.data.success) {
                setQueue(res.data.queueCalls.map((c: any) => ({
                    id: c._id,
                    caller_id: c.caller?.email || 'Unknown',
                    timestamp: c.timestamp
                })));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleControl = async (action: string) => {
        try {
            if (queue.length > 0) {
                await axios.post('/api/os/calls/action', { callId: queue[0].id, action });
                fetchQueue();
            }
        } catch (err) {
            console.error("Control error", err);
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1, background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Incoming Call Queue</h3>
                <DataTable
                    columns={[
                        { header: 'Caller ID', accessor: 'caller_id' as const },
                        { header: 'Waiting Since', accessor: (c: CallItem) => new Date(c.timestamp).toLocaleTimeString() },
                        { header: 'Priority', accessor: (c: CallItem, i?: number) => <span style={{ color: queue.indexOf(c) === 0 ? '#ef4444' : '#facc15' }}>{queue.indexOf(c) === 0 ? 'High' : 'Normal'}</span> }
                    ]}
                    data={queue}
                    keyExtractor={(c: CallItem) => c.id}
                />
            </div>

            <div style={{ width: '320px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: '#f8fafc' }}>Terminal Controls</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <ControlBtn icon={<PhoneCall />} label="Accept" onClick={() => handleControl('accept')} color="#10b981" />
                    <ControlBtn icon={<PhoneOff />} label="Reject" onClick={() => handleControl('reject')} color="#ef4444" />
                    <ControlBtn icon={<MicOff />} label="Mute" onClick={() => handleControl('mute')} />
                    <ControlBtn icon={<Pause />} label="Hold" onClick={() => handleControl('hold')} />
                    <ControlBtn icon={<GitMerge />} label="Transfer" onClick={() => handleControl('transfer')} />
                    <ControlBtn icon={<Voicemail />} label="Record" onClick={() => handleControl('record')} />
                </div>
            </div>
        </div>
    );
};

const ControlBtn: React.FC<{ icon: any, label: string, onClick: () => void, color?: string }> = ({ icon, label, onClick, color = '#64748b' }) => (
    <button onClick={onClick} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '16px', background: '#0f172a', border: `1px solid ${color}`, borderRadius: '8px',
        color: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s'
    }}
        onMouseEnter={e => e.currentTarget.style.background = '#334155'}
        onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
    >
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
    </button>
);

export default CallQueue;
