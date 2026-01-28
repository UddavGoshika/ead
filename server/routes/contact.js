const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { createNotification } = require('../utils/notif');

router.post('/', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();

        // NOTIFICATION: CONTACT FORM
        createNotification('contact', `New Contact/Ticket from ${req.body.name || req.body.email || 'Anonymous'}`, req.body.name, null, { email: req.body.email, subject: req.body.subject });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
