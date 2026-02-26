import React, { useState } from 'react';
import StaffLayout from '../staff/shared/StaffLayout';
import type { NavItem } from '../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, TrendingUp, Settings, FileText
} from 'lucide-react';
import Overview from './sections/Overview';
import StaffDirectory from './sections/StaffDirectory';
import FinanceReports from './sections/FinanceReports';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'staff', label: 'Staff Management', icon: <Users size={20} /> },
    { id: 'finance', label: 'Financial Reports', icon: <TrendingUp size={20} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const GeneralManagerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview />;
            case 'staff':
                return <StaffDirectory />;
            case 'finance':
                return <FinanceReports />;
            case 'documents':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Document Management</h2><p style={{ color: '#94a3b8' }}>This section handles company-wide documents.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Settings</h2><p style={{ color: '#94a3b8' }}>General Manager specific settings.</p></div>;
            default:
                return <Overview />;
        }
    };

    return (
        <StaffLayout
            title="General Manager Dashboard"
            roleName="General Manager"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default GeneralManagerDashboard;
