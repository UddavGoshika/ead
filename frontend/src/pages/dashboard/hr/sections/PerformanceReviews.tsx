import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Star, User, Calendar, FileText, Send, CheckCircle } from 'lucide-react';

interface Review {
    id: string;
    employee: string;
    role: string;
    manager: string;
    status: 'Scheduled' | 'Self-Review' | 'Manager-Review' | 'Completed';
    dueDate: string;
    rating?: number;
}

const mockReviews: Review[] = [
    { id: 'REV-001', employee: 'Arjun Verma', role: 'Support Agent', manager: 'Suresh Iyer', status: 'Manager-Review', dueDate: '2024-11-05', rating: 4.5 },
    { id: 'REV-002', employee: 'Priya Das', role: 'Telecaller', manager: 'Ananya Rao', status: 'Scheduled', dueDate: '2024-11-12' },
    { id: 'REV-003', employee: 'Karan Mehra', role: 'Finance Admin', manager: 'Vikram Malhotra', status: 'Completed', dueDate: '2024-10-20', rating: 4.8 },
    { id: 'REV-004', employee: 'Sanya Khan', role: 'Data Entry', manager: 'Ananya Rao', status: 'Self-Review', dueDate: '2024-11-02' },
];

const PerformanceReviews: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<Review>[] = [
        {
            header: 'Employee',
            accessor: (row: Review) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} className="text-blue-400" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.employee}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.role}</div>
                    </div>
                </div>
            )
        },
        { header: 'Manager', accessor: 'manager' },
        {
            header: 'Status',
            accessor: (row: Review) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'Completed' ? '#10b98120' : row.status === 'Scheduled' ? '#334155' : '#3b82f620',
                    color: row.status === 'Completed' ? '#10b981' : row.status === 'Scheduled' ? '#94a3b8' : '#3b82f6'
                }}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Rating',
            accessor: (row: Review) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {row.rating ? (
                        <>
                            <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{row.rating}</span>
                        </>
                    ) : '-'}
                </div>
            )
        },
        { header: 'Due Date', accessor: 'dueDate' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Performance Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Calendar size={18} /> Trigger Annual Review
                </button>
            </div>

            <DataTable
                data={mockReviews}
                columns={columns}
                keyExtractor={(row: Review) => row.id}
                actions={(row: Review) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="View Form"><FileText size={16} /></button>
                        <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Send Reminder"><Send size={16} /></button>
                    </div>
                )}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Start Review Cycle"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Configure the peer and manager review cycle parameters.</p>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Review Cycle Name</label>
                        <input type="text" placeholder="Q4 Annual Performance Review" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Department</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                                <option>All Departments</option>
                                <option>Sales</option>
                                <option>Support</option>
                                <option>Tech</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Completion Deadline</label>
                            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Launch Cycle</button>
                    </div>
                </div>
            </ActionModal>
        </div>
    );
};

export default PerformanceReviews;
