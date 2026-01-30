import React from 'react';
import styles from '../shared/DashboardSection.module.css';
import MemberTable from '../../../components/admin/MemberTable';

const AdvocateApprovals: React.FC = () => {
    return (
        <div className={styles.container}>
            <MemberTable
                title="Advocate Approvals"
                initialRole="Advocate"
                initialVerifiedFilter="Unverified"
                context="pending"
            />
        </div>
    );
};

export default AdvocateApprovals;
