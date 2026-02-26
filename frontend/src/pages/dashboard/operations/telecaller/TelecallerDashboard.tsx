import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    PhoneCall, Target, List, Settings, History, BarChart2
} from 'lucide-react';
import WorkQueue from '../shared/WorkQueue';
import type { WorkItem } from '../shared/WorkQueue';
import SystemSettings from '../../shared/SystemSettings';

const navItems: NavItem[] = [
    { id: 'calling', label: 'Call Queue', icon: <PhoneCall size={20} /> },
    { id: 'leads', label: 'My Leads', icon: <List size={20} /> },
    { id: 'performance', label: 'My Targets', icon: <Target size={20} /> },
    { id: 'history', label: 'Call History', icon: <History size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const mockLeads: WorkItem[] = [
    { id: 'L-991', title: 'Rahul Sharma - New Inquiry', priority: 'High', status: 'Pending', queueTime: '12m', metadata: { phone: '+91 98XXX XXXXX', source: 'Instagram Ad', interest: 'Property Law' } as any },
    { id: 'L-992', title: 'Sneha Gupta - Callback', priority: 'Medium', status: 'In Progress', queueTime: '45m', metadata: { phone: '+91 97XXX XXXXX', source: 'Website', interest: 'Corporate Law' } as any },
    { id: 'L-993', title: 'Vikram Singh - Urgent', priority: 'Critical', status: 'Pending', queueTime: '2m', metadata: { phone: '+91 96XXX XXXXX', source: 'Referral', interest: 'Criminal Law' } as any },
];

const TelecallerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('calling');

    const renderContent = () => {
        switch (activeTab) {
            case 'calling':
                return <WorkQueue role="telecaller" items={mockLeads} />;
            case 'leads':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Active Lead List</h2><p style={{ color: '#94a3b8' }}>Filter and manage your assigned leads.</p></div>;
            case 'performance':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Targets & Commission</h2><p style={{ color: '#94a3b8' }}>Track your daily conversions and earned bonuses.</p></div>;
            case 'history':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Call Logs</h2><p style={{ color: '#94a3b8' }}>Review your previous calls and recordings.</p></div>;
            case 'settings':
                return <SystemSettings allowedTabs={['general']} />;
            default:
                return <WorkQueue role="telecaller" items={mockLeads} />;
        }
    };

    return (
        <StaffLayout
            title="Telecalling Console"
            roleName="Senior Telecaller"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            department="operations"
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default TelecallerDashboard;
