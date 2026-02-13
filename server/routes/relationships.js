const express = require('express');
const router = express.Router();
const Relationship = require('../models/Relationship');
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

// Helper to emit events
const emitRelationshipUpdate = (req, senderId, receiverId, state) => {
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');

    const payload = { sender_id: senderId, receiver_id: receiverId, relationship_state: state };

    // Notify Sender
    const senderSocketId = userSockets.get(senderId.toString());
    if (senderSocketId) {
        io.to(senderSocketId).emit('relationship.updated', { ...payload, my_role: 'sender' });
    }

    // Notify Receiver
    const receiverSocketId = userSockets.get(receiverId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('relationship.updated', { ...payload, my_role: 'receiver' });
    }

    // Also emit stats update for broader UI updates
    io.emit('stats.updated', { affectedUsers: [senderId.toString(), receiverId.toString()] });
};

// Apply auth to all routes
router.use(auth);

// GET ALL RELATIONSHIPS FOR LOGGED IN USER
router.get('/all', async (req, res) => {
    try {
        const userId = req.user.id;
        const rels = await Relationship.find({
            $or: [{ user1: userId }, { user2: userId }]
        }).populate('user1', 'status').populate('user2', 'status');

        const formatted = rels.filter(rel => {
            const partner = rel.user1._id.toString() === userId.toString() ? rel.user2 : rel.user1;
            return partner && partner.status !== 'Deleted';
        }).map(rel => {
            const partnerId = rel.user1._id.toString() === userId.toString() ? rel.user2._id : rel.user1._id;
            const isRequester = rel.requester.toString() === userId.toString();

            let stateStr = rel.state;
            if (rel.state === 'INTEREST') {
                stateStr = isRequester ? 'INTEREST_SENT' : 'INTEREST_RECEIVED';
            } else if (rel.state === 'SUPER_INTEREST') {
                stateStr = isRequester ? 'SUPER_INTEREST_SENT' : 'SUPER_INTEREST_RECEIVED';
            } else if (rel.state === 'SHORTLISTED') {
                stateStr = isRequester ? 'SHORTLISTED_SENT' : 'SHORTLISTED_RECEIVED';
            }

            return {
                partnerId: partnerId.toString(),
                state: stateStr,
                my_role: isRequester ? 'sender' : 'receiver',
                updatedAt: rel.last_state_updated_at
            };
        });

        res.json({ success: true, relationships: formatted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEND INTEREST
router.post('/interest/send', async (req, res) => {
    try {
        const { receiver_id } = req.body;
        const sender_id = req.user.id;

        if (!receiver_id) return res.status(400).json({ error: 'Receiver ID is required' });

        const [u1, u2] = [sender_id.toString(), receiver_id.toString()].sort();

        let rel = await Relationship.findOne({ user1: u1, user2: u2 });
        if (rel && rel.state !== 'NONE') {
            return res.status(400).json({ error: 'Relationship already exists', state: rel.state });
        }

        if (!rel) {
            rel = new Relationship({ user1: u1, user2: u2 });
        }

        rel.requester = sender_id;
        rel.state = 'INTEREST';
        rel.last_state_updated_at = Date.now();
        // Log Activity
        // Idempotency check: Don't log the same action twice within 10 seconds
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const existingRecentActivity = await Activity.findOne({
            sender: sender_id,
            receiver: receiver_id,
            type: 'interest',
            timestamp: { $gte: tenSecondsAgo }
        });

        if (!existingRecentActivity) {
            const activity = new Activity({
                sender: sender_id,
                receiver: receiver_id,
                type: 'interest',
                status: 'pending',
                timestamp: new Date()
            });
            await activity.save();
        }

        await rel.save();

        emitRelationshipUpdate(req, sender_id, receiver_id, 'INTEREST');

        res.json({ success: true, state: 'INTEREST', my_role: 'sender' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ACCEPT INTEREST
router.post('/interest/accept', async (req, res) => {
    try {
        const { sender_id } = req.body;
        const receiver_id = req.user.id;

        if (!sender_id) return res.status(400).json({ error: 'Sender ID is required' });

        const [u1, u2] = [sender_id.toString(), receiver_id.toString()].sort();
        let rel = await Relationship.findOne({ user1: u1, user2: u2 });

        if (!rel || rel.state !== 'INTEREST' || rel.requester.toString() === receiver_id.toString()) {
            return res.status(400).json({ error: 'No pending interest to accept' });
        }

        rel.state = 'ACCEPTED';
        rel.last_state_updated_at = Date.now();
        // Update in parallel
        await Promise.all([
            rel.save(),
            Activity.updateMany(
                { sender: sender_id, receiver: receiver_id, type: { $in: ['interest', 'superInterest'] } },
                { status: 'accepted' }
            )
        ]);

        emitRelationshipUpdate(req, sender_id, receiver_id, 'ACCEPTED');

        res.json({ success: true, state: 'ACCEPTED', my_role: 'receiver' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DECLINE / IGNORE INTEREST
router.post('/interest/decline', async (req, res) => {
    try {
        const { sender_id } = req.body;
        const receiver_id = req.user.id;

        const [u1, u2] = [sender_id.toString(), receiver_id.toString()].sort();
        let rel = await Relationship.findOne({ user1: u1, user2: u2 });

        if (rel) {
            rel.state = 'DECLINED';
            rel.last_state_updated_at = Date.now();
            await rel.save();
        }

        // Update Activity
        await Activity.updateMany(
            { sender: sender_id, receiver: receiver_id, type: { $in: ['interest', 'superInterest'] } },
            { status: 'declined' }
        );

        emitRelationshipUpdate(req, sender_id, receiver_id, 'DECLINED');

        res.json({ success: true, state: 'DECLINED', my_role: 'receiver' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET RELATIONSHIP STATE
router.get('/state', async (req, res) => {
    try {
        const { partnerId } = req.query;
        const userId = req.user.id;
        if (!partnerId) return res.status(400).json({ error: 'Partner ID is required' });

        const [u1, u2] = [userId.toString(), partnerId.toString()].sort();
        const rel = await Relationship.findOne({ user1: u1, user2: u2 });

        if (!rel) return res.json({ success: true, state: 'NONE' });

        const my_role = (rel.requester.toString() === userId.toString()) ? 'sender' : 'receiver';

        res.json({
            success: true,
            state: rel.state,
            my_role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SHORTLIST
router.post('/shortlist', async (req, res) => {
    try {
        const { receiver_id } = req.body;
        const sender_id = req.user.id;

        const [u1, u2] = [sender_id.toString(), receiver_id.toString()].sort();
        let rel = await Relationship.findOne({ user1: u1, user2: u2 });

        if (!rel) {
            rel = new Relationship({ user1: u1, user2: u2 });
        } else if (rel.state !== 'NONE' && rel.state !== 'SHORTLISTED') {
            // If already interested/connected, don't downgrade to shortlist
            return res.status(400).json({ error: 'Relationship already exists', state: rel.state });
        }

        rel.requester = sender_id;
        rel.state = 'SHORTLISTED';
        rel.last_state_updated_at = Date.now();
        await rel.save();

        // Log Activity
        const activity = new Activity({
            sender: sender_id,
            receiver: receiver_id,
            type: 'shortlist',
            status: 'pending',
            timestamp: new Date()
        });
        await activity.save();

        emitRelationshipUpdate(req, sender_id, receiver_id, 'SHORTLISTED');

        res.json({ success: true, state: 'SHORTLISTED', my_role: 'sender' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
