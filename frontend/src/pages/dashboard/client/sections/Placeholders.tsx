import React, { useState, useEffect } from 'react';
import { ArrowLeft, Construction, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { advocateService } from '../../../../services/api';
import { interactionService } from '../../../../services/interactionService';
import { useInteractions } from '../../../../hooks/useInteractions';
import { useRelationshipStore } from '../../../../store/useRelationshipStore';
import type { Advocate } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import styles from '../AdvocateList.module.css';

interface Props {
    title: string;
    backToHome?: () => void;
}

const PlaceholderPage: React.FC<Props> = ({ title, backToHome }) => {
    return (
        <div style={{ padding: '40px', color: 'white' }}>
            {backToHome && (
                <button onClick={backToHome} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', textAlign: 'center' }}>
                <Construction size={64} style={{ color: '#eab308', marginBottom: '20px' }} />
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{title}</h1>
                <p style={{ color: '#94a3b8', fontSize: '18px' }}>We are working hard to bring this feature to you soon!</p>
            </div>
        </div>
    );
};

export default PlaceholderPage;

// Export specialized placeholders
export const NormalProfiles = ({ showDetailedProfile, showToast, showsidePage, onSelectForChat }: any) => {
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

    // NEW: Use hook
    const { handleInteraction } = useInteractions();
    const interactedIds = useRelationshipStore((state: any) => state.interactedIds);

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
            showToast('Failed to load advocates');
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
                <button className={styles.backLink} onClick={() => showsidePage('featured-profiles')}>
                    <ArrowLeft size={18} />
                    <span>Switch to Featured Profiles</span>
                </button>
            </div>

            <div className={styles.searchSection}>
                <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by ID or Name..."
                        className={styles.dashboardSearchInput}
                    />
                    <button type="submit" className={styles.searchBtnInside}>Search</button>
                </form>

                <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Department</option>
                    <option>Criminal Law</option>
                    <option>Civil Law</option>
                    <option>Family Law</option>
                </select>
                <select name="court" value={filters.court} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Select Court</option>
                    <option>Supreme Court</option>
                    <option>High Court</option>
                </select>
                <select name="location" value={filters.location} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option>Location</option>
                    <option>Delhi</option>
                    <option>Mumbai</option>
                </select>

                <button className={styles.submitBtnDashboard} onClick={fetchAdvocates}>Submit</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                </div>
            ) : (
                <div className={styles.grid}>
                    {(() => {
                        const plan = user?.plan || 'Free';
                        const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

                        return advocates
                            .filter(adv => !interactedIds.has(String(adv.id))) // Filter using hook state
                            .map(adv => (
                                <div key={adv.id} onClick={() => showDetailedProfile(adv.unique_id)} style={{ cursor: 'pointer' }}>
                                    <AdvocateCard
                                        advocate={adv}
                                        variant="normal"
                                        isPremium={isPremium}
                                        onAction={async (action: string, data?: any) => {
                                            if (user) {
                                                const targetId = String(adv.id);
                                                // Handle specific navigation actions
                                                if (action === 'openFullChatPage') {
                                                    // onAction usually passed from parent, but here we have prop
                                                    // interactionService.recordActivity('chat') is not strictly needed for navigation
                                                    // but we can preserve it if we want.
                                                    // Let's just navigate.
                                                    onSelectForChat(adv);
                                                    return;
                                                }

                                                // Delegate to hook
                                                try {
                                                    await handleInteraction({
                                                        id: targetId,
                                                        role: 'advocate',
                                                        name: adv.name
                                                    }, action, data);
                                                } catch (err) {
                                                    console.error("Interaction failed", err);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ));
                    })()}
                </div>
            )}
        </div>
    );
};
export const Upgrade = ({ backToHome }: any) => <PlaceholderPage title="Upgrade Account" backToHome={backToHome} />;
export const Credits = ({ backToHome }: any) => <PlaceholderPage title="Credits & Billing" backToHome={backToHome} />;
export const HelpSupport = ({ backToHome }: any) => <PlaceholderPage title="Help & Support" backToHome={backToHome} />;
export const Blogs = () => <PlaceholderPage title="Legal Blogs" />;
export const Activity = () => <PlaceholderPage title="Recent Activity" />;
