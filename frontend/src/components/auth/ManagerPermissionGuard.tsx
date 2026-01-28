import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import AdminOnlyPage from '../../pages/shared/AdminOnlyPage';

interface ManagerPermissionGuardProps {
    permissionId: string;
    children: React.ReactNode;
}

const ManagerPermissionGuard: React.FC<ManagerPermissionGuardProps> = ({ permissionId, children }) => {
    const { settings, loading } = useSettings();

    if (loading) {
        return <div>Loading permissions...</div>;
    }

    const permissions = settings?.manager_permissions || {};

    // Check if the specific permission is disabled
    if (permissions[permissionId] === false) {
        return <AdminOnlyPage />;
    }

    return <>{children}</>;
};

export default ManagerPermissionGuard;
