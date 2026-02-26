import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    const navigate = useNavigate();

    return (
        <nav className={styles.breadcrumbCard} aria-label="Breadcrumb">
            <ol className={styles.breadcrumbList}>
                <li className={styles.breadcrumbItem}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={styles.homeBtn}
                        aria-label="Home"
                    >
                        <Home size={16} />
                    </button>
                    {items.length > 0 && <ChevronRight size={14} className={styles.separator} />}
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={item.label} className={styles.breadcrumbItem}>
                            {isLast || !item.path ? (
                                <span className={styles.activeLabel}>{item.label}</span>
                            ) : (
                                <button
                                    onClick={() => navigate(item.path!)}
                                    className={styles.breadcrumbLink}
                                >
                                    {item.label}
                                </button>
                            )}
                            {!isLast && <ChevronRight size={14} className={styles.separator} />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
