import React, { useEffect, useState } from 'react';
import { caseService } from '../../../services/api';
import type { Case } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import CaseCard from '../../../components/dashboard/CaseCard';
import { Plus, Search, Loader2, FolderOpen } from 'lucide-react';
import styles from './CaseList.module.css';

const CaseList: React.FC = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await caseService.getCases(user?.id);
                const data = response.data.cases || [];
                setCases(data);
            } catch (err: any) {
                console.error('Failed to fetch cases', err);
                setError('Could not load cases. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchCases();
        } else {
            setLoading(false);
        }
    }, [user]);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>My Legal Cases</h1>
                    <p>Track your active litigation and case history</p>
                </div>

                <button className={styles.addBtn}>
                    <Plus size={18} />
                    <span>Post New Case</span>
                </button>
            </header>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input type="text" placeholder="Search cases by title or number..." />
                </div>
            </div>

            {loading ? (
                <div className={styles.centered}>
                    <Loader2 className={styles.spinner} size={48} />
                    <p>Syncing with court records...</p>
                </div>
            ) : error ? (
                <div className={styles.centered}>
                    <p className={styles.error}>{error}</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {cases.length > 0 ? (
                        cases.map(item => (
                            <CaseCard key={item.id} caseData={item} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <FolderOpen size={48} />
                            <h3>No cases yet</h3>
                            <p>You haven't posted any legal requirements. Connect with an advocate to get started.</p>
                            <button className={styles.ctaBtn}>Browse Advocates</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CaseList;
