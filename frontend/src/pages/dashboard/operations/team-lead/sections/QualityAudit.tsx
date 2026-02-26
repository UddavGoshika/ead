import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { Shield, CheckCircle, XCircle, Eye, MessageSquare, Star } from 'lucide-react';

interface AuditItem {
    id: string;
    type: 'Call Recording' | 'Chat Transcript' | 'Data Entry Record';
    agent: string;
    date: string;
    score?: number;
    status: 'Pending' | 'Evaluated' | 'Needs Coaching';
}

const mockAudits: AuditItem[] = [
    { id: 'QA-501', type: 'Call Recording', agent: 'Rahul Sharma', date: '2024-10-24', score: 92, status: 'Evaluated' },
    { id: 'QA-502', type: 'Chat Transcript', agent: 'Sneha Gupta', date: '2024-10-24', status: 'Pending' },
    { id: 'QA-503', type: 'Data Entry Record', agent: 'Priya Das', date: '2024-10-23', score: 75, status: 'Needs Coaching' },
    { id: 'QA-504', type: 'Call Recording', agent: 'Arjun Verma', date: '2024-10-23', score: 88, status: 'Evaluated' },
];

const QualityAudit: React.FC = () => {
    const columns: Column<AuditItem>[] = [
        {
            header: 'Evaluation Subject',
            accessor: (row: AuditItem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={16} className="text-purple-400" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.type}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.id}</div>
                    </div>
                </div>
            )
        },
        { header: 'Agent', accessor: 'agent' },
        {
            header: 'Status',
            accessor: (row: AuditItem) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'Evaluated' ? '#10b98120' : row.status === 'Needs Coaching' ? '#ef444420' : '#f59e0b20',
                    color: row.status === 'Evaluated' ? '#10b981' : row.status === 'Needs Coaching' ? '#ef4444' : '#f59e0b'
                }}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Score',
            accessor: (row: AuditItem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {row.score ? (
                        <>
                            <div style={{ height: '24px', width: '24px', borderRadius: '50%', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>
                                {row.score}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 100</span>
                        </>
                    ) : '-'}
                </div>
            )
        },
        { header: 'Date', accessor: 'date' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Quality Assurance & Audits</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '2px' }}>
                        <button style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem' }}>High Risk</button>
                        <button style={{ padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '6px', fontSize: '0.8rem' }}>Random Sample</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {[
                    { label: 'Avg Quality Score', value: '88.4%', icon: <Star size={18} />, color: '#3b82f6' },
                    { label: 'Audits Completed', value: '142', icon: <CheckCircle size={18} />, color: '#10b981' },
                    { label: 'Coaching Required', value: '8', icon: <MessageSquare size={18} />, color: '#ef4444' },
                    { label: 'Pending Audits', value: '24', icon: <Eye size={18} />, color: '#f59e0b' },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: stat.color, marginBottom: '8px' }}>
                            {stat.icon}
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <DataTable
                data={mockAudits}
                columns={columns}
                keyExtractor={(row: AuditItem) => row.id}
                actions={(row: AuditItem) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Review Item"><Eye size={16} /></button>
                        <button style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer', padding: '4px' }} title="Add Coaching Note"><MessageSquare size={16} /></button>
                    </div>
                )}
            />
        </div>
    );
};

export default QualityAudit;
