import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { Filter, Search, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import WorkItemDetail from '../shared/WorkItemDetail';

export interface WorkItem {
    id: string;
    title: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'In Progress' | 'Completed';
    queueTime: string;
    metadata?: any;
}

interface WorkQueueProps {
    role: 'telecaller' | 'customer_care' | 'data_entry';
    items: WorkItem[];
}

const WorkQueue: React.FC<WorkQueueProps> = ({ role, items }) => {
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);

    const columns: Column<WorkItem>[] = [
        {
            header: 'Subject',
            accessor: (row: WorkItem) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.id}</div>
                </div>
            )
        },
        {
            header: 'Priority',
            accessor: (row: WorkItem) => (
                <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                    background: row.priority === 'Critical' ? '#ef444420' : row.priority === 'High' ? '#f59e0b20' : '#334155',
                    color: row.priority === 'Critical' ? '#ef4444' : row.priority === 'High' ? '#f59e0b' : '#94a3b8'
                }}>
                    {row.priority}
                </span>
            )
        },
        {
            header: 'Wait Time',
            accessor: (row: WorkItem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <Clock size={14} className="text-gray-400" /> {row.queueTime}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row: WorkItem) => (
                <span style={{ fontSize: '0.85rem', color: row.status === 'In Progress' ? '#3b82f6' : '#64748b' }}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1.2fr 1fr' : '1fr', gap: '24px', height: 'calc(100vh - 180px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#f8fafc' }}>Active Work Queue ({items.length})</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input type="text" placeholder="Search items..." style={{ padding: '8px 10px 8px 34px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
                        </div>
                    </div>
                </div>

                <DataTable
                    data={items}
                    columns={columns}
                    keyExtractor={(row: WorkItem) => row.id}
                    onRowClick={(row: WorkItem) => setSelectedItem(row)}
                    actions={(row: WorkItem) => (
                        <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                            <ArrowRight size={18} />
                        </button>
                    )}
                />
            </div>

            {selectedItem && (
                <WorkItemDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    role={role}
                />
            )}
        </div>
    );
};

export default WorkQueue;
