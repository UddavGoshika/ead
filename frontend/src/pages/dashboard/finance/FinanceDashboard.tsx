import React, { useState } from 'react';
import StaffLayout from '../staff/shared/StaffLayout';
import type { NavItem } from '../staff/shared/StaffLayout';
import {
    LayoutDashboard, DollarSign, FileText, PieChart, Settings, Receipt, RefreshCw, Shield
} from 'lucide-react';
import FinanceControlPanel from '../../../components/os-modules/finance/FinanceControlPanel';
import { FinanceInvoices, FinancePayroll, FinanceReconciliation, FinanceBudgetReports, FinanceTaxCompliance } from '../../../components/os-modules/finance/AdditionalPages';
import SystemSettings from '../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Financial Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'invoices', label: 'Invoices & Payments', icon: <FileText size={20} /> },
    { id: 'reconciliation', label: 'Reconciliation', icon: <RefreshCw size={20} /> },
    { id: 'payroll', label: 'Payroll', icon: <DollarSign size={20} /> },
    { id: 'reports', label: 'Budget Analysis', icon: <PieChart size={20} /> },
    { id: 'tax', label: 'Tax & Legal', icon: <Shield size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const FinanceDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <FinanceControlPanel />;
            case 'invoices': return <FinanceInvoices />;
            case 'reconciliation': return <FinanceReconciliation />;
            case 'payroll': return <FinancePayroll />;
            case 'reports': return <FinanceBudgetReports />;
            case 'tax': return <FinanceTaxCompliance />;
            case 'settings': return <SystemSettings allowedTabs={['general', 'logs']} />;
            default: return <FinanceControlPanel />;
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
