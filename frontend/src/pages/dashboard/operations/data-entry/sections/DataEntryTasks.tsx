import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { CheckSquare, Edit2, Archive, PlayCircle } from 'lucide-react';

interface EntryTask {
    id: string;
    batchName: string;
    type: 'Lead Capture' | 'KYC Doc' | 'Court Order';
    recordsTotal: number;
    recordsCompleted: number;
    deadline: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
}

const mockTasks: EntryTask[] = [
    { id: 'BAT-4091', batchName: 'Offline Seminar Leads Delhi', type: 'Lead Capture', recordsTotal: 450, recordsCompleted: 120, deadline: 'Today, 5:00 PM', status: 'In Progress' },
    { id: 'BAT-4092', batchName: 'Advocate IDs Verification', type: 'KYC Doc', recordsTotal: 85, recordsCompleted: 0, deadline: 'Tomorrow, 12:00 PM', status: 'Not Started' },
    { id: 'BAT-4093', batchName: 'Mumbai High Court Orders', type: 'Court Order', recordsTotal: 12, recordsCompleted: 12, deadline: 'Oct 23, 2024', status: 'Completed' },
];

const DataEntryTasks: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<EntryTask>[] = [
        { header: 'Batch ID', accessor: (row) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.id}</span> },
        {
            header: 'Batch Details',
            accessor: (row) => (
                <div>
                    <span style={{ color: '#f8fafc', display: 'block' }}>{row.batchName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{row.type}</span>
                </div>
            )
        },
        {
            header: 'Progress',
            accessor: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, background: '#334155', height: '6px', borderRadius: '3px', overflow: 'hidden', minWidth: '100px' }}>
                        <div style={{ width: `${(row.recordsCompleted / row.recordsTotal) * 100}%`, height: '100%', background: row.status === 'Completed' ? '#10b981' : '#3b82f6' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.recordsCompleted}/{row.recordsTotal}</span>
                </div>
            )
        },
        { header: 'Deadline', accessor: 'deadline' },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'Not Started': { bg: '#334155', text: '#cbd5e1' },
                    'In Progress': { bg: '#3b82f620', text: '#3b82f6' },
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

    const renderActions = (row: EntryTask) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            {row.status !== 'Completed' ? (
                <button style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', cursor: 'pointer', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <PlayCircle size={14} /> Start
                </button>
            ) : (
                <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Archive Archive"><Archive size={16} /></button>
            )}
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Edit Details"><Edit2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Assigned Data Batches</h2>
            </div>

            <DataTable
                data={mockTasks}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Data Entry Console (Mock)"
                width="800px"
            >
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                    Data Entry Form Interface goes here.
                </div>
            </ActionModal>
        </div>
    );
};

export default DataEntryTasks;
