import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import MobileNav from '../components/dashboard/MobileNav';
import Footer from '../components/layout/Footer';

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main className="dashboard-content" style={{
                flex: 1,
                overflowY: 'auto',
                background: '#f8fafc',
                padding: '30px',
                paddingBottom: '100px' // Space for mobile nav
            }}>
                {children || <Outlet />}
                <Footer />
            </main>
            <MobileNav />
        </div>
    );
};

export default DashboardLayout;
