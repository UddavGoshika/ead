const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    initiator: { type: String, required: true }, // Name or Email of the person performing the action
    action: { type: String, required: true },    // e.g., 'ROLE_UPDATE', 'LOG_APPROVAL'
    target: { type: String, required: true },    // e.g., 'Rajesh Kumar (Telecaller)'
    status: {
        type: String,
        enum: ['success', 'warning', 'error'],
        default: 'success'
    },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
