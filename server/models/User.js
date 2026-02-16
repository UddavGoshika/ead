const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    loginId: { type: String, unique: true, sparse: true }, // Custom Login ID (name, numbers, etc)
    password: { type: String, required: true },
    plainPassword: { type: String }, // WARNING: Unsecured, requested by user
    name: { type: String },
    phone: { type: String },
    profilePic: { type: String },
    superAdminKey: { type: String }, // Hashed
    keyGeneratedAt: { type: Date },
    role: {
        type: String,
        enum: [
            'client', 'advocate', 'admin', 'superadmin', 'super_admin', 'manager', 'teamlead', 'verifier', 'finance', 'support', 'legal_provider',
            'hr', 'influencer', 'marketer', 'marketing_agency', 'call_support', 'chat_support', 'personal_agent',
            'live_chat', 'telecaller', 'customer_care', 'data_entry', 'personal_assistant', 'email_support'
        ],
        default: 'client'
    },
    status: { type: String, enum: ['Active', 'Blocked', 'Deactivated', 'Deleted', 'Pending', 'Rejected', 'Reverify'], default: 'Active' },
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
    subscription_state: { type: String, enum: ['FREE', 'PREMIUM'], default: 'FREE' },
    connection_id: { type: String },
    last_state_updated_at: { type: Date, default: Date.now },
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
    },
    notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        activityAlerts: { type: Boolean, default: true }
    },
    messageSettings: {
        allowDirectMessages: { type: Boolean, default: true },
        readReceipts: { type: Boolean, default: true },
        filterSpam: { type: Boolean, default: true }
    },
    // Wallet & Payments
    bankAccounts: [{
        bankName: String,
        accountNumber: String,
        ifsc: String,
        holderName: String,
        isPrimary: { type: Boolean, default: false }
    }],
    savedCards: [{
        cardNum: String, // Masked or partial
        cardType: String, // VISA, Mastercard, etc.
        expiry: String,
        holderName: String
    }]
});

UserSchema.pre('save', function (next) {
    // ENFORCEMENT: Pending/Reverify users MUST be on Free plan
    if (this.status === 'Pending' || this.status === 'Reverify') {
        this.plan = 'Free';
        this.planType = 'Free';
        this.planTier = null;
    }

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
            // Force disable demo benefit if pending
            if (this.status === 'Pending' || this.status === 'Reverify') {
                this.isPremium = false;
            } else {
                this.isPremium = true;
            }
        } else {
            this.isPremium = false;
        }
    }

    this.subscription_state = this.isPremium ? 'PREMIUM' : 'FREE';
    this.last_state_updated_at = Date.now();

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
