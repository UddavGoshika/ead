# Complete Package Feature Integration Plan

## Overview
This document outlines the complete integration of the premium package feature system across frontend components, backend enforcement, and payment/upgrade flows.

---

## 🎯 Integration Checklist

### Phase 1: Frontend Component Integration
- [ ] Apply restrictions to Advocate Profile viewing
- [ ] Apply restrictions to Featured Profiles
- [ ] Apply restrictions to Dashboard features
- [ ] Apply restrictions to Messaging
- [ ] Apply restrictions to Analytics
- [ ] Apply restrictions to AI Assistant
- [ ] Add upgrade prompts throughout app

### Phase 2: Backend Enforcement
- [ ] Add package features to User model
- [ ] Create middleware for feature checking
- [ ] Enforce message limits
- [ ] Enforce interest limits
- [ ] Enforce profile visibility
- [ ] Enforce API rate limits
- [ ] Add usage tracking

### Phase 3: Payment & Upgrade Flows
- [ ] Create payment integration
- [ ] Update user plan on successful payment
- [ ] Send confirmation emails
- [ ] Update UI immediately after upgrade
- [ ] Handle plan expiration
- [ ] Handle downgrades

---

## 📋 Detailed Implementation Steps

### PHASE 1: Frontend Component Integration

#### Step 1.1: Create Shared Components

**File: `frontend/src/components/shared/UpgradePrompt.tsx`**
- Reusable upgrade prompt component
- Shows feature name and upgrade benefits
- Links to pricing page

**File: `frontend/src/components/shared/LockedFeature.tsx`**
- Shows locked feature with icon
- Displays upgrade message
- Shows current plan and suggested upgrade

**File: `frontend/src/components/shared/UsageIndicator.tsx`**
- Shows current usage vs limit
- Progress bar visualization
- Warning when approaching limit

#### Step 1.2: Integrate into Advocate Profiles

**File: `frontend/src/components/AdvocateProfileCard.tsx`**
- Add star mark overlay based on package
- Apply visibility opacity
- Show upgrade prompt for restricted content

**File: `frontend/src/pages/AdvocateProfile.tsx`**
- Check profile visibility percentage
- Apply blur to restricted sections
- Show "Upgrade to view" buttons

#### Step 1.3: Integrate into Featured Profiles

**File: `frontend/src/components/FeaturedProfileCard.tsx`**
- Check featured profile access
- Apply blur effect based on package
- Lock completely for free users

#### Step 1.4: Integrate into Dashboard

**File: `frontend/src/pages/dashboard/advocate/AdvocateDashboard.tsx`**
- Gate analytics section
- Gate AI assistant
- Gate custom branding
- Gate advanced reports

**File: `frontend/src/pages/dashboard/client/ClientDashboard.tsx`**
- Same restrictions as advocate dashboard
- Package-specific features

#### Step 1.5: Integrate into Messaging

**File: `frontend/src/components/messaging/MessageComposer.tsx`**
- Check message limit before sending
- Show remaining messages
- Block sending when limit reached
- Upgrade prompt when blocked

#### Step 1.6: Integrate into Search/Discovery

**File: `frontend/src/pages/Search.tsx`**
- Sort profiles by ranking position
- Show ranking badges
- Apply visibility restrictions

---

### PHASE 2: Backend Enforcement

#### Step 2.1: Update User Model

**File: `server/models/User.js`**
```javascript
// Add package-related fields
packageName: {
    type: String,
    enum: ['Free', 'Pro Lite', 'Pro', 'Ultra Pro'],
    default: 'Free'
},
packageTier: {
    type: String,
    enum: ['Silver', 'Gold', 'Platinum'],
    default: 'Silver'
},
packageExpiry: Date,
packageFeatures: {
    type: Object,
    default: {}
},
usageStats: {
    messagesToday: { type: Number, default: 0 },
    superInterestsThisMonth: { type: Number, default: 0 },
    caseInterestsThisMonth: { type: Number, default: 0 },
    lastMessageDate: Date,
    lastResetDate: Date
}
```

#### Step 2.2: Create Feature Check Middleware

**File: `server/middleware/checkFeatureAccess.js`**
```javascript
const checkFeatureAccess = (featureName) => {
    return async (req, res, next) => {
        const user = req.user;
        const features = getPackageFeatures(user.packageName, user.packageTier);
        
        if (!features[featureName]) {
            return res.status(403).json({
                error: 'Feature not available in your plan',
                upgrade: true,
                currentPlan: `${user.packageName} - ${user.packageTier}`
            });
        }
        
        next();
    };
};
```

#### Step 2.3: Enforce Message Limits

**File: `server/routes/messages.js`**
```javascript
router.post('/send', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    const features = getPackageFeatures(user.packageName, user.packageTier);
    
    // Check if new day, reset counter
    const today = new Date().toDateString();
    if (user.usageStats.lastMessageDate?.toDateString() !== today) {
        user.usageStats.messagesToday = 0;
        user.usageStats.lastMessageDate = new Date();
    }
    
    // Check limit
    if (user.usageStats.messagesToday >= features.messagesPerDay) {
        return res.status(429).json({
            error: 'Daily message limit reached',
            limit: features.messagesPerDay,
            upgrade: true
        });
    }
    
    // Send message
    // ... message sending logic
    
    // Increment counter
    user.usageStats.messagesToday += 1;
    await user.save();
    
    res.json({ success: true });
});
```

#### Step 2.4: Enforce Profile Visibility

**File: `server/routes/profiles.js`**
```javascript
router.get('/advocate/:id', authenticateToken, async (req, res) => {
    const viewer = await User.findById(req.user.id);
    const features = getPackageFeatures(viewer.packageName, viewer.packageTier);
    
    const advocate = await User.findById(req.params.id);
    
    // Apply visibility restrictions
    const visibleProfile = applyVisibilityRestrictions(
        advocate,
        features.profileVisibility,
        features.starMarkPercentage
    );
    
    res.json(visibleProfile);
});
```

#### Step 2.5: Profile Ranking in Search

**File: `server/routes/search.js`**
```javascript
router.get('/advocates', async (req, res) => {
    const advocates = await User.find({ role: 'advocate' })
        .populate('packageName packageTier');
    
    // Sort by profile ranking position
    const sorted = advocates.sort((a, b) => {
        const featuresA = getPackageFeatures(a.packageName, a.packageTier);
        const featuresB = getPackageFeatures(b.packageName, b.packageTier);
        
        return featuresA.profileRankingPosition - featuresB.profileRankingPosition;
    });
    
    res.json(sorted);
});
```

---

### PHASE 3: Payment & Upgrade Flows

#### Step 3.1: Payment Integration

**File: `server/routes/payment.js`**
```javascript
router.post('/create-order', authenticateToken, async (req, res) => {
    const { packageName, tierName } = req.body;
    const features = getPackageFeatures(packageName, tierName);
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
        amount: features.price * 100, // in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
            userId: req.user.id,
            packageName,
            tierName
        }
    });
    
    res.json(order);
});

router.post('/verify-payment', authenticateToken, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (isValid) {
        // Update user package
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const { packageName, tierName } = order.notes;
        
        await User.findByIdAndUpdate(req.user.id, {
            packageName,
            packageTier: tierName,
            packageExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            plan: `${packageName} - ${tierName}`
        });
        
        // Send confirmation email
        await sendUpgradeConfirmationEmail(req.user.email, packageName, tierName);
        
        res.json({ success: true, upgraded: true });
    } else {
        res.status(400).json({ error: 'Invalid payment signature' });
    }
});
```

#### Step 3.2: Upgrade Flow Component

**File: `frontend/src/components/payment/UpgradeFlow.tsx`**
```tsx
const UpgradeFlow = ({ targetPackage, targetTier }) => {
    const [loading, setLoading] = useState(false);
    
    const handleUpgrade = async () => {
        setLoading(true);
        
        // Create order
        const order = await axios.post('/api/payment/create-order', {
            packageName: targetPackage,
            tierName: targetTier
        });
        
        // Open Razorpay
        const options = {
            key: process.env.RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'eAdvocate Premium',
            description: `${targetPackage} - ${targetTier}`,
            order_id: order.id,
            handler: async (response) => {
                // Verify payment
                const result = await axios.post('/api/payment/verify-payment', response);
                
                if (result.data.success) {
                    // Refresh user data
                    await refreshUserData();
                    
                    // Show success message
                    toast.success('Upgraded successfully!');
                    
                    // Redirect to dashboard
                    navigate('/dashboard');
                }
            }
        };
        
        const razorpay = new Razorpay(options);
        razorpay.open();
        
        setLoading(false);
    };
    
    return (
        <button onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Processing...' : 'Upgrade Now'}
        </button>
    );
};
```

#### Step 3.3: Plan Expiration Handler

**File: `server/jobs/checkExpiredPlans.js`**
```javascript
// Run daily
cron.schedule('0 0 * * *', async () => {
    const expiredUsers = await User.find({
        packageExpiry: { $lt: new Date() },
        packageName: { $ne: 'Free' }
    });
    
    for (const user of expiredUsers) {
        // Downgrade to Free
        user.packageName = 'Free';
        user.packageTier = 'Silver';
        user.plan = 'Free - Silver';
        user.packageExpiry = null;
        
        await user.save();
        
        // Send expiration email
        await sendPlanExpirationEmail(user.email);
    }
});
```

---

## 📁 File Structure

```
frontend/src/
├── components/
│   ├── shared/
│   │   ├── UpgradePrompt.tsx          ✅ NEW
│   │   ├── LockedFeature.tsx          ✅ NEW
│   │   ├── UsageIndicator.tsx         ✅ NEW
│   │   └── RankingBadge.tsx           ✅ NEW
│   ├── payment/
│   │   ├── UpgradeFlow.tsx            ✅ NEW
│   │   └── PricingCard.tsx            ✅ NEW
│   └── profiles/
│       ├── AdvocateProfileCard.tsx    🔄 UPDATE
│       └── FeaturedProfileCard.tsx    🔄 UPDATE
├── hooks/
│   ├── usePackageRestrictions.ts      ✅ CREATED
│   └── usePayment.ts                  ✅ NEW
└── config/
    └── completePackageConfig.ts       ✅ CREATED

server/
├── models/
│   └── User.js                        🔄 UPDATE
├── middleware/
│   ├── checkFeatureAccess.js          ✅ NEW
│   └── checkUsageLimits.js            ✅ NEW
├── routes/
│   ├── payment.js                     ✅ NEW
│   ├── messages.js                    🔄 UPDATE
│   ├── profiles.js                    🔄 UPDATE
│   └── search.js                      🔄 UPDATE
├── jobs/
│   └── checkExpiredPlans.js           ✅ NEW
└── utils/
    ├── packageFeatures.js             ✅ NEW
    └── applyVisibilityRestrictions.js ✅ NEW
```

---

## 🚀 Implementation Order

### Week 1: Foundation
1. ✅ Create shared components (UpgradePrompt, LockedFeature, etc.)
2. ✅ Update User model with package fields
3. ✅ Create feature check middleware

### Week 2: Frontend Integration
4. ✅ Integrate into Advocate Profiles
5. ✅ Integrate into Featured Profiles
6. ✅ Integrate into Dashboard
7. ✅ Integrate into Messaging

### Week 3: Backend Enforcement
8. ✅ Enforce message limits
9. ✅ Enforce interest limits
10. ✅ Implement profile visibility restrictions
11. ✅ Implement profile ranking in search

### Week 4: Payment & Testing
12. ✅ Integrate Razorpay payment
13. ✅ Create upgrade flow
14. ✅ Implement plan expiration
15. ✅ End-to-end testing

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Free user sees restricted content
- [ ] Pro user sees more content
- [ ] Ultra Pro user sees everything
- [ ] Upgrade prompts appear correctly
- [ ] Usage indicators work
- [ ] Ranking badges display

### Backend Tests
- [ ] Message limits enforced
- [ ] Interest limits enforced
- [ ] Profile visibility applied
- [ ] API rate limits work
- [ ] Payment verification works
- [ ] Plan upgrades correctly

### Integration Tests
- [ ] Complete upgrade flow
- [ ] Plan expiration handling
- [ ] Feature unlocking after upgrade
- [ ] Downgrade handling

---

## Date Created
2026-01-30

## Status
📋 **Plan Complete - Ready for Implementation**
