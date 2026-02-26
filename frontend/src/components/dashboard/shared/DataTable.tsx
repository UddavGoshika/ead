import React, { useState } from 'react';
import {
    Search, Filter, ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import styles from './DataTable.module.css';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string;
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    onFilter?: () => void;
    actions?: (row: T) => React.ReactNode;
    itemsPerPage?: number;
    onRowClick?: (row: T) => void;
}

const DataTableInner = <T,>({
    data,
    columns,
    keyExtractor,
    searchPlaceholder = "Search records...",
    onSearch,
    onFilter,
    actions,
    itemsPerPage = 10,
    onRowClick,
}: DataTableProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Internal search fallback if external onSearch is not provided
    const displayData = React.useMemo(() => {
        if (onSearch || !searchTerm) return data;
        return data.filter(item =>
            Object.values(item as any).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm, onSearch]);

    const totalPages = Math.ceil(displayData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = displayData.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (onSearch) onSearch(val);
        setCurrentPage(1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={handleSearch}
                        className={styles.searchInput}
                    />
                </div>
                {onFilter && (
                    <button className={styles.filterBtn} onClick={onFilter}>
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                )}
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={col.className}>{col.header}</th>
                            ))}
                            {actions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.emptyState}>
                                    No records found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row) => (
                                <tr
                                    key={keyExtractor(row)}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                >
                                    {columns.map((col, idx) => (
                                        <td key={idx} className={col.className}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(row)
                                                : (row as any)[col.accessor]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className={styles.actionsCell}>
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <span className={styles.pageInfo}>
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, displayData.length)} of {displayData.length} records
                    </span>
                    <div className={styles.pageControls}>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DataTable = React.memo(DataTableInner) as <T>(props: DataTableProps<T>) => React.ReactElement;

