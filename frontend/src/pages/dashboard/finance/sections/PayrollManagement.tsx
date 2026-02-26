import React, { useState } from 'react';
import { DataTable } from '../../../../components/dashboard/shared/DataTable';
import type { Column } from '../../../../components/dashboard/shared/DataTable';
import { ActionModal } from '../../../../components/dashboard/shared/ActionModal';
import { Download, CreditCard, CheckCircle } from 'lucide-react';

interface PayrollRecord {
    id: string;
    employeeName: string;
    department: string;
    baseSalary: number;
    bonus: number;
    deductions: number;
    netPay: number;
    status: 'Processed' | 'Pending Approval';
}

const mockPayroll: PayrollRecord[] = [
    { id: 'PAY-001', employeeName: 'John Doe', department: 'Operations', baseSalary: 45000, bonus: 5000, deductions: 2500, netPay: 47500, status: 'Processed' },
    { id: 'PAY-002', employeeName: 'Jane Smith', department: 'Support', baseSalary: 38000, bonus: 2000, deductions: 1800, netPay: 38200, status: 'Pending Approval' },
    { id: 'PAY-003', employeeName: 'Alice Johnson', department: 'Marketing', baseSalary: 55000, bonus: 8000, deductions: 3500, netPay: 59500, status: 'Processed' },
];

const Payroll: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    const columns: Column<PayrollRecord>[] = [
        { header: 'Employee', accessor: 'employeeName' },
        { header: 'Department', accessor: 'department' },
        { header: 'Base Salary', accessor: (row) => formatCurrency(row.baseSalary) },
        { header: 'Net Pay', accessor: (row) => <strong style={{ color: '#10b981' }}>{formatCurrency(row.netPay)}</strong> },
        {
            header: 'Status',
            accessor: (row) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500,
                    background: row.status === 'Processed' ? '#10b98120' : '#facc1520',
                    color: row.status === 'Processed' ? '#10b981' : '#facc15'
                }}>
                    {row.status}
                </span>
            )
        }
    ];

    const renderActions = (row: PayrollRecord) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            {row.status === 'Pending Approval' && (
                <button style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    <CheckCircle size={14} /> Approve
                </button>
            )}
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Payslip"><Download size={16} /></button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Payroll Processing</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#10b981', color: '#ffffff', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <CreditCard size={18} /> Run Payroll
                </button>
            </div>

            <DataTable
                data={mockPayroll}
                columns={columns}
                keyExtractor={(row) => row.id}
                actions={renderActions}
            />

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Run Monthly Payroll"
            >
                <div style={{ color: '#cbd5e1', marginBottom: '16px' }}>
                    You are about to process payroll for <strong>October 2024</strong>.
                </div>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total Employees:</span> <strong>142</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total Base Salary:</span> <strong>₹4,250,000</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total Deductions:</span> <strong style={{ color: '#ef4444' }}>-₹425,000</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px', fontSize: '1.1rem' }}><span>Estimated Net Payout:</span> <strong style={{ color: '#10b981' }}>₹3,825,000</strong></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Confirm & Process</button>
                </div>
            </ActionModal>
        </div>
    );
};

export default Payroll;
