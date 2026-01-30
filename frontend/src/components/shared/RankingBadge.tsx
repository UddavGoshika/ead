import React from 'react';
import { Crown, Award, Star, Trophy, Target, MapPin } from 'lucide-react';
import './RankingBadge.css';

interface RankingBadgeProps {
    position: number;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

export const RankingBadge: React.FC<RankingBadgeProps> = ({
    position,
    size = 'medium',
    showLabel = true
}) => {
    const getBadgeInfo = (pos: number) => {
        if (pos <= 7) {
            return {
                text: 'Top 5-7',
                color: 'gold',
                icon: <Crown size={size === 'small' ? 14 : size === 'medium' ? 18 : 24} />,
                gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            };
        }
        if (pos <= 12) {
            return {
                text: 'Top 12',
                color: 'platinum',
                icon: <Award size={size === 'small' ? 14 : size === 'medium' ? 18 : 24} />,
                gradient: 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%)'
            };
        }
        if (pos <= 25) {
            return {
                text: 'Top 25',
                color: 'silver',
                icon: <Star size={size === 'small' ? 14 : size === 'medium' ? 18 : 24} />,
                gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
            };
        }
        if (pos <= 50) {
            return {
                text: 'Top 50',
                color: 'blue',
                icon: <Trophy size={size === 'small' ? 14 : size === 'medium' ? 18 : 24} />,
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
            };
        }
        if (pos <= 100) {
            return {
                text: 'Top 100',
                color: 'blue',
                icon: <Target size={size === 'small' ? 14 : size === 'medium' ? 18 : 24} />,
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
            };
        }
        if (pos <= 150) {
            return {
                text: 'Top 150',
                color: 'blue',
                icon: <MapPin size={size === 'small' ? 14 : size === 'medium' ? 18 : 24} />,
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
            };
        }
        return null;
    };

    const badgeInfo = getBadgeInfo(position);

    if (!badgeInfo) return null;

    return (
        <div
            className={`ranking-badge ranking-badge-${size} ranking-badge-${badgeInfo.color}`}
            style={{ background: badgeInfo.gradient }}
        >
            <span className="badge-icon">{badgeInfo.icon}</span>
            {showLabel && <span className="badge-text">{badgeInfo.text}</span>}
        </div>
    );
};

export default RankingBadge;
