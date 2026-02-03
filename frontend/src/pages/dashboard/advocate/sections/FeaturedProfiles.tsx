import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../../services/api';
import type { Advocate } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import { Loader2, ArrowLeft, ScrollText, Shield } from 'lucide-react';
import { interactionService } from '../../../../services/interactionService';
import { useAuth } from '../../../../context/AuthContext';
import styles from '../AdvocateList.module.css';
import { LOCATION_DATA_RAW } from '../../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../../data/legalDomainData';
import TokenTopupModal from '../../../../components/dashboard/shared/TokenTopupModal';

interface Props {
    showDetailedProfile: (id: string) => void;
    showToast: (msg: string) => void;
    showsidePage: (page: string) => void;
    onSelectForChat: (advocate: Advocate) => void;
}

const FeaturedProfiles: React.FC<Props> = ({ showDetailedProfile, showToast, showsidePage, onSelectForChat }) => {
    const { user, refreshUser } = useAuth();
    const [showTopup, setShowTopup] = useState(false);
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

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const params: any = {};
            params.category = 'featured'; // Rule 3: STRICTLY FEATURED (Premium Plans)

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

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

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

                {/* Filter Grid Row 1: Legal Domain */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%' }}>
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
                </div>

                {/* Filter Grid Row 2: Location */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%' }}>
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

                    <select name="experience" value={filters.experience} onChange={handleFilterChange} className={styles.filterSelect}>
                        <option value="">All Experience</option>
                        <option value="0-2 Years">0-2 Years</option>
                        <option value="2-5 Years">2-5 Years</option>
                        <option value="5-10 Years">5-10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                    </select>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className={styles.submitBtnDashboard} onClick={fetchAdvocates} style={{ width: '200px' }}>Apply Filters</button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                </div>
            ) : !isPremium ? (
                <div className={styles.premiumOverlay}>
                    <div className={styles.premiumLockCard}>
                        <Shield size={64} color="#facc15" strokeWidth={1} />
                        <h2>Featured Profiles Locked</h2>
                        <p>Upgrade to a Premium Plan to view and interact with our top-rated featured advocates.</p>
                        <button className={styles.upgradeNowBtn} onClick={() => showsidePage('upgrade')}>
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            ) : (
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
                                            let res;
                                            if (action === 'interest') {
                                                res = await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                                showToast(`Interest sent to ${adv.name}`);
                                            } else if (action === 'superInterest') {
                                                res = await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                                showToast(`Super Interest sent to ${adv.name}!`);
                                            } else if (action === 'shortlist') {
                                                res = await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                                showToast(`${adv.name} added to shortlist`);
                                            } else if (action === 'openFullChatPage') {
                                                // Rule 12: Chat Unlock
                                                res = await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                                                onSelectForChat(adv);
                                            } else if (action === 'message_sent' && data) {
                                                await interactionService.sendMessage(userId, targetId, data);
                                                showToast(`Message sent to ${adv.name}`);
                                            }

                                            // Update local user state if tokens were spent
                                            if (res && res.coins !== undefined) {
                                                refreshUser({
                                                    coins: res.coins,
                                                    coinsUsed: res.coinsUsed
                                                });
                                            }
                                        } catch (err: any) {
                                            const errorData = err.response?.data;
                                            const msg = errorData?.message || 'Action failed';
                                            const errorCode = errorData?.error;

                                            if (errorCode === 'INTERACTION_LIMIT') {
                                                showToast("You’ve reached the interaction limit for this profile (Max 3)");
                                            } else if (errorCode === 'ZERO_COINS' || errorCode === 'INSUFFICIENT_COINS') {
                                                setShowTopup(true); // Rule 15
                                            } else if (errorCode === 'UPGRADE_REQUIRED') {
                                                showToast("Upgrade to premium to perform this action.");
                                                showsidePage('upgrade');
                                            } else {
                                                showToast(msg);
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            <TokenTopupModal
                isOpen={showTopup}
                onClose={() => setShowTopup(false)}
                onTopup={() => showsidePage('upgrade')}
            />
        </div>
    );
};

export default FeaturedProfiles;
