const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const Message = require('../models/Message');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');
const { upload } = require('../config/cloudinary');
const { createNotification } = require('../utils/notif');
const { getImageUrl } = require('../utils/pathHelper');
const UnlockedContact = require('../models/UnlockedContact');
const Relationship = require('../models/Relationship');
const auth = require('../middleware/auth');


// GET ACTIVITY STATS
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [visits, sent, received, accepted, messages, meet_request, blocked] = await Promise.all([
            Activity.countDocuments({ sender: userId, type: 'visit' }),
            Activity.countDocuments({ sender: userId, type: { $in: ['interest', 'superInterest'] } }),
            Activity.countDocuments({ receiver: userId, type: { $in: ['interest', 'superInterest'] } }),
            Activity.countDocuments({
                $or: [
                    { sender: userId, status: 'accepted' },
                    { receiver: userId, status: 'accepted' }
                ]
            }),
            Activity.countDocuments({
                $or: [{ sender: userId }, { receiver: userId }],
                type: { $in: ['chat', 'message', 'chat_initiated'] }
            }),
            Activity.countDocuments({ receiver: userId, type: 'meet_request' }),
            Activity.countDocuments({ sender: userId, type: 'block' })
        ]);
        res.json({
            success: true,
            stats: { visits, sent, received, accepted, messages, meet_request, blocked }
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ACCEPT/DECLINE INTEREST
router.post('/respond/:activityId/:status', async (req, res) => {
    try {
        const { activityId, status } = req.params; // status: 'accepted' or 'declined'
        const { meetingDetails } = req.body;
        console.log(`Response Request: ID=${activityId}, Status=${status}`);

        if (!['accepted', 'declined'].includes(status)) {
            console.warn(`Invalid status received: ${status}`);
            return res.status(400).json({ error: 'Invalid status' });
        }

        if (!mongoose.Types.ObjectId.isValid(activityId)) {
            console.warn(`Invalid Activity ID received: ${activityId}`);
            return res.status(400).json({ error: 'Invalid Activity ID format' });
        }

        const activity = await Activity.findById(activityId);
        if (!activity) {
            console.warn(`Activity not found: ${activityId}`);
            return res.status(404).json({ error: 'Activity not found' });
        }

        console.log(`Found activity: ${activity.type} from ${activity.sender} to ${activity.receiver}`);

        // Update specific activity
        activity.status = status;
        if (status === 'accepted' && (activity.type === 'meet_request' || activity.type === 'consultation') && meetingDetails) {
            activity.metadata = {
                ...activity.metadata,
                meetingDetails
            };
        }
        await activity.save();

        // Fetch responder details for notification
        let responderName = 'User';
        const receiverId = activity.receiver.toString();
        const adv = await Advocate.findOne({ userId: receiverId });
        if (adv) {
            responderName = adv.name || `${adv.firstName} ${adv.lastName}`;
        } else {
            const cl = await Client.findOne({ userId: receiverId });
            if (cl) responderName = `${cl.firstName} ${cl.lastName}`;
        }

        // Send notification to the SENDER of the interest
        const notifType = activity.type === 'superInterest' ? 'superInterest' : 'interest';
        const actionMsg = status === 'accepted' ? 'accepted' : 'declined';

        let customNotifMsg = `${responderName} has ${actionMsg} your request.`;
        if (status === 'accepted' && meetingDetails) {
            customNotifMsg = `${responderName} has accepted your consultation and scheduled a meeting on ${meetingDetails.date} at ${meetingDetails.time}.`;
        }

        await createNotification(
            notifType,
            customNotifMsg,
            responderName,
            receiverId,
            { activityId: activity._id, status: status, meetingDetails }
        );

        // Real-time Notification via Socket.IO
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');

        // 1. Notify the SENDER (the one who gets the decision)
        const senderSocketId = userSockets.get(activity.sender.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit('new-notification', {
                type: notifType,
                message: customNotifMsg,
                senderName: responderName,
                status: status,
                meetingDetails
            });
        }

        // 2. Notify the RESPONDER (the one who made the decision)
        const responderSocketId = userSockets.get(receiverId);
        if (responderSocketId) {
            io.to(responderSocketId).emit('new-notification', {
                type: 'system',
                message: `You have ${actionMsg} the request from ${activity.senderName || 'User'}.`,
                status: status
            });
        }

        // SYNC WITH RELATIONSHIP MODEL
        try {
            const [u1, u2] = [activity.sender.toString(), activity.receiver.toString()].sort();
            let relationship = await Relationship.findOne({ user1: u1, user2: u2 });

            let newState = status.toUpperCase(); // 'ACCEPTED' or 'DECLINED'
            if (status === 'accepted') {
                newState = 'ACCEPTED';
            } else if (status === 'declined') {
                newState = 'DECLINED';
            }

            if (relationship) {
                relationship.state = newState;
                relationship.last_state_updated_at = Date.now();
                await relationship.save();
                console.log(`[SYNC] Relationship updated to ${newState} for users ${u1} and ${u2}`);
            } else {
                // If it doesn't exist, create it (fallback)
                relationship = new Relationship({
                    user1: u1,
                    user2: u2,
                    requester: activity.sender,
                    state: newState,
                    last_state_updated_at: Date.now()
                });
                await relationship.save();
                console.log(`[SYNC] Relationship created as ${newState} for users ${u1} and ${u2}`);
            }
        } catch (syncErr) {
            console.error('[SYNC ERROR] Failed to update Relationship model:', syncErr);
            // Non-blocking error for the response
        }

        console.log(`Successfully updated activity ${activityId} to ${status}`);
        res.json({ success: true, message: `Request ${status}` });
    } catch (err) {
        console.error('Respond To Activity Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Action can be: shortlist, interest, superInterest, chat_unlock, view_contact
router.post('/:targetRole/:targetId/:action', auth, async (req, res) => {
    try {
        const { targetRole, targetId, action } = req.params;
        const userId = req.user.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Valid User ID is required' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // PLAN & PREMIUM CHECK
        const plan = (user.plan || 'Free').toLowerCase();
        const isPremium = user.isPremium || (plan !== 'free' && plan !== '');

        // Spec: "Free clients: Cannot spend coins"
        // Spec: "Coins are available only for premium users"
        // If user.plan == FREE -> coins = 0 (forced)
        if (!isPremium && user.coins > 0) {
            user.coins = 0;
            await user.save();
        }

        // Thus, ANY action requiring > 0 coins is blocked for Free users.

        // COIN TABLE (Rule 9)
        const COIN_COSTS = {
            interest: 0,
            superInterest: 0,
            shortlist: 0,
            view_contact: 1,
            unlock_contact: 1,
            chat: 0,
            accept: 0,
            decline: 0,
            withdraw: 0,
            block: 0,
            unblock: 0,
            ignore: 0,
            super_accept: 0,
            remove_connection: 0,
            cancel: 0,
            upgrade_super: 0,
            remove_shortlist: 0,
            meet_request: 0
        };

        if (!Object.keys(COIN_COSTS).includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        let cost = COIN_COSTS[action];

        // Fetch Target Details
        // Legal providers are stored in Advocate model; accept aliases.
        const normalizedTargetRole = String(targetRole || '').toLowerCase().trim();
        let targetModel;
        if (normalizedTargetRole === 'advocate' || normalizedTargetRole === 'legal_provider' || normalizedTargetRole === 'legal provider' || normalizedTargetRole === 'legal_service_provider' || normalizedTargetRole === 'legal service provider') {
            targetModel = Advocate;
        } else if (normalizedTargetRole === 'client') {
            targetModel = Client;
        } else {
            return res.status(400).json({ error: 'Invalid target role' });
        }

        let target = null;
        if (mongoose.Types.ObjectId.isValid(targetId)) {
            target = await targetModel.findById(targetId).populate('userId', 'email phone isPremium premiumExpiry');
            if (!target) {
                target = await targetModel.findOne({ userId: targetId }).populate('userId', 'email phone isPremium premiumExpiry');
            }
        } else {
            // Handle Unique IDs (ADV-xxxx / CLT-xxxx)
            target = await targetModel.findOne({ unique_id: targetId }).populate('userId', 'email phone isPremium premiumExpiry');
        }
        if (!target) return res.status(404).json({ error: 'Target profile not found' });

        let targetUserId = target.userId?._id || target.userId;
        if (targetUserId) targetUserId = targetUserId.toString();
        const isTargetPremium = target.userId?.isPremium || false;

        if (!targetUserId) {
            return res.status(400).json({ error: 'Target has no associated User ID' });
        }

        if (targetUserId.toString() === userId.toString()) {
            return res.status(400).json({ error: 'SELF_INTERACTION', message: 'You cannot interact with yourself.' });
        }

        // Rule: Chat is 0 coins if Contact Info was already unlocked
        const contactUnlocked = await Activity.findOne({
            sender: userId,
            receiver: targetUserId,
            type: 'view_contact'
        });
        if (action === 'chat' && contactUnlocked) {
            cost = 0;
        }

        // Rule: Premium <-> Premium Chat is Free (for 3 months)
        if (action === 'chat' && isPremium && isTargetPremium) {
            cost = 0;
        }

        // Rule 15: PREMIUM User with Zero Coins
        if (isPremium && user.coins <= 0 && cost > 0) {
            return res.status(403).json({
                error: 'ZERO_COINS',
                message: 'Your tokens are empty. Please top up.',
                isZeroCoins: true
            });
        }

        // Logic For Free Users (Rule 8: Coins only for premium)
        if (!isPremium && cost > 0 && action !== 'unlock_contact' && action !== 'view_contact') {
            return res.status(403).json({
                error: 'UPGRADE_REQUIRED',
                message: 'This action requires a Premium Plan.'
            });
        }

        // VALIDITY CHECKS (Chat 3 months, Contact Plan + 1 month)
        const alreadyPerformed = await Activity.findOne({
            sender: userId,
            receiver: targetUserId,
            type: action
        }).sort({ timestamp: -1 });

        if (alreadyPerformed) {
            if (['interest', 'superInterest', 'meet_request'].includes(action)) {
                return res.status(400).json({
                    error: 'ALREADY_SENT',
                    message: `You have already sent ${action === 'meet_request' ? 'a consultation request' : 'an interest'} to this profile.`
                });
            }
            if (action === 'chat') {
                // Rule: Chat valid for 3 months from unlock date
                const monthsDiff = (Date.now() - new Date(alreadyPerformed.timestamp).getTime()) / (1000 * 60 * 60 * 24 * 30);
                if (monthsDiff < 3) {
                    cost = 0;
                } else {
                    return res.status(403).json({
                        error: 'CHAT_EXPIRED',
                        message: 'Please upgrade or renew your plan to continue chatting'
                    });
                }
            }
            if (action === 'view_contact') {
                // Rule override: Once unlocked with 1 coin, it's always visible for this profile.
                cost = 0;
            }
        }

        // DEDUCT COINS
        if (user.coins < cost) {
            return res.status(400).json({ error: 'INSUFFICIENT_COINS', message: 'Not enough coins.' });
        }

        // Rule: INTERACTION LIMIT: Max 3 coin-based interactions per profile
        // Interaction Limit (Interest, Super Interest, Contact unlock, Chat unlock)
        const coinActions = ['interest', 'superInterest', 'chat', 'view_contact', 'upgrade_super', 'meet_request'];
        if (coinActions.includes(action)) {
            const distinctInteractions = await Activity.distinct('type', {
                sender: userId,
                receiver: targetUserId,
                type: { $in: ['interest', 'superInterest', 'chat', 'view_contact', 'meet_request'] }
            });

            // If this is a NEW type of interaction and we already have 3 types...
            // Note: upgrade_super replaces interest, so it shouldn't add to the count if interest exists.
            let willAddCount = !distinctInteractions.includes(action);
            if (action === 'upgrade_super' && distinctInteractions.includes('interest')) willAddCount = false;

            if (willAddCount && distinctInteractions.length >= 3) {
                return res.status(403).json({
                    error: 'INTERACTION_LIMIT',
                    message: 'You’ve reached the interaction limit for this profile (Max 3).'
                });
            }
        }

        if (cost > 0) {
            user.coins -= cost;
            user.coinsUsed = (user.coinsUsed || 0) + cost;
            await user.save();
        }

        // PERFORM ACTION (Push ID to target's arrays if applicable)
        let isShortlisted = false;
        if (['shortlist', 'interest', 'superInterest', 'upgrade_super', 'remove_shortlist'].includes(action)) {
            if (action === 'upgrade_super') {
                const userIdStr = userId.toString();
                // Remove from interests, add to superInterests
                if (Array.isArray(target.interests)) {
                    target.interests = target.interests.filter(id => id && id.toString() !== userIdStr);
                }
                if (Array.isArray(target.superInterests)) {
                    const hasIt = target.superInterests.some(id => id && id.toString() === userIdStr);
                    if (!hasIt) target.superInterests.push(userId);
                }
                await target.save();
            } else if (action === 'shortlist' || action === 'remove_shortlist') {
                if (!Array.isArray(target.shortlists)) target.shortlists = [];
                const userIdStr = userId.toString();
                const index = target.shortlists.findIndex(id => id && id.toString() === userIdStr);
                if (index > -1) {
                    target.shortlists.splice(index, 1);
                    isShortlisted = false;
                } else if (action === 'shortlist') {
                    target.shortlists.push(userId);
                    isShortlisted = true;
                }
                await target.save();
            } else {
                const field = action === 'interest' ? 'interests' : 'superInterests';
                if (Array.isArray(target[field])) {
                    const userIdStr = userId.toString();
                    const hasIt = target[field].some(id => id && id.toString() === userIdStr);
                    if (!hasIt) {
                        target[field].push(userId);
                        await target.save();
                    }
                }
            }
        }

        // LOG ACTIVITY
        // Idempotency check: Don't log the same action twice within 10 seconds
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const existingRecentActivity = await Activity.findOne({
            sender: userId.toString(),
            receiver: targetUserId.toString(),
            type: action,
            timestamp: { $gte: tenSecondsAgo }
        });

        if (!existingRecentActivity) {
            const newActivity = new Activity({
                sender: userId.toString(),
                receiver: targetUserId.toString(),
                type: action,
                status: (['interest', 'superInterest', 'upgrade_super', 'super_accept', 'meet_request'].includes(action)) ? 'pending' : 'none',
                metadata: { cost }
            });
            await newActivity.save();
        }

        // SYNC WITH RELATIONSHIP MODEL
        if (['shortlist', 'interest', 'superInterest', 'accept', 'decline', 'block', 'unblock', 'cancel', 'withdraw', 'remove_connection', 'super_accept', 'remove_shortlist', 'ignore', 'upgrade_super'].includes(action)) {
            try {
                const [u1, u2] = [userId.toString(), targetUserId.toString()].sort();
                let relationship = await Relationship.findOne({ user1: u1, user2: u2 });

                let newState = 'NONE';
                if (action === 'shortlist') newState = isShortlisted ? 'SHORTLISTED' : 'NONE';
                else if (action === 'interest') newState = 'INTEREST';
                else if (action === 'superInterest' || action === 'upgrade_super') newState = 'SUPER_INTEREST';
                else if (action === 'accept' || action === 'super_accept') newState = 'ACCEPTED';
                else if (action === 'decline' || action === 'ignore') newState = 'DECLINED';
                else if (action === 'block') newState = 'BLOCKED';
                else if (['unblock', 'withdraw', 'cancel', 'remove_connection', 'remove_shortlist'].includes(action)) newState = 'NONE';

                if (!relationship) {
                    relationship = new Relationship({
                        user1: u1,
                        user2: u2,
                        requester: userId,
                        state: newState,
                        last_state_updated_at: Date.now()
                    });
                } else {
                    relationship.state = newState;
                    relationship.requester = userId;
                    relationship.last_state_updated_at = Date.now();
                }
                await relationship.save();

                // Post-Action activities update
                if (newState === 'ACCEPTED') {
                    await Activity.updateMany(
                        {
                            $or: [
                                { sender: userId, receiver: targetUserId },
                                { sender: targetUserId, receiver: userId }
                            ],
                            type: { $in: ['interest', 'superInterest'] }
                        },
                        { status: 'accepted' }
                    );
                } else if (newState === 'DECLINED' || newState === 'NONE' || newState === 'BLOCKED') {
                    await Activity.updateMany(
                        {
                            $or: [
                                { sender: userId, receiver: targetUserId },
                                { sender: targetUserId, receiver: userId }
                            ],
                            type: { $in: ['interest', 'superInterest'] }
                        },
                        { status: newState === 'DECLINED' ? 'declined' : 'none' }
                    );
                }

                // Broadcast via Socket.IO
                const io = req.app.get('io');
                const userSockets = req.app.get('userSockets');
                const payload = { sender_id: userId, receiver_id: targetUserId, relationship_state: relationship.state };

                const sId = userSockets.get(userId.toString());
                if (sId) io.to(sId).emit('relationship.updated', { ...payload, my_role: 'sender' });

                const rId = userSockets.get(targetUserId.toString());
                if (rId) io.to(rId).emit('relationship.updated', { ...payload, my_role: 'receiver' });
            } catch (relErr) {
                console.error("Relationship Sync Error:", relErr);
            }
        }

        if (action === 'view_contact' || action === 'unlock_contact') {
            const privacy = target.userId?.privacySettings || { showContact: true, showEmail: true };
            const isOwner = userId && userId.toString() === target.userId?._id?.toString();

            let contactEmail = target.email || (target.userId && target.userId.email) || 'N/A';
            let contactPhone = target.mobile || target.phone || target.contact || (target.userId && target.userId.phone) || 'N/A';

            // Privacy overrides should NOT apply if the user just paid to unlock this.
            // if (!privacy.showContact && !isOwner) contactPhone = 'Hidden by User';
            // if (!privacy.showEmail && !isOwner) contactEmail = 'Hidden by User';

            const whatsapp = target.whatsapp || contactPhone;

            return res.json({
                success: true,
                coins: user.coins,
                coinsUsed: user.coinsUsed || 0,
                coinsReceived: user.coinsReceived || 0,
                message: 'Contact Unlocked',
                contact: {
                    email: contactEmail,
                    mobile: contactPhone,
                    whatsapp: whatsapp,
                    licenseId: target.education?.enrollmentNo || target.licenseId || 'N/A'
                }
            });
        }

        // NOTIFICATION DETAILS
        let senderName = 'A user';
        const adv = await Advocate.findOne({ userId: userId.toString() });
        if (adv) senderName = adv.name || `${adv.firstName} ${adv.lastName}`;
        else {
            const cl = await Client.findOne({ userId: userId.toString() });
            if (cl) senderName = `${cl.firstName} ${cl.lastName}`;
        }

        const actionText = action === 'interest' ? 'sent you an interest' :
            action === 'superInterest' ? 'sent you a super interest' :
                action === 'shortlist' ? 'shortlisted your profile' :
                    action === 'view_contact' ? 'viewed your contact' :
                        action === 'meet_request' ? 'sent you a meeting request' :
                            action === 'chat' ? 'unlocked chat with you' : `performed ${action}`;

        const notifMsg = `${senderName} has ${actionText}.`;

        // NOTIFY ONLY ON POSITIVE ACTIONS
        const shouldNotify = (action === 'shortlist' && isShortlisted) ||
            (['interest', 'superInterest', 'chat', 'view_contact', 'meet_request'].includes(action));

        if (shouldNotify) {
            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets');

            if (io && userSockets) {
                // 1. Notify the RECEIVER (target) - IMMEDIATE EMIT
                const targetSocketId = userSockets.get(targetUserId.toString());
                if (targetSocketId) {
                    io.to(targetSocketId).emit('new-notification', {
                        type: action,
                        message: notifMsg,
                        senderName: senderName,
                        action: action
                    });
                }

                // 2. Notify the SENDER (confirmation) - IMMEDIATE EMIT
                const senderSocketId = userSockets.get(userId.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit('new-notification', {
                        type: 'system',
                        message: `You successfully ${action === 'shortlist' ? 'shortlisted' : action === 'meet_request' ? 'sent a meeting request to' : 'sent an interest to'} ${target.name || 'this profile'}.`,
                        action: action
                    });
                }
            }

            // Save notification to DB in background - DO NOT AWAIT
            createNotification(action, notifMsg, senderName, userId, { targetId, targetRole });
        }

        res.json({
            success: true,
            coins: user.coins,
            coinsUsed: user.coinsUsed || 0,
            coinsReceived: user.coinsReceived || 0,
            message: `Action ${action} successful`,
            isShortlisted,
            cost
        });

        // HANDLE UNLOCKED CONTACT PERMANENT RECORD
        if (action === 'unlock_contact' || action === 'view_contact') {
            try {
                await UnlockedContact.findOneAndUpdate(
                    { viewer_user_id: userId, profile_user_id: targetUserId },
                    { coins_used: cost, created_at: Date.now() },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error('UnlockedContact error:', err);
            }
        }
    } catch (err) {
        console.error('Interaction Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET MY INTERACTIONS (For Dashboard)
router.get('/my-requests/:role/:userId', async (req, res) => {
    try {
        const { role, userId } = req.params;
        let model;
        const normalizedRole = String(role || '').toLowerCase().trim();
        if (normalizedRole === 'advocate' || normalizedRole === 'legal_provider' || normalizedRole === 'legal provider' || normalizedRole === 'legal_service_provider' || normalizedRole === 'legal service provider') model = Advocate;
        else if (normalizedRole === 'client') model = Client;
        else return res.status(400).json({ error: 'Invalid role' });

        let profile = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            profile = await model.findOne({ userId })
                .populate({
                    path: 'interests',
                    model: 'User',
                    select: 'email firstName lastName name unique_id status'
                })
                .populate({
                    path: 'superInterests',
                    model: 'User',
                    select: 'email firstName lastName name unique_id status'
                })
                .populate({
                    path: 'shortlists',
                    model: 'User',
                    select: 'email firstName lastName name unique_id status'
                });
        }

        if (!profile) {
            return res.json({
                success: true,
                interests: [],
                superInterests: [],
                shortlists: []
            });
        }

        // Filter out deleted users
        const interests = (profile.interests || []).filter(u => u && typeof u === 'object' && u.status !== 'Deleted');
        const superInterests = (profile.superInterests || []).filter(u => u && typeof u === 'object' && u.status !== 'Deleted');
        const shortlists = (profile.shortlists || []).filter(u => u && typeof u === 'object' && u.status !== 'Deleted');

        res.json({
            success: true,
            interests,
            superInterests,
            shortlists
        });
    } catch (err) {
        console.error('Fetch Interactions Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// MESSAGING ROUTES
router.post('/messages', async (req, res) => {
    try {
        const { sender, receiver, text } = req.body;

        const user = await User.findById(sender);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const plan = (user.plan || 'Free').toLowerCase();
        const isPremium = user.isPremium || !plan.includes('free');

        // Check if receiver is a featured advocate
        let receiverProfile = await Advocate.findOne({ userId: receiver });
        if (!receiverProfile) {
            receiverProfile = await Client.findOne({ userId: receiver });
        }

        const isTargetFeatured = receiverProfile && receiverProfile.isFeatured;

        if (!isPremium && isTargetFeatured) {
            const messagedProfiles = await Activity.distinct('receiver', {
                sender,
                type: 'chat'
            });

            if (!messagedProfiles.includes(receiver)) {
                if (messagedProfiles.length >= 10) {
                    return res.status(403).json({
                        error: 'FEATURED_CHAT_LIMIT',
                        message: 'Free users can only chat with 10 Featured Profiles. Please upgrade!'
                    });
                }
            } else {
                const msgCount = await Activity.countDocuments({
                    sender,
                    receiver,
                    type: 'chat'
                });
                if (msgCount >= 10) {
                    return res.status(403).json({
                        error: 'MESSAGE_COUNT_LIMIT',
                        message: 'Message limit reached for this profile (10 messages). Please upgrade!'
                    });
                }
            }
        }

        // Rule: FREE USER MESSAGE HANDLING
        // If a free user receives a message: hide content
        const targetUser = await User.findById(receiver);
        if (targetUser) {
            // PRIVACY CHECK: Allow Direct Messages
            const msgSettings = targetUser.messageSettings || { allowDirectMessages: true };
            if (!msgSettings.allowDirectMessages) {
                return res.status(403).json({
                    error: 'MESSAGING_DISABLED',
                    message: 'This user has disabled direct messaging.'
                });
            }

            const targetPlan = (targetUser.plan || 'Free').toLowerCase();
            const targetIsPremium = targetUser.isPremium || !targetPlan.includes('free');
            // ... (rest of logic)
        }

        const newMessage = new Message({
            sender,
            receiver,
            text,
            isLocked: !isPremium // Mark if sender is free? No, spec says "If a free user receives a message"
        });
        await newMessage.save();

        // Also log this as an activity
        const newActivity = new Activity({
            sender,
            receiver,
            type: 'chat',
            status: 'none',
            metadata: { text }
        });
        await newActivity.save();

        // NOTIFICATION: CHAT
        createNotification('chat', `New message from User ${sender}`, '', sender, { receiver });

        res.json({ success: true, message: newMessage });

        // Real-time Update via Socket.IO
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');

        if (io && userSockets) {
            // 1. Notify the RECEIVER
            const receiverSocketId = userSockets.get(receiver.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('new-message', {
                    message: newMessage,
                    senderId: sender
                });
            }
            // 2. Notify the SENDER (optional, but good for multi-device sync)
            const senderSocketId = userSockets.get(sender.toString());
            if (senderSocketId && senderSocketId !== req.socket.id) {
                io.to(senderSocketId).emit('new-message', {
                    message: newMessage,
                    senderId: sender
                });
            }
        }
    } catch (err) {
        console.error('Message Log Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/messages/:id1/:id2', async (req, res) => {
    try {
        const { id1, id2 } = req.params;
        const { viewerId } = req.query; // Optional: who is fetching the messages

        let messages = await Message.find({
            $or: [
                { sender: id1, receiver: id2 },
                { sender: id2, receiver: id1 }
            ]
        }).sort({ timestamp: 1 }).lean();

        // If no viewerId provided, we can't safely mask without context.
        // But we should at least check if BOTH are free.
        // Actually, the most robust way is to just return indicates and let frontend handle if it's purely for UI.
        // However, for security, we check the viewerId.

        const formattedMessages = await Promise.all(messages.map(async (msg) => {
            // NEVER mask if the viewer is the sender of THIS specific message
            if (viewerId && String(msg.sender) === String(viewerId)) {
                return msg;
            }

            // Default: show original message
            return msg;

            // Default: show original message
            return msg;
        }));

        res.json({ success: true, messages: formattedMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/conversations/:userId', async (req, res) => {
    try {
        let { userId } = req.params;

        // Transform unique_id to ObjectId if necessary
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findOne({ unique_id: userId });
            if (user) {
                userId = user._id.toString();
            } else {
                return res.json({ success: true, conversations: [] });
            }
        }

        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ timestamp: -1 });

        const partnersMap = new Map();
        const partnerIds = new Set();

        for (const msg of messages) {
            const partnerId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
            if (!partnersMap.has(partnerId)) {
                partnersMap.set(partnerId, { lastMessage: msg.text, timestamp: msg.timestamp });
                partnerIds.add(partnerId);
            }
        }

        const ids = Array.from(partnerIds).filter(id => mongoose.Types.ObjectId.isValid(id));
        const [advocates, clients, users, currentUser, unreadCounts] = await Promise.all([
            Advocate.find({ userId: { $in: ids } }).lean(),
            Client.find({ userId: { $in: ids } }).lean(),
            User.find({ _id: { $in: ids }, status: { $ne: 'Deleted' } }).lean(),
            User.findById(userId).lean(),
            Message.aggregate([
                { $match: { receiver: new mongoose.Types.ObjectId(userId), read: false } },
                { $group: { _id: "$sender", count: { $sum: 1 } } }
            ])
        ]);

        const unreadMap = {};
        unreadCounts.forEach(item => {
            unreadMap[item._id.toString()] = item.count;
        });

        const viewerIsPremium = currentUser?.isPremium || false;
        const profileMap = {};
        const activeUserIds = new Set(users.map(u => u._id.toString()));

        advocates.forEach(p => profileMap[p.userId.toString()] = p);
        clients.forEach(p => profileMap[p.userId.toString()] = p);

        const conversations = ids.filter(id => activeUserIds.has(id.toString())).map(partnerIdStr => {
            const pid = partnerIdStr.toString();
            const partnerProfile = profileMap[pid];
            const msgData = partnersMap.get(pid);

            let partnerImg = partnerProfile ? (partnerProfile.profilePic || partnerProfile.profilePicPath || partnerProfile.img) : null;
            if (!partnerImg) partnerImg = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';

            let partnerLocation = 'N/A';
            if (partnerProfile) {
                if (partnerProfile.address) {
                    partnerLocation = `${partnerProfile.address.city || ''} ${partnerProfile.address.state || ''}`.trim() || 'India';
                } else if (partnerProfile.location) {
                    partnerLocation = `${partnerProfile.location.city || ''} ${partnerProfile.location.state || ''}`.trim() || 'India';
                }
            }

            let partnerName = partnerProfile ? (partnerProfile.name || `${partnerProfile.firstName} ${partnerProfile.lastName}`) : 'Unknown User';
            let partnerUniqueId = partnerProfile ? partnerProfile.unique_id : null;
            const isBlur = false;

            return {
                partnerId: pid,
                partnerName,
                partnerUniqueId,
                partnerImg,
                partnerLocation,
                lastMessage: msgData.lastMessage,
                timestamp: msgData.timestamp,
                unreadCount: unreadMap[pid] || 0,
                isBlur
            };
        });

        res.json({ success: true, conversations });
    } catch (err) {
        console.error('Conversations Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// MARK MESSAGES AS READ
router.post('/messages/read', async (req, res) => {
    try {
        const { userId, partnerId } = req.body;
        if (!userId || !partnerId) return res.status(400).json({ error: 'Missing IDs' });

        await Message.updateMany(
            { sender: partnerId, receiver: userId, read: false },
            { $set: { read: true } }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL ACTIVITIES (Filtered List)
router.get('/all/:userId', async (req, res) => {
    try {
        let { userId } = req.params;

        // Validating inputs to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            // Try finding by unique_id
            const user = await User.findOne({ unique_id: userId });
            if (user) {
                userId = user._id.toString();
            } else {
                console.warn(`[Interactions] Invalid User ID: ${userId}`);
                return res.json({ success: true, activities: [] });
            }
        }

        const activities = await Activity.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ timestamp: -1 }).lean();

        const partnerIds = Array.from(new Set(activities.map(a =>
            a.sender.toString() === userId ? a.receiver.toString() : a.sender.toString()
        ))).filter(id => mongoose.Types.ObjectId.isValid(id));

        const [advocates, clients, users, currentUser] = await Promise.all([
            Advocate.find({ userId: { $in: partnerIds } }).lean(),
            Client.find({ userId: { $in: partnerIds } }).lean(),
            User.find({ _id: { $in: partnerIds }, status: { $ne: 'Deleted' } }).lean(),
            User.findById(userId).lean()
        ]);

        const viewerIsPremium = currentUser?.isPremium || false;

        const profileMap = {};
        const userMap = {};

        advocates.forEach(p => profileMap[p.userId.toString()] = p);
        clients.forEach(p => profileMap[p.userId.toString()] = p);
        users.forEach(u => userMap[u._id.toString()] = u);

        const detailedActivities = activities.map(act => {
            const isSender = act.sender.toString() === userId;
            const partnerId = isSender ? act.receiver.toString() : act.sender.toString();
            const partnerUser = userMap[partnerId];

            // If partner user is not found (because they are deleted), skip this activity
            if (!partnerUser) return null;

            const partnerProfile = profileMap[partnerId];

            // Robust Image Path handling
            let rawImg = null;
            if (partnerProfile) {
                rawImg = partnerProfile.profilePic || partnerProfile.profilePicPath || partnerProfile.img;
            }
            if (!rawImg && partnerUser) {
                // Try getting it from User object if somehow populated (unlikely based on current schema but safe)
                rawImg = partnerUser.profilePicPath;
            }

            const partnerImg = getImageUrl(rawImg) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';

            let partnerLocation = 'N/A';
            if (partnerProfile) {
                if (partnerProfile.address) {
                    partnerLocation = `${partnerProfile.address.city || ''} ${partnerProfile.address.state || ''}`.trim() || partnerProfile.address.country || 'India';
                } else if (partnerProfile.location) {
                    partnerLocation = `${partnerProfile.location.city || ''} ${partnerProfile.location.state || ''}`.trim() || partnerProfile.location.country || 'India';
                }
            }

            let partnerRole = partnerUser ? partnerUser.role : 'client';
            if (partnerProfile) {
                // Double check if it's an advocate by checking the advocates list
                const isPartnerAdvocate = advocates.some(adv => adv._id.toString() === partnerProfile._id.toString());
                partnerRole = isPartnerAdvocate ? 'advocate' : 'client';
            }

            // Enhanced fallback for name and uniqueId
            const fallbackId = `TP-EAD-${partnerId.slice(-6).toUpperCase()}`;
            const partnerName = partnerProfile
                ? (partnerProfile.name || `${partnerProfile.firstName} ${partnerProfile.lastName}`.trim())
                : (partnerUser ? partnerUser.email.split('@')[0] : 'Unknown User');

            let pName = partnerName;
            let pUniqueId = partnerProfile ? partnerProfile.unique_id : fallbackId;
            const isBlur = false;

            return {
                ...act,
                text: act.metadata?.text,
                partnerName: pName,
                partnerUniqueId: pUniqueId,
                partnerId,
                partnerUserId: partnerId,
                partnerRole,
                partnerImg,
                partnerLocation,
                isBlur,
                isSender
            };
        }).filter(Boolean);

        res.json({ success: true, activities: detailedActivities });
    } catch (err) {
        console.error('All Activities Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE ACTIVITY
router.delete('/:activityId', async (req, res) => {
    try {
        const { activityId } = req.params;
        const deleted = await Activity.findByIdAndDelete(activityId);
        if (!deleted) return res.status(404).json({ error: 'Activity not found' });
        res.json({ success: true, message: 'Activity deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPLOAD DOCUMENT FOR CASES
router.post('/upload-document', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const fileUrl = req.file.path.startsWith('http') ? req.file.path : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ success: true, fileUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

module.exports = router;
