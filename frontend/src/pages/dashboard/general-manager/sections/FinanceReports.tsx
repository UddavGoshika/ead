import React from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

interface Report {
    id: string;
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    status: 'Finalized' | 'Draft';
}

const mockReports: Report[] = [
    { id: '1', month: 'October 2023', revenue: 125000, expenses: 85000, profit: 40000, status: 'Finalized' },
    { id: '2', month: 'November 2023', revenue: 140000, expenses: 90000, profit: 50000, status: 'Finalized' },
    { id: '3', month: 'December 2023', revenue: 180000, expenses: 100000, profit: 80000, status: 'Finalized' },
    { id: '4', month: 'January 2024', revenue: 130000, expenses: 95000, profit: 35000, status: 'Draft' },
];

const FinancialReports: React.FC = () => {

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    const columns: Column<Report>[] = [
        { header: 'Month', accessor: 'month' },
        { header: 'Revenue', accessor: (row) => <span style={{ color: '#10b981' }}><TrendingUp size={14} style={{ marginRight: 4 }} />{formatCurrency(row.revenue)}</span> },
        { header: 'Expenses', accessor: (row) => <span style={{ color: '#ef4444' }}><TrendingDown size={14} style={{ marginRight: 4 }} />{formatCurrency(row.expenses)}</span> },
        { header: 'Net Profit', accessor: (row) => <strong style={{ color: '#f8fafc' }}>{formatCurrency(row.profit)}</strong> },
        {
            header: 'Status',
            accessor: (row) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500,
                    background: row.status === 'Finalized' ? '#3b82f620' : '#facc1520',
                    color: row.status === 'Finalized' ? '#3b82f6' : '#facc15'
                }}>
                    {row.status}
                </span>
            )
        }
    ];

    const renderActions = (row: Report) => (
        <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: '1px solid #334155',
            color: '#f8fafc', padding: '6px 12px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '0.875rem'
        }}>
            <Download size={14} /> PDF
        </button>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Executive Financial Summary</h2>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#334155', color: '#f8fafc', border: 'none',
                    padding: '10px 20px', borderRadius: '8px', fontWeight: 500,
                    cursor: 'pointer'
                }}>
                    <Download size={18} /> Export All
                </button>
            </div>

            <DataTable
                data={mockReports}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
                searchPlaceholder="Search reports by month..."
            />
        </div>
    );
};

export default FinancialReports;
