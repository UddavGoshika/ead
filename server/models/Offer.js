const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    expiresAt: { type: Date },
    status: { type: String, enum: ['Active', 'Expired', 'Disabled', 'Blocked'], default: 'Active' },
    category: { type: String, enum: ['Referral', 'Cashback', 'Plan Upgrade', 'Special Event', 'Discount Coupon'], default: 'Referral' },
    targetRoles: [{ type: String }] // 'client', 'advocate', 'legal_provider', etc.
}, { timestamps: true });

module.exports = mongoose.model('Offer', OfferSchema);
