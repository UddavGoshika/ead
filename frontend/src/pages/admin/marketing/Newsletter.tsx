import React from 'react';
import styles from './Newsletter.module.css';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';

const Newsletter: React.FC = () => {
    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Newsletter"
                onSearch={(q) => console.log('Searching newsletter', q)}
            />
            <p>Welcome to the Newsletter management module.</p>
        </div>
    );
};

export default Newsletter;
