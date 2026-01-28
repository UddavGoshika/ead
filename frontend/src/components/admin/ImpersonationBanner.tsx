import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import styles from './ImpersonationBanner.module.css';

const ImpersonationBanner: React.FC = () => {
    const { isImpersonating, switchBackToAdmin, user } = useAuth();

    useEffect(() => {
        if (isImpersonating) {
            document.body.classList.add('impersonating');
        } else {
            document.body.classList.remove('impersonating');
        }
        return () => document.body.classList.remove('impersonating');
    }, [isImpersonating]);

    if (!isImpersonating) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <div className={styles.info}>
                    <div className={styles.indicator}>
                        <ShieldAlert size={16} />
                        <span>Admin Impersonation Mode</span>
                    </div>
                    <p className={styles.text}>
                        Currently viewing as <strong>{user?.name}</strong>
                        <span className={styles.roleTag}>{user?.role}</span>
                    </p>
                </div>
                <button className={styles.switchBackBtn} onClick={switchBackToAdmin}>
                    <ArrowLeft size={18} />
                    <span>Switch back to Super Admin panel</span>
                </button>
            </div>
        </div>
    );
};

export default ImpersonationBanner;
