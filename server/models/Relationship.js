const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // requester: the one who initiated the current state (e.g. sender of interest)
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    state: {
        type: String,
        enum: ['INTEREST', 'SUPER_INTEREST', 'ACCEPTED', 'DECLINED', 'BLOCKED', 'CONNECTED', 'SHORTLISTED', 'NONE'],
        default: 'INTEREST'
    },
    last_state_updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique relationship between two users
RelationshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Helper to get relationship_state for a specific user
RelationshipSchema.methods.getRelationshipState = function (userId) {
    const isRequester = this.requester.toString() === userId.toString();

    if (this.state === 'INTEREST') {
        return isRequester ? 'INTEREST_SENT' : 'INTEREST_RECEIVED';
    }

    return this.state; // ACCEPTED, DECLINED, BLOCKED, CONNECTED
};

module.exports = mongoose.model('Relationship', RelationshipSchema);
