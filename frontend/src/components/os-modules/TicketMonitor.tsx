import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { DataTable } from '../dashboard/shared/DataTable';

interface Ticket {
    id: string;
    customer: string;
    priority: string;
    status: string;
    assigned_agent: string;
    created_at: string;
}

const TicketMonitor: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchTickets();

        const newSocket = io(window.location.origin);
        newSocket.emit('os:subscribe');

        newSocket.on('TICKET_UPDATED', () => {
            fetchTickets();
        });

        setSocket(newSocket);
        return () => { newSocket.close(); };
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await axios.get('/api/os/tickets');
            if (res.data.success) {
                setTickets(res.data.tickets);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (ticketId: string, action: string) => {
        try {
            await axios.patch(`/api/os/tickets/${ticketId}/action`, { action, agentName: 'Current User' });
            fetchTickets();
        } catch (err) {
            console.error("Action error", err);
        }
    };

    const columns = ['Customer', 'Priority', 'Status', 'Assigned Agent', 'Created At', 'Actions'];

    const getPriorityColor = (p: string) => p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#3b82f6';
    const getStatusColor = (s: string) => s === 'Open' ? '#ef4444' : s === 'In Progress' ? '#facc15' : '#10b981';

    return (
        <div style={{ padding: '20px', background: '#0f172a', minHeight: '100%' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Ticket Monitor</h3>
                <DataTable
                    headers={columns}
                    data={tickets.map(t => [
                        t.customer,
                        <span style={{ color: getPriorityColor(t.priority) }}>{t.priority}</span>,
                        <span style={{ color: getStatusColor(t.status) }}>{t.status}</span>,
                        t.assigned_agent,
                        new Date(t.created_at).toLocaleDateString(),
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAction(t.id, 'assign')} style={btnStyle}>Assign</button>
                            <button onClick={() => handleAction(t.id, 'escalate')} style={btnStyle}>Escalate</button>
                            <button onClick={() => handleAction(t.id, 'close')} style={{ ...btnStyle, background: '#10b981' }}>Close</button>
                        </div>
                    ])}
                />
            </div>
        </div>
    );
};

const btnStyle = { background: '#334155', border: 'none', color: '#f8fafc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default TicketMonitor;
