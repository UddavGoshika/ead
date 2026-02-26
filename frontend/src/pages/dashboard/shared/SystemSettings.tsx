import React, { useState } from 'react';
import { Settings, Users, Shield, History } from 'lucide-react';
import GeneralSettings from '../../../components/dashboard/shared/settings/GeneralSettings';
import UserManagement from '../../../components/dashboard/shared/settings/UserManagement';
import RolesPermissions from '../../../components/dashboard/shared/settings/RolesPermissions';
import ActivityLogViewer from '../../../components/dashboard/shared/ActivityLogViewer';
import styles from './SystemSettings.module.css';

interface SystemSettingsProps {
    allowedTabs?: string[]; // e.g., ['general', 'users', 'roles', 'logs']
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ allowedTabs = ['general', 'users', 'roles', 'logs'] }) => {
    const [activeSubTab, setActiveSubTab] = useState(allowedTabs[0]);

    const tabs = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'users', label: 'Staff Management', icon: <Users size={18} /> },
        { id: 'roles', label: 'Access Control', icon: <Shield size={18} /> },
        { id: 'logs', label: 'Audit Logs', icon: <History size={18} /> },
    ].filter(tab => allowedTabs.includes(tab.id));

    const renderSubContent = () => {
        switch (activeSubTab) {
            case 'general': return <GeneralSettings />;
            case 'users': return <UserManagement />;
            case 'roles': return <RolesPermissions />;
            case 'logs': return <ActivityLogViewer />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div className={styles.settingsWrapper}>
            <div className={styles.settingsSidebar}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.sidebarTab} ${activeSubTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveSubTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className={styles.settingsContent}>
                {renderSubContent()}
            </div>
        </div>
    );
};

export default SystemSettings;
