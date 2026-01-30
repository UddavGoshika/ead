import React from 'react';
import styles from '../shared/DashboardSection.module.css';
import MemberTable from '../../../components/admin/MemberTable';

const Verifications: React.FC = () => {
    return (
        <div className={styles.container}>
            <MemberTable
                title="Member Verifications"
                initialVerifiedFilter="Unverified"
            />
        </div>
    );
};

export default Verifications;
