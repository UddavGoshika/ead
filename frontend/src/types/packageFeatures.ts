/**
 * Package Feature Types
 * Defines the structure for package-based feature access control
 */

export type PackageType = 'Free' | 'Pro Lite' | 'Pro' | 'Ultra Pro' | 'Test Package';
export type TierType = 'Silver' | 'Gold' | 'Platinum' | 'Test Tier';

/**
 * Feature limits for different package tiers
 */
export interface FeatureLimits {
    // Messaging & Communication
    messagesPerDay?: number;
    superInterestsPerMonth?: number;
    caseInterestsPerMonth?: number;

    // Profile & Visibility
    profileViews?: number;
    searchRanking?: 'low' | 'medium' | 'high' | 'premium';
    featuredListing?: boolean;
    spotlightAccess?: boolean;

    // Analytics & Insights
    analyticsAccess?: boolean;
    visitorAnalytics?: boolean;
    advancedReports?: boolean;

    // Support & Services
    supportLevel?: 'email' | 'chat' | 'call' | 'personal-agent' | 'vip-concierge';
    responseTime?: '72h' | '48h' | '24h' | '12h' | '1h' | 'instant';

    // Content & Resources
    blogPostsPerMonth?: number;
    documentStorage?: number; // in MB
    templateAccess?: number;

    // Advanced Features
    aiAssistant?: boolean;
    customBranding?: boolean;
    apiAccess?: boolean;
    whiteLabel?: boolean;
    dedicatedManager?: boolean;

    // Coins & Credits
    monthlyCoins?: number | 'unlimited';
    coinMultiplier?: number;
}

/**
 * Complete package feature configuration
 */
export interface PackageFeatures {
    packageName: PackageType;
    tier: TierType;
    price: number;
    limits: FeatureLimits;
    features: string[];
    active: boolean;
}

/**
 * User's current package status
 */
export interface UserPackageStatus {
    currentPackage: PackageType;
    currentTier: TierType;
    expiryDate?: Date;
    isActive: boolean;
    limits: FeatureLimits;
}

/**
 * Feature gate check result
 */
export interface FeatureCheckResult {
    allowed: boolean;
    reason?: string;
    currentUsage?: number;
    limit?: number;
    upgradeRequired?: boolean;
}
