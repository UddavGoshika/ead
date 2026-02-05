import React, { useState, useEffect } from 'react';
import { ArrowLeft, Construction, Loader2, Send } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { advocateService, clientService } from '../../../../services/api';
import type { Advocate, Client } from '../../../../types';
import AdvocateCard from '../../../../components/dashboard/AdvocateCard';
import ClientCard from '../../../../components/dashboard/ClientCard';
import { interactionService } from '../../../../services/interactionService';
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
    const isAdvocate = user?.role.toLowerCase() === 'advocate';
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        specialization: 'Department',
        court: 'Select Court',
        location: 'Location',
        experience: 'Experience'
    });

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const params: any = {};
            params.category = 'normal';
            if (filters.search) params.search = filters.search;
            if (filters.specialization !== 'Department') params.specialization = filters.specialization;
            if (filters.court !== 'Select Court') params.court = filters.court;
            if (filters.location !== 'Location') params.city = filters.location;
            if (filters.experience !== 'Experience') params.experience = filters.experience;

            if (isAdvocate) {
                const response = await clientService.getClients(params);
                setProfiles(response.data.clients || []);
            } else {
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
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProfiles();
    };

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <button className={styles.backLink} onClick={() => showsidePage('featured-profiles')}>
                    <ArrowLeft size={18} />
                    <span>{isAdvocate ? 'Switch to Featured Clients' : 'Switch to Featured Profiles'}</span>
                </button>
            </div>

            <div className={styles.searchSection}>
                <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder={`Search by ${isAdvocate ? "Client's" : "Advocate's"} ID or Name...`}
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

                <button className={styles.submitBtnDashboard} onClick={fetchProfiles}>Submit</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                </div>
            ) : (
                <div className={styles.grid}>
                    {profiles.length > 0 ? (
                        profiles.map((profile: any) => (
                            <div key={profile.id} onClick={() => showDetailedProfile(isAdvocate ? profile.id : profile.unique_id)} style={{ cursor: 'pointer' }}>
                                {isAdvocate ? (
                                    <ClientCard
                                        client={profile}
                                        variant="normal"
                                        isPremium={isPremium}
                                        onAction={async (action: string, data?: string) => {
                                            if (user) {
                                                const targetId = String(profile.id);
                                                const userId = String(user.id);
                                                const targetRole = 'client';
                                                const name = profile.name || `${profile.firstName} ${profile.lastName}`;

                                                if (action === 'interest') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                                    showToast(`Interest sent to ${name}`);
                                                } else if (action === 'superInterest') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                                    showToast(`Super Interest sent to ${name}!`);
                                                } else if (action === 'shortlist') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                                    showToast(`${name} added to shortlist`);
                                                } else if (action === 'openFullChatPage') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                                                    onSelectForChat(profile);
                                                } else if (action === 'message_sent' && data) {
                                                    const partnerUserId = typeof profile.userId === 'object' ? String((profile.userId as any)._id) : String(profile.userId || profile.id);
                                                    await interactionService.sendMessage(userId, partnerUserId, data);
                                                    showToast(`Message sent to ${name}`);
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <AdvocateCard
                                        advocate={profile}
                                        variant="normal"
                                        isPremium={isPremium}
                                        onAction={async (action: string, data?: string) => {
                                            if (user) {
                                                const targetId = String(profile.id);
                                                const userId = String(user.id);
                                                const targetRole = 'advocate';

                                                if (action === 'interest_initiated' || action === 'interest') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                                    showToast(`Interest sent to ${profile.name}`);
                                                } else if (action === 'super_interest_sent' || action === 'super-interest') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                                    showToast(`Super Interest sent to ${profile.name}!`);
                                                } else if (action === 'shortlisted') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                                    showToast(`${profile.name} added to shortlist`);
                                                } else if (action === 'openFullChatPage') {
                                                    await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                                                    onSelectForChat(profile);
                                                } else if (action === 'message_sent' && data) {
                                                    const partnerUserId = typeof profile.userId === 'object' ? String((profile.userId as any)._id) : String(profile.userId || profile.id);
                                                    await interactionService.sendMessage(userId, partnerUserId, data);
                                                    showToast(`Message sent to ${profile.name}`);
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <p style={{ color: '#94a3b8', fontSize: '16px' }}>No {isAdvocate ? 'clients' : 'advocates'} found matching your criteria.</p>
                            <button onClick={() => showsidePage('featured-profiles')} style={{
                                background: 'transparent',
                                border: '1px solid #facc15',
                                color: '#facc15',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}>
                                View Featured {isAdvocate ? 'Clients' : 'Profiles'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const Upgrade = (props: any) => <PlaceholderPage title="Upgrade Account" backToHome={props.backToHome} />;
export const Credits = (props: any) => <PlaceholderPage title="Credits & Billing" backToHome={props.backToHome} />;
export const HelpSupport = (props: any) => <PlaceholderPage title="Help & Support" backToHome={props.backToHome} />;

// BLOGS SECTION WITH POST FEATURE
export const Blogs = () => {
    const [blogText, setBlogText] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = () => {
        if (!blogText.trim()) return;
        setIsPosting(true);
        // Mock post
        setTimeout(() => {
            setBlogText('');
            setIsPosting(false);
            alert('Blog posted successfully!');
        }, 1500);
    };

    return (
        <div style={{ padding: '30px', color: 'white' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '25px', color: '#facc15' }}>Legal Blogs</h1>

            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '40px'
            }}>
                <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Create New Post</h3>
                <textarea
                    value={blogText}
                    onChange={(e) => setBlogText(e.target.value)}
                    placeholder="Share your legal expertise or latest updates..."
                    style={{
                        width: '100%',
                        height: '120px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '15px',
                        color: 'white',
                        fontSize: '16px',
                        resize: 'none',
                        marginBottom: '15px',
                        outline: 'none'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handlePost}
                        disabled={isPosting || !blogText.trim()}
                        style={{
                            background: '#facc15',
                            color: '#000',
                            border: 'none',
                            padding: '10px 25px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: blogText.trim() ? 'pointer' : 'not-allowed',
                            opacity: isPosting ? 0.7 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {isPosting ? 'Posting...' : 'Post Blog'}
                    </button>
                </div>
            </div>

            <div style={{ opacity: 0.6 }}>
                <PlaceholderPage title="Archived Blogs" />
            </div>
        </div>
    );
};

