import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Briefcase, FileText, Settings
} from 'lucide-react';
import ClientProjects from './sections/ClientProjects';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Agency Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'projects', label: 'Client Projects', icon: <Briefcase size={20} /> },
    { id: 'reports', label: 'Performance Reports', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const MarketingAgencyDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Agency Overview</h2><p style={{ color: '#94a3b8' }}>High-level metrics across all managed accounts.</p></div>;
            case 'projects':
                return <ClientProjects />;
            case 'reports':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Performance Reports</h2><p style={{ color: '#94a3b8' }}>Generate exported reports for Eadvocate management.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Settings</h2><p style={{ color: '#94a3b8' }}>Managed API keys and agency details.</p></div>;
            default:
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Agency Overview</h2><p style={{ color: '#94a3b8' }}>High-level metrics across all managed accounts.</p></div>;
        }
    };

    return (
        <StaffLayout
            title="Agency Partner Dashboard"
            roleName="External Marketing Agency"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default MarketingAgencyDashboard;
