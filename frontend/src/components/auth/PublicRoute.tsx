import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isLoggedIn, user } = useAuth();

    if (isLoggedIn && user) {
        const role = user.role.toLowerCase();

        // Redirect logic based on role
        switch (role) {
            case 'admin':
            case 'superadmin':
                return <Navigate to="/admin/dashboard" replace />;
            case 'advocate':
                return <Navigate to="/dashboard/advocate" replace />;
            case 'client':
                return <Navigate to="/dashboard/client" replace />;
            case 'user':
                return <Navigate to="/dashboard/user" replace />;
            case 'legal_provider':
                return <Navigate to="/dashboard/advisor" replace />;
            case 'verifier':
                return <Navigate to="/dashboard/verifier" replace />;
            case 'finance':
                return <Navigate to="/dashboard/finance" replace />;
            case 'manager':
            case 'teamlead':
            case 'hr':
            case 'telecaller':
            case 'support':
            case 'customer_care':
            case 'chat_support':
            case 'live_chat':
            case 'call_support':
            case 'data_entry':
            case 'personal_assistant':
            case 'personal_agent':
            case 'influencer':
            case 'marketer':
            case 'marketing_agency':
                return <Navigate to="/staff/portal" replace />;
            default:
                return <Navigate to="/dashboard/client" replace />;
        }
    }

    return <>{children}</>;
};

export default PublicRoute;
