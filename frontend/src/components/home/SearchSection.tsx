import React, { useState, useEffect } from 'react';
import styles from './SearchSection.module.css';
import {
    ChevronDown,
    MapPin,
    Loader2,
    Handshake,
    Star,
    Bookmark,
    MessageCircle,
    Shield,
    Coins,
    CheckCircle,
    Users,
    UserSearch,
    Search
} from 'lucide-react';



import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { advocateService, clientService } from '../../services/api';
import { interactionService } from '../../services/interactionService';
import type { ClientProfile } from '../../services/api';
import type { Advocate } from '../../types';
import ConfirmationModal from '../layout/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { LOCATION_DATA_RAW } from '../layout/statesdis';
import { DEPARTMENT_DATA } from '../layout/FilterModal';
import MultiSelect from '../common/MultiSelect';


const LANGUAGES = [
    'English', 'Hindi', 'Telugu', 'Assamese', 'Awadhi', 'Bagheli', 'Banjara', 'Bhojpuri', 'Bodo', 'Bundeli',
    'Chhattisgarhi', 'Coorgi', 'Dakhini', 'Dogri', 'Garhwali', 'Gujarati', 'Haryanvi', 'Kannada', 'Kashmiri',
    'Konkani', 'Malayalam', 'Manipuri', 'Marathi', 'Punjabi', 'Rajasthani', 'Sanskrit', 'Tamil', 'Tulu', 'Urdu'
];

const EXPERIENCES = ['0–5 Years', '5–10 Years', '10+ Years'];
const MODES = ['Online', 'Offline', 'Hybrid'];

const SearchSection: React.FC = () => {
    const { searchRole, setSearchRole, user, isLoggedIn, openAuthModal } = useAuth();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Record<string, string[]>>({
        language: [],
        department: [],
        subDepartment: [],
        experience: [],
        state: [],
        district: [],
        city: [],
        consultationMode: []
    });

    const [searchId, setSearchId] = useState('');
    const navigate = useNavigate();

    // Modal & Notification State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ targetId: string; targetRole: string } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

    // Linked Logic
    const availableDistricts = filters.state.flatMap(s =>
        Object.keys(LOCATION_DATA_RAW[s] || {}).map(d => ({ value: d, label: d }))
    );
    const uniqueDistricts = Array.from(new Map(availableDistricts.map(item => [item.value, item])).values());

    const availableCities = filters.district.flatMap(d => {
        for (const stateName of filters.state) {
            const cities = LOCATION_DATA_RAW[stateName]?.[d];
            if (cities) return cities.map(c => ({ value: c, label: c }));
        }
        return [];
    });
    const uniqueCities = Array.from(new Map(availableCities.map(item => [item.value, item])).values());

    const availableSubDepartments = filters.department.flatMap(dept => {
        // Match label to key in DEPARTMENT_DATA (values are keys? No, keys are 'criminal', label is 'Criminal')
        // We need to find the key for the selected label, OR store keys in state.
        // In SearchSection originally, it stored 'Civil' (Label).
        // Let's modify MultiSelect to store VALUES (keys) but SearchSection originally used LABELS as values.
        // Let's convert to using correct keys/values.
        // DEPARTMENT_DATA keys: 'criminal', 'family'. Labels: 'Criminal', 'Family'.
        // Let's store KEYS ('criminal') in state to match FilterModal logic.
        return DEPARTMENT_DATA[dept]?.subDepartments || [];
    });

    useEffect(() => {
        fetchData();
    }, [searchRole]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filters.language.length) params.language = filters.language.join(',');

            // Map keys back to labels if Backend expects Labels? 
            // Original SearchSection sent `filters.department` (which was label).
            // Original Backend `advocate.js` regex matched that against `practice.specialization`.
            // Profiles store Labels ("Criminal", "Family"). 
            // So we should verify what `DEPARTMENT_DATA` keys map to.
            // If we store KEYS ('criminal'), we might need to send LABELS ('Criminal') to backend.
            // Let's send selected LABELS or map keys to labels.
            // Wait, MultiSelect stores values. If options are { value: 'criminal', label: 'Criminal' }, it stores 'criminal'.
            // I should construct options such that value IS the label if backend expects labels?
            // Or change backend. Backend data likely has "Criminal".

            // Let's map stored keys to labels for the API call if specific fields need it.
            // Actually, best to check what FilterModal sends. FilterModal sends `department=criminal,family`.
            // Does Search page handle it? Unknown.
            // But `SearchSection` uses backend directly. Backend data `practice.specialization` usually stores "Criminal".
            // So if I send "criminal", regex might miss "Criminal" if strict, or hit if 'i' flag (which is there).
            // So "criminal" (lowercase) matches "Criminal" (Title case) with 'i' flag. Safe.

            if (filters.department.length) {
                // If using keys like 'criminal', join them.
                const deptLabels = filters.department.map(d => DEPARTMENT_DATA[d]?.label || d);
                // Using labels might be safer for strict matches if any? But regex is case-insensitive.
                // Let's stick to sending what we store, but FilterModal uses keys.
                // Let's store KEYS in state for consistency with FilterModal.
                // Backend regex works for 'criminal' matching 'Criminal'.
                if (searchRole === 'advocates') params.specialization = filters.department.join(',');
                else params.category = filters.department.join(',');
            }

            if (filters.subDepartment.length) {
                if (searchRole === 'advocates') params.subSpecialization = filters.subDepartment.join(',');
                else params.subDepartment = filters.subDepartment.join(',');
            }
            if (filters.experience.length) params.experience = filters.experience.join(',');
            if (filters.state.length) params.state = filters.state.join(',');
            if (filters.district.length) params.district = filters.district.join(',');
            if (filters.city.length) params.city = filters.city.join(',');
            if (filters.consultationMode.length) params.consultationMode = filters.consultationMode.join(',');

            if (searchRole === 'advocates') {
                const advRes = await advocateService.getAdvocates(params);
                if (advRes.data.success) setResults(advRes.data.advocates);
            } else {
                const clientRes = await clientService.getClients(params);
                if (clientRes.data.success) setResults(clientRes.data.clients);
            }
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFilter = (field: string, value: string) => {
        setFilters(prev => {
            const current = (prev[field] || []) as string[];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];

            let newState = { ...prev, [field]: updated };

            if (field === 'state' && updated.length === 0) {
                newState.district = [];
                newState.city = [];
            }
            if (field === 'department' && updated.length === 0) {
                newState.subDepartment = [];
            }
            return newState;
        });
    };

    const handleReset = () => {
        setFilters({
            language: [], department: [], subDepartment: [], experience: [],
            state: [], district: [], city: [], consultationMode: []
        });
        setSearchId('');
        // Immediately fetch with empty
        setTimeout(() => {
            setLoading(true);
            const service = searchRole === 'advocates' ? advocateService.getAdvocates : clientService.getClients;
            service({}).then(res => {
                const data = res.data as any;
                if (data.success) setResults(searchRole === 'advocates' ? data.advocates : data.clients);
                setLoading(false);
            });
        }, 0);
    };

    const handleIdSearch = () => {
        if (searchId && /^adv-\d+$/i.test(searchId.trim())) {
            navigate(`/profile/${searchId.toUpperCase().trim()}`);
            return;
        }
    };

    const handleAction = async (targetId: string, action: string) => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }

        const role = searchRole === 'advocates' ? 'advocate' : 'client';

        if (action === 'chat') {
            setPendingAction({ targetId, targetRole: role });
            setIsConfirmOpen(true);
            return;
        }

        try {
            const userId = String(user?.id);
            const res = await interactionService.recordActivity(role, targetId, action, userId);

            if (res.success) {
                showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} sent successfully!`, 'info');
            }
        } catch (err: any) {
            showNotification(err.response?.data?.error || 'Action failed', 'info');
        }
    };

    const confirmChat = async () => {
        if (!pendingAction) return;
        setIsConfirmOpen(false);

        try {
            const userId = String(user?.id);
            const res = await interactionService.recordActivity(pendingAction.targetRole, pendingAction.targetId, 'chat', userId);

            if (res.success) {
                showNotification('Chat initiated! 2 coins deducted.', 'success');
                // Open chat interface logic here
            }
        } catch (err: any) {
            showNotification(err.response?.data?.error || 'Failed to initiate chat', 'info');
        }
    };

    const showNotification = (message: string, type: 'success' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const maskId = (id: string) => {
        if (!id) return "********";
        if (id.length <= 2) return id;
        return id.substring(0, 2) + '*'.repeat(id.length - 2);
    };

    const maskName = (name: string) => {
        if (!name) return "**";
        const parts = name.trim().split(/\s+/);
        return parts.map(part => {
            if (part.length <= 2) return part;
            return part.substring(0, 2) + "*".repeat(part.length - 2);
        }).join(" ");
    };

    return (
        <section id="search" className={styles.searchSection}>
            <div className={styles.container}>
                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            className={`${styles.notification} ${styles[notification.type]}`}
                            initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -100, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 1 }}
                        >
                            <div className={styles.notifIcon}><CheckCircle size={24} /></div>
                            <div className={styles.notifText}><span>{notification.message}</span></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.header}>
                    <h2 className={styles.title}>Browse Profiles</h2>
                    <p className={styles.subtitle}>Search, filter, and connect with top-rated professionals.</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.roleSwitcher}>
                            <button className={`${styles.roleBtn} ${searchRole === 'advocates' ? styles.active : ''}`} onClick={() => setSearchRole('advocates')}>
                                <Users size={20} /> Find Advocates
                            </button>
                            <button className={`${styles.roleBtn} ${searchRole === 'clients' ? styles.active : ''}`} onClick={() => setSearchRole('clients')}>
                                <UserSearch size={20} /> Find Clients
                            </button>
                        </div>

                        <div className={styles.idSearch}>
                            <Search size={18} className={styles.searchIcon} />
                            <input type="text" placeholder="Search by ID (e.g., ADV-123)" className={styles.idInput} value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleIdSearch()} />
                            <button className={styles.idSearchBtn} onClick={handleIdSearch}>Search</button>
                        </div>
                    </div>

                    <div className={styles.filterBar}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Select Languages"
                                options={LANGUAGES.map(l => ({ value: l, label: l }))}
                                selected={filters.language}
                                onChange={(val) => toggleFilter('language', val)}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Select Categories"
                                options={Object.entries(DEPARTMENT_DATA).map(([k, v]) => ({ value: k, label: v.label }))}
                                selected={filters.department}
                                onChange={(val) => toggleFilter('department', val)}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Select Sub-Categories"
                                options={availableSubDepartments}
                                selected={filters.subDepartment}
                                onChange={(val) => toggleFilter('subDepartment', val)}
                                disabled={filters.department.length === 0}
                            />
                        </div>

                        {searchRole !== 'clients' && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <MultiSelect
                                    placeholder="Select Experience"
                                    options={EXPERIENCES.map(e => ({ value: e, label: e }))}
                                    selected={filters.experience}
                                    onChange={(val) => toggleFilter('experience', val)}
                                />
                            </div>
                        )}

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Select States"
                                options={Object.keys(LOCATION_DATA_RAW).map(s => ({ value: s, label: s }))}
                                selected={filters.state}
                                onChange={(val) => toggleFilter('state', val)}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Select Districts"
                                options={uniqueDistricts}
                                selected={filters.district}
                                onChange={(val) => toggleFilter('district', val)}
                                disabled={filters.state.length === 0}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Select Cities"
                                options={uniqueCities}
                                selected={filters.city}
                                onChange={(val) => toggleFilter('city', val)}
                                disabled={filters.district.length === 0}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <MultiSelect
                                placeholder="Consultation Mode"
                                options={MODES.map(m => ({ value: m, label: m }))}
                                selected={filters.consultationMode}
                                onChange={(val) => toggleFilter('consultationMode', val)}
                            />
                        </div>

                        <button className={styles.applyBtn} onClick={fetchData} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Apply'}
                        </button>

                        <button className={styles.resetBtn} onClick={handleReset}>Reset</button>

                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}><Loader2 className={styles.spinner} size={40} /><p>Loading profiles...</p></div>
                ) : (
                    <div className={styles.resultsGrid}>
                        {results.length > 0 ? (
                            (searchRole === 'advocates'
                                ? [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                : results
                            ).slice(0, 6).map((profile: any) => {
                                const name = profile.name || (profile.firstName + ' ' + profile.lastName) || 'User';
                                const initial = name.charAt(0).toUpperCase();

                                // Fix Image URL Logic
                                let imageUrl = null;
                                if (profile.profilePicPath) {
                                    if (profile.profilePicPath.startsWith('http')) {
                                        imageUrl = profile.profilePicPath;
                                    } else {
                                        imageUrl = `/${profile.profilePicPath.replace(/\\/g, '/')}`;
                                    }
                                } else if (profile.image_url) { // Fallback to image_url if exists
                                    imageUrl = profile.image_url;
                                }

                                return (
                                    <div
                                        key={profile.id || profile._id}
                                        className={styles.luxuryCard}
                                        onClick={(e) => {
                                            // Don't navigate if clicking action buttons
                                            if ((e.target as HTMLElement).closest('button')) return;
                                            navigate(`/profile/${profile.unique_id || profile.id || profile._id}`);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.cardContent}>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    className={styles.profileImage}
                                                    alt={name}
                                                    onError={(e) => {
                                                        // Fallback on error
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            {(!imageUrl || (imageUrl && false)) && ( // We handle fallback in onError above, but also render initial div which is hidden by css if img exists? No, conditional rendering.
                                                <div className={styles.largeInitial} style={{ display: imageUrl ? 'none' : 'flex' }}>{initial}</div>
                                            )}

                                            <div className={styles.topRightBadge}>
                                                <div className={styles.idPill}>
                                                    <Shield size={12} />
                                                    <span>{maskId(profile.unique_id)}</span>
                                                </div>
                                            </div>
                                            <div className={styles.cardOverlay}>
                                                <div className={styles.bottomLeft}>
                                                    <h3 className={styles.profileName}>{maskName(name)}</h3>
                                                    <div className={styles.locationInfo}>
                                                        <MapPin size={14} />
                                                        <span>{typeof profile.location === 'string' ? profile.location : (profile.location?.city ? `${profile.location.city}, ${profile.location.state}` : 'Unknown Location')}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.bottomRight}>
                                                    <div className={styles.infoLine}>
                                                        <span className={styles.infoLabel}>{searchRole === 'advocates' ? 'Experience:' : 'Category:'}</span>
                                                        <span className={styles.infoValue}>{searchRole === 'advocates' ? (profile.experience || 'N/A') : (profile.category || 'N/A')}</span>
                                                    </div>
                                                    <div className={styles.infoLine}>
                                                        <span className={styles.infoLabel}>Practice:</span>
                                                        <span className={styles.infoValue}>{profile.specialization || 'Legal Services'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.actionGrid}>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'interest')}>
                                                <Handshake className={styles.actionIcon} size={20} /><span>Interest</span>
                                            </button>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'superInterest')}>
                                                <Star className={styles.actionIcon} size={20} /><span>Super Interest</span>
                                            </button>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'shortlist')}>
                                                <Bookmark className={styles.actionIcon} size={20} /><span>Shortlist</span>
                                            </button>
                                            <button className={styles.luxuryAction} onClick={() => handleAction(profile._id || profile.id, 'chat')}>
                                                <MessageCircle className={styles.actionIcon} size={20} /><span>Chat</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : <div className={styles.noResults}><p>No {searchRole} found.</p></div>}
                    </div>
                )}

            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmChat}
                title="Initiate Chat"
                message="You will cut 2 coins to initiate this chat. Do you want to proceed?"
                confirmText="Yes, Proceed"
                icon={<Coins size={48} color="#ffd700" />}
            />
        </section>
    );
};

export default SearchSection;
