import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Megaphone, Target, Users, Settings
} from 'lucide-react';
import MarketingOverview from './sections/MarketingOverview';
import CampaignManagement from './sections/CampaignManagement';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'campaigns', label: 'Active Campaigns', icon: <Megaphone size={20} /> },
    { id: 'leads', label: 'Lead Tracking', icon: <Target size={20} /> },
    { id: 'team', label: 'Team Performance', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const MarketingTeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <MarketingOverview />;
            case 'campaigns':
                return <CampaignManagement />;
            case 'leads':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Lead Tracking</h2><p style={{ color: '#94a3b8' }}>Monitor incoming leads from various channels.</p></div>;
            case 'team':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Team Performance</h2><p style={{ color: '#94a3b8' }}>Track marketer and agency performance metrics.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Settings</h2><p style={{ color: '#94a3b8' }}>Marketing settings and integrations.</p></div>;
            default:
                return <MarketingOverview />;
        }
    };

    return (
        <StaffLayout
            title="Marketing Lead Dashboard"
            roleName="Marketing Team Lead"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default MarketingTeamLeadDashboard;
