const mongoose = require('mongoose');

const UnlockedContactSchema = new mongoose.Schema({
    viewer_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    field_type: { type: String, enum: ['mobile', 'email', 'all'], default: 'all' },
    coins_used: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now }
});

// Index for quick lookup
UnlockedContactSchema.index({ viewer_user_id: 1, profile_user_id: 1 }, { unique: true });

module.exports = mongoose.model('UnlockedContact', UnlockedContactSchema);
