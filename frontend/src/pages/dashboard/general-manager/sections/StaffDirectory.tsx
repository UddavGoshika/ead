import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface StaffMember {
    id: string;
    name: string;
    department: string;
    role: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    joinedDate: string;
}

const mockStaff: StaffMember[] = [
    { id: '1', name: 'Alice Smith', department: 'HR', role: 'HR Manager', status: 'Active', joinedDate: '2023-01-15' },
    { id: '2', name: 'Bob Johnson', department: 'Finance', role: 'Finance Lead', status: 'Active', joinedDate: '2022-11-01' },
    { id: '3', name: 'Charlie Davis', department: 'Marketing', role: 'Marketing Team Lead', status: 'On Leave', joinedDate: '2023-05-20' },
    { id: '4', name: 'Diana Prince', department: 'Support', role: 'Support Team Lead', status: 'Active', joinedDate: '2024-02-10' },
];

const StaffManagement: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<StaffMember>[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Department', accessor: 'department' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Status',
            accessor: (row) => (
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    background: row.status === 'Active' ? '#10b98120' : row.status === 'On Leave' ? '#facc1520' : '#ef444420',
                    color: row.status === 'Active' ? '#10b981' : row.status === 'On Leave' ? '#facc15' : '#ef4444'
                }}>
                    {row.status}
                </span>
            )
        },
        { header: 'Joined', accessor: 'joinedDate' }
    ];

    const renderActions = (row: StaffMember) => (
        <>
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
        </>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Department Heads & Leads</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#facc15', color: '#0f172a', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Manager
                </button>
            </div>

            <DataTable
                data={mockStaff}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Manager / Lead"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Full Name</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Department</label>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                            <option>HR</option>
                            <option>Finance</option>
                            <option>Marketing</option>
                            <option>Support</option>
                            <option>Operations</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Role</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#facc15', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>Save Staff</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default StaffManagement;
