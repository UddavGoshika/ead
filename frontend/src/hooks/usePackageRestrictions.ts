import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeaturesFromPlan, type ExtendedFeatureLimits } from '../config/completePackageConfig';

/**
 * Hook for managing package-based restrictions and visibility
 * Handles profile visibility, star marks, feature access, and upgrade prompts
 */
export const usePackageRestrictions = () => {
    const { user } = useAuth();

    // Get features for current user's plan
    const features: ExtendedFeatureLimits = useMemo(() => {
        return getFeaturesFromPlan(user?.plan);
    }, [user?.plan]);

    /**
     * Check if user can view a profile type
     * @param profileType - Type of profile to check
     * @returns Visibility percentage (0-100)
     */
    const canViewProfile = (profileType: 'advocate' | 'featured'): number => {
        if (profileType === 'advocate') {
            return features.profileVisibility;
        }
        return features.featuredProfileAccess;
    };

    /**
     * Check if star marks should be shown
     * @returns true if star marks should be displayed
     */
    const shouldShowStarMarks = (): boolean => {
        return features.starMarkPercentage > 0;
    };

    /**
     * Get the percentage of content that should be covered with star marks
     * @returns Percentage (0-100)
     */
    const getStarMarkPercentage = (): number => {
        return features.starMarkPercentage;
    };

    /**
     * Check if upgrade prompt should be shown for a feature
     * @param feature - Feature name to check
     * @returns true if upgrade prompt should be shown
     */
    const shouldShowUpgradePrompt = (feature?: string): boolean => {
        return features.showUpgradePrompts;
    };

    /**
     * Check if user has access to a specific feature
     * @param featureName - Name of the feature to check
     * @returns true if user has access
     */
    const hasFeatureAccess = (featureName: keyof ExtendedFeatureLimits): boolean => {
        const featureValue = features[featureName];

        if (typeof featureValue === 'boolean') {
            return featureValue;
        }

        if (typeof featureValue === 'number') {
            return featureValue > 0;
        }

        if (featureValue === 'unlimited') {
            return true;
        }

        return !!featureValue;
    };

    /**
     * Get blur intensity for featured profiles
     * @returns Blur amount in pixels (0-10)
     */
    const getFeaturedProfileBlur = (): number => {
        const accessLevel = features.featuredProfileAccess;

        // Ultra Pro: No blur
        if (accessLevel === 100) return 0;

        // Free users: Maximum blur
        if (accessLevel === 0) return 10;

        // Calculate blur based on access level
        // 0% access = 10px blur, 100% access = 0px blur
        return Math.round((100 - accessLevel) / 10);
    };

    /**
     * Check if user is on a premium plan
     * @returns true if user has any paid plan
     */
    const isPremiumUser = (): boolean => {
        return features.price > 0;
    };

    /**
     * Check if user is on Ultra Pro plan
     * @returns true if user has Ultra Pro plan
     */
    const isUltraProUser = (): boolean => {
        return user?.plan?.includes('Ultra Pro') || false;
    };

    /**
     * Get upgrade suggestion based on current plan
     * @returns Suggested upgrade package
     */
    const getUpgradeSuggestion = (): string => {
        const plan = user?.plan || 'Free';

        if (plan.includes('Free')) {
            return 'Upgrade to Pro Lite to unlock more features';
        }

        if (plan.includes('Pro Lite')) {
            return 'Upgrade to Pro for advanced features';
        }

        if (plan.includes('Pro') && !plan.includes('Ultra')) {
            return 'Upgrade to Ultra Pro for unlimited access';
        }

        return 'You have full access to all features';
    };

    /**
     * Get profile visibility class name
     * @returns CSS class name for visibility level
     */
    const getVisibilityClassName = (): string => {
        const visibility = features.profileVisibility;

        if (visibility === 100) return 'full-visibility';
        if (visibility >= 70) return 'high-visibility';
        if (visibility >= 40) return 'medium-visibility';
        if (visibility >= 20) return 'low-visibility';
        return 'minimal-visibility';
    };

    /**
     * Check if user can perform an action based on usage
     * @param action - Action type
     * @param currentUsage - Current usage count
     * @returns Object with allowed status and reason
     */
    const canPerformAction = (
        action: 'message' | 'superInterest' | 'caseInterest',
        currentUsage: number
    ): { allowed: boolean; reason?: string; limit?: number } => {
        let limit: number;

        switch (action) {
            case 'message':
                limit = features.messagesPerDay || 0;
                break;
            case 'superInterest':
                limit = features.superInterestsPerMonth || 0;
                break;
            case 'caseInterest':
                limit = features.caseInterestsPerMonth || 0;
                break;
            default:
                return { allowed: false, reason: 'Unknown action' };
        }

        // Unlimited access
        if (limit === 999) {
            return { allowed: true, limit: 999 };
        }

        // Check if limit reached
        if (currentUsage >= limit) {
            return {
                allowed: false,
                reason: `You've reached your ${action} limit of ${limit}`,
                limit
            };
        }

        return { allowed: true, limit };
    };

    /**
     * Get remaining usage for an action
     * @param action - Action type
     * @param currentUsage - Current usage count
     * @returns Remaining usage count
     */
    const getRemainingUsage = (
        action: 'message' | 'superInterest' | 'caseInterest',
        currentUsage: number
    ): number | 'unlimited' => {
        const result = canPerformAction(action, currentUsage);

        if (result.limit === 999) {
            return 'unlimited';
        }

        return Math.max(0, (result.limit || 0) - currentUsage);
    };

    return {
        // Feature access
        features,
        hasFeatureAccess,

        // Profile visibility
        canViewProfile,
        shouldShowStarMarks,
        getStarMarkPercentage,
        getFeaturedProfileBlur,
        getVisibilityClassName,

        // Upgrade prompts
        shouldShowUpgradePrompt,
        getUpgradeSuggestion,

        // User status
        isPremiumUser,
        isUltraProUser,

        // Action limits
        canPerformAction,
        getRemainingUsage,

        // Package info
        packageName: user?.plan || 'Free',
        price: features.price,
        coins: features.monthlyCoins
    };
};

export default usePackageRestrictions;
