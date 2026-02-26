import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    status: 'Active' | 'On Leave' | 'Terminated';
}

const mockEmployees: Employee[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@company.com', department: 'Operations', role: 'Telecaller', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Support', role: 'Call Support', status: 'On Leave' },
    { id: '3', name: 'Mike Johnson', email: 'mike.j@company.com', department: 'Marketing', role: 'Marketer', status: 'Active' },
    { id: '4', name: 'Sarah Williams', email: 'sarah.w@company.com', department: 'Finance', role: 'Accountant', status: 'Terminated' },
];

const EmployeeDirectory: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<Employee>[] = [
        {
            header: 'Employee',
            accessor: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Mail size={12} /> {row.email}
                    </div>
                </div>
            )
        },
        { header: 'Department', accessor: 'department' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Status',
            accessor: (row) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500,
                    background: row.status === 'Active' ? '#10b98120' : row.status === 'On Leave' ? '#facc1520' : '#ef444420',
                    color: row.status === 'Active' ? '#10b981' : row.status === 'On Leave' ? '#facc15' : '#ef4444'
                }}>
                    {row.status}
                </span>
            )
        }
    ];

    const renderActions = (row: Employee) => (
        <>
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
        </>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Employee Directory</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#3b82f6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            <DataTable
                data={mockEmployees}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Employee"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>First Name</label>
                            <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Last Name</label>
                            <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Email Address</label>
                        <input type="email" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Department</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                                <option>Operations</option>
                                <option>Support</option>
                                <option>Marketing</option>
                                <option>Finance</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Role</label>
                            <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Save Employee</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default EmployeeDirectory;
