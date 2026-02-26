import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { ShieldCheck, CheckCircle, XCircle, FileSearch, Download } from 'lucide-react';

interface VerificationTask {
    id: string;
    profileName: string;
    profileType: 'Advocate' | 'Legal Provider';
    submittedDate: string;
    status: 'Pending' | 'In Review' | 'Flagged';
}

const mockTasks: VerificationTask[] = [
    { id: 'VER-1001', profileName: 'Ravi Kumar', profileType: 'Advocate', submittedDate: '2024-10-24 09:15 AM', status: 'Pending' },
    { id: 'VER-1002', profileName: 'Priya Sharma', profileType: 'Legal Provider', submittedDate: '2024-10-24 10:30 AM', status: 'In Review' },
    { id: 'VER-1003', profileName: 'Amit Singh', profileType: 'Advocate', submittedDate: '2024-10-23 04:45 PM', status: 'Flagged' },
];

const VerificationQueue: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<VerificationTask>[] = [
        { header: 'Task ID', accessor: (row) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.id}</span> },
        {
            header: 'Profile',
            accessor: (row) => (
                <div>
                    <div>{row.profileName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.profileType}</div>
                </div>
            )
        },
        { header: 'Submitted', accessor: 'submittedDate' },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'Pending': { bg: '#334155', text: '#cbd5e1' },
                    'In Review': { bg: '#3b82f620', text: '#3b82f6' },
                    'Flagged': { bg: '#ef444420', text: '#ef4444' }
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

    const renderActions = (row: VerificationTask) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                onClick={() => setIsModalOpen(true)}
                style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                title="Review Documents"
            >
                <FileSearch size={16} />
            </button>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Approve Fast"><CheckCircle size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Reject"><XCircle size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Verification Queue</h2>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <ShieldCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    {mockTasks.length} tasks needing attention
                </div>
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
                title="Review Profile Documents"
                width="700px"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem' }}>Applicant Name</p>
                            <p style={{ margin: 0, color: '#f8fafc', fontWeight: 500 }}>Ravi Kumar</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem' }}>Bar Council Number</p>
                            <p style={{ margin: 0, color: '#f8fafc', fontWeight: 500 }}>MAH/1234/2015</p>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: '#f8fafc', margin: '0 0 12px 0' }}>Uploaded Documents</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { name: 'ID Proof (Aadhar)', status: 'Pending Review' },
                                { name: 'Bar Council License', status: 'Pending Review' },
                                { name: 'Law Degree Certificate', status: 'Pending Review' }
                            ].map((doc, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '12px', border: '1px solid #334155', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileSearch size={18} color="#94a3b8" />
                                        <span style={{ color: '#f8fafc' }}>{doc.name}</span>
                                    </div>
                                    <button style={{ background: '#334155', border: 'none', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        <Download size={14} /> View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Verifier Notes (Optional)</label>
                        <textarea rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} placeholder="Add notes if rejecting or flagging..."></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>Reject Profile</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#facc15', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>Flag for Review</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Approve Verified</button>
                    </div>
                </div>
            </ActionModal>
        </div>
    );
};

export default VerificationQueue;
