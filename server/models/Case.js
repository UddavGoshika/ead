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
        enum: ['Requested', 'Accepted', 'Rejected', 'Quoted', 'Funded', 'In Progress', 'Delivered', 'Revision Requested', 'Completed', 'Cancelled', 'Disputed'],
        default: 'Requested'
    },
    urgency: { type: String, enum: ['Normal', 'Priority'], default: 'Normal' },
    budget: Number,
    deadline: Date,
    rejectedReason: String,
    quotingInfo: {
        estimatedDelivery: String,
        milestones: [{
            title: String,
            description: String,
            amount: Number
        }],
        terms: String
    },
    revisionCount: { type: Number, default: 0 },
    maxRevisions: { type: Number, default: 0 },
    jurisdiction: String,
    communicationPreferences: { type: String, enum: ['In-App Chat', 'Email', 'Voice Call', 'Video Call', 'Any'], default: 'In-App Chat' },
    paymentInfo: {
        serviceFee: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        advisorPayoutAmount: { type: Number, default: 0 },
        payoutStatus: { type: String, enum: ['Pending', 'Released', 'Refunded'], default: 'Pending' },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        transactionId: String
    },
    location: { type: String }, // e.g., Mumbai, Delhi
    court: { type: String }, // Supreme Court, High Court, etc.
    department: { type: String },
    subDepartment: { type: String },
    requestedDocuments: [String], // List of documents requested by advocate
    advocateNotes: String, // Notes from advocate to client
    clientNotes: String, // Notes from client to advocate
    documents: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    deliverableContent: String,
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
