import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { CheckSquare, Calendar, Phone, Mail, Plus } from 'lucide-react';

interface AssistantTask {
    id: string;
    description: string;
    lawyerName: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    status: 'Pending' | 'Completed';
}

const mockTasks: AssistantTask[] = [
    { id: 'TSK-101', description: 'Reschedule meeting with Client A. Sharma', lawyerName: 'Adv. Mehta', priority: 'High', dueDate: 'Today, 2:00 PM', status: 'Pending' },
    { id: 'TSK-102', description: 'Follow up on document submission for Case #402', lawyerName: 'Adv. Singh', priority: 'Medium', dueDate: 'Tomorrow', status: 'Pending' },
    { id: 'TSK-103', description: 'Send contract draft to TechCorp', lawyerName: 'Adv. Mehta', priority: 'High', dueDate: 'Today, 5:00 PM', status: 'Completed' },
];

const AssistantTasks: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<AssistantTask>[] = [
        {
            header: 'Task Description',
            accessor: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" checked={row.status === 'Completed'} readOnly style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                    <span style={{ color: row.status === 'Completed' ? '#64748b' : '#f8fafc', textDecoration: row.status === 'Completed' ? 'line-through' : 'none' }}>{row.description}</span>
                </div>
            )
        },
        { header: 'Assigned Lawyer', accessor: (row) => <span style={{ color: '#8b5cf6', fontWeight: 500 }}>{row.lawyerName}</span> },
        {
            header: 'Priority',
            accessor: (row) => (
                <span style={{
                    color: row.priority === 'High' ? '#ef4444' : row.priority === 'Medium' ? '#facc15' : '#10b981',
                    fontSize: '0.8rem', fontWeight: 600
                }}>
                    {row.priority}
                </span>
            )
        },
        { header: 'Due By', accessor: (row) => <span style={{ color: '#94a3b8' }}>{row.dueDate}</span> }
    ];

    const renderActions = (row: AssistantTask) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Call Client"><Phone size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Email Client"><Mail size={16} /></button>
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#facc15', cursor: 'pointer', padding: '4px' }} title="Reschedule"><Calendar size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>To-Do List</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#8b5cf6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Task
                </button>
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
                title="Create Assistant Task"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Task Description</label>
                        <input type="text" placeholder="e.g. Call client to remind about hearing..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>For Lawyer</label>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                            <option>Adv. Anita Mehta</option>
                            <option>Adv. Vikram Singh</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Priority</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Due Date</label>
                            <input type="datetime-local" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', colorScheme: 'dark' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Add Task</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default AssistantTasks;
