const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    route: { type: String, required: true, unique: true },
    content: { type: String, default: '' },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
    category: { type: String, default: 'General' }, // e.g. Explore, More, Legal, etc.
    isCustom: { type: Boolean, default: false } // If true, it's a page created via admin
}, { timestamps: true });

module.exports = mongoose.model('Page', PageSchema);
