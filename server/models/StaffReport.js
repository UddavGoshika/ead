const mongoose = require('mongoose');

const StaffReportSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, required: true }, // e.g. "Week 06 - 2024"
    dateRange: { type: String, required: true }, // e.g. "Feb 05 - Feb 11"
    frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly', 'quarterly'], required: true },
    deliverables: { type: String }, // Summary of work
    efficiency: { type: String }, // e.g. "94%"
    status: { type: String, enum: ['Verified', 'Pending Review', 'Flagged'], default: 'Pending Review' },
    fileUrl: { type: String }, // Path to generated report file
}, { timestamps: true });

module.exports = mongoose.model('StaffReport', StaffReportSchema);
