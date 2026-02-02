import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../../services/api';
import { interactionService } from '../../../../services/interactionService';
import type { Advocate } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import { Loader2, ArrowLeft, Star, ScrollText } from 'lucide-react';
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
        subDepartment: 'Sub-Department',
        court: 'Select Court',
        location: 'Location',
        experience: 'Experience'
    });

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

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

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <button className={styles.backLink} onClick={() => showsidePage('normalfccards')}>
                    <ArrowLeft size={18} />
                    <span>Switch to Profiles</span>
                </button>
                <button
                    className={styles.backLink}
                    onClick={() => window.open('/dashboard/legal-docs', '_blank')}
                    style={{ marginLeft: '15px' }}
                >
                    <ScrollText size={18} />
                    <span>Legal Documentation</span>
                </button>
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
                    <option>Real Estate</option>
                </select>
                <select name="subDepartment" value={filters.subDepartment} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Sub-Department</option>
                    <option>Divorce</option>
                    <option>Property Dispute</option>
                    <option>Cyber Crime</option>
                    <option>Consumer Court</option>
                </select>
                <select name="court" value={filters.court} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Select Court</option>
                    <option>Supreme Court</option>
                    <option>High Court</option>
                    <option>District Court</option>
                    <option>Session Court</option>
                </select>
                <select name="location" value={filters.location} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Location</option>
                    <option>Delhi</option>
                    <option>Mumbai</option>
                    <option>Bangalore</option>
                    <option>Hyderabad</option>
                    <option>Kolkata</option>
                </select>
                <select name="experience" value={filters.experience} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Experience</option>
                    <option>0-2 Years</option>
                    <option>2-5 Years</option>
                    <option>5-10 Years</option>
                    <option>10+ Years</option>
                </select>

                <button className={styles.submitBtnDashboard} onClick={fetchAdvocates}>Submit</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                </div>
            ) : (
                <div className={styles.gridContainer}>
                    <div className={styles.grid}>
                        {advocates.map(adv => (
                            <div key={adv.id} onClick={() => showDetailedProfile(adv.unique_id)} style={{ cursor: 'pointer' }}>
                                <AdvocateCard
                                    advocate={adv}
                                    variant="featured"
                                    isPremium={isPremium}
                                    onAction={async (action, data) => {
                                        if (user && isPremium) {
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
                                            } else if (action === 'chat_confirmed') {
                                                showToast(`Connection established with ${adv.name}!`);
                                            }
                                        } else if (!isPremium) {
                                            showsidePage('upgrade');
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeaturedProfiles;
