import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    PhoneCall, History, Settings, FileText
} from 'lucide-react';
import ActiveCall from './sections/ActiveCall';
import CallHistory from './sections/CallHistory';
import SupportScripts from './sections/SupportScripts';

const navItems: NavItem[] = [
    { id: 'active', label: 'Active Call Console', icon: <PhoneCall size={20} /> },
    { id: 'history', label: 'Call History', icon: <History size={20} /> },
    { id: 'scripts', label: 'Support Scripts', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const CallSupportDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('active');

    const renderContent = () => {
        switch (activeTab) {
            case 'active':
                return <ActiveCall />;
            case 'history':
                return <CallHistory />;
            case 'scripts':
                return <SupportScripts />;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Settings</h2><p style={{ color: '#94a3b8' }}>Agent device and availability settings.</p></div>;
            default:
                return <ActiveCall />;
        }
    };

    return (
        <StaffLayout
            title="Telecall Agent Dashboard"
            roleName="Call Support"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default CallSupportDashboard;
