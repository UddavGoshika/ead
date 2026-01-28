const mongoose = require('mongoose');

const PaymentSettingSchema = new mongoose.Schema({
    gateway: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' },
    credentials: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('PaymentSetting', PaymentSettingSchema);
