import React, { useState } from 'react';
import StaffLayout from '../staff/shared/StaffLayout';
import type { NavItem } from '../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, TrendingUp, Settings, FileText, Map, ShieldCheck
} from 'lucide-react';
import ExecutiveOverview from '../../../components/os-modules/gm/ExecutiveOverview';
import StrategicAnalytics from '../../../components/os-modules/gm/StrategicAnalytics';
import { GMStaffManagement, GMDocuments, GMRoadmap, GMCompliance } from '../../../components/os-modules/gm/AdditionalPages';
import SystemSettings from '../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'executive_overview', label: 'Executive Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'strategic_analytics', label: 'Strategic Analytics', icon: <TrendingUp size={20} /> },
    { id: 'staff', label: 'Staff Management', icon: <Users size={20} /> },
    { id: 'documents', label: 'Company Documents', icon: <FileText size={20} /> },
    { id: 'roadmap', label: 'Strategic Roadmap', icon: <Map size={20} /> },
    { id: 'compliance', label: 'Risk & Compliance', icon: <ShieldCheck size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const GeneralManagerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'executive_overview': return <ExecutiveOverview />;
            case 'strategic_analytics': return <StrategicAnalytics />;
            case 'staff': return <GMStaffManagement />;
            case 'documents': return <GMDocuments />;
            case 'roadmap': return <GMRoadmap />;
            case 'compliance': return <GMCompliance />;
            case 'settings': return <SystemSettings />;
            default: return <ExecutiveOverview />;
        }
    };

    return (
        <StaffLayout
            title="General Manager Dashboard"
            roleName="General Manager"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="management"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default GeneralManagerDashboard;
