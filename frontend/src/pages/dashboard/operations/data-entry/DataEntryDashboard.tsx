import React, { useState } from 'react';
import StaffLayout from '../../staff/shared/StaffLayout';
import type { NavItem } from '../../staff/shared/StaffLayout';
import {
    Database, Activity, CheckSquare, Settings, FileSearch, Zap
} from 'lucide-react';
import WorkQueue from '../shared/WorkQueue';
import type { WorkItem } from '../shared/WorkQueue';

const navItems: NavItem[] = [
    { id: 'tasks', label: 'Processing Queue', icon: <CheckSquare size={20} /> },
    { id: 'forms', label: 'Entry Forms', icon: <Database size={20} /> },
    { id: 'verify', label: 'Self-Verification', icon: <FileSearch size={20} /> },
    { id: 'performance', label: 'Speed & Accuracy', icon: <Zap size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const mockDataTasks: WorkItem[] = [
    { id: 'DAT-401', title: 'Advocate Profile Updates', priority: 'Medium', status: 'Pending', queueTime: '15m', metadata: { totalRecords: 45, type: 'Field Update', priority_Reason: 'Bulk update' } as any },
    { id: 'DAT-402', title: 'Case Document Digitation', priority: 'High', status: 'In Progress', queueTime: '32m', metadata: { pages: 120, format: 'PDF-to-DB', project: 'Legacy Conversion' } as any },
    { id: 'DAT-403', title: 'Provider Service Catalog', priority: 'Low', status: 'Pending', queueTime: '4h', metadata: { items: 12, action: 'Category Audit' } as any },
];

const DataEntryDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tasks');

    const renderContent = () => {
        switch (activeTab) {
            case 'tasks':
                return <WorkQueue role="data_entry" items={mockDataTasks} />;
            case 'forms':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Bulk Entry Forms</h2><p style={{ color: '#94a3b8' }}>Standardized forms for manual database entry.</p></div>;
            case 'verify':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Quality Self-Check</h2><p style={{ color: '#94a3b8' }}>Run validation logs against your recent entries.</p></div>;
            case 'performance':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>WPM & Accuracy Stats</h2><p style={{ color: '#94a3b8' }}>Real-time metrics on your throughput and verification pass rate.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Console Settings</h2><p style={{ color: '#94a3b8' }}>Customize your dark-mode UI and keyboard shortcuts.</p></div>;
            default:
                return <WorkQueue role="data_entry" items={mockDataTasks} />;
        }
    };

    return (
        <StaffLayout
            title="Data Management Terminal"
            roleName="Senior Data Clerk"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default DataEntryDashboard;
