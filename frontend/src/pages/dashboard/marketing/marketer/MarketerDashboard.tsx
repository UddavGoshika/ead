import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Megaphone, Target, BarChart2
} from 'lucide-react';
import MyCampaigns from './sections/MyCampaigns';

const navItems: NavItem[] = [
    { id: 'overview', label: 'My Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'campaigns', label: 'My Campaigns', icon: <Megaphone size={20} /> },
    { id: 'leads', label: 'Lead Generation', icon: <Target size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
];

const MarketerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Marketer Overview</h2><p style={{ color: '#94a3b8' }}>Daily insights and quick stats.</p></div>;
            case 'campaigns':
                return <MyCampaigns />;
            case 'leads':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Lead Generation</h2><p style={{ color: '#94a3b8' }}>View structured leads captured from your campaigns.</p></div>;
            case 'analytics':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Analytics</h2><p style={{ color: '#94a3b8' }}>Detailed drill-down of ad performance.</p></div>;
            default:
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Marketer Overview</h2><p style={{ color: '#94a3b8' }}>Daily insights and quick stats.</p></div>;
        }
    };

    return (
        <StaffLayout
            title="Marketer Dashboard"
            roleName="Digital Marketer"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default MarketerDashboard;
