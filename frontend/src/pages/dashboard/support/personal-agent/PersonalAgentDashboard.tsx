import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    Users, Calendar, Clock, Settings
} from 'lucide-react';
import MyClients from './sections/MyClients';
import InteractionHistory from './sections/InteractionHistory';

const navItems: NavItem[] = [
    { id: 'clients', label: 'My VIP Clients', icon: <Users size={20} /> },
    { id: 'history', label: 'Interaction History', icon: <Clock size={20} /> },
    { id: 'schedule', label: 'Appointment Schedule', icon: <Calendar size={20} /> },
    { id: 'settings', label: 'Availability Settings', icon: <Settings size={20} /> },
];

const PersonalAgentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clients');

    const renderContent = () => {
        switch (activeTab) {
            case 'clients':
                return <MyClients />;
            case 'history':
                return <InteractionHistory />;
            case 'schedule':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Appointment Schedule</h2><p style={{ color: '#94a3b8' }}>Manage upcoming calls with VIP clients.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Availability Settings</h2><p style={{ color: '#94a3b8' }}>Set your working hours for client bookings.</p></div>;
            default:
                return <MyClients />;
        }
    };

    return (
        <StaffLayout
            title="Personal Agent Dashboard"
            roleName="Dedicated Agent"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default PersonalAgentDashboard;
