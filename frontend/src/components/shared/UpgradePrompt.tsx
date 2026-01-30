import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import './UpgradePrompt.css';

interface UpgradePromptProps {
    feature?: string;
    message?: string;
    currentPlan?: string;
    suggestedPlan?: string;
    compact?: boolean;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    feature,
    message,
    currentPlan = 'Free',
    suggestedPlan = 'Pro',
    compact = false
}) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate('/premium-services');
    };

    if (compact) {
        return (
            <div className="upgrade-prompt-compact">
                <Crown size={16} />
                <span>Upgrade to access</span>
                <button onClick={handleUpgrade} className="upgrade-btn-compact">
                    Upgrade
                </button>
            </div>
        );
    }

    return (
        <div className="upgrade-prompt">
            <div className="upgrade-prompt-icon">
                <Sparkles size={32} />
            </div>

            <div className="upgrade-prompt-content">
                <h3 className="upgrade-prompt-title">
                    {feature ? `${feature} - Premium Feature` : 'Premium Feature'}
                </h3>

                <p className="upgrade-prompt-message">
                    {message || `Upgrade to ${suggestedPlan} to unlock this feature and many more!`}
                </p>

                <div className="upgrade-prompt-plans">
                    <div className="current-plan">
                        <span className="plan-label">Current Plan:</span>
                        <span className="plan-name">{currentPlan}</span>
                    </div>
                    <ArrowRight size={20} className="arrow-icon" />
                    <div className="suggested-plan">
                        <span className="plan-label">Suggested:</span>
                        <span className="plan-name">{suggestedPlan}</span>
                    </div>
                </div>

                <button onClick={handleUpgrade} className="upgrade-btn">
                    <Crown size={20} />
                    <span>Upgrade Now</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default UpgradePrompt;
