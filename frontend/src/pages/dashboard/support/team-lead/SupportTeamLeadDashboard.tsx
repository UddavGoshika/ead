import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, MessageSquare, BookOpen, Settings, PhoneCall, BarChart2, AlertCircle, Smile
} from 'lucide-react';
import SupportOverview from '../../../../components/os-modules/support/SupportOverview';
import TicketManagement from '../../../../components/os-modules/support/TicketManagement';
import CallControlCenter from '../../../../components/os-modules/support/CallControlCenter';
import AgentPerformance from '../../../../components/os-modules/support/AgentPerformance';
import { SupportKnowledgeBase, SupportSLATrends, SupportCSATDetailed } from '../../../../components/os-modules/support/AdditionalPages';
import SystemSettings from '../../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'support_overview', label: 'Support Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'ticket_management', label: 'Ticket Management', icon: <MessageSquare size={20} /> },
    { id: 'call_control_center', label: 'Call Control Center', icon: <PhoneCall size={20} /> },
    { id: 'agent_performance', label: 'Agent Performance', icon: <Users size={20} /> },
    { id: 'knowledge_base', label: 'Knowledge Base', icon: <BookOpen size={20} /> },
    { id: 'sla_trends', label: 'SLA Trends', icon: <AlertCircle size={20} /> },
    { id: 'csat_detailed', label: 'Customer Satisfaction', icon: <Smile size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const SupportTeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('support_overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'support_overview': return <SupportOverview />;
            case 'ticket_management': return <TicketManagement />;
            case 'call_control_center': return <CallControlCenter />;
            case 'agent_performance': return <AgentPerformance />;
            case 'knowledge_base': return <SupportKnowledgeBase />;
            case 'sla_trends': return <SupportSLATrends />;
            case 'csat_detailed': return <SupportCSATDetailed />;
            case 'settings': return <SystemSettings allowedTabs={['general', 'logs']} />;
            default: return <SupportOverview />;
        }
    };

    return (
        <StaffLayout
            title="Support Lead Dashboard"
            roleName="Support Team Lead"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="support"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default SupportTeamLeadDashboard;
