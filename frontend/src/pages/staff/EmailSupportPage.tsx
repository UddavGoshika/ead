
import React from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import EmailSupport from '../dashboard/support/roles/EmailSupport';

const EmailSupportPage: React.FC = () => {
    return (
        <StaffLayout>
            <EmailSupport />
        </StaffLayout>
    );
};

export default EmailSupportPage;
