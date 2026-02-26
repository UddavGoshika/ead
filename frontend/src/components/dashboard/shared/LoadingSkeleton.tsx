import React from 'react';
import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
    type?: 'table' | 'card' | 'list' | 'detail';
    rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', rows = 3 }) => {
    if (type === 'table') {
        return (
            <div className={styles.tableSkeleton}>
                <div className={styles.skeletonHeader}></div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className={styles.skeletonRow}>
                        <div className={styles.cell1}></div>
                        <div className={styles.cell2}></div>
                        <div className={styles.cell3}></div>
                        <div className={styles.cell4}></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className={styles.listSkeleton}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className={styles.listItem}>
                        <div className={styles.avatar}></div>
                        <div className={styles.listText}>
                            <div className={styles.line1}></div>
                            <div className={styles.line2}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div className={styles.detailSkeleton}>
                <div className={styles.header}></div>
                <div className={styles.contentBlock}></div>
                <div className={styles.contentBlockSm}></div>
                <div className={styles.contentBlock}></div>
            </div>
        );
    }

    // Default card
    return (
        <div className={styles.cardSkeleton}>
            <div className={styles.cardIcon}></div>
            <div className={styles.cardLine1}></div>
            <div className={styles.cardLine2}></div>
        </div>
    );
};

export default LoadingSkeleton;
