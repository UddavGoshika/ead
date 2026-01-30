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
            case 'manager':
                return <Navigate to="/manager/dashboard" replace />;
            case 'teamlead':
                return <Navigate to="/team-lead/workspace" replace />;
            case 'hr':
                return <Navigate to="/hr/workspace" replace />;
            case 'verifier':
                return <Navigate to="/dashboard/verifier" replace />;
            case 'finance':
                return <Navigate to="/dashboard/finance" replace />;
            case 'support':
                return <Navigate to="/dashboard/support" replace />;
            case 'telecaller':
                return <Navigate to="/telecaller" replace />;
            case 'customer-care':
                return <Navigate to="/customer-care" replace />;
            case 'data-entry':
                return <Navigate to="/data-entry" replace />;
            case 'personal-assistant':
                return <Navigate to="/personal-assistant" replace />;
            case 'influencer':
                return <Navigate to="/influencer" replace />;
            case 'marketer':
                return <Navigate to="/marketer" replace />;
            case 'marketing-agency':
                return <Navigate to="/marketing-agency" replace />;
            case 'chat-support':
                return <Navigate to="/chat-support" replace />;
            case 'call-support':
                return <Navigate to="/call-support" replace />;
            case 'live-chat':
                return <Navigate to="/live-chat" replace />;
            case 'personal-agent':
                return <Navigate to="/personal-agent" replace />;
            default:
                return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default PublicRoute;
