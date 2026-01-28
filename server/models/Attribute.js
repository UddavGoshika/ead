const mongoose = require('mongoose');

const AttributeSchema = new mongoose.Schema({
    category: { type: String, required: true }, // e.g., "religion", "caste", "language"
    name: { type: String, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure unique names within the same category
AttributeSchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Attribute', AttributeSchema);
