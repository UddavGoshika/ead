import React from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { MessageSquare, Phone, Mail, FileText, User } from 'lucide-react';

interface Interaction {
    id: string;
    client: string;
    type: 'Call' | 'Message' | 'Email' | 'Note';
    summary: string;
    date: string;
    priority: 'Normal' | 'High' | 'Critical';
}

const mockInteractions: Interaction[] = [
    { id: 'INT-901', client: 'Vikram Malhotra', type: 'Call', summary: 'Discussed case #4412 progress. Client satisfied.', date: 'Oct 24, 11:30 AM', priority: 'High' },
    { id: 'INT-902', client: 'Vikram Malhotra', type: 'Email', summary: 'Sent legal notice draft for review.', date: 'Oct 23, 04:15 PM', priority: 'Normal' },
    { id: 'INT-903', client: 'Ananya Rao', type: 'Note', summary: 'Follow up after hearing on Monday.', date: 'Oct 22, 10:00 AM', priority: 'Critical' },
    { id: 'INT-904', client: 'Suresh Iyer', type: 'Message', summary: 'Document verification request received.', date: 'Oct 21, 09:45 AM', priority: 'Normal' },
];

const InteractionHistory: React.FC = () => {
    const columns: Column<Interaction>[] = [
        {
            header: 'Client',
            accessor: (row: Interaction) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={12} className="text-gray-400" />
                    </div>
                    <span>{row.client}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: (row: Interaction) => {
                const icons: Record<string, React.ReactNode> = {
                    Call: <Phone size={14} className="text-blue-400" />,
                    Message: <MessageSquare size={14} className="text-green-400" />,
                    Email: <Mail size={14} className="text-yellow-400" />,
                    Note: <FileText size={14} className="text-purple-400" />
                };
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {icons[row.type]}
                        <span>{row.type}</span>
                    </div>
                );
            }
        },
        {
            header: 'Summary',
            accessor: (row: Interaction) => (
                <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {row.summary}
                </div>
            )
        },
        { header: 'Date', accessor: 'date' },
        {
            header: 'Priority',
            accessor: (row: Interaction) => (
                <span style={{
                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                    background: row.priority === 'Critical' ? '#ef444420' : row.priority === 'High' ? '#f59e0b20' : '#3b82f620',
                    color: row.priority === 'Critical' ? '#ef4444' : row.priority === 'High' ? '#f59e0b' : '#3b82f6'
                }}>
                    {row.priority}
                </span>
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Interaction History</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                        New Interaction
                    </button>
                </div>
            </div>

            <DataTable
                data={mockInteractions}
                columns={columns}
                keyExtractor={(row: Interaction) => row.id}
            />
        </div>
    );
};

export default InteractionHistory;
