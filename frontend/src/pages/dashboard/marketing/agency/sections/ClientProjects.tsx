import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, FileText, CheckCircle } from 'lucide-react';

interface Project {
    id: string;
    client: string;
    campaignType: string;
    budget: number;
    deadline: string;
    status: 'In Progress' | 'Review Ready' | 'Completed';
}

const mockProjects: Project[] = [
    { id: 'PRJ-24-001', client: 'Eadvocate Corporate', campaignType: 'SEO Remodel', budget: 150000, deadline: '2024-11-15', status: 'In Progress' },
    { id: 'PRJ-24-002', client: 'Legal Team A', campaignType: 'PPC Management', budget: 75000, deadline: '2024-10-30', status: 'Review Ready' },
    { id: 'PRJ-24-003', client: 'Family Law Dept', campaignType: 'Content Strategy', budget: 45000, deadline: '2024-10-10', status: 'Completed' },
];

const ClientProjects: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    const columns: Column<Project>[] = [
        { header: 'Project ID', accessor: (row) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.id}</span> },
        { header: 'Client/Department', accessor: 'client' },
        { header: 'Campaign Focus', accessor: 'campaignType' },
        { header: 'Allocated Budget', accessor: (row) => formatCurrency(row.budget) },
        { header: 'Deadline', accessor: 'deadline' },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'In Progress': { bg: '#3b82f620', text: '#3b82f6' },
                    'Review Ready': { bg: '#facc1520', text: '#facc15' },
                    'Completed': { bg: '#10b98120', text: '#10b981' }
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

    const renderActions = (row: Project) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Submit for Review"><CheckCircle size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px' }} title="View Brief"><FileText size={16} /></button>
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Managed Projects</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#8b5cf6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> New Project
                </button>
            </div>

            <DataTable
                data={mockProjects}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Agency Project"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Client / Department</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Campaign Focus</label>
                        <input type="text" placeholder="e.g. SEO, PPC, Content" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Budget</label>
                            <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Deadline</label>
                            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Project Brief Summary</label>
                        <textarea rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Save Project</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default ClientProjects;
