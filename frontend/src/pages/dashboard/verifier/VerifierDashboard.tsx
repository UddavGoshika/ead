import React, { useState } from 'react';
import StaffLayout from '../staff/shared/StaffLayout';
import type { NavItem } from '../staff/shared/StaffLayout';
import {
    LayoutDashboard, CheckSquare, ShieldCheck, Settings, BarChart2, MessageSquare
} from 'lucide-react';
import VerifierOverview from './sections/VerifierOverview';
import VerificationList from './sections/VerificationList';
import VerifierPerformance from './sections/Performance';

const navItems: NavItem[] = [
    { id: 'overview', label: 'Tasks Queue', icon: <LayoutDashboard size={20} /> },
    { id: 'all_verifications', label: 'All Verifications', icon: <CheckSquare size={20} /> },
    { id: 'performance', label: 'Performance', icon: <BarChart2 size={20} /> },
    { id: 'rejection_templates', label: 'Rejection Templates', icon: <MessageSquare size={20} /> },
    { id: 'history', label: 'Audit History', icon: <ShieldCheck size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const VerifierDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <VerifierOverview />;
            case 'all_verifications':
                return <VerificationList />;
            case 'performance':
                return <VerifierPerformance />;
            case 'rejection_templates':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Rejection Templates</h2><p style={{ color: '#94a3b8' }}>Standardized responses for common verification issues.</p></div>;
            case 'history':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Audit History</h2><p style={{ color: '#94a3b8' }}>View previously verified accounts and actions.</p></div>;
            case 'settings':
                return <div><h2 style={{ color: '#fff', marginBottom: '20px' }}>Settings</h2><p style={{ color: '#94a3b8' }}>Verifier specific settings and preferences.</p></div>;
            default:
                return <VerifierOverview />;
        }
    };

    return (
        <StaffLayout
            title="Verifier Dashboard"
            roleName="Verification Officer"
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </StaffLayout>
    );
};

export default VerifierDashboard;
