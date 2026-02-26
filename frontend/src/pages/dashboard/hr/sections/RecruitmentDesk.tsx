import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    appliedRole: string;
    stage: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Rejected';
    dateApplied: string;
}

const mockCandidates: Candidate[] = [
    { id: '1', name: 'Liam Neeson', appliedRole: 'Security Consultant', stage: 'Interview', dateApplied: '2024-02-15' },
    { id: '2', name: 'Emily Blunt', appliedRole: 'Marketing Team Lead', stage: 'Offered', dateApplied: '2024-02-10' },
    { id: '3', name: 'Ryan Gosling', appliedRole: 'Data Entry', stage: 'Screening', dateApplied: '2024-02-18' },
    { id: '4', name: 'Emma Stone', appliedRole: 'HR Assistant', stage: 'Applied', dateApplied: '2024-02-20' },
];

const Recruitment: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<Candidate>[] = [
        { header: 'Candidate Name', accessor: 'name' },
        { header: 'Applied Role', accessor: 'appliedRole' },
        {
            header: 'Stage',
            accessor: (row) => {
                const colors = {
                    'Applied': { bg: '#334155', text: '#cbd5e1' },
                    'Screening': { bg: '#8b5cf620', text: '#8b5cf6' },
                    'Interview': { bg: '#facc1520', text: '#facc15' },
                    'Offered': { bg: '#10b98120', text: '#10b981' },
                    'Rejected': { bg: '#ef444420', text: '#ef4444' },
                };
                const color = colors[row.stage] || colors['Applied'];

                return (
                    <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500,
                        background: color.bg, color: color.text
                    }}>
                        {row.stage}
                    </span>
                );
            }
        },
        { header: 'Date Applied', accessor: 'dateApplied' }
    ];

    const renderActions = (row: Candidate) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Advance Phase"><CheckCircle size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Reject"><XCircle size={16} /></button>
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Candidate Pipeline</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#10b981', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Candidate
                </button>
            </div>

            <DataTable
                data={mockCandidates}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Candidate"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Candidate Name</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Applied Role</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Initial Stage</label>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                            <option>Applied</option>
                            <option>Screening</option>
                            <option>Interview</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Add to Pipeline</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default Recruitment;
