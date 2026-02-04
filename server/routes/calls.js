const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');

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

        res.json({ success: true, call: newCall });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ACTIVE CALLS FOR USER (Polling)
router.get('/active/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find if someone is calling this user
        const incomingCall = await Call.findOne({
            receiver: userId,
            status: 'ringing'
        }).populate('caller', 'name image_url unique_id');

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
        const call = await Call.findById(req.params.callId)
            .populate('caller', 'name image_url unique_id')
            .populate('receiver', 'name image_url unique_id');

        if (!call) return res.status(404).json({ success: false, error: 'Call not found' });

        res.json({ success: true, call });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
