# Activity Tab & Messaging System - Complete Overhaul

## Overview
Complete redesign of the Activity tab and messaging integration to ensure 100% state synchronization, no duplicates, and dynamic action buttons based on relationship states.

## Phase 1: Message Integration (PRIORITY)

### 1.1 Update AdvocateCard Message Sending
- When user sends message from profile card, create conversation record
- Store message in backend via interactionService
- Update local state to reflect message sent

### 1.2 Sync with Chat/Messages Tab
- Ensure sent messages appear in "Messages Sent" section
- Update conversation list in real-time
- Show message preview and timestamp

## Phase 2: Activity Tab Redesign

### 2.1 Current Structure (Keep)
- 7 Grid cards at top showing counts
- Categories: Accepted, Received, Sent, Shortlisted, Declined, Blocked, Ignored

### 2.2 New Section-Based Layout
Instead of horizontal carousels, implement vertical sections:

```
┌─────────────────────────────────────┐
│  7 Grid Cards (Stats)               │
├─────────────────────────────────────┤
│  ▼ Accepted Interests (5)           │
│     [Profile] [Profile] [Profile]   │
├─────────────────────────────────────┤
│  ▼ Interests Received (12)          │
│     [Profile] [Profile] [Profile]   │
├─────────────────────────────────────┤
│  ▼ Interests Sent (8)               │
│     [Profile] [Profile] [Profile]   │
└─────────────────────────────────────┘
```

### 2.3 Deduplication Logic
Priority order (highest to lowest):
1. Accepted
2. Received (pending)
3. Sent (pending)
4. Shortlisted
5. Declined
6. Blocked
7. Ignored

A profile appears in ONLY ONE section (the highest priority match).

## Phase 3: Dynamic Action Buttons

### 3.1 Relationship States
- `NONE` - No interaction yet
- `INTEREST_SENT` - User sent interest (pending)
- `INTEREST_RECEIVED` - User received interest (pending)
- `SUPER_INTEREST_SENT` - User sent super interest
- `SUPER_INTEREST_RECEIVED` - User received super interest
- `ACCEPTED` - Both parties accepted
- `DECLINED` - User declined
- `BLOCKED` - User blocked
- `IGNORED` - User ignored
- `SHORTLISTED` - User shortlisted (can coexist with others)

### 3.2 Action Button Matrix

**For Received Interests:**
- Show: [Accept] [Decline] [Block]
- On Accept → Move to Accepted section
- On Decline → Move to Declined section
- On Block → Move to Blocked section

**For Sent Interests:**
- Show: [Withdraw] [Block]
- On Withdraw → Remove from Sent section
- On Block → Move to Blocked section

**For Accepted:**
- Show: [Message] [Block]
- On Message → Open chat
- On Block → Move to Blocked section

**For Shortlisted:**
- Show: [Remove from Shortlist] [Send Interest]
- Dynamic based on current state

**For Declined/Blocked/Ignored:**
- Show: [Undo] or [Remove]
- On Undo → Restore to previous state

## Phase 4: Implementation Steps

### Step 1: Update interactionService
Add new methods:
- `acceptInterest(userId, partnerId)`
- `declineInterest(userId, partnerId)`
- `withdrawInterest(userId, partnerId)`
- `blockUser(userId, partnerId)`
- `unblockUser(userId, partnerId)`

### Step 2: Create Deduplication Helper
```typescript
const deduplicateActivities = (activities) => {
  const profileMap = new Map();
  const priority = ['accepted', 'received', 'sent', 'shortlisted', 'declined', 'blocked', 'ignored'];
  
  activities.forEach(activity => {
    const partnerId = activity.partnerId;
    const currentPriority = priority.indexOf(activity.category);
    
    if (!profileMap.has(partnerId) || 
        currentPriority < priority.indexOf(profileMap.get(partnerId).category)) {
      profileMap.set(partnerId, activity);
    }
  });
  
  return Array.from(profileMap.values());
};
```

### Step 3: Update Activity Component
- Add section expand/collapse state
- Implement click on grid → scroll to section
- Add deduplication logic
- Update categorization to handle all states

### Step 4: Update DetailedProfile Component
- Make action buttons fully dynamic
- Add all action handlers (accept, decline, block, etc.)
- Update UI based on relationship state
- Add loading states for all actions

### Step 5: Message Integration
- Update handleSendMessage in AdvocateCard
- Call interactionService.sendMessage
- Create/update conversation record
- Emit socket event for real-time update
- Update local state

## Phase 5: Testing Checklist

- [ ] Send interest → appears in "Sent" section
- [ ] Receive interest → appears in "Received" section
- [ ] Accept interest → moves to "Accepted" section
- [ ] Decline interest → moves to "Declined" section
- [ ] Send message → appears in Messages tab
- [ ] No duplicate profiles across sections
- [ ] Grid click → scrolls to correct section
- [ ] All action buttons work correctly
- [ ] State updates are immediate (optimistic UI)
- [ ] Backend sync works correctly

## Files to Modify

1. `src/services/interactionService.ts` - Add new API methods
2. `src/pages/dashboard/client/sections/activity.tsx` - Complete redesign
3. `src/pages/dashboard/shared/DetailedProfile.tsx` - Dynamic action buttons
4. `src/components/dashboard/AdvocateCard.tsx` - Message integration
5. `src/context/RelationshipContext.tsx` - Enhanced state management

## Estimated Time
- Phase 1: 30 minutes
- Phase 2: 1 hour
- Phase 3: 1 hour
- Phase 4: 2 hours
- Phase 5: 30 minutes
**Total: ~5 hours**

## Priority Order
1. Message integration (so messages appear in chat)
2. Deduplication logic
3. Dynamic action buttons
4. Section-based layout
5. Polish and testing
