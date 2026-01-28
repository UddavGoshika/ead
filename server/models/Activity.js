const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    type: {
        type: String,
        enum: ['visit', 'interest', 'superInterest', 'shortlist', 'accept', 'decline', 'chat'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'none'],
        default: 'none'
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
