const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

MessageSchema.index({ sender: 1 });
MessageSchema.index({ receiver: 1 });
MessageSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);
