import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { MessageSquare, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';

interface SupportTicket {
    id: string;
    subject: string;
    customerName: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Resolved';
    timeCreated: string;
}

const mockTickets: SupportTicket[] = [
    { id: 'TCK-9041', subject: 'Payment Failed but Deducted', customerName: 'Rajesh Verma', priority: 'High', status: 'Open', timeCreated: '10 mins ago' },
    { id: 'TCK-9042', subject: 'How to upload documents?', customerName: 'Sneha Patel', priority: 'Low', status: 'In Progress', timeCreated: '1 hr ago' },
    { id: 'TCK-9043', subject: 'Consultation link not working', customerName: 'Vikram Singh', priority: 'High', status: 'Open', timeCreated: '2 hrs ago' },
    { id: 'TCK-9044', subject: 'Invoice Request', customerName: 'TechCorp India', priority: 'Medium', status: 'Resolved', timeCreated: '1 day ago' },
];

const TicketQueue: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<SupportTicket>[] = [
        { header: 'Ticket #', accessor: (row) => <span style={{ fontWeight: 600, color: '#3b82f6' }}>{row.id}</span> },
        {
            header: 'Subject & Customer',
            accessor: (row) => (
                <div>
                    <span style={{ color: '#f8fafc', display: 'block' }}>{row.subject}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.customerName}</span>
                </div>
            )
        },
        {
            header: 'Priority',
            accessor: (row) => (
                <span style={{
                    color: row.priority === 'High' ? '#ef4444' : row.priority === 'Medium' ? '#facc15' : '#10b981',
                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600
                }}>
                    {row.priority === 'High' && <AlertCircle size={14} />}
                    {row.priority}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'Open': { bg: '#ef444420', text: '#ef4444' },
                    'In Progress': { bg: '#facc1520', text: '#facc15' },
                    'Resolved': { bg: '#10b98120', text: '#10b981' }
                };
                const color = colors[row.status];

                return (
                    <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500,
                        background: color.bg, color: color.text
                    }}>
                        {row.status}
                    </span>
                );
            }
        },
        { header: 'Time', accessor: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}><Clock size={14} /> {row.timeCreated}</span> }
    ];

    const renderActions = (row: SupportTicket) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', cursor: 'pointer', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                Reply
            </button>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Mark Resolved"><CheckCircle size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Support Ticket Queue</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '4px 12px' }}>
                        <Search size={16} color="#64748b" />
                        <input type="text" placeholder="Search ticket ID..." style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '8px', outline: 'none' }} />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: '#3b82f6', color: '#ffffff', border: 'none',
                            padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <MessageSquare size={18} /> Compose Internal Note
                    </button>
                </div>
            </div>

            <DataTable
                data={mockTickets}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Internal Note / Escalate"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Ticket ID</label>
                        <input type="text" placeholder="e.g. TCK-9041" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Note Content</label>
                        <textarea rows={4} placeholder="Add private notes for other agents or tech support..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}></textarea>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Action</label>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                            <option>Save Internal Note</option>
                            <option>Escalate to Tech Support</option>
                            <option>Escalate to Support Lead</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Submit</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default TicketQueue;
