const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    user: { type: String, required: true }, // Email or Name
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: 'General' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Solved'], default: 'Open' },
    assignedTo: { type: String, default: 'None' },
    created: { type: String }, // formatted date
    messages: [{
        sender: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);
