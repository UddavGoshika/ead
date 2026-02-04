import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isLoggedIn, user } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const uid = user.unique_id || user.id;
        if (user.role === 'client') return <Navigate to={`/dashboard/client/${uid}`} replace />;
        if (user.role === 'advocate') return <Navigate to={`/dashboard/advocate/${uid}`} replace />;
        if (user.role === 'legal_provider') return <Navigate to={`/dashboard/advisor/${uid}`} replace />;
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
