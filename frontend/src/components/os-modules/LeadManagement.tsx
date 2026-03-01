import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { DataTable } from '../dashboard/shared/DataTable';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    source: string;
    status: string;
    assigned_agent: string;
    conversion_probability: string;
}

const LeadManagement: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchLeads();
        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');
        newSocket.on('LEAD_UPDATED', fetchLeads);
        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/api/os/leads');
            if (res.data.success) {
                setLeads(res.data.leads);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (leadId: string, action: string) => {
        try {
            if (action === 'delete') {
                await axios.delete(`/api/os/leads/${leadId}`);
            } else {
                await axios.patch(`/api/os/leads/${leadId}/action`, { action, agentName: 'Current User' });
            }
            fetchLeads();
        } catch (err) {
            console.error("Action error", err);
        }
    };

    const columns = ['Name', 'Phone', 'Source', 'Status', 'Assigned To', 'Probability', 'Actions'];

    return (
        <div style={{ padding: '20px', background: '#0f172a', minHeight: '100%' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Lead Management Pipeline</h3>
                <DataTable
                    columns={[
                        { header: 'Name', accessor: 'name' as const },
                        { header: 'Phone', accessor: 'phone' as const },
                        { header: 'Source', accessor: 'source' as const },
                        { header: 'Status', accessor: (l: Lead) => <span style={{ color: l.status === 'Converted' ? '#10b981' : '#3b82f6' }}>{l.status}</span> },
                        { header: 'Assigned To', accessor: 'assigned_agent' as const },
                        { header: 'Probability', accessor: 'conversion_probability' as const },
                        {
                            header: 'Actions', accessor: (l: Lead) => (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleAction(l.id, 'assign')} style={btnStyle}>Assign</button>
                                    <button onClick={() => handleAction(l.id, 'convert')} style={{ ...btnStyle, color: '#10b981', background: '#10b98120' }}>Convert</button>
                                    <button onClick={() => handleAction(l.id, 'delete')} style={{ ...btnStyle, color: '#ef4444', background: '#ef444420' }}>Drop</button>
                                </div>
                            )
                        }
                    ]}
                    data={leads}
                    keyExtractor={(l: Lead) => l.id}
                />
            </div>
        </div>
    );
};

const btnStyle = { background: '#334155', border: 'none', color: '#f8fafc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default LeadManagement;
