import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import './UsageIndicator.css';

interface UsageIndicatorProps {
    label: string;
    current: number;
    limit: number | 'unlimited';
    type?: 'message' | 'interest' | 'storage' | 'default';
    showUpgrade?: boolean;
    onUpgrade?: () => void;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
    label,
    current,
    limit,
    type = 'default',
    showUpgrade = true,
    onUpgrade
}) => {
    const isUnlimited = limit === 'unlimited' || limit === 999;
    const percentage = isUnlimited ? 0 : Math.min((current / (limit as number)) * 100, 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    const getStatusColor = () => {
        if (isUnlimited) return '#10b981'; // green
        if (isAtLimit) return '#ef4444'; // red
        if (isNearLimit) return '#f59e0b'; // orange
        return '#3b82f6'; // blue
    };

    const getStatusText = () => {
        if (isUnlimited) return 'Unlimited';
        if (isAtLimit) return 'Limit Reached';
        if (isNearLimit) return 'Near Limit';
        return 'Available';
    };

    return (
        <div className={`usage-indicator ${isAtLimit ? 'at-limit' : ''} ${isNearLimit ? 'near-limit' : ''}`}>
            <div className="usage-header">
                <div className="usage-label">
                    <span className="label-text">{label}</span>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor() }}>
                        {getStatusText()}
                    </span>
                </div>

                <div className="usage-count">
                    <span className="current">{current.toLocaleString()}</span>
                    <span className="separator">/</span>
                    <span className="limit">
                        {isUnlimited ? '∞' : (limit as number).toLocaleString()}
                    </span>
                </div>
            </div>

            {!isUnlimited && (
                <div className="usage-progress">
                    <div
                        className="progress-bar"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: getStatusColor()
                        }}
                    />
                </div>
            )}

            {isAtLimit && showUpgrade && (
                <div className="usage-warning">
                    <AlertCircle size={16} />
                    <span>You've reached your limit.</span>
                    {onUpgrade && (
                        <button onClick={onUpgrade} className="upgrade-link">
                            <TrendingUp size={14} />
                            Upgrade
                        </button>
                    )}
                </div>
            )}

            {isNearLimit && !isAtLimit && (
                <div className="usage-warning near">
                    <AlertCircle size={16} />
                    <span>
                        {(limit as number) - current} {type}s remaining
                    </span>
                </div>
            )}
        </div>
    );
};

export default UsageIndicator;
