import React from 'react';
import { ShieldAlert } from 'lucide-react';
import styles from './AdminOnlyPage.module.css';

const AdminOnlyPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <ShieldAlert size={48} className={styles.icon} />
                </div>
                <h1>Access Restricted</h1>
                <p>This section is reserved for Super Administrators only. Managers have restricted access to system-level settings and sensitive configurations.</p>
                <div className={styles.divider} />
                <div className={styles.info}>
                    <p>If you believe you need access to this section, please contact the System Administrator.</p>
                </div>
                <button className={styles.backBtn} onClick={() => window.history.back()}>
                    Return to Previous Page
                </button>
            </div>
        </div>
    );
};

export default AdminOnlyPage;
