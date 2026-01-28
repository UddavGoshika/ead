const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    memberType: { type: String, enum: ['advocate', 'client'], required: true },
    name: { type: String, required: true }, // This maps to "category" in frontend
    tiers: [
        {
            name: { type: String, required: true },
            price: { type: Number, default: 0 },
            coins: { type: mongoose.Schema.Types.Mixed, default: 0 }, // Number or "unlimited"
            support: { type: String, default: "" },
            active: { type: Boolean, default: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
