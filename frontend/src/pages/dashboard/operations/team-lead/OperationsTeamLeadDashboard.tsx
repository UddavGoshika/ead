import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, Activity, Settings, TrendingUp, Calendar, ShieldCheck, Database, Truck
} from 'lucide-react';
import WorkflowCommandCenter from '../../../../components/os-modules/operations/WorkflowCommandCenter';
import { OpsResourcePlanning, OpsQualityAudit, OpsAgentMetrics, OpsDataTracking, OpsReports, OpsSupplyChain } from '../../../../components/os-modules/operations/AdditionalPages';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Workflow Command', icon: <LayoutDashboard size={20} /> },
    { id: 'planning', label: 'Resource Planning', icon: <Calendar size={20} /> },
    { id: 'quality', label: 'Quality QA Audit', icon: <ShieldCheck size={20} /> },
    { id: 'telecallers', label: 'Agent Performance', icon: <Users size={20} /> },
    { id: 'data', label: 'Data Workflow', icon: <Database size={20} /> },
    { id: 'reports', label: 'Strategic Ops Reports', icon: <TrendingUp size={20} /> },
    { id: 'supply_chain', label: 'Supply Chain Hub', icon: <Truck size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const OperationsTeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <WorkflowCommandCenter />;
            case 'planning': return <OpsResourcePlanning />;
            case 'quality': return <OpsQualityAudit />;
            case 'telecallers': return <OpsAgentMetrics />;
            case 'data': return <OpsDataTracking />;
            case 'reports': return <OpsReports />;
            case 'supply_chain': return <OpsSupplyChain />;
            case 'settings': return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Operations Configuration</h2><p style={{ color: '#94a3b8' }}>Tailor dashboard alerts, SLA thresholds, and team assignments.</p></div>;
            default: return <WorkflowCommandCenter />;
        }
    };

    return (
        <StaffLayout
            title="Operations Manager Dashboard"
            roleName="Strategic Operations Lead"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="operations"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default OperationsTeamLeadDashboard;
