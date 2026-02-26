import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    CalendarCheck, UserCheck, MessageSquare, Briefcase
} from 'lucide-react';
import AssistantTasks from './sections/AssistantTasks';

const navItems: NavItem[] = [
    { id: 'tasks', label: 'Daily Tasks & Follow-ups', icon: <CalendarCheck size={20} /> },
    { id: 'lawyers', label: 'Assigned Lawyers', icon: <Briefcase size={20} /> },
    { id: 'clients', label: 'Client Communications', icon: <MessageSquare size={20} /> },
    { id: 'profile', label: 'My Profile Settings', icon: <UserCheck size={20} /> },
];

const PersonalAssistantDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tasks');

    const renderContent = () => {
        switch (activeTab) {
            case 'tasks':
                return <AssistantTasks />;
            case 'lawyers':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Assigned Lawyers</h2><p style={{ color: '#94a3b8' }}>Manage schedules for the lawyers you assist.</p></div>;
            case 'clients':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Client Communications</h2><p style={{ color: '#94a3b8' }}>Follow up with clients on behalf of lawyers.</p></div>;
            case 'profile':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>My Profile</h2><p style={{ color: '#94a3b8' }}>Update your assistant profile and availability.</p></div>;
            default:
                return <AssistantTasks />;
        }
    };

    return (
        <StaffLayout
            title="Personal Assistant Dashboard"
            roleName="Lawyer Assistant"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default PersonalAssistantDashboard;
