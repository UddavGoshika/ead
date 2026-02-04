const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['audio', 'video'],
        required: true
    },
    status: {
        type: String,
        enum: ['ringing', 'accepted', 'rejected', 'ended', 'missed'],
        default: 'ringing'
    },
    roomName: {
        type: String,
        required: true
    },
    startTime: Date,
    endTime: Date,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Call', CallSchema);
