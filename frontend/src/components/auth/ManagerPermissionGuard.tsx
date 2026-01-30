import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import AdminOnlyPage from '../../pages/shared/AdminOnlyPage';

interface ManagerPermissionGuardProps {
    permissionId: string;
    parentId?: string;
    children: React.ReactNode;
}

const ManagerPermissionGuard: React.FC<ManagerPermissionGuardProps> = ({ permissionId, parentId, children }) => {
    const { settings, loading } = useSettings();

    if (loading) {
        return <div>Loading permissions...</div>;
    }

    const permissions = settings?.manager_permissions || {};

    // Check if the specific permission is disabled
    // OR if the parent section is disabled
    const isRestricted = permissions[permissionId] === false || (parentId && permissions[parentId] === false);

    if (isRestricted) {
        return <AdminOnlyPage />;
    }

    return <>{children}</>;
};

export default ManagerPermissionGuard;
