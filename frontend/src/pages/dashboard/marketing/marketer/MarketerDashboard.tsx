import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Megaphone, Target, BarChart2, Settings
} from 'lucide-react';
import MyCampaigns from './sections/MyCampaigns';
import MarketingOverview from './sections/MarketingOverview';
import SystemSettings from '../../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'overview', label: 'My Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'campaigns', label: 'My Campaigns', icon: <Megaphone size={20} /> },
    { id: 'leads', label: 'Lead Generation', icon: <Target size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const MarketerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <MarketingOverview />;
            case 'campaigns':
                return <MyCampaigns />;
            case 'leads':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Lead Generation</h2><p style={{ color: '#94a3b8' }}>View structured leads captured from your campaigns.</p></div>;
            case 'analytics':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Campaign Analytics</h2><p style={{ color: '#94a3b8' }}>Detailed drill-down of ad performance metrics.</p></div>;
            case 'settings':
                return <SystemSettings allowedTabs={['general', 'logs']} />;
            default:
                return <MarketingOverview />;
        }
    };

    return (
        <StaffLayout
            title="Marketer Dashboard"
            roleName="Digital Marketer"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="marketing"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default MarketerDashboard;
