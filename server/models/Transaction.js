const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    gateway: { type: String, required: true },
    status: { type: String, default: 'pending' },
    transactionId: { type: String },
    paymentId: { type: String },
    packageId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
