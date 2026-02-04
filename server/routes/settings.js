const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth'); // Check middleware connection

// GET SITE SETTINGS (Public)
router.get('/site', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); // Create default if missing
        }
        res.json({ success: true, settings });
    } catch (err) {
        console.error('Fetch Site Settings Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE SITE SETTINGS (Admin Only)
router.post('/site', auth, async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin' && req.user.role.toLowerCase() !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        const update = req.body;
        const settings = await Settings.findOneAndUpdate({}, update, { new: true, upsert: true });
        res.json({ success: true, settings });
    } catch (err) {
        console.error('Update Site Settings Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET USER SETTINGS
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            privacy: user.privacySettings,
            presets: user.searchPresets,
            status: user.status
        });
    } catch (err) {
        console.error('Get Settings Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE PRIVACY
router.put('/privacy', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { showProfile, showContact, showEmail } = req.body;

        if (showProfile !== undefined) user.privacySettings.showProfile = showProfile;
        if (showContact !== undefined) user.privacySettings.showContact = showContact;
        if (showEmail !== undefined) user.privacySettings.showEmail = showEmail;

        await user.save();
        res.json({ success: true, privacy: user.privacySettings });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DEACTIVATE ACCOUNT
router.post('/deactivate', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.status = 'Deactivated';
        await user.save();
        res.json({ success: true, message: 'Account deactivated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE ACCOUNT (Hard Delete or Soft Delete)
router.post('/delete', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.status = 'Deleted'; // Soft delete
        await user.save();
        res.json({ success: true, message: 'Account marked for deletion' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// SEARCH PRESETS
router.post('/presets', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.searchPresets = req.body.presets; // Sync whole array
        await user.save();
        res.json({ success: true, presets: user.searchPresets });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save presets' });
    }
});

module.exports = router;
