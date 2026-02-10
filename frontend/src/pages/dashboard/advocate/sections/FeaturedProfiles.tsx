import React, { useEffect, useState } from 'react';
import { advocateService, clientService } from '../../../../services/api';
import type { Advocate, Client } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import ClientCard from '../../../../components/dashboard/ClientCard';
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
    onSelectForChat: (partner: any) => void;
}

const FeaturedProfiles: React.FC<Props> = ({ showDetailedProfile, showToast, showsidePage, onSelectForChat }) => {
    const { user, refreshUser } = useAuth();
    const isAdvocate = user?.role.toLowerCase() === 'advocate';
    const [showTopup, setShowTopup] = useState(false);
    const [profiles, setProfiles] = useState<any[]>([]);
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

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const params: any = {};
            params.category = 'featured';

            if (filters.search) params.search = filters.search;
            if (filters.specialization) params.specialization = filters.specialization;
            if (filters.subDepartment) params.subDepartment = filters.subDepartment;
            if (filters.court) params.court = filters.court;
            if (filters.state) params.state = filters.state;
            if (filters.district) params.district = filters.district;
            if (filters.city) params.city = filters.city;
            if (filters.experience) params.experience = filters.experience;

            if (isAdvocate) {
                const response = await clientService.getClients(params);
                setProfiles(response.data.clients || []);
            } else {
                // Rule 3: STRICTLY FEATURED (Premium Plans)
                params.subSpecialization = params.subDepartment;
                const response = await advocateService.getAdvocates(params);
                setProfiles(response.data.advocates || []);
            }
        } catch (err) {
            console.error(err);
            showToast(`Failed to load ${isAdvocate ? 'client' : 'advocate'} profiles`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
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
        fetchProfiles();
    };

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    // Centralized Interaction Handler
    const handleInteraction = async (profile: any, action: string, data?: any) => {
        if (!user) return;
        if (user.status === 'Pending') {
            alert("Your profile is under verification. You can perform interactions once approved (usually in 12-24 hours).");
            return;
        }

        const targetId = String(profile.id);
        const userId = String(user.id);
        const targetRole = isAdvocate ? 'client' : 'advocate';
        const profileName = profile.name || `${profile.firstName} ${profile.lastName}`;

        try {
            let res;
            if (action === 'interest') {
                res = await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                showToast(`Interest sent to ${profileName}`);
            } else if (action === 'superInterest') {
                res = await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                showToast(`Super Interest sent to ${profileName}!`);
            } else if (action === 'shortlist') {
                res = await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                showToast(`${profileName} added to shortlist`);
            } else if (action === 'openFullChatPage') {
                res = await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                onSelectForChat(profile);
            } else if (action === 'message_sent' && data) {
                const partnerUserId = typeof profile.userId === 'object' ? String((profile.userId as any)._id) : String(profile.userId || profile.id);
                await interactionService.sendMessage(userId, partnerUserId, data);
                showToast(`Message sent to ${profileName}`);
            }

            // Update coins if spent
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
                setShowTopup(true);
            } else if (errorCode === 'UPGRADE_REQUIRED') {
                showToast("Upgrade to premium to perform this action.");
                showsidePage('upgrade');
            } else {
                showToast(msg);
            }
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <button className={styles.backLink} onClick={() => showsidePage('normalfccards')}>
                    <ArrowLeft size={18} />
                    <span>{isAdvocate ? 'Browse Profiles' : 'Switch to Profiles'}</span>
                </button>
                <button
                    className={styles.backLink}
                    onClick={() => window.open('/dashboard/legal-docs', '_blank')}
                    style={{ marginLeft: '15px' }}
                >
                    <ScrollText size={18} />
                    <span>Legal Documentation</span>
                </button>

                {/* <div className={styles.planInfo}>
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
                </div> */}
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

                    <button className={styles.submitBtnDashboard} onClick={fetchProfiles} style={{ height: '100%', minHeight: '45px' }}>
                        Search
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                </div>
            ) : (
                <div className={styles.grid}>
                    {profiles.length > 0 ? (
                        profiles.map(profile => (
                            <div key={profile.id} onClick={() => showDetailedProfile(isAdvocate ? profile.id : profile.unique_id)} style={{ cursor: 'pointer' }}>
                                {isAdvocate ? (
                                    <ClientCard
                                        client={profile}
                                        variant="featured"
                                        isPremium={isPremium}
                                        onAction={async (action, data) => handleInteraction(profile, action, data)}
                                    />
                                ) : (
                                    <AdvocateCard
                                        advocate={profile}
                                        variant="featured"
                                        isPremium={isPremium}
                                        onAction={async (action, data) => handleInteraction(profile, action, data)}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={styles.noProfiles}>
                            <p>No featured {isAdvocate ? 'clients' : 'advocates'} found at the moment.</p>
                            <button onClick={() => showsidePage('normalfccards')} className={styles.switchBtn}>
                                Browse All {isAdvocate ? 'Clients' : 'Profiles'}
                            </button>
                        </div>
                    )}
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
