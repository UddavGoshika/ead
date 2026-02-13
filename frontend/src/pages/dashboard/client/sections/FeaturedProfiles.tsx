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
import { useRelationshipStore } from '../../../../store/useRelationshipStore';
import { useInteractions } from '../../../../hooks/useInteractions';

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

    const { handleInteraction } = useInteractions(showToast);
    const interactedIds = useRelationshipStore(state => state.interactedIds);

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

    const filteredAdvocates = advocates.filter(adv => {
        // Robust ID extraction handling both string IDs and populated objects
        const partnerId = String(
            (adv.userId && (adv.userId as any)._id)
                ? (adv.userId as any)._id
                : (adv.userId || adv.id || (adv as any)._id)
        );
        return !interactedIds.has(partnerId);
    });

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
                {/* Unified Search & Filter Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    width: '100%'
                }}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search Name or ID..."
                        className={styles.dashboardSearchInput}
                        style={{ paddingRight: '20px' }}
                    />

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

                    <button className={styles.submitBtnDashboard} onClick={fetchAdvocates} style={{ height: '100%', minHeight: '45px' }}>
                        Search
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                </div>
            ) : (
                <div className={styles.gridContainer}>
                    <div className={styles.grid}>
                        {filteredAdvocates.map(adv => (
                            <div key={adv.id} onClick={() => showDetailedProfile(adv.unique_id)} style={{ cursor: 'pointer' }}>
                                <AdvocateCard
                                    advocate={adv}
                                    variant="featured"
                                    isPremium={isPremium}
                                    onAction={async (action, data) => {
                                        if (action === 'view_profile') {
                                            showDetailedProfile(adv.unique_id);
                                            return;
                                        }
                                        handleInteraction(adv, action, data);
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
