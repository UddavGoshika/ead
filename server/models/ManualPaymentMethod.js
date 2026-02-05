const mongoose = require('mongoose');

const ManualPaymentMethodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    instructions: { type: String, required: true },
    details: { type: String }, // Additional details for internal use or display
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ManualPaymentMethod', ManualPaymentMethodSchema);
