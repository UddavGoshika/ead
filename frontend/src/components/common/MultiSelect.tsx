
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import styles from './MultiSelect.module.css';

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
                                    // Prevent click propagation to avoid closing dropdown
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* OPTIONS */}
                            <div className={styles.optionsList}>
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MultiSelect;
