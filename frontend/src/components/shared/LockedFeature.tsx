import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LockedFeature.css';

interface LockedFeatureProps {
    name: string;
    description?: string;
    icon?: React.ReactNode;
    suggestedPlan?: string;
    benefits?: string[];
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({
    name,
    description,
    icon,
    suggestedPlan = 'Pro',
    benefits = []
}) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate('/premium-services');
    };

    return (
        <div className="locked-feature">
            <div className="locked-feature-overlay">
                <div className="lock-icon-wrapper">
                    <Lock size={48} className="lock-icon" />
                </div>

                <div className="locked-feature-content">
                    {icon && <div className="feature-icon">{icon}</div>}

                    <h3 className="locked-feature-title">{name}</h3>

                    {description && (
                        <p className="locked-feature-description">{description}</p>
                    )}

                    {benefits.length > 0 && (
                        <ul className="locked-feature-benefits">
                            {benefits.map((benefit, index) => (
                                <li key={index}>
                                    <Crown size={16} />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="locked-feature-action">
                        <p className="upgrade-message">
                            Upgrade to <strong>{suggestedPlan}</strong> to unlock
                        </p>
                        <button onClick={handleUpgrade} className="unlock-btn">
                            <Crown size={20} />
                            <span>Unlock Feature</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockedFeature;
