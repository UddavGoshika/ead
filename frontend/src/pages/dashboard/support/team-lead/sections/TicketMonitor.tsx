import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { User, Flag, ArrowUpRight, Filter, AlertTriangle } from 'lucide-react';
import { EscalationModal } from '../../shared/EscalationModal';

interface Ticket {
    id: string;
    customer: string;
    subject: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Open' | 'Pending' | 'Closed' | 'Escalated';
    assignedTo: string;
    lastActive: string;
}

const mockTickets: Ticket[] = [
    { id: 'TKT-1001', customer: 'Ramesh Kumar', subject: 'Login issue on mobile app', priority: 'High', status: 'Escalated', assignedTo: 'Rahul S.', lastActive: '5m ago' },
    { id: 'TKT-1002', customer: 'Sita Sharma', subject: 'Refund request for billing error', priority: 'Medium', status: 'Pending', assignedTo: 'Priya M.', lastActive: '12m ago' },
    { id: 'TKT-1003', customer: 'Sunil Verma', subject: 'Clarification on legal fees', priority: 'Low', status: 'Open', assignedTo: 'Unassigned', lastActive: '30m ago' },
    { id: 'TKT-1004', customer: 'Anita Desai', subject: 'VIP: Urgent case verification', priority: 'Urgent', status: 'Open', assignedTo: 'Amit K.', lastActive: '2m ago' },
];

const TicketMonitor: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEscalateOpen, setIsEscalateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const columns: Column<Ticket>[] = [
        {
            header: 'Ticket ID & Subject',
            accessor: (row: Ticket) => (
                <div style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.id}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.subject}</div>
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: (row: Ticket) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={12} className="text-gray-400" />
                    </div>
                    <span>{row.customer}</span>
                </div>
            )
        },
        {
            header: 'Priority',
            accessor: (row: Ticket) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flag size={14} style={{ color: row.priority === 'Urgent' ? '#ef4444' : row.priority === 'High' ? '#f59e0b' : '#3b82f6' }} />
                    <span style={{ color: row.priority === 'Urgent' ? '#ef4444' : row.priority === 'High' ? '#f59e0b' : '#3b82f6', fontWeight: 500 }}>{row.priority}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row: Ticket) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'Escalated' ? '#ef444420' : row.status === 'Pending' ? '#f59e0b20' : '#10b98120',
                    color: row.status === 'Escalated' ? '#ef4444' : row.status === 'Pending' ? '#f59e0b' : '#10b981'
                }}>
                    {row.status}
                </span>
            )
        },
        { header: 'Assigned To', accessor: 'assignedTo' },
        { header: 'Last Active', accessor: 'lastActive' }
    ];

    const handleView = (row: Ticket) => {
        setSelectedTicket(row);
        setIsModalOpen(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Ticket Monitor</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} /> Filters
                    </button>
                    <button style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                        Export Data
                    </button>
                </div>
            </div>

            <DataTable
                data={mockTickets}
                columns={columns}
                keyExtractor={(row: Ticket) => row.id}
                actions={(row: Ticket) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => handleView(row)}
                            style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                            title="View Details"
                        >
                            <ArrowUpRight size={18} />
                        </button>
                        <button
                            onClick={() => { setSelectedTicket(row); setIsEscalateOpen(true); }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Escalate"
                        >
                            <AlertTriangle size={18} />
                        </button>
                    </div>
                )}
            />

            <EscalationModal
                isOpen={isEscalateOpen}
                onClose={() => setIsEscalateOpen(false)}
                ticketId={selectedTicket?.id || ''}
                onEscalate={(level, reason) => {
                    console.log(`Escalated ${selectedTicket?.id} to Level ${level} for: ${reason}`);
                    setIsEscalateOpen(false);
                }}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Ticket Details: ${selectedTicket?.id}`}
            >
                {selectedTicket && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ marginBottom: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>Subject</div>
                            <div style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedTicket.subject}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>Customer</label>
                                <div style={{ color: '#f8fafc' }}>{selectedTicket.customer}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>Assigned Agent</label>
                                <select style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}>
                                    <option>{selectedTicket.assignedTo}</option>
                                    <option>Rahul S.</option>
                                    <option>Priya M.</option>
                                    <option>Amit K.</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>Internal Note</label>
                            <textarea
                                placeholder="Add instructions for the agent..."
                                style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', resize: 'none' }}
                                rows={4}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                            <button style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                )}
            </ActionModal>
        </div>
    );
};

export default TicketMonitor;
