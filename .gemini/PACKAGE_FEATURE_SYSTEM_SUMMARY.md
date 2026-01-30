# Package Feature System - Complete Documentation

## Overview

The Package Feature System provides a comprehensive solution for managing feature access based on user subscription packages. It enables fine-grained control over what features users can access based on their package tier.

## Architecture

### Components

1. **Type Definitions** (`types/packageFeatures.ts`)
   - Defines all package and feature types
   - Specifies feature limits structure
   - Type-safe feature checking

2. **Custom Hook** (`hooks/usePackageFeatures.ts`)
   - Manages package status
   - Provides feature checking functions
   - Handles upgrade suggestions

3. **UI Components** (`components/shared/FeatureGate.tsx`)
   - Conditional rendering based on features
   - Upgrade prompts
   - Usage limit displays

## Package Tiers

### Free Package
- **Silver**: Basic access, limited features
- **Gold**: Enhanced access, more features
- **Platinum**: Premium features with analytics

### Pro Lite Package
- **Silver**: Professional features, basic analytics
- **Gold**: Featured listing, visitor analytics
- **Platinum**: Advanced reports, API access

### Pro Package
- **Silver**: Premium features, AI assistant
- **Gold**: Personal agent, dedicated manager
- **Platinum**: Unlimited features, instant support

### Ultra Pro Package
- **Silver/Gold/Platinum**: Unlimited everything, VIP concierge

### Test Package
- **Test Tier**: Testing and verification features

## Feature Limits

### Communication Features
```typescript
messagesPerDay?: number;
superInterestsPerMonth?: number;
caseInterestsPerMonth?: number;
```

### Profile & Visibility
```typescript
searchRanking?: 'low' | 'medium' | 'high' | 'premium';
featuredListing?: boolean;
spotlightAccess?: boolean;
```

### Analytics & Insights
```typescript
analyticsAccess?: boolean;
visitorAnalytics?: boolean;
advancedReports?: boolean;
```

### Support Levels
```typescript
supportLevel?: 'email' | 'chat' | 'call' | 'personal-agent' | 'vip-concierge';
responseTime?: '48h' | '24h' | '12h' | '1h' | 'instant';
```

### Advanced Features
```typescript
aiAssistant?: boolean;
customBranding?: boolean;
apiAccess?: boolean;
whiteLabel?: boolean;
dedicatedManager?: boolean;
```

## Usage Examples

### 1. Basic Feature Check

```typescript
import { usePackageFeatures } from '../hooks/usePackageFeatures';

function MyComponent() {
    const { isFeatureEnabled } = usePackageFeatures();
    
    if (isFeatureEnabled('analyticsAccess')) {
        return <AnalyticsDashboard />;
    }
    
    return <UpgradePrompt />;
}
```

### 2. Usage Limit Check

```typescript
import { usePackageFeatures } from '../hooks/usePackageFeatures';

function MessageButton() {
    const { canPerformAction } = usePackageFeatures();
    const currentMessages = 5; // From your state/API
    
    const check = canPerformAction('messagesPerDay', currentMessages);
    
    if (!check.allowed) {
        return (
            <div>
                <p>{check.reason}</p>
                <UpgradeButton />
            </div>
        );
    }
    
    return <SendMessageButton />;
}
```

### 3. Feature Gate Component

```typescript
import { FeatureGate } from '../components/shared/FeatureGate';

function AdvancedFeature() {
    return (
        <FeatureGate 
            feature="aiAssistant"
            showUpgradePrompt={true}
        >
            <AIAssistantPanel />
        </FeatureGate>
    );
}
```

### 4. Custom Fallback

```typescript
import { FeatureGate } from '../components/shared/FeatureGate';

function ProfileSection() {
    return (
        <FeatureGate 
            feature="customBranding"
            fallback={<DefaultBranding />}
            showUpgradePrompt={false}
        >
            <CustomBrandingEditor />
        </FeatureGate>
    );
}
```

### 5. Usage Limit Display

```typescript
import { FeatureLimitDisplay } from '../components/shared/FeatureGate';

function MessagingPanel() {
    const currentMessages = 15; // From your state
    
    return (
        <div>
            <h3>Daily Messages</h3>
            <FeatureLimitDisplay 
                feature="messagesPerDay"
                currentUsage={currentMessages}
            />
        </div>
    );
}
```

### 6. Get Specific Limit

```typescript
import { usePackageFeatures } from '../hooks/usePackageFeatures';

function DocumentUploader() {
    const { getLimit } = usePackageFeatures();
    const storageLimit = getLimit('documentStorage'); // in MB
    
    return (
        <div>
            <p>Storage: {storageLimit} MB available</p>
            <UploadButton />
        </div>
    );
}
```

### 7. Upgrade Suggestions

```typescript
import { usePackageFeatures } from '../hooks/usePackageFeatures';

function LockedFeature() {
    const { getUpgradeSuggestion } = usePackageFeatures();
    const suggestion = getUpgradeSuggestion('apiAccess');
    
    return (
        <div>
            <Lock />
            <p>{suggestion}</p>
            <UpgradeButton />
        </div>
    );
}
```

## Integration with Existing Code

### Update User Context

Ensure your `AuthContext` provides:
```typescript
interface User {
    plan?: string; // e.g., "Pro Lite - Gold"
    status?: string; // "Active", "Inactive", etc.
    // ... other fields
}
```

### Track Feature Usage

Create a usage tracking system:
```typescript
// services/usageTracker.ts
export const trackUsage = async (
    userId: string,
    feature: string,
    increment: number = 1
) => {
    await axios.post('/api/usage/track', {
        userId,
        feature,
        increment
    });
};

export const getUsage = async (
    userId: string,
    feature: string
): Promise<number> => {
    const response = await axios.get(`/api/usage/${userId}/${feature}`);
    return response.data.usage;
};
```

### Backend API Endpoints

Create these endpoints:
```typescript
// GET /api/usage/:userId/:feature
// Returns current usage count

// POST /api/usage/track
// Increments usage counter

// GET /api/packages/user/:userId
// Returns user's current package details
```

## Error Handling

The hook handles errors gracefully:

```typescript
const { packageStatus, loading, checkFeature } = usePackageFeatures();

if (loading) {
    return <LoadingSpinner />;
}

if (!packageStatus) {
    return <ErrorMessage />;
}

const check = checkFeature('analyticsAccess');
if (!check.allowed) {
    console.log(check.reason); // User-friendly error message
}
```

## TypeScript Benefits

Full type safety:
```typescript
// ✅ Correct
const check = checkFeature('messagesPerDay');

// ❌ TypeScript error - invalid feature name
const check = checkFeature('invalidFeature');
```

## Performance Considerations

1. **Memoization**: The hook uses `useCallback` for stable function references
2. **Lazy Loading**: Package status is only loaded when needed
3. **Caching**: Consider implementing client-side caching for package data

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { usePackageFeatures } from './usePackageFeatures';

test('should check feature access', () => {
    const { result } = renderHook(() => usePackageFeatures());
    
    const check = result.current.checkFeature('analyticsAccess');
    expect(check.allowed).toBe(true);
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { FeatureGate } from './FeatureGate';

test('should show upgrade prompt for locked feature', () => {
    render(
        <FeatureGate feature="aiAssistant">
            <div>Premium Content</div>
        </FeatureGate>
    );
    
    expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
});
```

## Future Enhancements

1. **Real-time Usage Tracking**: WebSocket integration for live usage updates
2. **Usage Analytics**: Dashboard showing feature usage patterns
3. **A/B Testing**: Test different package configurations
4. **Dynamic Pricing**: Adjust limits based on market conditions
5. **Custom Packages**: Allow admins to create custom package tiers
6. **Usage Alerts**: Notify users when approaching limits
7. **Grace Periods**: Allow temporary overages with warnings

## Troubleshooting

### Issue: Features not updating after package change

**Solution**: Ensure user data is refreshed after package upgrade:
```typescript
const { refreshUser } = useAuth();
await upgradePackage(newPackage);
await refreshUser(); // Reload user data
```

### Issue: TypeScript errors with feature names

**Solution**: Import types explicitly:
```typescript
import type { FeatureLimits } from '../types/packageFeatures';

const feature: keyof FeatureLimits = 'messagesPerDay';
```

### Issue: Limits not reflecting correctly

**Solution**: Check that user.plan format matches expected pattern:
```typescript
// Expected format: "PackageName - TierName"
// Examples:
// "Free - Silver"
// "Pro Lite - Gold"
// "Ultra Pro - Platinum"
```

## Support

For issues or questions:
1. Check this documentation
2. Review example implementations
3. Check TypeScript types for available features
4. Contact development team

## Changelog

### Version 1.0.0 (2026-01-30)
- Initial release
- Complete package feature system
- TypeScript support
- React hooks and components
- Comprehensive documentation
- Fixed undefined limit error on line 97
