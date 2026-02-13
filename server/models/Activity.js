const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    type: {
        type: String,
        enum: ['visit', 'interest', 'superInterest', 'shortlist', 'accept', 'decline', 'chat', 'view_contact', 'unlock_contact', 'system', 'block', 'unblock', 'withdraw', 'cancel', 'remove_connection', 'upgrade_super', 'remove_shortlist', 'ignore', 'super_accept', 'meet_request'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'none'],
        default: 'none'
    },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object }
});

ActivitySchema.index({ sender: 1 });
ActivitySchema.index({ receiver: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
