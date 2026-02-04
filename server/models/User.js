const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: [
            'client', 'advocate', 'admin', 'manager', 'teamlead', 'verifier', 'finance', 'support', 'legal_provider',
            'hr', 'influencer', 'marketer', 'marketing_agency', 'call_support', 'chat_support', 'personal_agent',
            'live_chat', 'telecaller', 'customer_care', 'data_entry', 'personal_assistant'
        ],
        default: 'client'
    },
    status: { type: String, enum: ['Active', 'Blocked', 'Deactivated', 'Deleted', 'Pending'], default: 'Active' },
    coins: { type: Number, default: 10 },
    plan: { type: String, default: 'Free' },
    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date },
    myReferralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
