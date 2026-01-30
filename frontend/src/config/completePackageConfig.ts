import type { PackageType, TierType, FeatureLimits } from '../types/packageFeatures';

/**
 * Extended Feature Limits with additional package-specific features
 * See: .gemini/complete_package_feature_matrix.md for full documentation
 */
export interface ExtendedFeatureLimits extends FeatureLimits {
    // Visibility & Restrictions
    profileVisibility: number; // 0-100%
    starMarkPercentage: number; // 0-100%
    featuredProfileAccess: number; // 0-100%
    showUpgradePrompts: boolean;

    // Profile Ranking & Position
    profileRankingPosition: number; // Top X profiles (5-7, 12, 25, 50, 100, 150, or 999 for no guarantee)

    // AI Features
    aiFeatureLimit?: number; // requests per month

    // API Features
    apiRateLimit?: number; // requests per hour

    // Pricing
    price: number;
}

/**
 * Helper function to get features from user plan string
 * Example: "Pro - Gold" => Pro package, Gold tier
 */
export const getFeaturesFromPlan = (plan?: string): ExtendedFeatureLimits => {
    if (!plan) {
        // Default Free Silver
        return {
            price: 0,
            monthlyCoins: 10,
            coinMultiplier: 1,
            messagesPerDay: 5,
            superInterestsPerMonth: 0,
            caseInterestsPerMonth: 3,
            profileVisibility: 10,
            starMarkPercentage: 90,
            featuredProfileAccess: 0,
            showUpgradePrompts: true,
            profileRankingPosition: 999,
            searchRanking: 'low',
            featuredListing: false,
            spotlightAccess: false,
            analyticsAccess: false,
            visitorAnalytics: false,
            advancedReports: false,
            aiAssistant: false,
            customBranding: false,
            whiteLabel: false,
            apiAccess: false,
            supportLevel: 'email',
            responseTime: '72h',
            dedicatedManager: false,
            documentStorage: 10,
            blogPostsPerMonth: 1,
            templateAccess: 0
        };
    }

    // Parse plan string
    const parts = plan.split(' - ');
    const rawPkg = (parts[0] || "").trim().toLowerCase();
    const tierName = parts[1]?.trim() || 'Silver';

    // Ultra Pro packages
    if (rawPkg.includes('ultra')) {
        const baseFeatures: Partial<ExtendedFeatureLimits> = {
            monthlyCoins: 'unlimited',
            messagesPerDay: 999,
            superInterestsPerMonth: 999,
            caseInterestsPerMonth: 999,
            profileVisibility: 100,
            starMarkPercentage: 0,
            featuredProfileAccess: 100,
            showUpgradePrompts: false,
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            aiAssistant: true,
            aiFeatureLimit: 999,
            customBranding: true,
            whiteLabel: true,
            apiAccess: true,
            apiRateLimit: 999,
            responseTime: 'instant',
            dedicatedManager: true,
            documentStorage: 10000,
            blogPostsPerMonth: 999,
            templateAccess: 999
        };

        if (tierName === 'Platinum') {
            return { ...baseFeatures, price: 50000, coinMultiplier: 15, profileRankingPosition: 7, supportLevel: 'vip-concierge', documentStorage: 50000 } as ExtendedFeatureLimits;
        } else if (tierName === 'Gold') {
            return { ...baseFeatures, price: 35000, coinMultiplier: 10, profileRankingPosition: 12, supportLevel: 'call', documentStorage: 20000 } as ExtendedFeatureLimits;
        } else {
            return { ...baseFeatures, price: 25000, coinMultiplier: 5, profileRankingPosition: 25, supportLevel: 'chat' } as ExtendedFeatureLimits;
        }
    }

    // Pro packages (specifically checking for 'pro' but NOT 'pro lite' or 'ultra pro' if those were already handled)
    if (rawPkg === 'pro' || (rawPkg.includes('pro') && !rawPkg.includes('lite') && !rawPkg.includes('ultra'))) {
        const baseFeatures: Partial<ExtendedFeatureLimits> = {
            searchRanking: 'premium',
            featuredListing: true,
            spotlightAccess: true,
            analyticsAccess: true,
            visitorAnalytics: true,
            advancedReports: true,
            aiAssistant: true,
            customBranding: true,
            whiteLabel: true,
            apiAccess: true,
            showUpgradePrompts: true
        };

        if (tierName === 'Platinum') {
            return {
                ...baseFeatures,
                price: 15000,
                monthlyCoins: 1500,
                coinMultiplier: 3,
                messagesPerDay: 999,
                superInterestsPerMonth: 200,
                caseInterestsPerMonth: 500,
                profileVisibility: 100,
                starMarkPercentage: 0,
                featuredProfileAccess: 100,
                profileRankingPosition: 50,
                aiFeatureLimit: 1500,
                apiRateLimit: 5000,
                supportLevel: 'call',
                responseTime: '1h',
                dedicatedManager: true,
                documentStorage: 2000,
                blogPostsPerMonth: 200,
                templateAccess: 999
            } as ExtendedFeatureLimits;
        } else if (tierName === 'Gold') {
            return {
                ...baseFeatures,
                price: 10000,
                monthlyCoins: 1000,
                coinMultiplier: 2.5,
                messagesPerDay: 500,
                superInterestsPerMonth: 100,
                caseInterestsPerMonth: 300,
                profileVisibility: 100,
                starMarkPercentage: 0,
                featuredProfileAccess: 100,
                profileRankingPosition: 100,
                aiFeatureLimit: 1000,
                apiRateLimit: 2000,
                supportLevel: 'chat',
                responseTime: '12h',
                dedicatedManager: true,
                documentStorage: 1000,
                blogPostsPerMonth: 100,
                templateAccess: 999
            } as ExtendedFeatureLimits;
        } else {
            return {
                ...baseFeatures,
                price: 5000,
                monthlyCoins: 500,
                coinMultiplier: 2,
                messagesPerDay: 200,
                superInterestsPerMonth: 50,
                caseInterestsPerMonth: 150,
                profileVisibility: 100,
                starMarkPercentage: 0,
                featuredProfileAccess: 100,
                profileRankingPosition: 150,
                aiFeatureLimit: 500,
                apiRateLimit: 1000,
                supportLevel: 'email',
                responseTime: '24h',
                dedicatedManager: false,
                documentStorage: 500,
                blogPostsPerMonth: 50,
                templateAccess: 999
            } as ExtendedFeatureLimits;
        }
    }

    // Pro Lite packages
    if (rawPkg.includes('lite')) {
        if (tierName === 'Platinum') {
            return {
                price: 1500,
                monthlyCoins: 150,
                coinMultiplier: 1.8,
                messagesPerDay: 100,
                superInterestsPerMonth: 20,
                caseInterestsPerMonth: 80,
                profileVisibility: 100,
                starMarkPercentage: 0,
                featuredProfileAccess: 100,
                showUpgradePrompts: true,
                profileRankingPosition: 999,
                searchRanking: 'high',
                featuredListing: true,
                spotlightAccess: true,
                analyticsAccess: true,
                visitorAnalytics: true,
                advancedReports: true,
                aiAssistant: true,
                aiFeatureLimit: 100,
                customBranding: true,
                whiteLabel: false,
                apiAccess: true,
                apiRateLimit: 100,
                supportLevel: 'chat',
                responseTime: '12h',
                dedicatedManager: false,
                documentStorage: 200,
                blogPostsPerMonth: 20,
                templateAccess: 999
            };
        } else if (tierName === 'Gold') {
            return {
                price: 1000,
                monthlyCoins: 100,
                coinMultiplier: 1.5,
                messagesPerDay: 50,
                superInterestsPerMonth: 10,
                caseInterestsPerMonth: 40,
                profileVisibility: 100,
                starMarkPercentage: 0,
                featuredProfileAccess: 100,
                showUpgradePrompts: true,
                profileRankingPosition: 999,
                searchRanking: 'high',
                featuredListing: true,
                spotlightAccess: false,
                analyticsAccess: true,
                visitorAnalytics: true,
                advancedReports: false,
                aiAssistant: false,
                customBranding: true,
                whiteLabel: false,
                apiAccess: false,
                supportLevel: 'chat',
                responseTime: '24h',
                dedicatedManager: false,
                documentStorage: 100,
                blogPostsPerMonth: 10,
                templateAccess: 15
            };
        } else {
            return {
                price: 500,
                monthlyCoins: 50,
                coinMultiplier: 1.2,
                messagesPerDay: 25,
                superInterestsPerMonth: 5,
                caseInterestsPerMonth: 20,
                profileVisibility: 100,
                starMarkPercentage: 0,
                featuredProfileAccess: 100,
                showUpgradePrompts: true,
                profileRankingPosition: 999,
                searchRanking: 'medium',
                featuredListing: false,
                spotlightAccess: false,
                analyticsAccess: true,
                visitorAnalytics: false,
                advancedReports: false,
                aiAssistant: false,
                customBranding: false,
                whiteLabel: false,
                apiAccess: false,
                supportLevel: 'email',
                responseTime: '48h',
                dedicatedManager: false,
                documentStorage: 50,
                blogPostsPerMonth: 5,
                templateAccess: 5
            };
        }
    }

    // Default to Free Silver
    return getFeaturesFromPlan();
};

/**
 * Get package features by package name and tier
 */
export const getPackageFeatures = (packageName: PackageType, tierName: TierType): ExtendedFeatureLimits => {
    return getFeaturesFromPlan(`${packageName} - ${tierName}`);
};
