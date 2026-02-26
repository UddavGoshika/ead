import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Plus, Check, X, FileText, Upload, Filter, Receipt } from 'lucide-react';

interface Expense {
    id: string;
    description: string;
    category: 'Travel' | 'Software' | 'Rent' | 'Miscellaneous';
    amount: string;
    submittedBy: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

const mockExpenses: Expense[] = [
    { id: 'EXP-101', description: 'AWS Hosting Fees', category: 'Software', amount: '₹12,400', submittedBy: 'Tech Team', date: '2024-10-24', status: 'Pending' },
    { id: 'EXP-102', description: 'Client Lunch - Bangalore', category: 'Travel', amount: '₹3,500', submittedBy: 'Sales Lead', date: '2024-10-23', status: 'Approved' },
    { id: 'EXP-103', description: 'Office Rent - Oct', category: 'Rent', amount: '₹85,000', submittedBy: 'HR', date: '2024-10-20', status: 'Approved' },
    { id: 'EXP-104', description: 'New Keyboard & Mouse', category: 'Miscellaneous', amount: '₹2,200', submittedBy: 'Data Entry', date: '2024-10-22', status: 'Rejected' },
];

const Expenses: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

    const columns: Column<Expense>[] = [
        {
            header: 'Description',
            accessor: (row: Expense) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Receipt size={16} className="text-blue-400" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.description}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {row.id}</div>
                    </div>
                </div>
            )
        },
        { header: 'Category', accessor: 'category' },
        {
            header: 'Amount',
            accessor: (row: Expense) => <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{row.amount}</span>
        },
        { header: 'Submitted By', accessor: 'submittedBy' },
        {
            header: 'Status',
            accessor: (row: Expense) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'Approved' ? '#10b98120' : row.status === 'Rejected' ? '#ef444420' : '#f59e0b20',
                    color: row.status === 'Approved' ? '#10b981' : row.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                }}>
                    {row.status}
                </span>
            )
        },
        { header: 'Date', accessor: 'date' }
    ];

    const handleBatchAction = (action: 'approve' | 'reject') => {
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)}ing ${selectedExpenses.length} expenses`);
        setSelectedExpenses([]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Expense Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedExpenses.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
                            <button
                                onClick={() => handleBatchAction('approve')}
                                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Check size={16} /> Approve ({selectedExpenses.length})
                            </button>
                            <button
                                onClick={() => handleBatchAction('reject')}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <X size={16} /> Reject
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> New Expense
                    </button>
                </div>
            </div>

            <DataTable
                data={mockExpenses}
                columns={columns}
                keyExtractor={(row: Expense) => row.id}
                actions={(row: Expense) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="View Receipt"><FileText size={16} /></button>
                        {row.status === 'Pending' && (
                            <>
                                <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Quick Approve"><Check size={16} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Reject"><X size={16} /></button>
                            </>
                        )}
                    </div>
                )}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Submit New Expense"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Description</label>
                        <input type="text" placeholder="e.g. Flight to Bangalore" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Category</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                                <option>Travel</option>
                                <option>Software</option>
                                <option>Rent</option>
                                <option>Miscellaneous</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Amount (₹)</label>
                            <input type="number" placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Attach Receipt</label>
                        <div style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', color: '#64748b' }}>
                            <Upload size={32} style={{ marginBottom: '12px' }} />
                            <div>Click or drag to upload receipt (PDF, PNG, JPG)</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Submit Expense</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default Expenses;
