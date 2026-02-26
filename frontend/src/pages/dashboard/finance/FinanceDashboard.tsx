import React, { useState } from 'react';
import StaffLayout from '../staff/shared/StaffLayout';
import type { NavItem } from '../staff/shared/StaffLayout';
import {
    LayoutDashboard, DollarSign, FileText, PieChart, Settings, Receipt, RefreshCw
} from 'lucide-react';
import FinanceOverview from './sections/FinanceOverview';
import InvoiceList from './sections/InvoiceList';
import PayrollManagement from './sections/PayrollManagement';
import SystemSettings from '../shared/SystemSettings';
import Expenses from './sections/Expenses';
import Reconciliation from './sections/Reconciliation';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Financial Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'invoices', label: 'Invoices & Payments', icon: <FileText size={20} /> },
    { id: 'expenses', label: 'Expense Management', icon: <Receipt size={20} /> },
    { id: 'reconciliation', label: 'Reconciliation', icon: <RefreshCw size={20} /> },
    { id: 'payroll', label: 'Payroll', icon: <DollarSign size={20} /> },
    { id: 'reports', label: 'Budget & Reports', icon: <PieChart size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const FinanceDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <FinanceOverview />;
            case 'invoices':
                return <InvoiceList />;
            case 'expenses':
                return <Expenses />;
            case 'reconciliation':
                return <Reconciliation />;
            case 'payroll':
                return <PayrollManagement />;
            case 'reports':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Budget vs Actual Reports</h2><p style={{ color: '#94a3b8' }}>Detailed financial analysis and variance reports.</p></div>;
            case 'settings':
                return <SystemSettings allowedTabs={['general', 'logs']} />;
            default:
                return <FinanceOverview />;
        }
    };

    return (
        <StaffLayout
            title="Finance Dashboard"
            roleName="Lead Financial Officer"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="finance"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default FinanceDashboard;
