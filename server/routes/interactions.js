const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const Message = require('../models/Message');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notif');

// Action can be: shortlist, interest, superInterest, chat, visit
router.post('/:targetRole/:targetId/:action', async (req, res) => {
    try {
        const { targetRole, targetId, action } = req.params;
        const { userId } = req.body;

        const mongoose = require('mongoose');

        // Mock-safe user lookup
        let user;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }

        // If user not in DB, use a mock object for coins logic
        if (!user) {
            user = { id: userId, coins: 100, save: () => Promise.resolve() };
        }

        let targetModel;
        if (targetRole === 'advocate') targetModel = Advocate;
        else if (targetRole === 'client') targetModel = Client;
        else return res.status(400).json({ error: 'Invalid target role' });

        let target;
        if (mongoose.Types.ObjectId.isValid(targetId)) {
            target = await targetModel.findById(targetId);
        }

        // Processing logic
        try {
            if (action === 'chat') {
                if (user.coins < 2) {
                    return res.status(400).json({ error: 'Insufficient coins.' });
                }
                user.coins -= 2;
                await user.save();
            } else if (target && ['shortlist', 'interest', 'superInterest'].includes(action)) {
                const field = action === 'shortlist' ? 'shortlists' :
                    action === 'interest' ? 'interests' : 'superInterests';

                if (!target[field].includes(userId)) {
                    target[field].push(userId);
                    await target.save();
                }
            }
        } catch (updateErr) {
            console.error('Profile update failed during interaction, but activity will still be logged:', updateErr);
        }

        // Log to Activity model - ALWAYS attempt this
        const newActivity = new Activity({
            sender: userId,
            receiver: target ? (target.userId || targetId) : targetId,
            type: action === 'superInterest' ? 'superInterest' : action,
            status: ['interest', 'superInterest'].includes(action) ? 'pending' : 'none'
        });
        await newActivity.save();

        // NOTIFICATION: INTERACTION
        createNotification(action, `New interaction: ${action} from User ${userId}`, '', userId, { targetId, targetRole });

        res.json({
            success: true,
            coins: user.coins,
            message: `Activity ${action} recorded`
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
        const newMessage = new Message({ sender, receiver, text });
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
        const messages = await Message.find({
            $or: [
                { sender: id1, receiver: id2 },
                { sender: id2, receiver: id1 }
            ]
        }).sort({ timestamp: 1 });
        res.json({ success: true, messages });
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

                conversations.push({
                    partnerId,
                    partnerName: partnerProfile ? (partnerProfile.name || `${partnerProfile.firstName} ${partnerProfile.lastName}`) : 'Unknown User',
                    partnerUniqueId: partnerProfile ? partnerProfile.unique_id : null,
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

            detailedActivities.push({
                ...act,
                partnerName: partnerProfile ? (partnerProfile.name || `${partnerProfile.firstName} ${partnerProfile.lastName}`) : 'Unknown User',
                partnerUniqueId: partnerProfile ? partnerProfile.unique_id : null,
                isSender
            });
        }

        res.json({ success: true, activities: detailedActivities });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
