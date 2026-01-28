import React from 'react';
import styles from '../admin/ContactQueries.module.css';
import { useAuth } from '../../context/AuthContext';
import { MdPersonAdd, MdGroupAdd } from 'react-icons/md';

const ManualEntry: React.FC = () => {
    const { openAdvocateReg, openClientReg } = useAuth();

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Manual Ingestion Portal</h1>
                    <p>Select the profile type to initialize a single-member registration sequence.</p>
                </div>
            </header>

            <div className={styles.gridsWrapper} style={{ gridTemplateColumns: '1fr 1fr', maxWidth: '1000px', margin: '0 auto' }}>
                <div
                    className={styles.queryCard}
                    onClick={openAdvocateReg}
                    style={{ padding: '60px', textAlign: 'center', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                >
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', color: '#10b981' }}>
                            <MdPersonAdd size={64} />
                        </div>
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>Register Advocate</h2>
                    <p style={{ color: '#94a3b8' }}>Manually onboard a new legal professional to the platform.</p>
                </div>

                <div
                    className={styles.queryCard}
                    onClick={openClientReg}
                    style={{ padding: '60px', textAlign: 'center', cursor: 'pointer', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}
                >
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '24px', color: '#3b82f6' }}>
                            <MdGroupAdd size={64} />
                        </div>
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>Register Client</h2>
                    <p style={{ color: '#94a3b8' }}>Manually onboard a new client or corporate entity.</p>
                </div>
            </div>
        </div>
    );
};

export default ManualEntry;
