import React, { useState } from 'react';
import StaffLayout from '../staff/shared/StaffLayout';
import type { NavItem } from '../staff/shared/StaffLayout';
import {
    LayoutDashboard, Users, UserPlus, Calendar, Settings, BarChart2, Briefcase
} from 'lucide-react';
import HROverview from './sections/HROverview';
import EmployeeList from './sections/EmployeeList';
import RecruitmentDesk from './sections/RecruitmentDesk';
import PerformanceReviews from './sections/PerformanceReviews';
import TimeOffAttendance from './sections/TimeOffAttendance';
import SystemSettings from '../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'directory', label: 'Employee Directory', icon: <Users size={20} /> },
    { id: 'recruitment', label: 'Recruitment Pipeline', icon: <UserPlus size={20} /> },
    { id: 'performance', label: 'Performance Reviews', icon: <BarChart2 size={20} /> },
    { id: 'leave', label: 'PTO & Attendance', icon: <Calendar size={20} /> },
    { id: 'policies', label: 'Onboarding Policies', icon: <Briefcase size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const HRDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <HROverview />;
            case 'directory':
                return <EmployeeList />;
            case 'recruitment':
                return <RecruitmentDesk />;
            case 'performance':
                return <PerformanceReviews />;
            case 'leave':
                return <TimeOffAttendance />;
            case 'policies':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Policies & Onboarding</h2><p style={{ color: '#94a3b8' }}>Manage company policies and new employee onboarding flows.</p></div>;
            case 'settings':
                return <SystemSettings allowedTabs={['users', 'logs']} />;
            default:
                return <HROverview />;
        }
    };

    return (
        <StaffLayout
            title="HR Dashboard"
            roleName="People Operations Lead"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="hr"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default HRDashboard;
