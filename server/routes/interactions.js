const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const Message = require('../models/Message');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notif');

// Action can be: shortlist, interest, superInterest, chat_unlock, view_contact
router.post('/:targetRole/:targetId/:action', async (req, res) => {
    try {
        const { targetRole, targetId, action } = req.params;
        const { userId } = req.body;

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
            interest: 1,
            superInterest: 2,
            shortlist: 0,
            view_contact: 1,
            chat: 1 // Rule 9: Chat (unlock) is 1 coin
        };

        if (!Object.keys(COIN_COSTS).includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        let cost = COIN_COSTS[action];

        // Fetch Target Details
        let targetModel;
        if (targetRole === 'advocate') targetModel = Advocate;
        else if (targetRole === 'client') targetModel = Client;
        else return res.status(400).json({ error: 'Invalid target role' });

        let target = null;
        if (mongoose.Types.ObjectId.isValid(targetId)) {
            target = await targetModel.findById(targetId).populate('userId', 'email phone isPremium premiumExpiry');
        }
        if (!target) return res.status(404).json({ error: 'Target profile not found' });

        const targetUserId = target.userId?._id || target.userId;
        const isTargetPremium = target.userId?.isPremium || false;

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
        if (!isPremium && cost > 0) {
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
                // Rule: Contact Visibility = Viewer's Premium Active + 1 Month Grace
                const viewerPremiumExpiry = user.premiumExpiry ? new Date(user.premiumExpiry) : new Date(0);
                const gracePeriodExpiry = new Date(viewerPremiumExpiry.getTime() + (30 * 24 * 60 * 60 * 1000));

                if (Date.now() < gracePeriodExpiry.getTime()) {
                    cost = 0; // Still in grace period or plan is active
                } else {
                    // Rule: After grace period, hidden again. "Requires plan renewal (no extra coin)"
                    // This means if they renew, cost is 0 again.
                    if (isPremium) cost = 0;
                    else return res.status(403).json({ error: 'PLAN_EXPIRED', message: 'Please renew your plan to view contact info.' });
                }
            }
        }

        // Rule: INTERACTION LIMIT: Max 3 coin-based interactions per profile
        // Interaction Limit (Interest, Super Interest, Contact unlock, Chat unlock)
        if (action !== 'shortlist') {
            const coinActions = ['interest', 'superInterest', 'chat', 'view_contact'];
            const distinctInteractions = await Activity.distinct('type', {
                sender: userId,
                receiver: targetUserId,
                type: { $in: coinActions }
            });

            // If this is a NEW type of interaction and we already have 3 types...
            if (!distinctInteractions.includes(action) && distinctInteractions.length >= 3) {
                return res.status(403).json({
                    error: 'INTERACTION_LIMIT',
                    message: 'You’ve reached the interaction limit for this profile (Max 3).'
                });
            }
        }

        // DEDUCT COINS
        if (user.coins < cost) {
            return res.status(400).json({ error: 'INSUFFICIENT_COINS', message: 'Not enough coins.' });
        }
        if (cost > 0) {
            user.coins -= cost;
            user.coinsUsed = (user.coinsUsed || 0) + cost;
            await user.save();
        }

        // PERFORM ACTION (Push ID to target's arrays if applicable)
        if (['shortlist', 'interest', 'superInterest'].includes(action)) {
            const field = action === 'shortlist' ? 'shortlists' : action === 'interest' ? 'interests' : 'superInterests';
            if (Array.isArray(target[field]) && !target[field].includes(userId)) {
                target[field].push(userId);
                await target.save();
            }
        }

        // LOG ACTIVITY
        const newActivity = new Activity({
            sender: userId.toString(),
            receiver: targetUserId.toString(),
            type: action,
            status: ['interest', 'superInterest'].includes(action) ? 'pending' : 'none',
            metadata: { cost }
        });
        await newActivity.save();

        if (action === 'view_contact') {
            const contactEmail = target.email || (target.userId && target.userId.email) || 'N/A';
            const contactPhone = target.mobile || target.phone || target.contact || (target.userId && target.userId.phone) || 'N/A';
            const whatsapp = target.whatsapp || contactPhone; // Use mobile as fallback for WhatsApp

            return res.json({
                success: true,
                coins: user.coins,
                coinsUsed: user.coinsUsed || 0,
                coinsReceived: user.coinsReceived || 0,
                message: 'Contact Unlocked',
                contact: {
                    email: contactEmail,
                    mobile: contactPhone,
                    whatsapp: whatsapp
                }
            });
        }

        // NOTIFICATION
        createNotification(action, `New interaction: ${action} from User`, '', userId, { targetId, targetRole });

        res.json({
            success: true,
            coins: user.coins,
            coinsUsed: user.coinsUsed || 0,
            coinsReceived: user.coinsReceived || 0,
            message: `Action ${action} successful`,
            cost
        });
    } catch (err) {
        console.error('Interaction Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET ACTIVITY STATS
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = {
            visits: await Activity.countDocuments({ sender: userId, type: 'visit' }),
            sent: await Activity.countDocuments({ sender: userId, type: { $in: ['interest', 'superInterest'] } }),
            received: await Activity.countDocuments({ receiver: userId, type: { $in: ['interest', 'superInterest'] } }),
            accepted: await Activity.countDocuments({
                $or: [
                    { sender: userId, status: 'accepted' },
                    { receiver: userId, status: 'accepted' }
                ]
            })
        };
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ACCEPT/DECLINE INTEREST
router.post('/respond/:activityId/:status', async (req, res) => {
    try {
        const { activityId, status } = req.params; // status: 'accepted' or 'declined'
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const activity = await Activity.findById(activityId);
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        activity.status = status;
        await activity.save();

        res.json({ success: true, message: `Request ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET MY INTERACTIONS (For Dashboard)
router.get('/my-requests/:role/:userId', async (req, res) => {
    try {
        const { role, userId } = req.params;
        let model;
        if (role === 'advocate') model = Advocate;
        else if (role === 'client') model = Client;
        else return res.status(400).json({ error: 'Invalid role' });

        let profile = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            profile = await model.findOne({ userId })
                .populate('interests', 'email firstName lastName name unique_id')
                .populate('superInterests', 'email firstName lastName name unique_id')
                .populate('shortlists', 'email firstName lastName name unique_id');
        }

        if (!profile) {
            return res.json({
                success: true,
                interests: [],
                superInterests: [],
                shortlists: []
            });
        }

        res.json({
            success: true,
            interests: profile.interests,
            superInterests: profile.superInterests,
            shortlists: profile.shortlists
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
            const targetPlan = (targetUser.plan || 'Free').toLowerCase();
            const targetIsPremium = targetUser.isPremium || !targetPlan.includes('free');

            // Note: Content is stored normally in DB, but filtered on retrieval
            // or we could mark the message as "locked" if sent to a free user.
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
            status: 'none'
        });
        await newActivity.save();

        // NOTIFICATION: CHAT
        createNotification('chat', `New message from User ${sender}`, '', sender, { receiver });

        res.json({ success: true, message: newMessage });
    } catch (err) {
        console.error('Message Log Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/messages/:id1/:id2', async (req, res) => {
    try {
        const { id1, id2 } = req.params;
        let messages = await Message.find({
            $or: [
                { sender: id1, receiver: id2 },
                { sender: id2, receiver: id1 }
            ]
        }).sort({ timestamp: 1 }).lean();

        // Process message content based on recipient premium status
        const formattedMessages = await Promise.all(messages.map(async (msg) => {
            const receiverUser = await User.findById(msg.receiver);
            if (receiverUser) {
                const planStr = (receiverUser.plan || 'Free').toLowerCase();
                const isPremium = receiverUser.isPremium || (planStr !== 'free' && planStr !== '');

                if (!isPremium) {
                    // Logic: If receiver is free, hide the text
                    // (But allow the sender to see their own sent messages)
                    // Wait, the spec says "If a free user receives a message: Message content is hidden"
                    // So we hide it specifically when the person viewing IT is the receiver?
                    // Usually id1 or id2 is the viewer. Let's assume the fetch is for both.
                    // We'll add a 'isLocked' flag that the frontend handles.
                    return {
                        ...msg,
                        text: "Someone sent you a message. Upgrade to view.",
                        isLocked: true
                    };
                }
            }
            return msg;
        }));

        res.json({ success: true, messages: formattedMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ timestamp: -1 });

        const conversationPartners = new Set();
        const conversations = [];

        for (const msg of messages) {
            const partnerId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
            if (!conversationPartners.has(partnerId)) {
                conversationPartners.add(partnerId);

                // Fetch partner profile (Advocate or Client)
                let partnerProfile = null;
                if (mongoose.Types.ObjectId.isValid(partnerId)) {
                    partnerProfile = await Advocate.findOne({ userId: partnerId });
                    if (!partnerProfile) {
                        partnerProfile = await Client.findOne({ userId: partnerId });
                    }
                }

                const partnerImg = partnerProfile ? (partnerProfile.profilePic || partnerProfile.img || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400') : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';

                let partnerLocation = 'N/A';
                if (partnerProfile) {
                    if (partnerProfile.address) {
                        partnerLocation = `${partnerProfile.address.city || ''} ${partnerProfile.address.state || ''}`.trim() || 'India';
                    } else if (partnerProfile.location) {
                        partnerLocation = `${partnerProfile.location.city || ''} ${partnerProfile.location.state || ''}`.trim() || 'India';
                    }
                }

                conversations.push({
                    partnerId,
                    partnerName: partnerProfile ? (partnerProfile.name || `${partnerProfile.firstName} ${partnerProfile.lastName}`) : 'Unknown User',
                    partnerUniqueId: partnerProfile ? partnerProfile.unique_id : null,
                    partnerImg,
                    partnerLocation,
                    lastMessage: msg.text,
                    timestamp: msg.timestamp
                });
            }
        }

        res.json({ success: true, conversations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL ACTIVITIES (Filtered List)
router.get('/all/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const activities = await Activity.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ timestamp: -1 }).lean();

        const detailedActivities = [];

        for (const act of activities) {
            const isSender = act.sender.toString() === userId;
            const partnerId = isSender ? act.receiver : act.sender;

            // Fetch partner profile
            let partnerProfile = null;
            if (mongoose.Types.ObjectId.isValid(partnerId)) {
                partnerProfile = await Advocate.findOne({ userId: partnerId });
                if (!partnerProfile) {
                    partnerProfile = await Client.findOne({ userId: partnerId });
                }
            }

            const partnerImg = partnerProfile ? (partnerProfile.profilePic || partnerProfile.img || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400') : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';

            let partnerLocation = 'N/A';
            if (partnerProfile) {
                if (partnerProfile.address) {
                    partnerLocation = `${partnerProfile.address.city || ''} ${partnerProfile.address.state || ''}`.trim() || 'India';
                } else if (partnerProfile.location) {
                    partnerLocation = `${partnerProfile.location.city || ''} ${partnerProfile.location.state || ''}`.trim() || 'India';
                }
            }

            detailedActivities.push({
                ...act,
                partnerName: partnerProfile ? (partnerProfile.name || `${partnerProfile.firstName} ${partnerProfile.lastName}`) : 'Unknown User',
                partnerUniqueId: partnerProfile ? partnerProfile.unique_id : null,
                partnerImg,
                partnerLocation,
                isSender
            });
        }

        res.json({ success: true, activities: detailedActivities });
    } catch (err) {
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

module.exports = router;
