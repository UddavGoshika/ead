import React, { useEffect, useState } from 'react';
import { advocateService } from '../../../services/api';
import type { Advocate } from '../../../types';
import { LEGAL_DOMAINS } from '../../../data/legalDomainData';
import { useRelationshipStore } from '../../../store/useRelationshipStore';
import AdvocateCard from '../../../components/dashboard/AdvocateCard';
import TokenTopupModal from '../../../components/dashboard/shared/TokenTopupModal';
import { Loader2, ArrowLeft, ScrollText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import styles from './AdvocateList.module.css';
import { LOCATION_DATA_RAW } from '../../../components/layout/statesdis';
import { useQueryClient } from '@tanstack/react-query';

import { useInteractions } from '../../../hooks/useInteractions';
import { checkIsPremium } from '../../../utils/planHelper';


interface AdvocateListProps {
    onAction?: (action: string, adv: Advocate) => void;
    showDetailedProfile?: (id: string) => void;
    showToast?: (msg: string) => void;
}

const AdvocateList: React.FC<AdvocateListProps> = ({ onAction, showDetailedProfile, showToast }) => {
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const [showTopup, setShowTopup] = useState(false);
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // removedProfileIds removed, using global store now
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

    const isPremium = checkIsPremium(user);


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

    const { relationships } = useRelationshipStore();
    const interactedIds = useRelationshipStore((state: any) => state.interactedIds); // Reactive skipped/interacted set
    const { handleInteraction } = useInteractions();

    useEffect(() => {
        fetchAdvocates();
    }, [isPremium]); // Removed manual event listener

    const filteredAdvocates = advocates.filter(adv => {
        // Robust ID extraction handling both string IDs and populated objects
        const partnerId = String(
            (adv.userId && (adv.userId as any)._id)
                ? (adv.userId as any)._id
                : (adv.userId || adv.id || (adv as any)._id)
        );

        // Filter out if in global interactedIds, UNLESS it is shortlisted
        if (interactedIds.has(partnerId)) {
            const rel = relationships[partnerId];
            const state = typeof rel === 'string' ? rel : rel?.state;

            // KEEP shortlisted profiles visible
            if (state === 'SHORTLISTED') return true;

            return false;
        }

        // Also check relationship state if needed
        const rel = relationships[partnerId];
        if (rel?.state && ['ACCEPTED', 'BLOCKED'].includes(rel.state)) {
            // Only hide ACCEPTED or BLOCKED
            return false;
        }

        return true;
    });

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

    const handleAction = async (adv: Advocate, action: string, data?: any) => {
        if (!user) return;
        if (user.status === 'Pending') {
            alert("Your profile is under verification. You can perform interactions once approved.");
            return;
        }

        // Handle navigation actions purely locally/parent
        if (action === 'openFullChatPage') {
            // We still record 'chat' activity if needed, or just open?
            // Usually 'chat' activity is recorded when actual message sent, or specifically requested.
            // Let's rely on onAction for navigation. 
            // If the parent wants to record 'chat' access, it can. But typically we just open.
            // However, existing code called interactionService.recordActivity('chat').
            // We can use handleInteraction for that if supported, or just keep it simple.
            // 'chat' isn't really a state changing interaction in useInteractions yet, unless we add it.
            // For now, let's just call onAction directly as it likely just sets state in parent.
            if (onAction) onAction('openFullChatPage', adv);
            return;
        }
        if (action === 'openUpgradePage') {
            if (onAction) onAction('openUpgradePage', adv);
            return;
        }

        // Handle standard interactions via hook
        const partnerId = String(adv.userId || adv.id);
        const partner = { id: partnerId, role: 'advocate', name: adv.name }; // AdvocateList shows advocates

        try {
            await handleInteraction(partner, action, data);

            // Post-interaction navigation if needed
            if (action === 'message_sent' && onAction) {
                // Should we navigate? Maybe not if it's a quick message.
                // But existing code didn't navigate.
            }
        } catch (err) {
            console.error("Interaction failed in AdvocateList", err);
            // Error handled by hook (toast)
            if ((err as any)?.error === 'UPGRADE_REQUIRED') {
                if (onAction) onAction('openUpgradePage', adv);
            } else if ((err as any)?.error === 'ZERO_COINS' || (err as any)?.error === 'INSUFFICIENT_COINS') {
                setShowTopup(true);
            }
        }
    };

    const availableDistricts = filters.state && LOCATION_DATA_RAW[filters.state] ? Object.keys(LOCATION_DATA_RAW[filters.state]) : [];
    const availableCities = filters.state && filters.district && LOCATION_DATA_RAW[filters.state][filters.district] ? LOCATION_DATA_RAW[filters.state][filters.district] : [];
    const availableSubDepartments = filters.specialization && LEGAL_DOMAINS[filters.specialization] ? LEGAL_DOMAINS[filters.specialization] : [];

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerSection}>
                    <button
                        className={styles.backLink}
                        onClick={() => onAction?.('switchFeatured', {} as Advocate)}
                    >
                        <ArrowLeft size={18} />
                        <span>Switch to Featured Profiles</span>
                    </button>
                    <button
                        className={styles.backLink}
                        onClick={() => window.open('/dashboard/legal-docs', '_blank')}
                        style={{ marginLeft: 'auto' }}
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
                    {filteredAdvocates.length > 0 ? (
                        filteredAdvocates.map(advocate => (
                            <div
                                key={advocate.id}
                                onClick={() => showDetailedProfile && showDetailedProfile(advocate.unique_id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <AdvocateCard
                                    advocate={advocate}
                                    variant={advocate.isFeatured ? 'featured' : 'normal'}
                                    isPremium={isPremium}
                                    onAction={(action, data) => {
                                        if (action === 'view_profile') {
                                            if (showDetailedProfile) showDetailedProfile(advocate.unique_id);
                                            return;
                                        }
                                        handleAction(advocate, action, data);
                                    }}
                                />
                            </div>
                        ))
                    ) : (
                        <div className={styles.noProfiles}>
                            <p>No experts found matching your criteria.</p>
                            <button onClick={() => onAction?.('switchFeatured', {} as Advocate)} className={styles.switchBtn}>
                                View Featured Profiles
                            </button>
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
