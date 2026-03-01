import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { DataTable } from '../../dashboard/shared/DataTable';

interface Ticket { id: string; subject: string; user: string; priority: string; status: string; sla: string; }

const TicketManagement: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filter, setFilter] = useState('all');

    const fetchTickets = async (scope: string) => {
        try {
            const res = await axios.get(`/api/tickets?scope=${scope}`);
            setTickets(res.data.data);
            setFilter(scope);
        } catch (err) {
            console.error("OS Failed to fetch Tickets", err);
        }
    };

    useEffect(() => {
        fetchTickets('all');
    }, []);

    const handleAssign = async (id: string) => {
        await axios.patch('/api/tickets/assign', { ticketId: id });
        fetchTickets(filter);
    };

    const handleClose = async (id: string) => {
        await axios.patch('/api/tickets/close', { ticketId: id });
        fetchTickets(filter);
    };

    const handleEscalate = async (id: string) => {
        await axios.patch('/api/tickets/escalate', { ticketId: id });
        fetchTickets(filter);
    };

    return (
        <div style={{ padding: '24px', background: '#0f172a', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => fetchTickets('all')} style={filter === 'all' ? activeTabStyle : tabStyle}>All Tickets</button>
                <button onClick={() => fetchTickets('priority')} style={filter === 'priority' ? activeTabStyle : tabStyle}>Priority Tickets</button>
                <button onClick={() => fetchTickets('sla_risk')} style={filter === 'sla_risk' ? activeTabStyle : tabStyle}>SLA Risk</button>
                <button onClick={() => fetchTickets('escalated')} style={filter === 'escalated' ? activeTabStyle : tabStyle}>Escalated</button>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="#3b82f6" /> Ticket Command Center
                </h3>
                <DataTable
                    columns={[
                        { header: 'Ticket ID', accessor: 'id' as const },
                        { header: 'Subject', accessor: 'subject' as const },
                        { header: 'Priority', accessor: (t: Ticket) => <span style={{ color: t.priority === 'High' ? '#f43f5e' : t.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>{t.priority}</span> },
                        { header: 'Status', accessor: 'status' as const },
                        { header: 'SLA Status', accessor: (t: Ticket) => <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: t.sla === 'Danger' ? '#f43f5e20' : '#10b98120', color: t.sla === 'Danger' ? '#f43f5e' : '#10b981' }}>{t.sla}</span> },
                        {
                            header: 'Actions', accessor: (t: Ticket) => (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleAssign(t.id)} title="Assign" style={iconBtnStyle}><UsersIcon /></button>
                                    <button onClick={() => handleEscalate(t.id)} title="Escalate" style={iconBtnStyle}><AlertCircle size={16} color="#f59e0b" /></button>
                                    <button onClick={() => handleClose(t.id)} title="Close" style={iconBtnStyle}><CheckCircle size={16} color="#10b981" /></button>
                                </div>
                            )
                        }
                    ]}
                    data={tickets}
                    keyExtractor={(t: Ticket) => t.id}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ marginBottom: '16px', color: '#f8fafc' }}>Quick Stats</h3>
                    <p style={{ color: '#94a3b8' }}>Total Tickets in View: {tickets.length}</p>
                </div>
            </div>
        </div>
    );
};

const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const tabStyle = { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' };
const activeTabStyle = { ...tabStyle, background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' };
const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' };

export default TicketManagement;
