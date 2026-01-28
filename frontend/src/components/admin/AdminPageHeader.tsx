import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import styles from './AdminPageHeader.module.css';

interface AdminPageHeaderProps {
    title: string;
    onSearch?: (query: string, role: 'advocate' | 'client' | 'all') => void;
    placeholder?: string;
    onAddClick?: (role: 'advocate' | 'client' | 'all') => void;
    showRoleFilter?: boolean;
    onRoleChange?: (role: 'advocate' | 'client' | 'all') => void;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
    title,
    onSearch,
    placeholder = "Search...",
    onAddClick,
    showRoleFilter = true,
    onRoleChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRole, setActiveRole] = useState<'advocate' | 'client' | 'all'>('all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchQuery, activeRole);
        }
    };

    return (
        <div className={styles.headerContainer}>
            <div className={styles.leftSection}>
                <h1 className={styles.title}>{title}</h1>
            </div>

            <div className={styles.rightSection}>
                {showRoleFilter && (
                    <div className={styles.toggleWrapper}>
                        <button
                            className={`${styles.toggleBtn} ${activeRole === 'all' ? styles.active : ''}`}
                            onClick={() => {
                                setActiveRole('all');
                                if (onSearch) onSearch(searchQuery, 'all');
                                if (onRoleChange) onRoleChange('all');
                            }}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${activeRole === 'advocate' ? styles.active : ''}`}
                            onClick={() => {
                                setActiveRole('advocate');
                                if (onSearch) onSearch(searchQuery, 'advocate');
                                if (onRoleChange) onRoleChange('advocate');
                            }}
                        >
                            Advocates
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${activeRole === 'client' ? styles.active : ''}`}
                            onClick={() => {
                                setActiveRole('client');
                                if (onSearch) onSearch(searchQuery, 'client');
                                if (onRoleChange) onRoleChange('client');
                            }}
                        >
                            Clients
                        </button>
                    </div>
                )}

                <form className={styles.searchForm} onSubmit={handleSearch}>
                    <div className={styles.inputWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.searchSubmitBtn}>
                        Search
                    </button>
                </form>

                {onAddClick && (
                    <button
                        className={styles.addMemberBtn}
                        onClick={() => onAddClick(activeRole)}
                        title={`Add New ${activeRole === 'advocate' ? 'Advocate' : 'Client'}`}
                    >
                        <UserPlus size={20} />
                        <span>Add New Member</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminPageHeader;
