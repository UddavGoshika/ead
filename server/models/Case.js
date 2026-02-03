const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    caseId: { type: String, required: true, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    advocateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned advocate
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // Civil, Criminal, Family, etc.
    customCategory: { type: String },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Action Required', 'Closed', 'Resolved'],
        default: 'Open'
    },
    location: { type: String }, // e.g., Mumbai, Delhi
    court: { type: String }, // Supreme Court, High Court, etc.
    department: { type: String },
    subDepartment: { type: String },
    documents: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    lastUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to generate caseId if not present
CaseSchema.pre('validate', async function (next) {
    if (!this.caseId) {
        // Simple random ID generation for now, or could use a counter
        const random = Math.floor(1000 + Math.random() * 9000);
        this.caseId = `CASE-${random}-${Date.now().toString().slice(-4)}`;
    }
    next();
});

module.exports = mongoose.model('Case', CaseSchema);
