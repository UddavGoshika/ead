import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from '../../dashboard/shared/DataTable';
import { FileText, DollarSign, RefreshCcw, PieChart, Shield } from 'lucide-react';

export const FinanceInvoices: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/finance/invoices').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> Invoices & Payments</h2>
            <DataTable
                columns={[{ header: 'ID', accessor: 'id' }, { header: 'Client', accessor: 'client' }, { header: 'Amount', accessor: 'amount' }, { header: 'Status', accessor: 'status' }]}
                data={data}
                keyExtractor={(item: any) => item.id}
            />
        </div>
    );
};

export const FinancePayroll: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/finance/payroll').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><DollarSign /> Payroll Management</h2>
            <DataTable
                columns={[{ header: 'ID', accessor: 'id' }, { header: 'Employee', accessor: 'employee' }, { header: 'Salary', accessor: 'salary' }, { header: 'Status', accessor: 'status' }]}
                data={data}
                keyExtractor={(item: any) => item.id}
            />
        </div>
    );
};

export const FinanceReconciliation: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/finance/reconciliation').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCcw /> Bank Reconciliation</h2>
            <DataTable
                columns={[{ header: 'Bank', accessor: 'bank' }, { header: 'Book Bal', accessor: 'book_balance' }, { header: 'Bank Bal', accessor: 'bank_balance' }, { header: 'Diff', accessor: 'diff' }]}
                data={data}
                keyExtractor={(item: any) => item.bank}
            />
        </div>
    );
};

export const FinanceBudgetReports: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/finance/budget-reports').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><PieChart /> Budget Analysis</h2>
            <DataTable
                columns={[{ header: 'Project', accessor: 'project' }, { header: 'Budget', accessor: 'budget' }, { header: 'Allocated', accessor: 'allocated' }, { header: 'Variance', accessor: 'variance' }]}
                data={data}
                keyExtractor={(item: any) => item.project}
            />
        </div>
    );
};

export const FinanceTaxCompliance: React.FC = () => {
    const [data, setData] = useState([]);
    useEffect(() => { axios.get('/api/finance/tax-compliance').then(res => setData(res.data.data)); }, []);
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield /> Tax & Legal Compliance</h2>
            <DataTable
                columns={[{ header: 'Filing', accessor: 'filing' }, { header: 'Deadline', accessor: 'deadline' }, { header: 'Status', accessor: 'status' }]}
                data={data}
                keyExtractor={(item: any) => item.filing}
            />
        </div>
    );
};
