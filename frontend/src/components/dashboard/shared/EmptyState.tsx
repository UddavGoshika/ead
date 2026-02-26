import React from 'react';
import styles from './EmptyState.module.css';
import { FileQuestion, Plus } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = <FileQuestion size={48} />,
    actionLabel,
    onAction
}) => {
    return (
        <div className={styles.emptyStateContainer}>
            <div className={styles.iconWrapper}>
                {icon}
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            {actionLabel && onAction && (
                <button className={styles.actionBtn} onClick={onAction}>
                    <Plus size={16} /> {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
