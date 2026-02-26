import React from 'react';
import { DataTable } from '../../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../../components/dashboard/shared/DataTable';
import { Play, Download, User } from 'lucide-react';

interface CallRecord {
    id: string;
    customer: string;
    duration: string;
    type: 'Inbound' | 'Outbound';
    date: string;
    time: string;
    recordingSize: string;
}

const mockCalls: CallRecord[] = [
    { id: 'CAL-5521', customer: 'John Doe', duration: '12m 45s', type: 'Inbound', date: '2024-10-24', time: '10:30 AM', recordingSize: '4.2 MB' },
    { id: 'CAL-5522', customer: 'Jane Smith', duration: '5m 12s', type: 'Outbound', date: '2024-10-24', time: '11:15 AM', recordingSize: '1.8 MB' },
    { id: 'CAL-5523', customer: 'Mike Johnson', duration: '22m 10s', type: 'Inbound', date: '2024-10-23', time: '02:45 PM', recordingSize: '8.5 MB' },
    { id: 'CAL-5524', customer: 'Sarah Williams', duration: '8m 30s', type: 'Inbound', date: '2024-10-23', time: '04:20 PM', recordingSize: '3.1 MB' },
];

const CallHistory: React.FC = () => {
    const columns: Column<CallRecord>[] = [
        {
            header: 'Customer',
            accessor: (row: CallRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={14} className="text-blue-400" />
                    </div>
                    <span>{row.customer}</span>
                </div>
            )
        },
        { header: 'Type', accessor: 'type' },
        {
            header: 'Date & Time',
            accessor: (row: CallRecord) => (
                <div>
                    <div style={{ color: '#f8fafc' }}>{row.date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.time}</div>
                </div>
            )
        },
        { header: 'Duration', accessor: 'duration' },
        { header: 'Size', accessor: 'recordingSize' }
    ];

    const renderActions = (row: CallRecord) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: '#3b82f620', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Play Recording"><Play size={16} onClick={() => console.log(row.id)} /></button>
            <button style={{ background: '#10b98120', border: 'none', color: '#10b981', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Download"><Download size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Call History & Recordings</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '2px' }}>
                        <button style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem' }}>All</button>
                        <button style={{ padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '6px', fontSize: '0.85rem' }}>Missed</button>
                    </div>
                </div>
            </div>

            <DataTable
                data={mockCalls}
                columns={columns}
                keyExtractor={(row: CallRecord) => row.id}
                actions={renderActions}
            />
        </div>
    );
};

export default CallHistory;
