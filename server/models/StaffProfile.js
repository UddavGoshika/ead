const mongoose = require('mongoose');

const StaffProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    staffId: { type: String, required: true, unique: true },
    department: { type: String },
    vendor: { type: String, default: 'Internal' }, // 'Internal' or Vendor Name
    level: { type: String }, // Senior, L1, L2, L3, Partner etc.
    solvedCases: { type: Number, default: 0 },
    pendingCases: { type: Number, default: 0 },
    successRate: { type: String, default: '0%' },
    grossAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    currentProject: { type: String },
    joinedDate: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StaffProfile', StaffProfileSchema);
