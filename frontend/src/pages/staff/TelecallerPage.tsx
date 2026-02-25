
import React from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import TelecallerDashboard from './roles/TelecallerDashboard';

const TelecallerPage: React.FC = () => {
    return (
        <StaffLayout activeTab="leads">
            <TelecallerDashboard />
        </StaffLayout>
    );
};

export default TelecallerPage;
