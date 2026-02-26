import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, Eye, BookOpen } from 'lucide-react';

interface Article {
    id: string;
    title: string;
    category: string;
    author: string;
    views: number;
    lastUpdated: string;
    status: 'Published' | 'Draft' | 'Archived';
}

const mockArticles: Article[] = [
    { id: 'ART-001', title: 'Getting Started for Advocates', category: 'Onboarding', author: 'Team Lead', views: 1240, lastUpdated: '2024-10-20', status: 'Published' },
    { id: 'ART-002', title: 'How to Reset Your ID Password', category: 'Account Security', author: 'HR Manager', views: 850, lastUpdated: '2024-10-22', status: 'Published' },
    { id: 'ART-003', title: 'Understanding Refund Policies', category: 'Billing', author: 'Finance Team', views: 320, lastUpdated: '2024-10-24', status: 'Draft' },
    { id: 'ART-004', title: 'Verification Process Walkthrough', category: 'Verification', author: 'Verifier Team', views: 560, lastUpdated: '2024-09-15', status: 'Archived' },
];

const KnowledgeBase: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<Article>[] = [
        {
            header: 'Article Title',
            accessor: (row: Article) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={16} className="text-blue-400" />
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.title}</span>
                </div>
            )
        },
        { header: 'Category', accessor: 'category' },
        { header: 'Views', accessor: 'views' },
        {
            header: 'Status',
            accessor: (row: Article) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'Published' ? '#10b98120' : row.status === 'Draft' ? '#f59e0b20' : '#64748b20',
                    color: row.status === 'Published' ? '#10b981' : row.status === 'Draft' ? '#f59e0b' : '#64748b'
                }}>
                    {row.status}
                </span>
            )
        },
        { header: 'Last Updated', accessor: 'lastUpdated' }
    ];

    const renderActions = (row: Article) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Preview"><Eye size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Archive" onClick={() => console.log(row.id)}><Trash2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Knowledge Base Editor</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#3b82f6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> New Article
                </button>
            </div>

            <DataTable
                data={mockArticles}
                columns={columns}
                keyExtractor={(row: Article) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Help Article"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Article Title</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Category</label>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                            <option>Onboarding</option>
                            <option>Account Security</option>
                            <option>Billing</option>
                            <option>Legal Procedures</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Content (Markdown supported)</label>
                        <textarea rows={8} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', resize: 'none' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Save Draft</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Publish Article</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default KnowledgeBase;
