import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Megaphone, Target, Users, Settings, TrendingUp, BarChart, Briefcase
} from 'lucide-react';
import MarketingOverview from './sections/MarketingOverview';
import CampaignCenter from '../../../../components/os-modules/marketing/CampaignCenter';
import LeadIntelligence from '../../../../components/os-modules/marketing/LeadIntelligence';
import { MarketingTeamPerformance, MarketingSEOGrowth, MarketingAnalysis, MarketingAgencies } from '../../../../components/os-modules/marketing/AdditionalPages';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Marketing Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'campaigns', label: 'Campaign Engine', icon: <Megaphone size={20} /> },
    { id: 'leads', label: 'Lead Intelligence', icon: <Target size={20} /> },
    { id: 'team', label: 'Team Performance', icon: <Users size={20} /> },
    { id: 'seo', label: 'SEO & Growth', icon: <TrendingUp size={20} /> },
    { id: 'analysis', label: 'Market Analysis', icon: <BarChart size={20} /> },
    { id: 'agencies', label: 'Agency Hub', icon: <Briefcase size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const MarketingTeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <MarketingOverview />;
            case 'campaigns': return <CampaignCenter />;
            case 'leads': return <LeadIntelligence />;
            case 'team': return <MarketingTeamPerformance />;
            case 'seo': return <MarketingSEOGrowth />;
            case 'analysis': return <MarketingAnalysis />;
            case 'agencies': return <MarketingAgencies />;
            case 'settings': return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Settings</h2><p style={{ color: '#94a3b8' }}>Marketing settings and integrations.</p></div>;
            default: return <MarketingOverview />;
        }
    };

    return (
        <StaffLayout
            title="Marketing Lead Dashboard"
            roleName="Marketing Team Lead"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="marketing"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default MarketingTeamLeadDashboard;
