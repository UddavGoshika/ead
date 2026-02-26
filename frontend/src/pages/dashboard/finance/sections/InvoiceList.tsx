import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, Send, Download } from 'lucide-react';

interface Invoice {
    id: string;
    clientId: string;
    clientName: string;
    amount: number;
    date: string;
    dueDate: string;
    status: 'Paid' | 'Pending' | 'Overdue';
}

const mockInvoices: Invoice[] = [
    { id: 'INV-2024-001', clientId: 'CLI-001', clientName: 'Acme Corp', amount: 45000, date: '2024-10-01', dueDate: '2024-10-15', status: 'Paid' },
    { id: 'INV-2024-002', clientId: 'CLI-042', clientName: 'Global Tech', amount: 12500, date: '2024-10-10', dueDate: '2024-10-24', status: 'Pending' },
    { id: 'INV-2024-003', clientId: 'CLI-018', clientName: 'Stark Industries', amount: 89000, date: '2024-09-15', dueDate: '2024-09-29', status: 'Overdue' },
    { id: 'INV-2024-004', clientId: 'CLI-099', clientName: 'Wayne Enterprises', amount: 250000, date: '2024-10-12', dueDate: '2024-10-26', status: 'Pending' },
];

const Invoices: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    const columns: Column<Invoice>[] = [
        { header: 'Invoice ID', accessor: (row) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.id}</span> },
        { header: 'Client', accessor: 'clientName' },
        { header: 'Amount', accessor: (row) => formatCurrency(row.amount) },
        { header: 'Date', accessor: 'date' },
        { header: 'Due Date', accessor: 'dueDate' },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'Paid': { bg: '#10b98120', text: '#10b981' },
                    'Pending': { bg: '#facc1520', text: '#facc15' },
                    'Overdue': { bg: '#ef444420', text: '#ef4444' }
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
        }
    ];

    const renderActions = (row: Invoice) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Send Reminder"><Send size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Download PDF"><Download size={16} /></button>
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Invoices & Billing</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#3b82f6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Create Invoice
                </button>
            </div>

            <DataTable
                data={mockInvoices}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Invoice"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Client Name</label>
                            <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Amount (₹)</label>
                            <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Invoice Date</label>
                            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Due Date</label>
                            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Description</label>
                        <textarea rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Generate Invoice</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default Invoices;
