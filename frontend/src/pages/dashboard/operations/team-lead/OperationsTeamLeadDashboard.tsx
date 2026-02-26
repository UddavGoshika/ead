import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, Activity, Settings, TrendingUp, Calendar, ShieldCheck
} from 'lucide-react';
import OperationsOverview from './sections/OperationsOverview';
import ResourcePlanning from './sections/ResourcePlanning';
import QualityAudit from './sections/QualityAudit';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Operations Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'planning', label: 'Resource Planning', icon: <Calendar size={20} /> },
    { id: 'quality', label: 'Quality & QA Audit', icon: <ShieldCheck size={20} /> },
    { id: 'telecallers', label: 'Agent Performance', icon: <Users size={20} /> },
    { id: 'data', label: 'Data Tracking', icon: <Activity size={20} /> },
    { id: 'reports', label: 'Operations Reports', icon: <TrendingUp size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const OperationsTeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OperationsOverview />;
            case 'planning':
                return <ResourcePlanning />;
            case 'quality':
                return <QualityAudit />;
            case 'telecallers':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Agent Performance Monitor</h2><p style={{ color: '#94a3b8' }}>Real-time conversion metrics and activity logs for all operational staff.</p></div>;
            case 'data':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Data Workflow Tracking</h2><p style={{ color: '#94a3b8' }}>Monitor the lifecycle of data entry tasks and verification records.</p></div>;
            case 'reports':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Strategic Operations Reports</h2><p style={{ color: '#94a3b8' }}>Generate cross-functional reports on efficiency, growth, and SLA compliance.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Operations Configuration</h2><p style={{ color: '#94a3b8' }}>Tailor dashboard alerts, SLA thresholds, and team assignments.</p></div>;
            default:
                return <OperationsOverview />;
        }
    };

    return (
        <StaffLayout
            title="Operations Manager Dashboard"
            roleName="Strategic Operations Lead"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default OperationsTeamLeadDashboard;
