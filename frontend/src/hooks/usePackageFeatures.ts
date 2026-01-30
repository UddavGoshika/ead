import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type {
    PackageType,
    TierType,
    FeatureLimits,
    UserPackageStatus,
    FeatureCheckResult
} from '../types/packageFeatures';

/**
 * Default feature limits for each package tier
 */
const DEFAULT_LIMITS: Record<PackageType, Record<TierType, FeatureLimits>> = {
    'Free': {
        'Silver': {
            messagesPerDay: 5,
            superInterestsPerMonth: 0,
            caseInterestsPerMonth: 3,
            searchRanking: 'low',
            featuredListing: false,
            spotlightAccess: false,
            analyticsAccess: false,
            visitorAnalytics: false,
            supportLevel: 'email',
            responseTime: '48h',
            blogPostsPerMonth: 1,
            documentStorage: 10,
            templateAccess: 0,
            monthlyCoins: 10,
            coinMultiplier: 1
        },
        'Gold': {
            messagesPerDay: 10,
            superInterestsPerMonth: 0,
            caseInterestsPerMonth: 5,
            searchRanking: 'medium',
            featuredListing: false,
            spotlightAccess: false,
            analyticsAccess: false,
            visitorAnalytics: false,
            supportLevel: 'chat',
            responseTime: '24h',
            blogPostsPerMonth: 2,
            documentStorage: 20,
            templateAccess: 3,
            monthlyCoins: 20,
            coinMultiplier: 1
        },
        'Platinum': {
            messagesPerDay: 15,
            superInterestsPerMonth: 1,
            caseInterestsPerMonth: 10,
            searchRanking: 'medium',
            featuredListing: false,
            spotlightAccess: false,
            analyticsAccess: true,
            visitorAnalytics: false,
            supportLevel: 'chat',
            responseTime: '24h',
            blogPostsPerMonth: 3,
            documentStorage: 30,
            templateAccess: 5,
            monthlyCoins: 30,
            coinMultiplier: 1
        },
        'Test Tier': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        }
    },
    'Pro Lite': {
        'Silver': {
            messagesPerDay: 25,
            superInterestsPerMonth: 5,
            caseInterestsPerMonth: 20,
            searchRanking: 'medium',
            featuredListing: false,
            spotlightAccess: false,
            analyticsAccess: true,
            visitorAnalytics: false,
            supportLevel: 'email',
            responseTime: '24h',
            blogPostsPerMonth: 5,
            documentStorage: 50,
            templateAccess: 5,
            aiAssistant: false,
            monthlyCoins: 50,
            coinMultiplier: 1.2
        },
        'Gold': {
            messagesPerDay: 50,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 40,
            searchRanking: 'high',
            featuredListing: true,
            spotlightAccess: false,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 15,
            aiAssistant: false,
            customBranding: true,
            monthlyCoins: 100,
            coinMultiplier: 1.5
        },
        'Platinum': {
            messagesPerDay: 100,
            superInterestsPerMonth: 20,
            caseInterestsPerMonth: 80,
            searchRanking: 'high',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'call',
            responseTime: '12h',
            blogPostsPerMonth: 20,
            documentStorage: 200,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            monthlyCoins: 150,
            coinMultiplier: 1.8
        },
        'Test Tier': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        }
    },
    'Pro': {
        'Silver': {
            messagesPerDay: 200,
            superInterestsPerMonth: 50,
            caseInterestsPerMonth: 150,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'call',
            responseTime: '1h',
            blogPostsPerMonth: 50,
            documentStorage: 500,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            whiteLabel: true,
            monthlyCoins: 500,
            coinMultiplier: 2
        },
        'Gold': {
            messagesPerDay: 500,
            superInterestsPerMonth: 100,
            caseInterestsPerMonth: 300,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'personal-agent',
            responseTime: '1h',
            blogPostsPerMonth: 100,
            documentStorage: 1000,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            whiteLabel: true,
            dedicatedManager: true,
            monthlyCoins: 1000,
            coinMultiplier: 2.5
        },
        'Platinum': {
            messagesPerDay: 999,
            superInterestsPerMonth: 200,
            caseInterestsPerMonth: 500,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'personal-agent',
            responseTime: 'instant',
            blogPostsPerMonth: 200,
            documentStorage: 2000,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            whiteLabel: true,
            dedicatedManager: true,
            monthlyCoins: 1500,
            coinMultiplier: 3
        },
        'Test Tier': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        }
    },
    'Ultra Pro': {
        'Silver': {
            messagesPerDay: 999,
            superInterestsPerMonth: 999,
            caseInterestsPerMonth: 999,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'vip-concierge',
            responseTime: 'instant',
            blogPostsPerMonth: 999,
            documentStorage: 10000,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            whiteLabel: true,
            dedicatedManager: true,
            monthlyCoins: 'unlimited',
            coinMultiplier: 5
        },
        'Gold': {
            messagesPerDay: 999,
            superInterestsPerMonth: 999,
            caseInterestsPerMonth: 999,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'vip-concierge',
            responseTime: 'instant',
            blogPostsPerMonth: 999,
            documentStorage: 20000,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            whiteLabel: true,
            dedicatedManager: true,
            monthlyCoins: 'unlimited',
            coinMultiplier: 10
        },
        'Platinum': {
            messagesPerDay: 999,
            superInterestsPerMonth: 999,
            caseInterestsPerMonth: 999,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            supportLevel: 'vip-concierge',
            responseTime: 'instant',
            blogPostsPerMonth: 999,
            documentStorage: 50000,
            templateAccess: 999,
            aiAssistant: true,
            customBranding: true,
            apiAccess: true,
            whiteLabel: true,
            dedicatedManager: true,
            monthlyCoins: 'unlimited',
            coinMultiplier: 15
        },
        'Test Tier': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        }
    },
    'Test Package': {
        'Silver': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        },
        'Gold': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        },
        'Platinum': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        },
        'Test Tier': {
            messagesPerDay: 100,
            superInterestsPerMonth: 10,
            caseInterestsPerMonth: 50,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            supportLevel: 'chat',
            responseTime: '12h',
            blogPostsPerMonth: 10,
            documentStorage: 100,
            templateAccess: 20,
            monthlyCoins: 100,
            coinMultiplier: 2
        }
    }
};

/**
 * Custom hook for managing package-based feature access
 */
export const usePackageFeatures = () => {
    const { user } = useAuth();
    const [packageStatus, setPackageStatus] = useState<UserPackageStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Parse user's package and tier
            const packageName = (user.plan || 'Free') as PackageType;
            const tier = extractTierFromPlan(user.plan) as TierType;

            // Get limits for this package/tier combination
            const limits = DEFAULT_LIMITS[packageName]?.[tier] || DEFAULT_LIMITS['Free']['Silver'];

            setPackageStatus({
                currentPackage: packageName,
                currentTier: tier,
                isActive: user.status === 'Active',
                limits
            });
        } else {
            // Default to Free Silver for non-logged-in users
            setPackageStatus({
                currentPackage: 'Free',
                currentTier: 'Silver',
                isActive: false,
                limits: DEFAULT_LIMITS['Free']['Silver']
            });
        }
        setLoading(false);
    }, [user]);

    /**
     * Extract tier from plan string
     * Examples: "Pro Lite - Gold" -> "Gold", "Free" -> "Silver"
     */
    const extractTierFromPlan = (plan?: string): TierType => {
        if (!plan) return 'Silver';

        const tierMatch = plan.match(/(Silver|Gold|Platinum|Test Tier)/i);
        if (tierMatch) {
            return tierMatch[1] as TierType;
        }

        // Default tier based on package
        if (plan.includes('Ultra')) return 'Platinum';
        if (plan.includes('Pro')) return 'Gold';
        return 'Silver';
    };

    /**
     * Check if a specific feature is allowed
     */
    const checkFeature = useCallback((featureName: keyof FeatureLimits): FeatureCheckResult => {
        if (!packageStatus) {
            return {
                allowed: false,
                reason: 'Package status not loaded',
                upgradeRequired: true
            };
        }

        const limit = packageStatus.limits[featureName];

        // Boolean features
        if (typeof limit === 'boolean') {
            return {
                allowed: limit,
                reason: limit ? undefined : `${featureName} is not available in your current package`,
                upgradeRequired: !limit
            };
        }

        // Unlimited features
        if (limit === 'unlimited' || limit === 999) {
            return {
                allowed: true,
                limit: limit === 'unlimited' ? undefined : 999
            };
        }

        // Numeric limits - Fixed: Added undefined check
        if (typeof limit === 'number') {
            return {
                allowed: true,
                limit: limit,
                currentUsage: 0 // This would come from actual usage tracking
            };
        }

        // String-based features (like support level, response time)
        if (typeof limit === 'string') {
            return {
                allowed: true,
                reason: `Current level: ${limit}`
            };
        }

        // Feature not defined - Fixed: Handle undefined case
        return {
            allowed: false,
            reason: `Feature ${featureName} is not available`,
            upgradeRequired: true
        };
    }, [packageStatus]);

    /**
     * Check if user can perform an action based on usage limits
     */
    const canPerformAction = useCallback((
        featureName: keyof FeatureLimits,
        currentUsage: number
    ): FeatureCheckResult => {
        const featureCheck = checkFeature(featureName);

        if (!featureCheck.allowed) {
            return featureCheck;
        }

        const limit = featureCheck.limit;

        // Fixed: Check for undefined or 999 (unlimited represented as number)
        if (limit === undefined || limit === 999) {
            return {
                allowed: true,
                currentUsage,
                limit: limit
            };
        }

        // Check if usage exceeds limit
        if (currentUsage >= limit) {
            return {
                allowed: false,
                reason: `You've reached your limit of ${limit} for ${featureName}`,
                currentUsage,
                limit,
                upgradeRequired: true
            };
        }

        return {
            allowed: true,
            currentUsage,
            limit
        };
    }, [checkFeature]);

    /**
     * Get upgrade suggestions for a feature
     */
    const getUpgradeSuggestion = useCallback((featureName: keyof FeatureLimits): string => {
        if (!packageStatus) return 'Please login to access premium features';

        const currentPackage = packageStatus.currentPackage;
        const currentTier = packageStatus.currentTier;

        // Suggest next tier or package
        if (currentPackage === 'Free') {
            return 'Upgrade to Pro Lite to unlock this feature';
        }
        if (currentPackage === 'Pro Lite' && currentTier === 'Silver') {
            return 'Upgrade to Gold tier for enhanced limits';
        }
        if (currentPackage === 'Pro Lite') {
            return 'Upgrade to Pro package for advanced features';
        }
        if (currentPackage === 'Pro') {
            return 'Upgrade to Ultra Pro for unlimited access';
        }

        return 'Contact support for custom enterprise solutions';
    }, [packageStatus]);

    return {
        packageStatus,
        loading,
        checkFeature,
        canPerformAction,
        getUpgradeSuggestion,
        isFeatureEnabled: (feature: keyof FeatureLimits) => checkFeature(feature).allowed,
        getLimit: (feature: keyof FeatureLimits) => packageStatus?.limits[feature]
    };
};
