const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    memberType: { type: String, enum: ['advocate', 'client'], required: true },
    name: { type: String, required: true }, // This maps to "category" in frontend
    description: { type: String, default: "" },
    icon: { type: String, default: "info" },
    gradient: { type: String, default: "from-blue-50 to-gray-50" },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    tiers: [
        {
            name: { type: String, required: true },
            price: { type: Number, default: 0 },
            coins: { type: mongoose.Schema.Types.Mixed, default: 0 }, // Number or "unlimited"
            support: { type: String, default: "" },
            active: { type: Boolean, default: true },
            features: { type: [String], default: [] },
            badgeColor: { type: String, default: "#3b82f6" },
            glowColor: { type: String, default: "rgba(59, 130, 246, 0.2)" },
            popular: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
