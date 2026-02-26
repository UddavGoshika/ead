import React from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { Star, Shield, Award, User, ExternalLink } from 'lucide-react';

interface VIPClient {
    id: string;
    name: string;
    status: 'Platinum' | 'Gold' | 'Silver';
    activeCases: number;
    lastContact: string;
    happiness: number; // 0-100
}

const mockClients: VIPClient[] = [
    { id: 'VIP-001', name: 'Vikram Malhotra', status: 'Platinum', activeCases: 3, lastContact: '2h ago', happiness: 95 },
    { id: 'VIP-042', name: 'Ananya Rao', status: 'Gold', activeCases: 1, lastContact: '1d ago', happiness: 88 },
    { id: 'VIP-012', name: 'Suresh Iyer', status: 'Platinum', activeCases: 4, lastContact: '30m ago', happiness: 92 },
    { id: 'VIP-099', name: 'Mehta & Co.', status: 'Silver', activeCases: 2, lastContact: '3d ago', happiness: 75 },
];

const MyClients: React.FC = () => {
    const columns: Column<VIPClient>[] = [
        {
            header: 'Client Name',
            accessor: (row: VIPClient) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f620', border: '1px solid #3b82f640', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} className="text-blue-400" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.id}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row: VIPClient) => {
                const colors: Record<string, string> = { Platinum: '#94a3b8', Gold: '#fbbf24', Silver: '#94a3b8' };
                const icons: Record<string, React.ReactNode> = { Platinum: <Award size={14} />, Gold: <Star size={14} />, Silver: <Shield size={14} /> };
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors[row.status], fontWeight: 700, fontSize: '0.85rem' }}>
                        {icons[row.status]}
                        {row.status}
                    </div>
                );
            }
        },
        { header: 'Active Cases', accessor: 'activeCases' },
        { header: 'Last Contact', accessor: 'lastContact' },
        {
            header: 'CSAT',
            accessor: (row: VIPClient) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{ width: `${row.happiness}%`, height: '100%', background: row.happiness > 90 ? '#10b981' : row.happiness > 80 ? '#3b82f6' : '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{row.happiness}%</span>
                </div>
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>My VIP Clients</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        Add Client
                    </button>
                </div>
            </div>

            <DataTable
                data={mockClients}
                columns={columns}
                keyExtractor={(row: VIPClient) => row.id}
                actions={(row: VIPClient) => (
                    <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }} onClick={() => console.log(row.id)}>
                        <ExternalLink size={18} />
                    </button>
                )}
            />
        </div>
    );
};

export default MyClients;
