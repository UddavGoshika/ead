const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['status_update', 'call', 'chat', 'onboarding', 'other'], default: 'other' },
    duration: { type: String }, // e.g. "15m", "1h 30m"
    tags: [String],
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', WorkLogSchema);
