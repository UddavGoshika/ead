import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './FilterModal.module.css';
import { LOCATION_DATA_RAW } from './statesdis';
import { useEffect } from 'react';

interface MultiSelectProps {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder,
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const closeDropdown = () => {
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className={`${styles.multiSelectContainer} ${disabled ? styles.disabled : ''}`}>
            <div
                className={styles.multiSelectTrigger}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={styles.selectedValues}>
                    {selected.length === 0 ? (
                        <span className={styles.placeholder}>{placeholder}</span>
                    ) : (
                        selected.map(val => (
                            <span key={val} className={styles.tag}>
                                {options.find(opt => opt.value === val)?.label || val}
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                />
            </div>

            <AnimatePresence>
                {isOpen && !disabled && (
                    <>
                        <motion.div
                            className={styles.dropdownOverlay}
                            onClick={closeDropdown}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            className={styles.dropdownMenu}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* 🔍 SEARCH INPUT */}
                            <div className={styles.searchBox}>
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* OPTIONS */}
                            {filteredOptions.length === 0 ? (
                                <div className={styles.noResult}>No results found</div>
                            ) : (
                                filteredOptions.map(opt => (
                                    <div
                                        key={opt.value}
                                        className={`${styles.dropdownItem} ${selected.includes(opt.value) ? styles.selected : ''
                                            }`}
                                        onClick={() => onChange(opt.value)}
                                    >
                                        <div className={styles.checkbox}>
                                            {selected.includes(opt.value) && <Check size={14} />}
                                        </div>
                                        <span>{opt.label}</span>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export const DEPARTMENT_DATA: Record<
    string,
    {
        label: string;
        subDepartments: { value: string; label: string }[];
    }
> = {
    criminal: {
        label: 'Criminal',
        subDepartments: [
            { value: 'ipc_crpc', label: 'IPC & CrPC' },
            { value: 'cyber_crimes', label: 'Cyber Crimes' },
            { value: 'juvenile_justice', label: 'Juvenile Justice' },
            { value: 'white_collar', label: 'White-Collar Crime' },
            { value: 'narcotics', label: 'Narcotics Law' }
        ]
    },
    family: {
        label: 'Family',
        subDepartments: [
            { value: 'marriage_divorce', label: 'Marriage & Divorce' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'adoption', label: 'Adoption' },
            { value: 'hindu_law', label: 'Hindu Law' },
            { value: 'muslim_law', label: 'Muslim Law' },
            { value: 'christian_law', label: 'Christian Law' }
        ]
    },
    corporate: {
        label: 'Corporate',
        subDepartments: [
            { value: 'company_incorporation', label: 'Company Incorporation' },
            { value: 'mergers_acquisitions', label: 'Mergers & Acquisitions' },
            { value: 'insolvency_bankruptcy', label: 'Insolvency & Bankruptcy' },
            { value: 'sebi_compliance', label: 'SEBI Compliance' }
        ]
    },
    constitutional: {
        label: 'Constitutional',
        subDepartments: [
            { value: 'fundamental_rights', label: 'Fundamental Rights' },
            { value: 'writ_petitions', label: 'Writ Petitions' },
            { value: 'election_law', label: 'Election Law' },
            { value: 'centre_state', label: 'Centre-State Relations' }
        ]
    },
    intellectual_property: {
        label: 'Intellectual Property',
        subDepartments: [
            { value: 'patents', label: 'Patents' },
            { value: 'trademarks', label: 'Trademarks' },
            { value: 'copyrights', label: 'Copyrights' },
            { value: 'designs', label: 'Designs' },
            { value: 'gi_tags', label: 'GI Tags' }
        ]
    },
    cyber: {
        label: 'Cyber Law',
        subDepartments: [
            { value: 'data_privacy', label: 'Data Privacy' },
            { value: 'it_act', label: 'IT Act Cases' },
            { value: 'online_fraud', label: 'Online Fraud' },
            { value: 'digital_contracts', label: 'Digital Contracts' }
        ]
    },
    contract: {
        label: 'Contract',
        subDepartments: [
            { value: 'commercial_contracts', label: 'Commercial Contracts' },
            { value: 'e_contracts', label: 'E-Contracts' },
            { value: 'service_agreements', label: 'Service Agreements' },
            { value: 'government_contracts', label: 'Government Contracts' }
        ]
    },
    tort: {
        label: 'Tort Law',
        subDepartments: [
            { value: 'negligence', label: 'Negligence' },
            { value: 'defamation', label: 'Defamation' },
            { value: 'nuisance', label: 'Nuisance' },
            { value: 'medical_malpractice', label: 'Medical Malpractice' }
        ]
    },
    administrative: {
        label: 'Administrative',
        subDepartments: [
            { value: 'service_law', label: 'Service Law' },
            { value: 'tribunals', label: 'Tribunals' },
            { value: 'rti', label: 'RTI & Public Duty' },
            { value: 'disciplinary_actions', label: 'Disciplinary Actions' }
        ]
    },
    labour_employment: {
        label: 'Labour & Employment',
        subDepartments: [
            { value: 'wages_salary', label: 'Wages & Salary Law' },
            { value: 'industrial_disputes', label: 'Industrial Disputes' },
            { value: 'workplace_harassment', label: 'Workplace Harassment' },
            { value: 'epf_esi', label: 'EPF & ESI Law' }
        ]
    },
    property: {
        label: 'Property',
        subDepartments: [
            { value: 'lease_rent', label: 'Lease & Rent' },
            { value: 'land_titles', label: 'Land Titles' },
            { value: 'transfer_property', label: 'Transfer of Property' },
            { value: 'rera', label: 'Real Estate (RERA)' }
        ]
    },
    banking_finance: {
        label: 'Banking & Finance',
        subDepartments: [
            { value: 'debt_recovery', label: 'Debt Recovery' },
            { value: 'loan_default', label: 'Loan Default Cases' },
            { value: 'nbfc_rbi', label: 'NBFC & RBI Compliance' },
            { value: 'sebi_securities', label: 'SEBI & Securities Law' }
        ]
    },
    consumer_protection: {
        label: 'Consumer Protection',
        subDepartments: [
            { value: 'ecommerce', label: 'E-commerce Complaints' },
            { value: 'service_deficiency', label: 'Service Deficiency' },
            { value: 'product_liability', label: 'Product Liability' },
            { value: 'consumer_forums', label: 'Consumer Forums' }
        ]
    },
    environmental: {
        label: 'Environmental',
        subDepartments: [
            { value: 'pollution_control', label: 'Pollution Control' },
            { value: 'forest_wildlife', label: 'Forest & Wildlife' },
            { value: 'eia', label: 'Environment Impact Assessment' },
            { value: 'climate_litigation', label: 'Climate Litigation' }
        ]
    },
    taxation: {
        label: 'Taxation',
        subDepartments: [
            { value: 'income_tax', label: 'Income Tax' },
            { value: 'gst', label: 'GST Law' },
            { value: 'customs_excise', label: 'Customs & Excise' },
            { value: 'tax_appeals', label: 'Tax Appeals' }
        ]
    },
    human_rights: {
        label: 'Human Rights',
        subDepartments: [
            { value: 'child_rights', label: 'Child Rights' },
            { value: 'women_rights', label: 'Women’s Rights' },
            { value: 'prisoner_rights', label: 'Prisoner Rights' },
            { value: 'minority_rights', label: 'Minority Rights' }
        ]
    },
    arbitration: {
        label: 'Arbitration',
        subDepartments: [
            { value: 'domestic_arbitration', label: 'Domestic Arbitration' },
            { value: 'international_arbitration', label: 'International Arbitration' },
            { value: 'mediation', label: 'Mediation' },
            { value: 'conciliation', label: 'Conciliation' }
        ]
    },
    media: {
        label: 'Media & Entertainment',
        subDepartments: [
            { value: 'censorship', label: 'Censorship Law' },
            { value: 'ott_regulation', label: 'OTT Regulation' },
            { value: 'film_contracts', label: 'Film Contracts' },
            { value: 'artist_rights', label: 'Artist Rights' }
        ]
    }
};

const FilterModal: React.FC = () => {
    const { isFilterModalOpen, closeFilterModal } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (isFilterModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = '';
            document.body.style.height = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
        };
    }, [isFilterModalOpen]);
    const [role, setRole] = useState<'advocate' | 'client'>('advocate');
    const [searchId, setSearchId] = useState('');

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

    // Linked Logic: Get available options based on parent selections
    const availableDistricts = filters.state.flatMap(s =>
        Object.keys(LOCATION_DATA_RAW[s] || {}).map(d => ({ value: d, label: d }))
    );

    const availableCities = filters.district.flatMap(d => {
        for (const stateName of filters.state) {
            const cities = LOCATION_DATA_RAW[stateName]?.[d];
            if (cities) return cities.map(c => ({ value: c, label: c }));
        }
        // Fallback: search all states if no state selected or district not in selected states
        if (filters.state.length === 0) {
            for (const stateData of Object.values(LOCATION_DATA_RAW)) {
                if (stateData[d]) return stateData[d].map(c => ({ value: c, label: c }));
            }
        }
        return [];
    });

    const availableSubDepartments = filters.department.flatMap(dept =>
        DEPARTMENT_DATA[dept]?.subDepartments || []
    );

    if (!isFilterModalOpen) return null;

    const handleReset = () => {
        setFilters({
            language: [],
            department: [],
            subDepartment: [],
            experience: [],
            state: [],
            district: [],
            city: [],
            consultationMode: []
        });
        setSearchId('');
        setRole('advocate');
    };

    const handleApply = () => {
        console.log('Applying filters:', { role, searchId, ...filters });

        if (searchId && /^adv-\d+$/i.test(searchId.trim())) {
            navigate(`/profile/${searchId.toUpperCase().trim()}`);
            closeFilterModal();
            return;
        }

        let query = `?role=${role}`;
        if (searchId) query += `&q=${encodeURIComponent(searchId)}`;

        // Add other filters to query string if needed
        Object.entries(filters).forEach(([key, values]) => {
            if (values.length > 0) {
                query += `&${key}=${encodeURIComponent(values.join(','))}`;
            }
        });

        navigate(`/search${query}`);
        closeFilterModal();
    };

    const toggleFilter = (field: string, value: string) => {
        setFilters(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];

            let newState = { ...prev, [field]: updated };

            // Linked logic: Clear children if parent is changed
            if (field === 'state') {
                const remainingDistricts = newState.district.filter(d =>
                    updated.some(s => LOCATION_DATA_RAW[s]?.[d])
                );
                const remainingCities = newState.city.filter(c =>
                    remainingDistricts.some(d => {
                        for (const s of updated) {
                            if (LOCATION_DATA_RAW[s]?.[d]?.includes(c)) return true;
                        }
                        return false;
                    })
                );
                newState.district = remainingDistricts;
                newState.city = remainingCities;
            }

            if (field === 'district') {
                const remainingCities = newState.city.filter(c =>
                    updated.some(d => {
                        for (const stateName of newState.state) {
                            if (LOCATION_DATA_RAW[stateName]?.[d]?.includes(c)) return true;
                        }
                        // If no state selected, check all states
                        if (newState.state.length === 0) {
                            for (const stateData of Object.values(LOCATION_DATA_RAW)) {
                                if (stateData[d]?.includes(c)) return true;
                            }
                        }
                        return false;
                    })
                );
                newState.city = remainingCities;
            }

            if (field === 'department') {
                const remainingSubDepts = newState.subDepartment.filter(sd =>
                    updated.some(dept => DEPARTMENT_DATA[dept]?.subDepartments.some(sub => sub.value === sd))
                );
                newState.subDepartment = remainingSubDepts;
            }

            return newState;
        });
    };

    return (
        <div className={styles.overlay} onClick={closeFilterModal}>
            <motion.div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >


                <button className={styles.closeIconBtn} onClick={closeFilterModal}>
                    <X size={24} />X
                </button>
                <div className={styles.headerRow}>
                    <div className={styles.topHeader}>
                        <h2 className={styles.modalTitle}>Browse Profiles</h2>

                    </div>

                    <div className={styles.headerControls}>
                        <div className={styles.searchContainer}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by ID"
                                className={styles.idInput}
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                            />
                            <button className={styles.searchActionBtn} onClick={handleApply}>Search</button>
                        </div>

                        <div className={styles.rolePicker}>
                            <span className={styles.roleLabel}>Role:</span>
                            <div className={styles.roleToggle}>
                                <button
                                    className={`${styles.roleOption} ${role === 'advocate' ? styles.activeRole : ''}`}
                                    onClick={() => setRole('advocate')}
                                >
                                    Advocate
                                </button>
                                <button
                                    className={`${styles.roleOption} ${role === 'client' ? styles.activeRole : ''}`}
                                    onClick={() => setRole('client')}
                                >
                                    Client
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className={styles.scrollArea}>
                    <div className={styles.grid}>
                        {/* Language */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Languages"
                                options={[
                                    { value: 'english', label: 'English' },
                                    { value: 'hindi', label: 'Hindi' },
                                    { value: 'telugu', label: 'Telugu' },
                                    { value: 'assamese', label: 'Assamese' },
                                    { value: 'awadhi', label: 'Awadhi' },
                                    { value: 'bagheli', label: 'Bagheli' },
                                    { value: 'banjara', label: 'Banjara' },
                                    { value: 'bhojpuri', label: 'Bhojpuri' },
                                    { value: 'bodo', label: 'Bodo' },
                                    { value: 'bundeli', label: 'Bundeli' },
                                    { value: 'chhattisgarhi', label: 'Chhattisgarhi' },
                                    { value: 'coorgi', label: 'Coorgi' },
                                    { value: 'dakhini', label: 'Dakhini' },
                                    { value: 'dogri', label: 'Dogri' },
                                    { value: 'garhwali', label: 'Garhwali' },
                                    { value: 'gujarati', label: 'Gujarati' },
                                    { value: 'haryanvi', label: 'Haryanvi' },
                                    { value: 'kannada', label: 'Kannada' },
                                    { value: 'kashmiri', label: 'Kashmiri' },
                                    { value: 'konkani', label: 'Konkani' },
                                    { value: 'malayalam', label: 'Malayalam' },
                                    { value: 'manipuri', label: 'Manipuri' },
                                    { value: 'marathi', label: 'Marathi' },
                                    { value: 'punjabi', label: 'Punjabi' },
                                    { value: 'rajasthani', label: 'Rajasthani' },
                                    { value: 'sanskrit', label: 'Sanskrit' },
                                    { value: 'tamil', label: 'Tamil' },
                                    { value: 'tulu', label: 'Tulu' },
                                    { value: 'urdu', label: 'Urdu' }
                                ]}

                                selected={filters.language}
                                onChange={(val) => toggleFilter('language', val)}
                            />
                        </div>

                        {/* Department */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Departments"
                                options={Object.entries(DEPARTMENT_DATA).map(([value, d]) => ({ value, label: d.label }))}
                                selected={filters.department}
                                onChange={(val) => toggleFilter('department', val)}
                            />
                        </div>

                        {/* Sub Department */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Sub Departments"
                                options={availableSubDepartments}
                                selected={filters.subDepartment}
                                onChange={(val) => toggleFilter('subDepartment', val)}
                                disabled={filters.department.length === 0}
                            />
                        </div>

                        {/* Experience */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Experience"
                                options={[
                                    { value: '1-3', label: '1-3 Years' },
                                    { value: '3-5', label: '3-5 Years' },
                                    { value: '5+', label: '5+ Years' }
                                ]}
                                selected={filters.experience}
                                onChange={(val) => toggleFilter('experience', val)}
                                disabled={role === 'client'}
                            />
                        </div>

                        {/* State */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select States"
                                options={Object.keys(LOCATION_DATA_RAW).map(s => ({ value: s, label: s }))}
                                selected={filters.state}
                                onChange={(val) => toggleFilter('state', val)}
                            />
                        </div>

                        {/* District */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Districts"
                                options={availableDistricts}
                                selected={filters.district}
                                onChange={(val) => toggleFilter('district', val)}
                                disabled={filters.state.length === 0}
                            />
                        </div>

                        {/* City */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Cities"
                                options={availableCities}
                                selected={filters.city}
                                onChange={(val) => toggleFilter('city', val)}
                                disabled={filters.district.length === 0}
                            />
                        </div>

                        {/* Consultation Mode */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Consultation Mode"
                                options={[
                                    { value: 'online', label: 'Online' },
                                    { value: 'offline', label: 'Offline' }
                                ]}
                                selected={filters.consultationMode}
                                onChange={(val) => toggleFilter('consultationMode', val)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.footerActions}>
                    <button className={styles.resetActionButton} onClick={handleReset}>Reset</button>
                    <button className={styles.applyActionButton} onClick={handleApply}>Apply Filters</button>
                </div>
            </motion.div>
        </div>
    );
};

export default FilterModal;
