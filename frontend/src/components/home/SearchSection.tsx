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
    const [filters, setFilters] = useState({
        language: '',
        department: '',
        subDepartment: '',
        experience: '',
        state: '',
        district: '',
        city: '',
        consultationMode: ''
    });
    const [searchId, setSearchId] = useState('');
    const navigate = useNavigate();

    // Modal & Notification State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ targetId: string; targetRole: string } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

    // Linked Logic
    const availableDistricts = filters.state ? Object.keys(LOCATION_DATA_RAW[filters.state] || {}) : [];
    const availableCities = (filters.state && filters.district) ? (LOCATION_DATA_RAW[filters.state]?.[filters.district] || []) : [];
    const availableSubDepartments = filters.department ? (DEPARTMENT_DATA[filters.department.toLowerCase()]?.subDepartments || []) : [];

    useEffect(() => {
        fetchData();
    }, [searchRole]); // Re-fetch when role switches

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};

            // Map filters to API parameters
            if (filters.language && filters.language !== 'Select Languages') params.language = filters.language;
            if (filters.department && filters.department !== 'Select Departments / Categories') {
                if (searchRole === 'advocates') params.specialization = filters.department;
                else params.category = filters.department;
            }
            if (filters.subDepartment && filters.subDepartment !== 'Select Sub Departments') {
                if (searchRole === 'advocates') params.subSpecialization = filters.subDepartment;
                else params.subDepartment = filters.subDepartment;
            }
            if (filters.experience && filters.experience !== 'Select Experience') params.experience = filters.experience;
            if (filters.state && filters.state !== 'Select States') params.state = filters.state;
            if (filters.district && filters.district !== 'Select Districts') params.district = filters.district;
            if (filters.city && filters.city !== 'Select Cities') params.city = filters.city;
            if (filters.consultationMode && filters.consultationMode !== 'Consultation Mode') params.consultationMode = filters.consultationMode;

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

    const handleIdSearch = () => {
        if (searchId && /^adv-\d+$/i.test(searchId.trim())) {
            navigate(`/profile/${searchId.toUpperCase().trim()}`);
            return;
        }
        // If not a valid ID format, maybe just fetch with it as a search term?
        // For now, let's just stick to the ID redirect logic from FilterModal
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newState = { ...prev, [name]: value };
            // Reset children if parent changes
            if (name === 'state') {
                newState.district = '';
                newState.city = '';
            }
            if (name === 'district') {
                newState.city = '';
            }
            if (name === 'department') {
                newState.subDepartment = '';
            }
            return newState;
        });
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
        let letterCount = 0;
        let numberCount = 0;
        return id.split('').map(char => {
            if (/[a-zA-Z]/.test(char)) {
                letterCount++;
                return letterCount <= 2 ? char : '*';
            }
            if (/[0-9]/.test(char)) {
                numberCount++;
                return numberCount <= 2 ? char : '*';
            }
            return char;
        }).join('');
    };

    const maskName = (name: string) => {
        if (!name) return "**";
        const parts = name.trim().split(/\s+/);
        return parts.map(part => {
            if (part.length <= 2) return part;
            return part.substring(0, 2) + "**";
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
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 40,
                                mass: 1
                            }}
                        >
                            <div className={styles.notifIcon}>
                                <CheckCircle size={24} />
                            </div>
                            <div className={styles.notifText}>
                                <span>{notification.message}</span>
                            </div>
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
                            <button
                                id="role-toggle-advocates"
                                className={`${styles.roleBtn} ${searchRole === 'advocates' ? styles.active : ''}`}
                                onClick={() => setSearchRole('advocates')}
                            >
                                <Users size={20} />
                                Find Advocates
                            </button>
                            <button
                                id="role-toggle-clients"
                                className={`${styles.roleBtn} ${searchRole === 'clients' ? styles.active : ''}`}
                                onClick={() => setSearchRole('clients')}
                            >
                                <UserSearch size={20} />
                                Find Clients
                            </button>
                        </div>

                        <div className={styles.idSearch}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by ID (e.g., ADV-123)"
                                className={styles.idInput}
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleIdSearch()}
                            />
                            <button className={styles.idSearchBtn} onClick={handleIdSearch}>Search</button>
                        </div>
                    </div>

                    <div className={styles.filterBar}>
                        {/* Languages */}
                        <div className={styles.selectWrapper}>
                            <select name="language" value={filters.language} onChange={handleFilterChange}>
                                <option>Select Languages</option>
                                {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Departments */}
                        <div className={styles.selectWrapper}>
                            <select name="department" value={filters.department} onChange={handleFilterChange}>
                                <option>Select Departments / Categories</option>
                                {Object.values(DEPARTMENT_DATA).map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Sub Departments */}
                        <div className={styles.selectWrapper}>
                            <select
                                name="subDepartment"
                                value={filters.subDepartment}
                                onChange={handleFilterChange}
                                disabled={!filters.department}
                            >
                                <option>Select Sub Departments</option>
                                {availableSubDepartments.map(sd => <option key={sd.value} value={sd.label}>{sd.label}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Experience */}
                        {searchRole !== 'clients' && (
                            <div className={styles.selectWrapper}>
                                <select
                                    name="experience"
                                    value={filters.experience}
                                    onChange={handleFilterChange}
                                >
                                    <option>Select Experience</option>
                                    {EXPERIENCES.map(exp => <option key={exp}>{exp}</option>)}
                                </select>
                                <ChevronDown className={styles.chevron} size={18} />
                            </div>
                        )}

                        {/* States */}
                        <div className={styles.selectWrapper}>
                            <select name="state" value={filters.state} onChange={handleFilterChange}>
                                <option>Select States</option>
                                {Object.keys(LOCATION_DATA_RAW).map(s => <option key={s}>{s}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Districts */}
                        <div className={styles.selectWrapper}>
                            <select
                                name="district"
                                value={filters.district}
                                onChange={handleFilterChange}
                                disabled={!filters.state}
                            >
                                <option>Select Districts</option>
                                {availableDistricts.map(d => <option key={d}>{d}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Cities */}
                        <div className={styles.selectWrapper}>
                            <select
                                name="city"
                                value={filters.city}
                                onChange={handleFilterChange}
                                disabled={!filters.district}
                            >
                                <option>Select Cities</option>
                                {availableCities.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Consultation Mode */}
                        <div className={styles.selectWrapper}>
                            <select
                                name="consultationMode"
                                value={filters.consultationMode}
                                onChange={handleFilterChange}
                            >
                                <option>Consultation Mode</option>
                                {MODES.map(m => <option key={m}>{m}</option>)}
                            </select>
                            <ChevronDown className={styles.chevron} size={18} />
                        </div>

                        {/* Apply Button */}
                        <button className={styles.applyBtn} onClick={fetchData} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Apply Filters'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}><Loader2 className={styles.spinner} size={40} /><p>Loading profiles...</p></div>
                ) : (
                    <div className={styles.resultsGrid}>
                        {results.length > 0 ? (
                            results.map((profile: any) => {
                                const name = profile.name || (profile.firstName + ' ' + profile.lastName) || 'User';
                                const initial = name.charAt(0).toUpperCase();

                                return (
                                    <div key={profile.id || profile._id} className={styles.luxuryCard}>
                                        <div className={styles.cardContent}>
                                            {profile.profilePicPath ? (
                                                <img
                                                    src={`/${profile.profilePicPath.replace(/\\/g, '/')}`}
                                                    className={styles.profileImage}
                                                    alt={name}
                                                />
                                            ) : (
                                                <div className={styles.largeInitial}>{initial}</div>
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
                                                        <span>{profile.location || 'Unknown Location'}</span>
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
