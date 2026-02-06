const mongoose = require('mongoose');

const AdminConfigSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['SECTION_CONFIG', 'ATTRIBUTE_CONFIG']
    },
    // e.g. "advocate", "legal_provider", "client"
    role: {
        type: String,
        required: true
    },
    // Flexible structure to hold array of sections or attributes
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique config per type+role
AdminConfigSchema.index({ type: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('AdminConfig', AdminConfigSchema);
