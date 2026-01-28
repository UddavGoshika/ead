import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../services/api';
import type { Advocate } from '../../../types';
import AdvocateCard from '../../../components/dashboard/AdvocateCard';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import styles from './AdvocateList.module.css';

const AdvocateList: React.FC = () => {
    const { user } = useAuth();
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdvocates = async () => {
            try {
                const response = await advocateService.getAdvocates();
                // Extract advocates from the wrapper object
                const data = response.data.advocates || [];

                // Normalize specialties if they come as string from legacy
                const normalized = data.map(ext => ({
                    ...ext,
                    specialties: Array.isArray(ext.specialties)
                        ? ext.specialties
                        : (ext.specialties as string).split(',').map(s => s.trim())
                }));

                setAdvocates(normalized);
            } catch (err: any) {
                console.error('Failed to fetch advocates', err);
                setError('Could not load advocates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdvocates();
    }, []);

    const handleAction = async (adv: Advocate, action: string, data?: string) => {
        if (!user) return;
        const targetId = String(adv.id);
        const userId = String(user.id);
        const targetRole = 'advocate';

        try {
            if (action === 'interest_initiated' || action === 'interest') {
                await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                alert(`Interest sent to ${adv.name}`);
            } else if (action === 'super_interest_sent' || action === 'super-interest') {
                await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                alert(`Super Interest sent to ${adv.name}!`);
            } else if (action === 'shortlisted') {
                await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                alert(`${adv.name} added to shortlist`);
            } else if (action === 'message_sent' && data) {
                await interactionService.sendMessage(userId, targetId, data);
            }
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Featured Advocates</h1>
                    <p>Find the right legal professional for your case</p>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input type="text" placeholder="Search advocates..." />
                    </div>
                    <button className={styles.filterBtn}>
                        <SlidersHorizontal size={18} />
                        <span>Filters</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.centered}>
                    <Loader2 className={styles.spinner} size={48} />
                    <p>Finding the best advocates for you...</p>
                </div>
            ) : error ? (
                <div className={styles.centered}>
                    <p className={styles.error}>{error}</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {advocates.length > 0 ? (
                        advocates.map(advocate => (
                            <AdvocateCard
                                key={advocate.id}
                                advocate={advocate}
                                onAction={(action, data) => handleAction(advocate, action, data)}
                            />
                        ))
                    ) : (
                        <p className={styles.noResults}>No advocates found matching your criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvocateList;
