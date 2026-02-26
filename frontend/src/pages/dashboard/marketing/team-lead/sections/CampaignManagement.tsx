import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, BarChart2, PlayCircle, PauseCircle } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    platform: string;
    budget: number;
    spent: number;
    leads: number;
    status: 'Active' | 'Paused' | 'Completed';
}

const mockCampaigns: Campaign[] = [
    { id: 'CMP-001', name: 'Q4 B2B Target', platform: 'LinkedIn', budget: 50000, spent: 12500, leads: 42, status: 'Active' },
    { id: 'CMP-002', name: 'Family Law Retargeting', platform: 'Facebook', budget: 20000, spent: 19800, leads: 156, status: 'Active' },
    { id: 'CMP-003', name: 'Google Search Top KWs', platform: 'Google Ads', budget: 100000, spent: 45000, leads: 310, status: 'Active' },
    { id: 'CMP-004', name: 'Summer Special Offers', platform: 'Instagram', budget: 15000, spent: 15000, leads: 89, status: 'Completed' },
    { id: 'CMP-005', name: 'Email Nurture Sequence', platform: 'Mailchimp', budget: 5000, spent: 1200, leads: 15, status: 'Paused' },
];

const Campaigns: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    const columns: Column<Campaign>[] = [
        { header: 'Campaign Name', accessor: (row) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.name}</span> },
        { header: 'Platform', accessor: 'platform' },
        {
            header: 'Budget / Spent',
            accessor: (row) => (
                <div>
                    <span style={{ color: '#f8fafc' }}>{formatCurrency(row.budget)}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '8px' }}>({formatCurrency(row.spent)} spent)</span>
                </div>
            )
        },
        { header: 'Leads Generated', accessor: (row) => <strong style={{ color: '#3b82f6' }}>{row.leads}</strong> },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'Active': { bg: '#10b98120', text: '#10b981' },
                    'Paused': { bg: '#facc1520', text: '#facc15' },
                    'Completed': { bg: '#334155', text: '#cbd5e1' }
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

    const renderActions = (row: Campaign) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px' }} title="View Metrics"><BarChart2 size={16} /></button>
            {row.status === 'Active' ? (
                <button style={{ background: 'transparent', border: 'none', color: '#facc15', cursor: 'pointer', padding: '4px' }} title="Pause"><PauseCircle size={16} /></button>
            ) : row.status === 'Paused' ? (
                <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Resume"><PlayCircle size={16} /></button>
            ) : null}
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Campaign Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#3b82f6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> New Campaign
                </button>
            </div>

            <DataTable
                data={mockCampaigns}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Campaign"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Campaign Name</label>
                        <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Platform</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                                <option>Google Ads</option>
                                <option>Facebook</option>
                                <option>LinkedIn</option>
                                <option>Instagram</option>
                                <option>Twitter (X)</option>
                                <option>Email/Mailchimp</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Total Budget (₹)</label>
                            <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Start Date</label>
                            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>End Date</label>
                            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Target Audience Notes</label>
                        <textarea rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Launch Campaign</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default Campaigns;
