import React, { useState } from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../../components/dashboard/shared/ActionModal';
import { Plus, Edit2, Trash2, Link, Copy } from 'lucide-react';

interface AdCampaign {
    id: string;
    adSet: string;
    platform: string;
    clicks: number;
    impressions: number;
    cpa: number;
    status: 'Live' | 'Review' | 'Stopped';
}

const mockAds: AdCampaign[] = [
    { id: 'AD-101', adSet: 'Retargeting Audience A', platform: 'Facebook', clicks: 1450, impressions: 45000, cpa: 120, status: 'Live' },
    { id: 'AD-102', adSet: 'Search - Legal Keywords', platform: 'Google Ads', clicks: 890, impressions: 12000, cpa: 250, status: 'Live' },
    { id: 'AD-103', adSet: 'B2B LinkedIn Cold', platform: 'LinkedIn', clicks: 120, impressions: 5000, cpa: 850, status: 'Review' },
    { id: 'AD-104', adSet: 'Instagram Reels Video', platform: 'Instagram', clicks: 3200, impressions: 150000, cpa: 45, status: 'Stopped' },
];

const MyCampaigns: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (val: number) => `₹${val}`;

    const columns: Column<AdCampaign>[] = [
        { header: 'Ad Set Name', accessor: (row) => <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.adSet}</span> },
        { header: 'Platform', accessor: 'platform' },
        { header: 'Impressions', accessor: (row) => row.impressions.toLocaleString() },
        { header: 'Clicks', accessor: (row) => <strong style={{ color: '#3b82f6' }}>{row.clicks.toLocaleString()}</strong> },
        { header: 'CPA', accessor: (row) => formatCurrency(row.cpa) },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    'Live': { bg: '#10b98120', text: '#10b981' },
                    'Review': { bg: '#facc1520', text: '#facc15' },
                    'Stopped': { bg: '#ef444420', text: '#ef4444' }
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

    const renderActions = (row: AdCampaign) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px' }} title="Copy UTM Link"><Copy size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Go to Ad Platform"><Link size={16} /></button>
            <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Ad Sets & Tracking</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#3b82f6', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Generate UTM Link
                </button>
            </div>

            <DataTable
                data={mockAds}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Generate Tracking Link"
            >
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Target URL</label>
                        <input type="url" placeholder="https://eadvocate.in/" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Campaign Source (utm_source)</label>
                        <input type="text" placeholder="e.g. google, facebook" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Campaign Medium (utm_medium)</label>
                        <input type="text" placeholder="e.g. cpc, banner, email" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Campaign Name (utm_campaign)</label>
                        <input type="text" placeholder="e.g. summer_sale" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Generate & Copy</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default MyCampaigns;
