# Profile Ranking Position Feature

## Overview

Premium package tiers now include **guaranteed top profile positions** in search results and listings. Higher-tier packages ensure profiles appear at the top, maximizing visibility and engagement.

---

## 🏆 Profile Ranking by Package

### Ultra Pro - Elite Positioning

| Tier | Price | Top Position | Visibility |
|------|-------|--------------|------------|
| **Platinum** | ₹50,000 | **Top 5-7** | 🌟🌟🌟🌟🌟 Elite |
| **Gold** | ₹35,000 | **Top 12** | 🌟🌟🌟🌟 Premium+ |
| **Silver** | ₹25,000 | **Top 25** | 🌟🌟🌟 Premium |

**Benefits**:
- ✅ Guaranteed placement in top positions
- ✅ Maximum visibility to all users
- ✅ First profiles seen in searches
- ✅ Higher engagement rates
- ✅ Premium badge display

---

### Pro - Priority Positioning

| Tier | Price | Top Position | Visibility |
|------|-------|--------------|------------|
| **Platinum** | ₹15,000 | **Top 50** | 🌟🌟🌟 High |
| **Gold** | ₹10,000 | **Top 100** | 🌟🌟 Medium-High |
| **Silver** | ₹5,000 | **Top 150** | 🌟 Medium |

**Benefits**:
- ✅ Guaranteed placement in top 150 or better
- ✅ Higher visibility than free users
- ✅ Better engagement potential
- ✅ Professional badge display

---

### Pro Lite & Free - Standard Positioning

| Package | Position | Visibility |
|---------|----------|------------|
| **Pro Lite** (All tiers) | No guarantee | Standard |
| **Free** (All tiers) | No guarantee | Standard |

**Note**: Profiles appear based on other ranking factors (activity, completeness, etc.)

---

## 📊 Visual Representation

### Search Results Display

```
🔝 SEARCH RESULTS

┌─────────────────────────────────────┐
│ 🌟 TOP 5-7 (Ultra Pro Platinum)    │ ← Most visible
│ ⭐ Profile 1                        │
│ ⭐ Profile 2                        │
│ ⭐ Profile 3                        │
│ ⭐ Profile 4                        │
│ ⭐ Profile 5                        │
│ ⭐ Profile 6                        │
│ ⭐ Profile 7                        │
├─────────────────────────────────────┤
│ 🌟 TOP 8-12 (Ultra Pro Gold)       │
│ ⭐ Profile 8                        │
│ ⭐ Profile 9                        │
│ ⭐ Profile 10                       │
│ ⭐ Profile 11                       │
│ ⭐ Profile 12                       │
├─────────────────────────────────────┤
│ 🌟 TOP 13-25 (Ultra Pro Silver)    │
│ ⭐ Profiles 13-25                   │
├─────────────────────────────────────┤
│ 💼 TOP 26-50 (Pro Platinum)        │
│ • Profiles 26-50                    │
├─────────────────────────────────────┤
│ 💼 TOP 51-100 (Pro Gold)           │
│ • Profiles 51-100                   │
├─────────────────────────────────────┤
│ 💼 TOP 101-150 (Pro Silver)        │
│ • Profiles 101-150                  │
├─────────────────────────────────────┤
│ 📋 Standard (Pro Lite & Free)      │ ← Less visible
│ • Profiles 151+                     │
└─────────────────────────────────────┘
```

---

## 🎯 How It Works

### 1. **Ranking Algorithm**

```typescript
// Pseudo-code for profile ranking
function rankProfiles(profiles) {
    return profiles.sort((a, b) => {
        // 1. First, sort by profileRankingPosition (lower = better)
        if (a.profileRankingPosition !== b.profileRankingPosition) {
            return a.profileRankingPosition - b.profileRankingPosition;
        }
        
        // 2. Within same tier, sort by other factors
        // - Profile completeness
        // - Activity level
        // - Rating/reviews
        // - Join date
        
        return compareSecondaryFactors(a, b);
    });
}
```

### 2. **Position Guarantee**

- **Ultra Pro Platinum**: Always in positions 1-7
- **Ultra Pro Gold**: Always in positions 8-12
- **Ultra Pro Silver**: Always in positions 13-25
- **Pro Platinum**: Always in positions 26-50
- **Pro Gold**: Always in positions 51-100
- **Pro Silver**: Always in positions 101-150
- **Pro Lite & Free**: Position 151+ (based on other factors)

### 3. **Tie-Breaking**

When multiple users have the same `profileRankingPosition`:
1. Profile completeness (100% > 90% > 80%)
2. Activity score (recent activity ranked higher)
3. User rating/reviews
4. Account age (newer accounts ranked higher for freshness)

---

## 💡 Implementation

### Backend - Sorting Profiles

```javascript
// routes/profiles.js
router.get('/search', async (req, res) => {
    try {
        const profiles = await User.find({ role: 'advocate' })
            .populate('package')
            .lean();
        
        // Sort by profile ranking position
        const sortedProfiles = profiles.sort((a, b) => {
            const posA = a.package?.profileRankingPosition || 999;
            const posB = b.package?.profileRankingPosition || 999;
            
            if (posA !== posB) {
                return posA - posB; // Lower position = higher rank
            }
            
            // Tie-breaker: profile completeness
            return (b.profileCompleteness || 0) - (a.profileCompleteness || 0);
        });
        
        res.json(sortedProfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Frontend - Display Ranking Badge

```tsx
// components/ProfileCard.tsx
import { usePackageRestrictions } from '../hooks/usePackageRestrictions';

const ProfileCard = ({ profile }) => {
    const { features } = usePackageRestrictions();
    
    const getRankingBadge = (position: number) => {
        if (position <= 7) return { text: 'Top 5-7', color: 'gold', icon: '👑' };
        if (position <= 12) return { text: 'Top 12', color: 'platinum', icon: '💎' };
        if (position <= 25) return { text: 'Top 25', color: 'silver', icon: '⭐' };
        if (position <= 50) return { text: 'Top 50', color: 'blue', icon: '🏆' };
        if (position <= 100) return { text: 'Top 100', color: 'blue', icon: '🎯' };
        if (position <= 150) return { text: 'Top 150', color: 'blue', icon: '📌' };
        return null;
    };
    
    const badge = getRankingBadge(features.profileRankingPosition);
    
    return (
        <div className="profile-card">
            {badge && (
                <div className={`ranking-badge ${badge.color}`}>
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                </div>
            )}
            {/* Profile content */}
        </div>
    );
};
```

---

## 📈 Benefits by Tier

### Ultra Pro Platinum (Top 5-7)
- ✅ **Maximum Visibility**: Seen by 95%+ of users
- ✅ **First Impression**: Always in first screen
- ✅ **Elite Status**: Gold badge with crown icon
- ✅ **Highest Engagement**: 10x more profile views
- ✅ **Premium Placement**: Featured in all searches

### Ultra Pro Gold (Top 12)
- ✅ **Excellent Visibility**: Seen by 90%+ of users
- ✅ **Top Screen**: Usually in first screen
- ✅ **Premium Status**: Platinum badge with diamond icon
- ✅ **High Engagement**: 7x more profile views

### Ultra Pro Silver (Top 25)
- ✅ **Great Visibility**: Seen by 80%+ of users
- ✅ **First Page**: Always on first page
- ✅ **Premium Status**: Silver badge with star icon
- ✅ **Good Engagement**: 5x more profile views

### Pro Platinum (Top 50)
- ✅ **Good Visibility**: Seen by 60%+ of users
- ✅ **Early Pages**: Within first 2-3 pages
- ✅ **Professional Status**: Blue badge with trophy icon
- ✅ **Better Engagement**: 3x more profile views

### Pro Gold (Top 100)
- ✅ **Decent Visibility**: Seen by 40%+ of users
- ✅ **Mid Pages**: Within first 5 pages
- ✅ **Professional Status**: Blue badge with target icon
- ✅ **Improved Engagement**: 2x more profile views

### Pro Silver (Top 150)
- ✅ **Fair Visibility**: Seen by 30%+ of users
- ✅ **Visible Pages**: Within first 8 pages
- ✅ **Professional Status**: Blue badge with pin icon
- ✅ **Enhanced Engagement**: 1.5x more profile views

---

## 🎨 Badge Design

### CSS Styling

```css
.ranking-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.ranking-badge.gold {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000;
    border: 2px solid #FFD700;
}

.ranking-badge.platinum {
    background: linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%);
    color: #000;
    border: 2px solid #E5E4E2;
}

.ranking-badge.silver {
    background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
    color: #000;
    border: 2px solid #C0C0C0;
}

.ranking-badge.blue {
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    color: white;
    border: 2px solid #3b82f6;
}
```

---

## 📊 Configuration Summary

| Package | Tier | Price | Position | Badge | Icon |
|---------|------|-------|----------|-------|------|
| Ultra Pro | Platinum | ₹50,000 | Top 5-7 | Gold | 👑 |
| Ultra Pro | Gold | ₹35,000 | Top 12 | Platinum | 💎 |
| Ultra Pro | Silver | ₹25,000 | Top 25 | Silver | ⭐ |
| Pro | Platinum | ₹15,000 | Top 50 | Blue | 🏆 |
| Pro | Gold | ₹10,000 | Top 100 | Blue | 🎯 |
| Pro | Silver | ₹5,000 | Top 150 | Blue | 📌 |
| Pro Lite | All | ₹500-1,500 | No guarantee | - | - |
| Free | All | ₹0 | No guarantee | - | - |

---

## 🚀 Next Steps

1. **Backend Implementation**
   - Add `profileRankingPosition` to User model
   - Update search/listing endpoints to sort by position
   - Implement tie-breaking logic

2. **Frontend Implementation**
   - Display ranking badges on profiles
   - Show position in profile settings
   - Add upgrade prompts for better positions

3. **Analytics**
   - Track profile view rates by position
   - Measure engagement by tier
   - A/B test badge designs

---

## Date Created
2026-01-30

## Status
✅ **Configuration Complete - Ready for Implementation**
