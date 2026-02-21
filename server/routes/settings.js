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
        const role = (req.user.role || '').toLowerCase();
        if (role !== 'admin' && role !== 'superadmin' && role !== 'super_admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const update = { ...req.body };
        // Sanitize update object to remove read-only fields
        delete update._id;
        delete update.__v;
        delete update.createdAt;
        delete update.updatedAt;

        const settings = await Settings.findOneAndUpdate({}, update, { new: true, upsert: true });
        res.json({ success: true, settings });
    } catch (err) {
        console.error('Update Site Settings Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// GET USER SETTINGS
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            privacy: user.privacySettings || { showProfile: true, showContact: false, showEmail: false },
            notificationSettings: user.notificationSettings || { email: true, push: true, sms: false, activityAlerts: true },
            messageSettings: user.messageSettings || { allowDirectMessages: true, readReceipts: true, filterSpam: true },
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

// UPDATE NOTIFICATIONS
router.put('/notifications', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.notificationSettings = { ...user.notificationSettings, ...req.body };
        await user.save();
        res.json({ success: true, notificationSettings: user.notificationSettings });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE MESSAGING
router.put('/messaging', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.messageSettings = { ...user.messageSettings, ...req.body };
        await user.save();
        res.json({ success: true, messageSettings: user.messageSettings });
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

// SEND TEST EMAIL
router.post('/test-email', auth, async (req, res) => {
    try {
        const { email, smtp_settings } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const nodemailer = require('nodemailer');

        // Use provided settings or fall back to DB settings
        let config = smtp_settings;
        if (!config) {
            const settings = await Settings.findOne();
            config = settings?.smtp_settings;
        }

        if (!config || !config.host) {
            return res.status(400).json({ error: 'SMTP settings not configured' });
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465, // true for 465, false for other ports
            auth: {
                user: config.user,
                pass: config.pass,
            },
            tls: {
                rejectUnauthorized: false // Often needed for shared hosting
            }
        });

        await transporter.sendMail({
            from: `"${config.sender_name}" <${config.sender_email}>`,
            to: email,
            subject: "SMTP Test Email",
            text: "This is a test email from your system settings. If you received this, your SMTP configuration is correct!",
            html: "<b>This is a test email from your system settings.</b><p>If you received this, your SMTP configuration is correct!</p>"
        });

        res.json({ success: true, message: 'Test email sent successfully!' });
    } catch (err) {
        console.error('Test Email Error:', err);
        res.status(500).json({ error: 'Failed to send test email: ' + err.message });
    }
});

module.exports = router;
