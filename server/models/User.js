const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plainPassword: { type: String }, // WARNING: Unsecured, requested by user
    role: { type: String, enum: ['client', 'advocate', 'admin', 'manager', 'teamlead', 'verifier', 'finance', 'support', 'legal_provider'], default: 'client' },
    status: { type: String, enum: ['Active', 'Blocked', 'Deactivated', 'Deleted', 'Pending'], default: 'Active' },
    coins: { type: Number, default: 10 },
    walletBalance: { type: Number, default: 0 },
    totalActions: { type: Number, default: 0 },
    lastActionDate: { type: Date },
    plan: { type: String, default: 'Free' }, // e.g. "Pro Lite Silver" or "Free"
    planType: { type: String, enum: ['Free', 'Pro Lite', 'Pro', 'Ultra Pro'], default: 'Free' },
    planTier: { type: String, enum: ['Silver', 'Gold', 'Platinum', null], default: null },
    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date },
    coinsReceived: { type: Number, default: 0 },
    coinsUsed: { type: Number, default: 0 },
    demoUsed: { type: Boolean, default: false },
    lastDemoDate: { type: Date },
    demoExpiry: { type: Date },
    myReferralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    searchPresets: [{
        id: String,
        name: String,
        specs: [String],
        states: [String],
        experience: String,
        date: { type: Number, default: Date.now }
    }],
    privacySettings: {
        showProfile: { type: Boolean, default: true },
        showContact: { type: Boolean, default: false },
        showEmail: { type: Boolean, default: false }
    }
});

UserSchema.pre('save', function (next) {
    const planStr = (this.plan || '').toLowerCase();
    const typeStr = (this.planType || '').toLowerCase();

    // Rule: Anything except "free" is premium
    if (planStr !== 'free' && planStr !== '' && !planStr.includes('none')) {
        this.isPremium = true;
    } else if (typeStr !== 'free' && typeStr !== '' && typeStr !== 'none') {
        this.isPremium = true;
    } else {
        // Fallback or explicit check for demo trial
        if (this.demoUsed && this.demoExpiry > Date.now()) {
            this.isPremium = true;
        } else {
            this.isPremium = false;
        }
    }

    // Forced Rule: FREE users have 0 coins
    if (!this.isPremium) {
        this.coins = 0;
        this.coinsReceived = 0;
    } else {
        // If they have coins but Received is 0, sync it
        if (this.coins > 0 && (this.coinsReceived || 0) === 0) {
            this.coinsReceived = this.coins;
        }
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
