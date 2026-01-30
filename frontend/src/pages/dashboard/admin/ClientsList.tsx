import React from 'react';
import styles from '../shared/DashboardSection.module.css';
import MemberTable from '../../../components/admin/MemberTable';

const ClientsList: React.FC = () => {
    return (
        <div className={styles.container}>
            <MemberTable
                title="Client Management"
                initialRole="Client"
            />
        </div>
    );
};

export default ClientsList;
