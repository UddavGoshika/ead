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
        index: { expires: 1200 } // OTP expires in 20 minutes (1200 seconds)
    }
});

module.exports = mongoose.model('Otp', OtpSchema);
