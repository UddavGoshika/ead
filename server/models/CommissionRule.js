const mongoose = require('mongoose');

const CommissionRuleSchema = new mongoose.Schema({
    level: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['Percentage', 'Fixed Amount'], default: 'Percentage' },
    value: { type: String, required: true },
    condition: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('CommissionRule', CommissionRuleSchema);
