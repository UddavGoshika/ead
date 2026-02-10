const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Ticket = require('../models/Ticket');
const { createNotification } = require('../utils/notif');

router.post('/', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();

        // NOTIFICATION: CONTACT FORM
        await createNotification('contact', `New Contact/Ticket from ${req.body.name || req.body.email || 'Anonymous'}`, req.body.name, null, { email: req.body.email, subject: req.body.subject });

        // CREATE TICKET (Ensure visibility in Admin > Active Tickets)
        const ticketCount = await Ticket.countDocuments();
        const ticketId = `TKT-${10000 + ticketCount + 1}`;
        await Ticket.create({
            id: ticketId,
            subject: req.body.subject || `Inquiry from ${req.body.source || 'Website'}`,
            user: req.body.email || req.body.name || 'Visitor',
            userId: req.body.userId,
            category: req.body.category || 'General Inquiry',
            priority: (req.body.category === 'Technical Issue' || req.body.category === 'Report User') ? 'High' : 'Medium',
            status: 'Open',
            messages: [{
                sender: req.body.name || 'Visitor',
                text: `${req.body.message}\n\nPhone: ${req.body.phone || 'N/A'}\nSource: ${req.body.source || 'Website'}`,
                timestamp: new Date()
            }]
        });

        // SEND EMAIL ALERT TO ADMIN
        // You can change 'tatitoprojects@gmail.com' to your preferred admin email or use an ENV variable
        const adminEmail = process.env.SMTP_USER || 'tatitoprojects@gmail.com';
        const { name, email, phone, message } = req.body;

        const emailHtml = `
            <h3>New Contact Inquiry</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        // Send email (no await on purpose to speed up response, or await if critical)
        // We'll await to ensure it works for now as user asked for "real integration"
        const { sendEmail } = require('../utils/mailer');
        const emailResult = await sendEmail(adminEmail, `New Inquiry from ${name}`, `New inquiry from ${name}: ${message}`, emailHtml);

        if (!emailResult.success) {
            console.warn('Admin email alert failed:', emailResult.error);
            // We do NOT want to fail the request if just email failed, since contact is saved.
        }

        res.json({ success: true, message: 'Message sent successfully! Please wait 12-24 hours for a response.' });
    } catch (err) {
        console.error("Contact Form Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// FRAUD ALERT / PUBLIC TICKET CREATION
router.post('/fraud', async (req, res) => {
    try {
        const { name, email, phone, description, evidence } = req.body;

        // Generate Ticket ID
        const count = await Ticket.countDocuments();
        const ticketId = `TKT-${10000 + count + 1}`;

        const ticket = await Ticket.create({
            id: ticketId,
            subject: `Fraud Alert: Report by ${name}`,
            user: email || name || 'Anonymous', // User identifier
            category: 'Fraud Alert',
            priority: 'High',
            status: 'Open',
            messages: [{
                sender: name || 'Anonymous',
                text: `${description}\n\nPhone: ${phone}\nEvidence provided: ${evidence ? 'Yes' : 'No'}`,
                timestamp: new Date()
            }]
        });

        // Notify Admin
        await createNotification('ticket', `New Fraud Alert Ticket ${ticketId}`, 'System', null, { ticketId: ticketId });

        res.json({ success: true, message: 'Fraud report submitted. Ticket ID: ' + ticketId });
    } catch (err) {
        console.error("Fraud Ticket Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
