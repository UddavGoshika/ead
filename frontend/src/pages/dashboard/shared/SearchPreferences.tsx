import React, { useState, useEffect } from 'react';
import styles from '../client/AdvocateList.module.css';
import { Search, Filter, Loader2, Save, Trash2, X, Bookmark } from 'lucide-react';
import { advocateService } from '../../../services/api';
import { interactionService } from '../../../services/interactionService';
import type { Advocate } from '../../../types';
import AdvocateCard from '../../../components/dashboard/AdvocateCard';
import { useAuth } from '../../../context/AuthContext';
import { LOCATION_DATA_RAW } from '../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../data/legalDomainData';

interface Props {
    backToHome?: () => void;
    showToast?: (msg: string) => void;
    showDetailedProfile?: (id: string) => void;
    onSelectForChat?: (advocate: Advocate) => void;
}

interface SearchPreset {
    id: string;
    name: string;
    specs: string[];
    states: string[];
    experience: string;
    date: number;
}

const SearchPreferences: React.FC<Props> = ({ backToHome, showToast, showDetailedProfile, onSelectForChat }) => {
    const { user } = useAuth();
    const [advocates, setAdvocates] = useState<Advocate[]>([]);
    const [loading, setLoading] = useState(false);

    // Multi-Select States
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [experience, setExperience] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Preset State
    const [presets, setPresets] = useState<SearchPreset[]>([]);
    const [presetName, setPresetName] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);

    useEffect(() => {
        const loadPresets = async () => {
            try {
                const { settingsService } = await import('../../../services/api');
                const res = await settingsService.getSettings();
                if (res.data.success && res.data.presets) {
                    setPresets(res.data.presets);
                }
            } catch (e) {
                console.error("Failed to load presets from backend", e);
                // Fallback
                const saved = localStorage.getItem('user_search_presets');
                if (saved) setPresets(JSON.parse(saved));
            }
        };
        loadPresets();
    }, []);

    const savePresetsToStorage = async (newPresets: SearchPreset[]) => {
        setPresets(newPresets);
        // Optimistic update
        localStorage.setItem('user_search_presets', JSON.stringify(newPresets));
        try {
            const { settingsService } = await import('../../../services/api');
            await settingsService.syncPresets(newPresets);
        } catch (e) {
            console.error("Failed to sync presets to backend", e);
        }
    };

    const handleSpecSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val && !selectedSpecs.includes(val)) {
            setSelectedSpecs([...selectedSpecs, val]);
        }
    };

    const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val && !selectedStates.includes(val)) {
            setSelectedStates([...selectedStates, val]);
        }
    };

    const removeSpec = (spec: string) => setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
    const removeState = (st: string) => setSelectedStates(selectedStates.filter(s => s !== st));

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (searchQuery) params.search = searchQuery;

            // Join multiple selections with '|' for Regex OR matching in backend
            if (selectedSpecs.length > 0) params.specialization = selectedSpecs.join('|');
            if (selectedStates.length > 0) params.state = selectedStates.join('|');
            if (experience) params.experience = experience;

            const response = await advocateService.getAdvocates(params);
            setAdvocates(response.data.advocates || []);
        } catch (err) {
            console.error(err);
            if (showToast) showToast('Failed to load advocates');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            if (showToast) showToast("Please enter a name for this preference");
            return;
        }
        const newPreset: SearchPreset = {
            id: Date.now().toString(),
            name: presetName,
            specs: selectedSpecs,
            states: selectedStates,
            experience,
            date: Date.now()
        };
        const updated = [...presets, newPreset];
        savePresetsToStorage(updated);
        setPresetName('');
        setShowSaveInput(false);
        if (showToast) showToast("Preference saved successfully!");
    };

    const applyPreset = (preset: SearchPreset) => {
        setSelectedSpecs(preset.specs);
        setSelectedStates(preset.states);
        setExperience(preset.experience);
        if (showToast) showToast(`Applied preset: ${preset.name}`);
        // Optionally auto-search
        // fetchAdvocates(); 
    };

    const deletePreset = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = presets.filter(p => p.id !== id);
        savePresetsToStorage(updated);
        if (showToast) showToast("Preset deleted");
    };

    const isPremium = user?.isPremium;

    return (
        <div className={styles.page}>
            <div className={styles.headerSection}>
                <h1>Search Preferences & Presets</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>

                {/* Left: Filter Form */}
                <div className={styles.searchSection} style={{ flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ color: '#facc15', margin: '0 0 10px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} /> Configure Preferences
                    </h3>

                    {/* ID Search */}
                    <div className={styles.searchContainer} style={{ width: '100%' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Name or ID..."
                            className={styles.dashboardSearchInput}
                        />
                    </div>

                    {/* Multi-Select Specs */}
                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Preferred Departments (Multi-Select)</label>
                        <select onChange={handleSpecSelect} className={styles.filterSelect} style={{ width: '100%' }}>
                            <option value="">Select Departments to Add...</option>
                            {Object.keys(LEGAL_DOMAINS).map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {selectedSpecs.map(spec => (
                                <span key={spec} style={{
                                    background: 'rgba(250, 204, 21, 0.1)',
                                    border: '1px solid rgba(250, 204, 21, 0.3)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    color: '#facc15',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    {spec}
                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSpec(spec)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Multi-Select States */}
                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Preferred States (Multi-Select)</label>
                        <select onChange={handleStateSelect} className={styles.filterSelect} style={{ width: '100%' }}>
                            <option value="">Select States to Add...</option>
                            {Object.keys(LOCATION_DATA_RAW).sort().map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {selectedStates.map(st => (
                                <span key={st} style={{
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    color: '#38bdf8',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    {st}
                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeState(st)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Experience Single Select */}
                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Minimum Experience</label>
                        <select value={experience} onChange={(e) => setExperience(e.target.value)} className={styles.filterSelect} style={{ width: '100%' }}>
                            <option value="">Any Experience</option>
                            <option value="0-2 Years">0-2 Years</option>
                            <option value="2-5 Years">2-5 Years</option>
                            <option value="5-10 Years">5-10 Years</option>
                            <option value="10+ Years">10+ Years</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            className={styles.submitBtnDashboard}
                            onClick={fetchAdvocates}
                            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            <Search size={16} /> Search Now
                        </button>

                        {!showSaveInput ? (
                            <button
                                onClick={() => setShowSaveInput(true)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Save size={16} /> Save Filter
                            </button>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', gap: '5px' }}>
                                <input
                                    autoFocus
                                    placeholder="Preset Name..."
                                    value={presetName}
                                    onChange={e => setPresetName(e.target.value)}
                                    className={styles.dashboardSearchInput}
                                    style={{ padding: '8px', fontSize: '12px' }}
                                />
                                <button onClick={handleSavePreset} className={styles.searchBtnInside} style={{ position: 'static' }}>Save</button>
                            </div>
                        )}

                    </div>

                </div>

                {/* Right: Saved Presets */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    padding: '25px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                }}>
                    <h3 style={{ color: '#fff', margin: '0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bookmark size={18} /> Saved Search Filters
                    </h3>

                    {presets.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                            <p>No saved preferences yet.</p>
                            <p style={{ fontSize: '12px' }}>Save your common search filters here for quick access.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '400px' }}>
                            {presets.map(p => (
                                <div key={p.id} onClick={() => applyPreset(p)} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#facc15' }}>{p.name}</h4>
                                        <button onClick={(e) => deletePreset(p.id, e)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#94a3b8' }}>
                                        {p.specs.length ? p.specs.join(', ') : 'All Depts'} • {p.states.length ? p.states.join(', ') : 'All States'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={40} color="#facc15" />
                </div>
            ) : (
                <div className={styles.grid}>
                    {advocates.map(adv => (
                        <div key={adv.id} onClick={() => showDetailedProfile && showDetailedProfile(adv.unique_id)} style={{ cursor: 'pointer' }}>
                            <AdvocateCard
                                advocate={adv}
                                variant="featured"
                                isPremium={isPremium}
                                onAction={async (action, data) => {
                                    if (user) {
                                        const targetId = String(adv.id);
                                        const userId = String(user.id);
                                        const targetRole = 'advocate';

                                        if (action === 'interest_initiated' || action === 'interest') {
                                            await interactionService.recordActivity(targetRole, targetId, 'interest', userId);
                                            if (showToast) showToast(`Interest sent to ${adv.name}`);
                                        } else if (action === 'super_interest_sent' || action === 'super-interest') {
                                            await interactionService.recordActivity(targetRole, targetId, 'superInterest', userId);
                                            if (showToast) showToast(`Super Interest sent to ${adv.name}!`);
                                        } else if (action === 'shortlisted') {
                                            await interactionService.recordActivity(targetRole, targetId, 'shortlist', userId);
                                            if (showToast) showToast(`${adv.name} added to shortlist`);
                                        } else if (action === 'openFullChatPage') {
                                            await interactionService.recordActivity(targetRole, targetId, 'chat', userId);
                                            if (onSelectForChat) onSelectForChat(adv);
                                        } else if (action === 'message_sent' && typeof data === 'string') {
                                            await interactionService.sendMessage(userId, targetId, data);
                                            if (showToast) showToast(`Message sent to ${adv.name}`);
                                        }
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPreferences;
