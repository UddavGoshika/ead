const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    // Lead Details
    date: { type: Date, default: Date.now },
    source: { type: String, required: true },
    assignedBPO: { type: String, required: true },

    // Client Info
    clientName: { type: String, required: true },
    clientMobile: { type: String, required: true },
    clientCity: { type: String, required: true },

    // Legal Requirement
    category: { type: String, required: true },
    problem: { type: String, required: true },

    // Lead Quality
    qualityGenuine: { type: String, enum: ['Verified', 'Unverified'], default: 'Unverified' },
    qualityUrgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    qualityBudgetLine: { type: String }, // e.g., "50k - 1L"

    // Advocate Mapping
    advocateType: { type: String },
    advocateStatus: { type: String, enum: ['Assigned', 'Pending'], default: 'Pending' },

    // Lead Status
    leadStatus: { type: String, enum: ['New', 'Qualified', 'Follow Up', 'Converted', 'Closed'], default: 'New' },
    notes: { type: String },

    // Activity History for Reporting
    history: [{
        status: String,
        notes: String,
        updatedAt: { type: Date, default: Date.now }
    }],

    // Relation to Report/Staff
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffReport' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
