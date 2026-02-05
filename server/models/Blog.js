const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    category: { type: String, default: 'General' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

    // Metrics
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reported: { type: Number, default: 0 },

    // Interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
