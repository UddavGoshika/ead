const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET LATEST NOTIFICATIONS (Admin)
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// MARK AS READ
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json({ success: true, notification });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// MARK ALL AS READ
router.post('/read-all', async (req, res) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
