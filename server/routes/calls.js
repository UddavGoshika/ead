const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');

// Helper to get profile details for a user
async function getProfileDetails(userId) {
    const user = await User.findById(userId);
    if (!user) return { name: 'Unknown', image_url: '/default-avatar.png' };

    let profile = null;
    if (user.role === 'advocate') {
        profile = await Advocate.findOne({ userId });
    } else if (user.role === 'client') {
        profile = await Client.findOne({ userId });
    } else if (user.role === 'legal_provider') {
        // Fallback for legal_provider if needed
        profile = await Advocate.findOne({ userId });
    }

    let imageUrl = '/default-avatar.png';
    if (profile?.profilePicPath) {
        imageUrl = `/${profile.profilePicPath.replace(/\\/g, '/')}`;
    } else if (profile?.img) {
        imageUrl = profile.img;
    }

    return {
        _id: user._id,
        unique_id: profile?.unique_id || 'UID',
        name: profile?.name || (profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email.split('@')[0]),
        image_url: imageUrl,
        role: user.role
    };
}

// INITIATE CALL
router.post('/', async (req, res) => {
    try {
        const { callerId, receiverId, type } = req.body;

        // Generate a unique room name
        const roomName = `eadvocate_${callerId}_${receiverId}_${Date.now()}`;

        const newCall = new Call({
            caller: callerId,
            receiver: receiverId,
            type,
            roomName,
            status: 'ringing'
        });

        await newCall.save();

        // Populate details for frontend immediate display
        const callerDetails = await getProfileDetails(callerId);
        const receiverDetails = await getProfileDetails(receiverId);

        const call = newCall.toObject();
        call.caller = callerDetails;
        call.receiver = receiverDetails;

        res.json({ success: true, call });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ACTIVE CALLS FOR USER (Polling)
router.get('/active/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find if someone is calling this user
        const incomingCallRaw = await Call.findOne({
            receiver: userId,
            status: 'ringing'
        }).sort({ timestamp: -1 });

        let incomingCall = null;
        if (incomingCallRaw) {
            const callerDetails = await getProfileDetails(incomingCallRaw.caller);
            incomingCall = incomingCallRaw.toObject();
            incomingCall.caller = callerDetails;
        }

        // Also check if our own calls have been accepted or rejected
        const outgoingCall = await Call.findOne({
            caller: userId,
            status: { $in: ['accepted', 'rejected'] }
        }).sort({ timestamp: -1 });

        res.json({
            success: true,
            incomingCall,
            outgoingCall
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE CALL STATUS
router.patch('/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        const { status } = req.body;

        const updateData = { status };
        if (status === 'accepted') {
            updateData.startTime = new Date();
        } else if (status === 'ended' || status === 'rejected' || status === 'missed') {
            updateData.endTime = new Date();
        }

        const call = await Call.findByIdAndUpdate(callId, updateData, { new: true });

        if (!call) return res.status(404).json({ success: false, error: 'Call not found' });

        res.json({ success: true, call });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET CALL DETAILS
router.get('/:callId', async (req, res) => {
    try {
        const callRaw = await Call.findById(req.params.callId);
        if (!callRaw) return res.status(404).json({ success: false, error: 'Call not found' });

        const callerDetails = await getProfileDetails(callRaw.caller);
        const receiverDetails = await getProfileDetails(callRaw.receiver);

        const call = callRaw.toObject();
        call.caller = callerDetails;
        call.receiver = receiverDetails;

        res.json({ success: true, call });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
