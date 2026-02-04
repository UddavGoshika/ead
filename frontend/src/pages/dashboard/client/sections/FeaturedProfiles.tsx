import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../../services/api';
import { interactionService } from '../../../../services/interactionService';
import type { Advocate } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import { Loader2, ArrowLeft, Star, ScrollText } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import styles from '../AdvocateList.module.css';
import { LOCATION_DATA_RAW } from '../../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../../data/legalDomainData';

interface Props {
    showDetailedProfile: (id: string) => void;
    showToast: (msg: string) => void;
    showsidePage: (page: string) => void;
    onSelectForChat: (advocate: Advocate) => void;
}

const FeaturedProfiles: React.FC<Props> = ({ showDetailedProfile, showToast, showsidePage, onSelectForChat }) => {
    const { user, refreshUser } = useAuth();
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        specialization: '',
        subDepartment: '',
        court: '',
        state: '',
        district: '',
        city: '',
        experience: ''
    });

    // Derived Data for Dropdowns
    const availableDistricts = filters.state && LOCATION_DATA_RAW[filters.state] ? Object.keys(LOCATION_DATA_RAW[filters.state]) : [];
    const availableCities = filters.state && filters.district && LOCATION_DATA_RAW[filters.state][filters.district] ? LOCATION_DATA_RAW[filters.state][filters.district] : [];
    const availableSubDepartments = filters.specialization && LEGAL_DOMAINS[filters.specialization] ? LEGAL_DOMAINS[filters.specialization] : [];

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const params: any = {};
            params.category = 'featured'; // STRICTLY FEATURED (Paid Plans)
            if (filters.search) params.search = filters.search;
            if (filters.specialization) params.specialization = filters.specialization;
            if (filters.subDepartment) params.subSpecialization = filters.subDepartment;
            if (filters.court) params.court = filters.court;
            if (filters.state) params.state = filters.state;
            if (filters.district) params.district = filters.district;
            if (filters.city) params.city = filters.city;
            if (filters.experience) params.experience = filters.experience;

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
        const { name, value } = e.target;

        let newFilters = { ...filters, [name]: value };

        // Cascading Resets
        if (name === 'state') {
            newFilters.district = '';
            newFilters.city = '';
        } else if (name === 'district') {
            newFilters.city = '';
        } else if (name === 'specialization') {
            newFilters.subDepartment = '';
        }

        setFilters(newFilters);
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

            <div className={styles.searchSection} style={{ flexDirection: 'column', gap: '15px' }}>
                <form className={styles.searchContainer} onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
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

                {/* 4x2 Grid Layout for Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '100%' }}>
                    {/* Row 1 */}
                    <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className={styles.filterSelect}>
                        <option value="">All Departments</option>
                        {Object.keys(LEGAL_DOMAINS).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select name="subDepartment" value={filters.subDepartment} onChange={handleFilterChange} className={styles.filterSelect} disabled={!filters.specialization}>
                        <option value="">All Sub-Departments</option>
                        {availableSubDepartments.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>

                    <select name="court" value={filters.court} onChange={handleFilterChange} className={styles.filterSelect}>
                        <option value="">All Courts</option>
                        <option>Supreme Court</option>
                        <option>High Court</option>
                        <option>District Court</option>
                        <option>Session Court</option>
                        <option>Family Court</option>
                        <option>Consumer Forum</option>
                        <option>Tribunal</option>
                    </select>

                    <select name="experience" value={filters.experience} onChange={handleFilterChange} className={styles.filterSelect}>
                        <option value="">All Experience</option>
                        <option value="0-2 Years">0-2 Years</option>
                        <option value="2-5 Years">2-5 Years</option>
                        <option value="5-10 Years">5-10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                    </select>

                    {/* Row 2 */}
                    <select name="state" value={filters.state} onChange={handleFilterChange} className={styles.filterSelect}>
                        <option value="">All States</option>
                        {Object.keys(LOCATION_DATA_RAW).sort().map(st => (
                            <option key={st} value={st}>{st}</option>
                        ))}
                    </select>

                    <select name="district" value={filters.district} onChange={handleFilterChange} className={styles.filterSelect} disabled={!filters.state}>
                        <option value="">All Districts</option>
                        {availableDistricts.sort().map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>

                    <select name="city" value={filters.city} onChange={handleFilterChange} className={styles.filterSelect} disabled={!filters.district}>
                        <option value="">All Cities</option>
                        {availableCities.sort().map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>

                    <button className={styles.submitBtnDashboard} onClick={fetchAdvocates} style={{ width: '100%', height: '100%' }}>Apply Filters</button>
                </div>
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
                                        if (user) {
                                            const targetId = String(adv.id);
                                            const userId = String(user.id);
                                            const targetRole = 'advocate';

                                            try {
                                                if (action === 'interest') {
                                                    const res = await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                                    if (res && res.coins !== undefined) refreshUser({ coins: res.coins, coinsUsed: res.coinsUsed, coinsReceived: res.coinsReceived });
                                                    showToast(`Interest sent to ${adv.name}`);
                                                } else if (action === 'superInterest') {
                                                    const res = await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                                    if (res && res.coins !== undefined) refreshUser({ coins: res.coins, coinsUsed: res.coinsUsed, coinsReceived: res.coinsReceived });
                                                    showToast(`Super Interest sent to ${adv.name}!`);
                                                } else if (action === 'shortlist') {
                                                    const res = await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                                    if (res && res.coins !== undefined) refreshUser({ coins: res.coins, coinsUsed: res.coinsUsed, coinsReceived: res.coinsReceived });
                                                    showToast(`${adv.name} added to shortlist`);
                                                } else if (action === 'openFullChatPage') {
                                                    onSelectForChat(adv);
                                                } else if (action === 'message_sent' && data) {
                                                    const res = await interactionService.sendMessage(userId, targetId, data);
                                                    // sendMessage currently doesn't return coins in backend? check interactions.js
                                                    // Rule: Chat unlock happens via recordActivity('chat'), so sendMessage doesn't deduct.
                                                    showToast(`Message sent to ${adv.name}`);
                                                }
                                            } catch (err: any) {
                                                console.error('Action failed', err);
                                                const errorMsg = err.response?.data?.message || 'Operation failed. Please try again.';
                                                showToast(errorMsg);

                                                // If limit reached or insufficient coins, then redirect to upgrade
                                                const errorCode = err.response?.data?.error;
                                                const redirectErrors = [
                                                    'FEATURED_INTERACTION_LIMIT',
                                                    'FEATURED_CHAT_LIMIT',
                                                    'MESSAGE_COUNT_LIMIT',
                                                    'ACTION_LIMIT_REACHED',
                                                    'INSUFFICIENT_COINS'
                                                ];

                                                if (redirectErrors.includes(errorCode)) {
                                                    setTimeout(() => showsidePage('upgrade'), 2000);
                                                }
                                            }
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
