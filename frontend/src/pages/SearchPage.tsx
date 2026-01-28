import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SearchPage.module.css';
import { Search as SearchIcon, Filter, MapPin, Briefcase, Languages, CheckCircle, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categories = ["Criminal Law", "Civil Law", "Family Law", "Corporate Law", "Intellectual Property", "Cyber Law", "Taxation", "Human Rights", "Arbitration"];
const languages = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati"];
const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "West Bengal", "Gujarat"];

const maskText = (text: string) => {
    if (!text) return "";
    const parts = text.split(" ");
    return parts.map(part => {
        if (part.length <= 2) return part;
        return part.substring(0, 2) + "*".repeat(part.length - 2);
    }).join(" ");
};

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || "";

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') === 'client' ? 'Client' : 'Advocate');
    const [advocates, setAdvocates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isLoggedIn, openAuthModal } = useAuth();

    const fetchResults = async (query: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/advocates?search=${encodeURIComponent(query)}`);
            if (response.data.success) {
                setAdvocates(response.data.advocates);
            }
        } catch (err) {
            console.error('Error fetching advocates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults(initialQuery);
    }, [initialQuery]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchTerm && /^adv-\d+$/i.test(searchTerm.trim())) {
            navigate(`/profile/${searchTerm.toUpperCase().trim()}`);
            return;
        }
        navigate(`/search?q=${encodeURIComponent(searchTerm)}&role=${selectedRole.toLowerCase()}`);
    };

    return (
        <div className={styles.searchPage}>
            <section className={styles.hero}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Browse Profiles</h1>
                    <p className={styles.subtitle}>Find the right legal expert for your needs from our verified network of professionals.</p>
                </div>
            </section>

            <section className={styles.mainContent}>
                <div className={styles.container}>
                    <div className={styles.searchHeader}>
                        <form className={styles.searchBarWrapper} onSubmit={handleSearch}>
                            <SearchIcon className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, expertise, or location..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" style={{ display: 'none' }} />
                        </form>
                        <div className={styles.roleSwitch}>
                            <button
                                className={selectedRole === "Advocate" ? styles.activeRole : ""}
                                onClick={() => setSelectedRole("Advocate")}
                            >
                                Advocates
                            </button>
                            <button
                                className={selectedRole === "Client" ? styles.activeRole : ""}
                                onClick={() => setSelectedRole("Client")}
                            >
                                Clients
                            </button>
                        </div>
                    </div>

                    <div className={styles.layoutLayout}>
                        {/* Sidebar Filters */}
                        <aside className={styles.filtersSidebar}>
                            <div className={styles.filterGroup}>
                                <label><Filter size={16} /> Filter by Expertise</label>
                                <div className={styles.checkboxList}>
                                    {categories.map(cat => (
                                        <label key={cat} className={styles.checkboxItem}>
                                            <input type="checkbox" />
                                            <span>{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label><Languages size={16} /> Languages Spoken</label>
                                <div className={styles.checkboxList}>
                                    {languages.map(lang => (
                                        <label key={lang} className={styles.checkboxItem}>
                                            <input type="checkbox" />
                                            <span>{lang}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label><MapPin size={16} /> Location (State)</label>
                                <select className={styles.selectInput}>
                                    <option value="">Select State</option>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <button className={styles.resetBtn}>Reset All Filters</button>
                        </aside>

                        {/* Results Grid */}
                        <div className={styles.resultsArea}>
                            <div className={styles.resultsCount}>
                                {loading ? 'Searching...' : `Showing ${advocates.length} verified professionals`}
                            </div>

                            {loading ? (
                                <div className={styles.loadingArea} style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                                </div>
                            ) : (
                                <div className={styles.resultsGrid}>
                                    {advocates.map((adv: any) => (
                                        <div key={adv.id} className={styles.profileCard}>
                                            <div className={`${styles.cardContent} ${!isLoggedIn ? styles.blurred : ''}`}>
                                                <div className={styles.cardHeader}>
                                                    <div className={styles.avatarPlaceholder}>
                                                        {adv.name ? (isLoggedIn ? adv.name : maskText(adv.name)).charAt(0).toUpperCase() : 'A'}
                                                    </div>
                                                    <div className={styles.headerInfo}>
                                                        <h3>{isLoggedIn ? adv.name : maskText(adv.name)}</h3>
                                                        <div className={styles.location}>
                                                            <MapPin size={14} /> {isLoggedIn ? adv.location : maskText(adv.location)}
                                                        </div>
                                                    </div>
                                                    <div className={styles.verifyBadge}>
                                                        <CheckCircle size={14} /> Verified
                                                    </div>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.specialties}>
                                                        {adv.specialties?.map((s: string) => <span key={s}>{isLoggedIn ? s : maskText(s)}</span>)}
                                                    </div>
                                                    <p className={styles.bio}>
                                                        {isLoggedIn ? (adv.bio || 'Professional legal advocate providing expert consultation.') : maskText(adv.bio || 'Professional legal advocate providing expert consultation.')}
                                                    </p>
                                                    <div className={styles.experience}>
                                                        <Briefcase size={14} /> {adv.experience} Experience
                                                    </div>
                                                </div>
                                                <div className={styles.cardActions}>
                                                    <button className={styles.interestBtn} disabled={!isLoggedIn}>Send Interest</button>
                                                    <button className={styles.profileBtn} onClick={() => navigate(`/profile/${adv.unique_id}`)}>View Profile</button>
                                                </div>
                                            </div>

                                            {/* ID is NOT BLURRED */}
                                            <div className={styles.profileIdBadge}>ID: {adv.unique_id}</div>

                                            {!isLoggedIn && (
                                                <div className={styles.loginOverlay}>
                                                    <Lock size={24} />
                                                    <p>Login to see details</p>
                                                    <button className={styles.loginBtnSmall} onClick={() => openAuthModal('login')}>Login</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {advocates.length === 0 && (
                                        <div className={styles.noResults}>
                                            <p>No professionals found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SearchPage;
