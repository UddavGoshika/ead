const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 } // OTP expires in 5 minutes (300 seconds)
    }
});

module.exports = mongoose.model('Otp', OtpSchema);
