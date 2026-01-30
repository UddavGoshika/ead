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
    const [filters, setFilters] = useState({
        search: '',
        specialization: 'Department',
        court: 'Select Court',
        location: 'Location',
        experience: 'Experience'
    });

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filters.search) params.search = filters.search;
            if (filters.specialization !== 'Department') params.specialization = filters.specialization;
            if (filters.court !== 'Select Court') params.court = filters.court;
            if (filters.location !== 'Location') params.city = filters.location;
            if (filters.experience !== 'Experience') params.experience = filters.experience;

            const response = await advocateService.getAdvocates(params);
            setAdvocates(response.data.advocates || []);
        } catch (err) {
            console.error(err);
            showToast('Failed to load featured advocates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvocates();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAdvocates();
    };

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <button className={styles.backLink} onClick={() => showsidePage('normalfccards')}>
                    <ArrowLeft size={18} />
                    <span>Switch to Profiles</span>
                </button>

                <div className={styles.planInfo}>
                    <span className={styles.accountLabel}>Account Type:</span>
                    {isPremium ? (
                        <div className={`${styles.planBadge} ${plan.toLowerCase().includes('ultra') ? styles.ultraBadge :
                            plan.toLowerCase().includes('pro') ? styles.proBadge :
                                styles.liteBadge
                            }`}>
                            <div className={styles.verifiedBadgeWrapper}>
                                <svg className={styles.premiumSeal} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className={styles.sealRibbons} d="M8 18L5 22L8 21L11 22L9 18H8ZM16 18L19 22L16 21L13 22L15 18H16Z" fill="#3b82f6" />
                                    <path className={styles.sealMain} d="M12 2L13.8 3.5L16.2 3.1L17.3 5.3L19.6 5.8L19.8 8.2L21.7 9.7L20.9 12L21.7 14.3L19.8 15.8L19.6 18.2L17.3 18.7L16.2 20.9L13.8 20.5L12 22L10.2 20.5L7.8 20.9L6.7 18.7L4.4 18.2L4.2 15.8L2.3 14.3L3.1 12L2.3 9.7L4.2 8.2L4.4 5.8L6.7 5.3L7.8 3.1L10.2 3.5L12 2Z" fill="#3b82f6" />
                                    <path d="M8.5 12L10.5 14L15.5 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span>{plan.trim().includes(' ') ? plan.trim().replace(/\s+(?=[^\s]+$)/, '-') : plan}</span>
                        </div>
                    ) : (
                        <span className={`${styles.planBadge} ${styles.freeBadge}`}>Advocate - Free</span>
                    )}
                </div>
            </div>

            <div className={styles.searchSection}>
                <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by Advocate's ID or Name......"
                        className={styles.dashboardSearchInput}
                    />
                    <button type="submit" className={styles.searchBtnInside}>Search</button>
                </form>

                <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Department</option>
                    <option>Criminal Law</option>
                    <option>Civil Law</option>
                    <option>Family Law</option>
                    <option>Corporate Law</option>
                    <option>Taxation</option>
                </select>
                <select name="court" value={filters.court} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Select Court</option>
                    <option>Supreme Court</option>
                    <option>High Court</option>
                    <option>District Court</option>
                </select>
                <select name="location" value={filters.location} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Location</option>
                    <option>Delhi</option>
                    <option>Mumbai</option>
                    <option>Bangalore</option>
                </select>
                <select name="experience" value={filters.experience} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Experience</option>
                    <option>0-2 Years</option>
                    <option>2-5 Years</option>
                    <option>5-10 Years</option>
                </select>

                <button className={styles.submitBtnDashboard} onClick={fetchAdvocates}>Submit</button>
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
