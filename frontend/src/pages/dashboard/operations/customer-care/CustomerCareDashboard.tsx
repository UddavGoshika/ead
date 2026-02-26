import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    MessageCircle, Settings, Mail, List, ShieldAlert, BarChart2
} from 'lucide-react';
import WorkQueue from '../shared/WorkQueue';
import type { WorkItem } from '../shared/WorkQueue';

const navItems: NavItem[] = [
    { id: 'tickets', label: 'Support Queue', icon: <List size={20} /> },
    { id: 'chat', label: 'Live Chats', icon: <MessageCircle size={20} /> },
    { id: 'emails', label: 'Email Box', icon: <Mail size={20} /> },
    { id: 'performance', label: 'SLA Dashboard', icon: <BarChart2 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const mockTickets: WorkItem[] = [
    { id: 'TKT-101', title: 'Payment Not Reflected', priority: 'High', status: 'Pending', queueTime: '24m', metadata: { user: 'Amit K.', issue: 'Double charge on UPI', txnId: '998271' } as any },
    { id: 'TKT-102', title: 'Account Access Issue', priority: 'Critical', status: 'In Progress', queueTime: '5m', metadata: { user: 'Sita M.', issue: 'Password reset failed', browser: 'Safari Mobile' } as any },
    { id: 'TKT-103', title: 'Refund Status Update', priority: 'Low', status: 'Pending', queueTime: '2h', metadata: { user: 'Raj V.', issue: 'Late refund', orderId: 'ORD-441' } as any },
];

const CustomerCareDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tickets');

    const renderContent = () => {
        switch (activeTab) {
            case 'tickets':
                return <WorkQueue role="customer_care" items={mockTickets} />;
            case 'chat':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Active Chat Sessions</h2><p style={{ color: '#94a3b8' }}>Real-time chat support for all website visitors.</p></div>;
            case 'emails':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Email Inbox</h2><p style={{ color: '#94a3b8' }}>Filter and respond to level-2 support emails.</p></div>;
            case 'performance':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Your CSAT & SLA Metrics</h2><p style={{ color: '#94a3b8' }}>Detailed breakdown of your response times and customer satisfaction scores.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Preferences</h2><p style={{ color: '#94a3b8' }}>Adjust notification sounds and quick-response macros.</p></div>;
            default:
                return <WorkQueue role="customer_care" items={mockTickets} />;
        }
    };

    return (
        <StaffLayout
            title="Customer Support Desk"
            roleName="Support Representative"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default CustomerCareDashboard;
