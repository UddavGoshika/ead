const mongoose = require('mongoose');

const SupportActivitySchema = new mongoose.Schema({
    // AGENT INFO
    // AGENT INFO (ACTUAL SENDER)
    sentByAgentName: { type: String },
    sentByAgentEmail: { type: String },
    sentByAgentId: { type: String },
    sentByAgentPhone: { type: String },

    // Legacy mapping (kept for safety)
    agentName: { type: String, required: false }, // Made optional
    agentEmail: { type: String, required: false },
    agentId: { type: String },
    agentPhone: { type: String },
    agentRole: { type: String },
    agentStatus: { type: String, default: 'Active' },

    // ACTION INFO
    action: { type: String, required: true }, // Reply, Direct Email, Bulk Broadcast, Automated, etc.
    type: { type: String, enum: ['Direct Email', 'Broadcast', 'Automated', 'Bulk Action'], default: 'Direct Email' },

    // TARGET INFO
    recipient: { type: String },
    subject: { type: String },
    content: { type: String },
    ticketId: { type: String },

    // TRACKING & STATUS
    status: {
        type: String,
        enum: ['Sent', 'Failed', 'Delivered', 'Opened', 'Clicked', 'Pending'],
        default: 'Sent'
    },
    smtpResponse: { type: String },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },

    // TIMESTAMPS
    timestamp: { type: Date, default: Date.now },
    deliveryTime: { type: Date },
    openTime: { type: Date },
    clickTime: { type: Date },

    // METADATA
    ipAddress: { type: String },
    deviceInfo: { type: String },
    location: { type: String },
    trackingId: { type: String, unique: true, sparse: true },

    // SECURITY
    integrityHash: { type: String }, // For immutable verification
    history: [{
        action: String,
        performedBy: String,
        timestamp: { type: Date, default: Date.now },
        details: String
    }]
});

// Middleware to generate hash if needed (simplified for now)
SupportActivitySchema.pre('save', function (next) {
    if (!this.trackingId) {
        this.trackingId = 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('SupportActivity', SupportActivitySchema);
