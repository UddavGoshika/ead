import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../services/api';
import type { Advocate } from '../../../types';
import AdvocateCard from '../../../components/dashboard/AdvocateCard';
import { Search, SlidersHorizontal, Loader2, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import styles from './AdvocateList.module.css';
import { LOCATION_DATA_RAW } from '../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../data/legalDomainData';
import TokenTopupModal from '../../../components/dashboard/shared/TokenTopupModal';

interface AdvocateListProps {
    onAction?: (action: string, adv: Advocate) => void;
    showDetailedProfile?: (id: string) => void;
}

const AdvocateList: React.FC<AdvocateListProps> = ({ onAction, showDetailedProfile }) => {
    const { user, refreshUser } = useAuth();
    const [showTopup, setShowTopup] = useState(false);
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const params: any = {};
            params.category = 'normal'; // STRICTLY NORMAL (Free Plans)
            if (filters.search) params.search = filters.search;
            if (filters.specialization) params.specialization = filters.specialization;
            if (filters.subDepartment) params.subSpecialization = filters.subDepartment;
            if (filters.court) params.court = filters.court;
            if (filters.state) params.state = filters.state;
            if (filters.district) params.district = filters.district;
            if (filters.city) params.city = filters.city;
            if (filters.experience) params.experience = filters.experience;

            const response = await advocateService.getAdvocates(params);
            let data = response.data.advocates || [];

            // Normalize specialties
            data = data.map((ext: any) => ({
                ...ext,
                specialties: Array.isArray(ext.specialties)
                    ? ext.specialties
                    : (ext.specialties as string).split(',').map(s => s.trim())
            }));

            // Filter out featured profiles if we only want 'normal' ones here, 
            // but usually this list shows all. The user asked for a switch TO featured.
            // So we show all here, and they can switch to a filtered featured view if they want.
            setAdvocates(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch advocates', err);
            setError('Could not load advocates. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvocates();
    }, [isPremium]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };

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

    const handleAction = async (adv: Advocate, action: string, data?: string) => {
        if (!user) return;
        if (user.status === 'Pending') {
            alert("Your profile is under verification. You can perform interactions once approved (usually in 12-24 hours).");
            return;
        }
        if (onAction) onAction(action, adv);

        const targetId = String(adv.id);
        const userId = String(user.id);

        try {
            let res;
            if (action === 'interest') {
                res = await interactionService.recordActivity('advocate', targetId, 'interest', userId);
            } else if (action === 'superInterest') {
                res = await interactionService.recordActivity('advocate', targetId, 'superInterest', userId);
            } else if (action === 'shortlist') {
                res = await interactionService.recordActivity('advocate', targetId, 'shortlist', userId);
            } else if (action === 'openFullChatPage') {
                res = await interactionService.recordActivity('advocate', targetId, 'chat', userId);
                onAction?.('openFullChatPage', adv);
            } else if (action === 'message_sent' && data) {
                await interactionService.sendMessage(userId, targetId, data);
            }

            if (res && res.coins !== undefined) {
                refreshUser({
                    coins: res.coins,
                    coinsUsed: res.coinsUsed
                });
            }
        } catch (err: any) {
            console.error('Action failed', err);
            const errorData = err.response?.data;
            const msg = errorData?.message || 'Operation failed. Please try again.';
            const errorCode = errorData?.error;

            if (errorCode === 'INTERACTION_LIMIT') {
                alert("You’ve reached the interaction limit for this profile (Max 3)");
            } else if (errorCode === 'ZERO_COINS' || errorCode === 'INSUFFICIENT_COINS') {
                setShowTopup(true);
            } else if (errorCode === 'UPGRADE_REQUIRED') {
                alert("Upgrade to premium to perform this action.");
                onAction?.('openUpgradePage', adv);
            } else {
                alert(msg);
            }
        }
    };

    const availableDistricts = filters.state && LOCATION_DATA_RAW[filters.state] ? Object.keys(LOCATION_DATA_RAW[filters.state]) : [];
    const availableCities = filters.state && filters.district && LOCATION_DATA_RAW[filters.state][filters.district] ? LOCATION_DATA_RAW[filters.state][filters.district] : [];
    const availableSubDepartments = filters.specialization && LEGAL_DOMAINS[filters.specialization] ? LEGAL_DOMAINS[filters.specialization] : [];

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerSection} style={{ justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                    <div className={styles.titleSection}>
                        <h1 style={{ color: '#facc15', fontSize: '2rem', marginBottom: '8px' }}>Profiles</h1>
                        <p style={{ color: '#94a3b8' }}>Connect with highly qualified legal professionals nationwide</p>
                    </div>
                    {onAction && (
                        <button
                            className={styles.backLink}
                            onClick={() => onAction('switchFeatured', {} as Advocate)}
                            style={{
                                background: 'rgba(250, 204, 21, 0.1)',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px solid rgba(250, 204, 21, 0.3)',
                                color: '#facc15'
                            }}
                        >
                            <Star size={18} fill="#facc15" />
                            <span style={{ fontWeight: 700 }}>Switch to Featured Profiles</span>
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>

                <div className={styles.searchSection} style={{ flexDirection: 'column', gap: '15px', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <form className={styles.searchContainer} onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Find by Advocate Name or ID..."
                            className={styles.dashboardSearchInput}
                        />
                        <button type="submit" className={styles.searchBtnInside}>Search</button>
                    </form>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
                        <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className={styles.filterSelect}>
                            <option value="">All Specializations</option>
                            {Object.keys(LEGAL_DOMAINS).map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>

                        <select name="subDepartment" value={filters.subDepartment} onChange={handleFilterChange} className={styles.filterSelect} disabled={!filters.specialization}>
                            <option value="">Sub-Department</option>
                            {availableSubDepartments.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>

                        <select name="court" value={filters.court} onChange={handleFilterChange} className={styles.filterSelect}>
                            <option value="">Any Court</option>
                            <option>Supreme Court</option>
                            <option>High Court</option>
                            <option>District Court</option>
                            <option>Tribunal</option>
                        </select>

                        <select name="experience" value={filters.experience} onChange={handleFilterChange} className={styles.filterSelect}>
                            <option value="">Any Experience</option>
                            <option value="0-2 Years">0-2 Years</option>
                            <option value="2-5 Years">2-5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                        </select>

                        <select name="state" value={filters.state} onChange={handleFilterChange} className={styles.filterSelect}>
                            <option value="">Any State</option>
                            {Object.keys(LOCATION_DATA_RAW).sort().map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>

                        <select name="district" value={filters.district} onChange={handleFilterChange} className={styles.filterSelect} disabled={!filters.state}>
                            <option value="">Any District</option>
                            {availableDistricts.sort().map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>

                        <select name="city" value={filters.city} onChange={handleFilterChange} className={styles.filterSelect} disabled={!filters.district}>
                            <option value="">Any City</option>
                            {availableCities.sort().map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <button className={styles.submitBtnDashboard} onClick={fetchAdvocates} style={{ height: '100%' }}>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className={styles.centered}>
                    <Loader2 className={styles.spinner} size={48} />
                    <p>Loading Expert Profiles...</p>
                </div>
            ) : error ? (
                <div className={styles.centered}>
                    <p className={styles.error}>{error}</p>
                    <button onClick={fetchAdvocates} className={styles.upgradeNowBtn}>Retry</button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {advocates.length > 0 ? (
                        advocates.map(advocate => (
                            <div
                                key={advocate.id}
                                onClick={() => showDetailedProfile && showDetailedProfile(advocate.unique_id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <AdvocateCard
                                    advocate={advocate}
                                    variant={advocate.isFeatured ? 'featured' : 'normal'}
                                    isPremium={isPremium}
                                    onAction={(action, data) => handleAction(advocate, action, data)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResults}>
                            <h3>No Experts Found</h3>
                            <p>Try adjusting your search or filters to find more results.</p>
                        </div>
                    )}
                </div>
            )}

            <TokenTopupModal
                isOpen={showTopup}
                onClose={() => setShowTopup(false)}
                onTopup={() => onAction?.('openUpgradePage', {} as Advocate)}
            />
        </div>
    );
};

export default AdvocateList;
