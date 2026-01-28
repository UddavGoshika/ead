import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../../services/api';
import type { Advocate } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { interactionService } from '../../../../services/interactionService';
import { useAuth } from '../../../../context/AuthContext';
import styles from '../AdvocateList.module.css';

interface Props {
    showDetailedProfile: (id: string) => void;
    showToast: (msg: string) => void;
    showsidePage: (page: string) => void;
    onSelectForChat: (advocate: Advocate) => void;
}

const FeaturedProfiles: React.FC<Props> = ({ showDetailedProfile, showToast, showsidePage, onSelectForChat }) => {
    const { user } = useAuth();
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvocates = async () => {
            try {
                const response = await advocateService.getAdvocates();
                setAdvocates(response.data.advocates || []);
            } catch (err) {
                console.error(err);
                showToast('Failed to load featured advocates');
            } finally {
                setLoading(false);
            }
        };
        fetchAdvocates();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <button className={styles.backLink} onClick={() => showsidePage('normalfccards')}>
                    <ArrowLeft size={18} />
                    <span>Switch to  Profiles</span>
                </button>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by Advocate's ID......"
                        className={styles.dashboardSearchInput}
                    />
                    <button className={styles.searchBtnInside}>Search</button>
                </div>

                <select className={styles.filterSelect}>
                    <option>Department</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Sub-Department</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Select Court</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Location</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Experience</option>
                </select>

                <button className={styles.submitBtnDashboard}>Submit</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                </div>
            ) : (
                <div className={styles.grid}>
                    {advocates.map(adv => (
                        <div key={adv.id} onClick={() => showDetailedProfile(adv.unique_id)} style={{ cursor: 'pointer' }}>
                            <AdvocateCard
                                advocate={adv}
                                variant="featured"
                                isPremium={user?.isPremium}
                                onAction={async (action, data) => {
                                    if (user) {
                                        const targetId = String(adv.id);
                                        const userId = String(user.id);
                                        const targetRole = 'advocate';

                                        if (action === 'interest_initiated' || action === 'interest') {
                                            await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                            showToast(`Interest sent to ${adv.name}`);
                                        } else if (action === 'super_interest_sent' || action === 'super-interest') {
                                            await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                            showToast(`Super Interest sent to ${adv.name}!`);
                                        } else if (action === 'shortlisted') {
                                            await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                            showToast(`${adv.name} added to shortlist`);
                                        } else if (action === 'openFullChatPage') {
                                            await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                                            onSelectForChat(adv);
                                        } else if (action === 'message_sent' && data) {
                                            await interactionService.sendMessage(userId, targetId, data);
                                            showToast(`Message sent to ${adv.name}`);
                                        }
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeaturedProfiles;
