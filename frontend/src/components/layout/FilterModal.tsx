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
    isOpen: boolean;
    onToggle: () => void;
    expandLayout?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder,
    disabled,
    isOpen,
    onToggle,
    expandLayout
}) => {
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const closeDropdown = () => {
        onToggle();
        setSearch('');
    };

    return (
        <div className={`${styles.multiSelectContainer} ${disabled ? styles.disabled : ''} ${isOpen ? styles.active : ''}`}>
            <div
                className={styles.multiSelectTrigger}
                onClick={() => !disabled && onToggle()}
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
                            className={`${styles.dropdownMenu} ${expandLayout ? styles.expandable : ''}`}
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
    constitutional: {
        label: 'Constitutional',
        subDepartments: [
            { value: 'fundamental_rights', label: 'Fundamental Rights' },
            { value: 'writ_32', label: 'Writs under Article 32' },
            { value: 'writ_226', label: 'Writs under Article 226' },
            { value: 'pil', label: 'Public Interest Litigation (PIL)' },
            { value: 'judicial_review', label: 'Judicial Review' },
            { value: 'constitutional_challenges', label: 'Constitutional Challenges' },
            { value: 'election_law', label: 'Election Law' },
            { value: 'centre_state', label: 'Centre–State Relations' },
            { value: 'administrative_actions', label: 'State Administrative Actions' }
        ]
    },

    administrative: {
        label: 'Administrative Law',
        subDepartments: [
            { value: 'service_law', label: 'Service Law' },
            { value: 'disciplinary_proceedings', label: 'Disciplinary Proceedings' },
            { value: 'tribunal_matters', label: 'Tribunal Matters' },
            { value: 'administrative_appeals', label: 'Administrative Appeals' },
            { value: 'government_employees', label: 'Government Employees Law' }
        ]
    },

    // =========================
    // CRIMINAL LAW
    // =========================
    criminal: {
        label: 'Criminal',
        subDepartments: [
            { value: 'ipc', label: 'Indian Penal Code (IPC)' },
            { value: 'crpc', label: 'Criminal Procedure Code (CrPC)' },
            { value: 'criminal_trials', label: 'Criminal Trials' },
            { value: 'criminal_appeals', label: 'Criminal Appeals' },
            { value: 'criminal_revisions', label: 'Criminal Revisions' },
            { value: 'bail', label: 'Bail & Anticipatory Bail' },
            { value: 'white_collar', label: 'White-Collar Crime' },
            { value: 'economic_offences', label: 'Economic Offences' },
            { value: 'ndps', label: 'NDPS / Narcotics Law' },
            { value: 'pmla', label: 'PMLA & Money Laundering' },
            { value: 'cyber_crimes', label: 'Cyber Crimes' },
            { value: 'juvenile_justice', label: 'Juvenile Justice Act' },
            { value: 'anti_corruption', label: 'Anti-Corruption / CBI' },
            { value: 'forensic_evidence', label: 'Forensic & Digital Evidence' }
        ]
    },

    // =========================
    // CIVIL & PROCEDURAL
    // =========================
    civil: {
        label: 'Civil Litigation',
        subDepartments: [
            { value: 'civil_suits', label: 'Civil Suits' },
            { value: 'injunctions', label: 'Injunction Matters' },
            { value: 'specific_relief', label: 'Specific Relief Act' },
            { value: 'recovery_suits', label: 'Recovery & Money Suits' },
            { value: 'execution', label: 'Execution Proceedings' },
            { value: 'civil_appeals', label: 'Civil Appeals' },
            { value: 'civil_revisions', label: 'Civil Revisions' },
            { value: 'limitation', label: 'Limitation Act' },
            { value: 'procedural_law', label: 'Procedural Law (CPC)' }
        ]
    },

    evidence: {
        label: 'Evidence Law',
        subDepartments: [
            { value: 'indian_evidence_act', label: 'Indian Evidence Act' },
            { value: 'documentary_evidence', label: 'Documentary Evidence' },
            { value: 'electronic_evidence', label: 'Electronic Evidence' },
            { value: 'expert_evidence', label: 'Expert & Forensic Evidence' }
        ]
    },

    // =========================
    // FAMILY & PERSONAL
    // =========================
    family: {
        label: 'Family Law',
        subDepartments: [
            { value: 'marriage_divorce', label: 'Marriage & Divorce' },
            { value: 'maintenance', label: 'Maintenance & Alimony' },
            { value: 'child_custody', label: 'Child Custody' },
            { value: 'guardianship', label: 'Guardianship' },
            { value: 'adoption', label: 'Adoption' },
            { value: 'domestic_violence', label: 'Domestic Violence Act' },
            { value: 'hindu_law', label: 'Hindu Personal Law' },
            { value: 'muslim_law', label: 'Muslim Personal Law' },
            { value: 'christian_law', label: 'Christian & Parsi Law' },
            { value: 'succession', label: 'Succession & Inheritance' }
        ]
    },

    // =========================
    // PROPERTY & LAND
    // =========================
    property: {
        label: 'Property & Land',
        subDepartments: [
            { value: 'title_due_diligence', label: 'Title Due Diligence' },
            { value: 'transfer_property', label: 'Transfer of Property Act' },
            { value: 'lease_rent', label: 'Lease & Rent Control' },
            { value: 'partition', label: 'Partition Suits' },
            { value: 'land_acquisition', label: 'Land Acquisition' },
            { value: 'revenue_laws', label: 'Revenue & Land Laws' },
            { value: 'builder_buyer', label: 'Builder-Buyer Disputes' },
            { value: 'rera', label: 'Real Estate (RERA)' }
        ]
    },

    // =========================
    // CORPORATE & COMMERCIAL
    // =========================
    corporate: {
        label: 'Corporate Law',
        subDepartments: [
            { value: 'company_incorporation', label: 'Company Incorporation' },
            { value: 'company_compliance', label: 'Company Law Compliance' },
            { value: 'corporate_governance', label: 'Corporate Governance' },
            { value: 'shareholder_disputes', label: 'Shareholder Disputes' },
            { value: 'mna', label: 'Mergers & Acquisitions' },
            { value: 'joint_ventures', label: 'Joint Ventures' },
            { value: 'commercial_suits', label: 'Commercial Suits' },
            { value: 'startup_law', label: 'Startup & VC Law' }
        ]
    },

    contract: {
        label: 'Contract Law',
        subDepartments: [
            { value: 'commercial_contracts', label: 'Commercial Contracts' },
            { value: 'service_agreements', label: 'Service Agreements' },
            { value: 'government_contracts', label: 'Government Contracts' },
            { value: 'e_contracts', label: 'Electronic Contracts' },
            { value: 'contract_breach', label: 'Breach of Contract' }
        ]
    },

    // =========================
    // BANKING, FINANCE & INSOLVENCY
    // =========================
    banking_finance: {
        label: 'Banking & Finance',
        subDepartments: [
            { value: 'banking_litigation', label: 'Banking Litigation' },
            { value: 'loan_documentation', label: 'Loan Documentation' },
            { value: 'loan_default', label: 'Loan Default Cases' },
            { value: 'drt', label: 'Debt Recovery Tribunal (DRT)' },
            { value: 'sarfaesi', label: 'SARFAESI Act' },
            { value: 'financial_fraud', label: 'Financial Fraud' },
            { value: 'nbfc', label: 'NBFC Compliance' },
            { value: 'rbi', label: 'RBI Regulations' }
        ]
    },

    insolvency: {
        label: 'Insolvency & Bankruptcy',
        subDepartments: [
            { value: 'ibc', label: 'IBC Proceedings' },
            { value: 'corporate_insolvency', label: 'Corporate Insolvency' },
            { value: 'personal_insolvency', label: 'Personal Insolvency' },
            { value: 'liquidation', label: 'Liquidation' },
            { value: 'resolution_plans', label: 'Resolution Plans' }
        ]
    },

    // =========================
    // TAX
    // =========================
    taxation: {
        label: 'Taxation',
        subDepartments: [
            { value: 'income_tax', label: 'Income Tax' },
            { value: 'gst', label: 'GST' },
            { value: 'customs', label: 'Customs Law' },
            { value: 'excise', label: 'Excise Law' },
            { value: 'transfer_pricing', label: 'Transfer Pricing' },
            { value: 'international_tax', label: 'International Taxation' },
            { value: 'tax_appeals', label: 'Tax Appeals & Tribunals' }
        ]
    },

    // =========================
    // IP, TECH & MEDIA
    // =========================
    intellectual_property: {
        label: 'Intellectual Property',
        subDepartments: [
            { value: 'trademarks', label: 'Trademarks' },
            { value: 'patents', label: 'Patents' },
            { value: 'copyrights', label: 'Copyrights' },
            { value: 'designs', label: 'Design Law' },
            { value: 'gi', label: 'Geographical Indications' },
            { value: 'ip_litigation', label: 'IP Litigation' },
            { value: 'licensing', label: 'IP Licensing' }
        ]
    },

    cyber: {
        label: 'Cyber & Technology Law',
        subDepartments: [
            { value: 'it_act', label: 'IT Act Matters' },
            { value: 'data_privacy', label: 'Data Protection & Privacy' },
            { value: 'cyber_security', label: 'Cyber Security Compliance' },
            { value: 'digital_evidence', label: 'Digital Evidence' },
            { value: 'ai_blockchain', label: 'AI & Blockchain Law' }
        ]
    },

    media: {
        label: 'Media & Entertainment',
        subDepartments: [
            { value: 'media_law', label: 'Media Law' },
            { value: 'defamation_media', label: 'Media Defamation' },
            { value: 'film_contracts', label: 'Film & OTT Contracts' },
            { value: 'sports_law', label: 'Sports & Gaming Law' }
        ]
    },

    // =========================
    // LABOUR, CONSUMER, SOCIAL
    // =========================
    labour: {
        label: 'Labour & Employment',
        subDepartments: [
            { value: 'industrial_disputes', label: 'Industrial Disputes' },
            { value: 'employment_contracts', label: 'Employment Contracts' },
            { value: 'posh', label: 'POSH Act' },
            { value: 'epf_esi', label: 'EPF & ESI' },
            { value: 'trade_unions', label: 'Trade Union Law' }
        ]
    },

    consumer: {
        label: 'Consumer Protection',
        subDepartments: [
            { value: 'consumer_forums', label: 'Consumer Forums' },
            { value: 'product_liability', label: 'Product Liability' },
            { value: 'service_deficiency', label: 'Deficiency of Service' },
            { value: 'ecommerce', label: 'E-commerce Complaints' }
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

    // =========================
    // ENVIRONMENT, ENERGY, INTERNATIONAL
    // =========================
    environmental: {
        label: 'Environmental & Energy',
        subDepartments: [
            { value: 'ngt', label: 'NGT Matters' },
            { value: 'pollution_control', label: 'Pollution Control Laws' },
            { value: 'forest_wildlife', label: 'Forest & Wildlife Law' },
            { value: 'climate_change', label: 'Climate Change Litigation' },
            { value: 'renewable_energy', label: 'Renewable Energy Law' }
        ]
    },

    arbitration: {
        label: 'Arbitration & ADR',
        subDepartments: [
            { value: 'domestic_arbitration', label: 'Domestic Arbitration' },
            { value: 'international_arbitration', label: 'International Arbitration' },
            { value: 'mediation', label: 'Mediation' },
            { value: 'conciliation', label: 'Conciliation' },
            { value: 'award_enforcement', label: 'Enforcement of Awards' }
        ]
    },

    international: {
        label: 'International Law',
        subDepartments: [
            { value: 'public_international', label: 'Public International Law' },
            { value: 'private_international', label: 'Private International Law' },
            { value: 'wto', label: 'WTO & Trade Law' },
            { value: 'cross_border', label: 'Cross-Border Transactions' },
            { value: 'maritime', label: 'Maritime & Admiralty Law' },
            { value: 'aviation', label: 'Aviation Law' }
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
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

    const handleToggle = (id: string) => {
        setOpenDropdownId(prev => prev === id ? null : id);
    };

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
                {/* 
                  HEADER ROW 
                  Left: Role Toggles
                  Right: Search by ID 
                */}
                <div className={styles.headerRow}>
                    {/* Left: Role Toggles */}
                    <div className={styles.rolePicker}>
                        <div className={styles.roleToggle}>
                            <button
                                className={`${styles.roleOption} ${role === 'advocate' ? styles.activeRole : ''}`}
                                onClick={() => setRole('advocate')}
                            >
                                {/* Using a placeholder icon, can use UserGroup if available */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                Find Advocates
                            </button>
                            <button
                                className={`${styles.roleOption} ${role === 'client' ? styles.activeRole : ''}`}
                                onClick={() => setRole('client')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                Find Clients
                            </button>
                        </div>
                    </div>

                    {/* Right: Search */}
                    <div className={styles.headerControls}>
                        <div className={styles.searchContainer}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by ID (e.g., ADV-123)"
                                className={styles.idInput}
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                            />
                            <button className={styles.searchActionBtn} onClick={handleApply}>Search</button>
                        </div>
                    </div>
                    <div className={styles.headerControls}>
                        <button className={styles.closebtn} onClick={closeFilterModal}>X</button>
                    </div>


                </div>

                <div className={styles.scrollArea}>
                    <div className={styles.grid}>
                        {/* Row 1: Languages, Depts, SubDepts, Experience */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Languages"
                                options={[
                                    { value: 'assamese', label: 'Assamese' },
                                    { value: 'bengali', label: 'Bengali' },
                                    { value: 'bodo', label: 'Bodo' },
                                    { value: 'dogri', label: 'Dogri' },
                                    { value: 'english', label: 'English' },
                                    { value: 'gujarati', label: 'Gujarati' },
                                    { value: 'hindi', label: 'Hindi' },
                                    { value: 'kannada', label: 'Kannada' },
                                    { value: 'kashmiri', label: 'Kashmiri' },
                                    { value: 'konkani', label: 'Konkani' },
                                    { value: 'maithili', label: 'Maithili' },
                                    { value: 'malayalam', label: 'Malayalam' },
                                    { value: 'manipuri', label: 'Manipuri' },
                                    { value: 'marathi', label: 'Marathi' },
                                    { value: 'nepali', label: 'Nepali' },
                                    { value: 'odia', label: 'Odia' },
                                    { value: 'punjabi', label: 'Punjabi' },
                                    { value: 'sanskrit', label: 'Sanskrit' },
                                    { value: 'santali', label: 'Santali' },
                                    { value: 'sindhi', label: 'Sindhi' },
                                    { value: 'tamil', label: 'Tamil' },
                                    { value: 'telugu', label: 'Telugu' },
                                    { value: 'urdu', label: 'Urdu' }

                                ]}
                                selected={filters.language}
                                onChange={(val) => toggleFilter('language', val)}
                                isOpen={openDropdownId === 'language'}
                                onToggle={() => handleToggle('language')}
                            />
                        </div>

                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Departments / Categories"
                                options={Object.entries(DEPARTMENT_DATA).map(([value, d]) => ({ value, label: d.label }))}
                                selected={filters.department}
                                onChange={(val) => toggleFilter('department', val)}
                                isOpen={openDropdownId === 'department'}
                                onToggle={() => handleToggle('department')}
                            />
                        </div>

                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Sub Departments"
                                options={availableSubDepartments}
                                selected={filters.subDepartment}
                                onChange={(val) => toggleFilter('subDepartment', val)}
                                disabled={filters.department.length === 0}
                                isOpen={openDropdownId === 'subDepartment'}
                                onToggle={() => handleToggle('subDepartment')}
                            />
                        </div>



                        {/* Row 2: States, Districts, Cities, Mode */}
                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select States"
                                options={Object.keys(LOCATION_DATA_RAW).map(s => ({ value: s, label: s }))}
                                selected={filters.state}
                                onChange={(val) => toggleFilter('state', val)}
                                isOpen={openDropdownId === 'state'}
                                onToggle={() => handleToggle('state')}
                            />
                        </div>

                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Districts"
                                options={availableDistricts}
                                selected={filters.district}
                                onChange={(val) => toggleFilter('district', val)}
                                disabled={filters.state.length === 0}
                                isOpen={openDropdownId === 'district'}
                                onToggle={() => handleToggle('district')}
                            />
                        </div>

                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Cities"
                                options={availableCities}
                                selected={filters.city}
                                onChange={(val) => toggleFilter('city', val)}
                                disabled={filters.district.length === 0}
                                isOpen={openDropdownId === 'city'}
                                onToggle={() => handleToggle('city')}
                            />
                        </div>

                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Select Experience"
                                options={[
                                    { value: '1-3', label: '1-3 Years' },
                                    { value: '3-5', label: '3-5 Years' },
                                    { value: '5-10', label: '5-10 Years' },
                                    { value: '10+', label: '10+ Years' }
                                ]}
                                selected={filters.experience}
                                onChange={(val) => toggleFilter('experience', val)}
                                disabled={role === 'client'}
                                isOpen={openDropdownId === 'experience'}
                                onToggle={() => handleToggle('experience')}
                                expandLayout={true}
                            />
                        </div>

                        <div className={styles.filterBox}>
                            <MultiSelect
                                placeholder="Consultation Mode"
                                options={[
                                    { value: 'online', label: 'Online' },
                                    { value: 'offline', label: 'Offline' }
                                ]}
                                selected={filters.consultationMode}
                                onChange={(val) => toggleFilter('consultationMode', val)}
                                isOpen={openDropdownId === 'consultationMode'}
                                onToggle={() => handleToggle('consultationMode')}
                                expandLayout={true}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.footerActions}>
                    <button className={styles.applyActionButton} onClick={handleApply}>Apply Filters</button>
                    {/* Hidden/Removed Reset Button as per visual req, or if needed can add back subtly */}

                    <button className={styles.resetBtn} onClick={handleReset}>Reset</button>


                </div>



            </motion.div>
        </div>
    );
};

export default FilterModal;
