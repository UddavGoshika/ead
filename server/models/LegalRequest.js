const mongoose = require('mongoose');

const LegalRequestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Affidavit', 'Agreement', 'Notice'], required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    grossFee: { type: Number, required: true },
    earned: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Executed', 'Delivered', 'Reported', 'Rejected', 'Review', 'Completed'],
        default: 'Pending'
    },
    requestedBy: { type: String, required: true },
    clientPhone: { type: String, required: true },
    requestedDate: { type: String, required: true },
    executionDate: { type: String },
    completionDate: { type: String },
    fulfillmentSpecialist: { type: String, required: true },
    specialistLicense: { type: String, required: true },
    stepsCompleted: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 5 },
    requiredStamp: { type: String },
    reportedLogs: { type: String },
    clientNotes: { type: String },
    lastUpdated: { type: String },
    // Relations if needed in future
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    specialistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('LegalRequest', LegalRequestSchema);
