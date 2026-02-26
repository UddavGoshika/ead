import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, MessageSquare, BookOpen, Settings
} from 'lucide-react';
import LiveOverview from './sections/LiveOverview';
import TicketMonitor from './sections/TicketMonitor';
import KnowledgeBase from './sections/KnowledgeBase';
import SystemSettings from '../../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Live Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'tickets', label: 'Ticket Monitor', icon: <MessageSquare size={20} /> },
    { id: 'kb', label: 'Knowledge Base', icon: <BookOpen size={20} /> },
    { id: 'agents', label: 'Agent Performance', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const SupportTeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <LiveOverview />;
            case 'tickets':
                return <TicketMonitor />;
            case 'kb':
                return <KnowledgeBase />;
            case 'agents':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Agent Performance</h2><p style={{ color: '#94a3b8' }}>Monitor individual support agent metrics and activity timelines.</p></div>;
            case 'settings':
                return <SystemSettings allowedTabs={['general', 'logs']} />;
            default:
                return <LiveOverview />;
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
