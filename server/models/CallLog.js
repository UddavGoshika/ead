const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    type: { type: String, enum: ['Inbound', 'Outbound'], required: true },
    mode: { type: String, enum: ['Voice', 'Video'], default: 'Voice' },
    duration: { type: Number, default: 0 }, // in seconds
    status: { type: String, enum: ['Completed', 'Missed', 'Busy', 'Failed'], default: 'Completed' },
    recordingUrl: { type: String },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', CallLogSchema);
