const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['registration', 'login', 'blog', 'ticket', 'contact', 'interest', 'superInterest', 'chat', 'shortlist', 'visit', 'profileUpdate', 'payment', 'system', 'view_contact']
    },
    message: { type: String, required: true },
    senderName: { type: String },
    senderId: { type: String }, // Flexible: could be ObjectId or mock string
    read: { type: Boolean, default: false },
    metadata: { type: Object }, // Flexible field for extra data (e.g. blogId, ticketId)
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
