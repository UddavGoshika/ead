import React from 'react';
import { usePackageFeatures } from '../../hooks/usePackageFeatures';
import type { FeatureLimits } from '../../types/packageFeatures';
import { Lock, Crown, Zap } from 'lucide-react';
import styles from './FeatureGate.module.css';

interface FeatureGateProps {
    feature: keyof FeatureLimits;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgradePrompt?: boolean;
    currentUsage?: number;
}

/**
 * FeatureGate Component
 * Conditionally renders content based on package feature access
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
    feature,
    children,
    fallback,
    showUpgradePrompt = true,
    currentUsage = 0
}) => {
    const { canPerformAction, getUpgradeSuggestion, loading } = usePackageFeatures();

    if (loading) {
        return (
            <div className={styles.loading}>
                <Zap className={styles.spinner} size={24} />
                <p>Checking access...</p>
            </div>
        );
    }

    const accessCheck = canPerformAction(feature, currentUsage);

    if (accessCheck.allowed) {
        return <>{children}</>;
    }

    // Feature not allowed - show fallback or upgrade prompt
    if (fallback) {
        return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
        return (
            <div className={styles.upgradePrompt}>
                <div className={styles.lockIcon}>
                    <Lock size={48} />
                </div>
                <h3 className={styles.title}>Premium Feature</h3>
                <p className={styles.reason}>{accessCheck.reason}</p>
                <p className={styles.suggestion}>{getUpgradeSuggestion(feature)}</p>
                <button className={styles.upgradeButton}>
                    <Crown size={20} />
                    <span>Upgrade Now</span>
                </button>
            </div>
        );
    }

    return null;
};

interface FeatureLimitDisplayProps {
    feature: keyof FeatureLimits;
    currentUsage: number;
}

/**
 * FeatureLimitDisplay Component
 * Shows current usage and limit for a feature
 */
export const FeatureLimitDisplay: React.FC<FeatureLimitDisplayProps> = ({
    feature,
    currentUsage
}) => {
    const { canPerformAction } = usePackageFeatures();
    const check = canPerformAction(feature, currentUsage);

    // Check if unlimited (undefined limit or 999)
    if (!check.limit || check.limit === 999) {
        return (
            <div className={styles.limitDisplay}>
                <span className={styles.unlimited}>Unlimited</span>
            </div>
        );
    }

    const percentage = (currentUsage / (check.limit as number)) * 100;
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className={styles.limitDisplay}>
            <div className={styles.limitText}>
                <span className={styles.usage}>{currentUsage}</span>
                <span className={styles.separator}>/</span>
                <span className={styles.limit}>{check.limit}</span>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={`${styles.progress} ${isNearLimit ? styles.warning : ''} ${isAtLimit ? styles.danger : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {isNearLimit && (
                <p className={styles.warningText}>
                    {isAtLimit ? 'Limit reached' : 'Approaching limit'}
                </p>
            )}
        </div>
    );
};

export default FeatureGate;
