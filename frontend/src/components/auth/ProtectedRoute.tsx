import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isLoggedIn, user, isAuthLoading } = useAuth();
    const location = useLocation();
    const [initialWait, setInitialWait] = useState(true);

    useEffect(() => {
        // Very short wait to let context settle if needed
        const timer = setTimeout(() => setInitialWait(false), 300);
        return () => clearTimeout(timer);
    }, []);

    // 1. Show global loading if context is verifying with backend
    if (isAuthLoading || initialWait) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: '#0f172a',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <h2 style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '1px' }}>Verifying Identity...</h2>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // 2. Check if logged in (Context or fallback to localStorage/Token)
    const token = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');
    const finalLoggedIn = isLoggedIn || !!token;

    if (!finalLoggedIn) {
        console.warn('[ProtectedRoute] Not logged in. Redirecting to home.');
        return <Navigate to="/" state={{ from: location }} replace />;
    }

<<<<<<< HEAD
    // 3. Check Role Permission
    if (allowedRoles && allowedRoles.length > 0) {
        let currentUserRole = (user?.role || '').toUpperCase();

        // Fallback to localStorage if context not yet populated but token exists
        if (!currentUserRole && storedUserStr) {
            try {
                const parsed = JSON.parse(storedUserStr);
                currentUserRole = (parsed.role || '').toUpperCase();
            } catch (e) { }
        }

        const hasPermission = allowedRoles.some(r => r.toUpperCase() === currentUserRole);

        if (!hasPermission) {
            console.warn(`[ProtectedRoute] Unauthorized role: ${currentUserRole}. Access denied for ${location.pathname}`);
            return <Navigate to="/" replace />;
        }
=======
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const uid = user.unique_id || user.id;
        if (user.role === 'client') return <Navigate to={`/dashboard/client/${uid}`} replace />;
        if (user.role === 'advocate') return <Navigate to={`/dashboard/advocate/${uid}`} replace />;
        if (user.role === 'legal_provider') return <Navigate to={`/dashboard/advisor/${uid}`} replace />;
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

        return <Navigate to="/" replace />;
>>>>>>> 1d75c825403bec99c6b4a6faba396c177aea5604
    }

    // 4. Access Granted - Show children wrapped in a clean container to avoid style leakage
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: '#0f172a',
            position: 'relative',
            zIndex: 1
        }}>
            {children}
        </div>
    );
};

export default ProtectedRoute;
