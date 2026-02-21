const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Referral = require('../models/Referral');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Auth middleware (simplified like in payments.js)
const authenticate = async (req, res, next) => {
    let token = req.headers.authorization || req.headers['x-auth-token'];
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        if (token.startsWith('Bearer ')) token = token.slice(7).trim();
        if (token.startsWith('user-token-')) {
            const userId = token.split('user-token-')[1];
            const user = await User.findById(userId);
            if (!user) return res.status(401).json({ error: 'User not found' });
            req.user = user;
            return next();
        }
        res.status(401).json({ error: 'Invalid token' });
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// GET REFERRAL STATS
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        // Total Earned from Transactions (packageId: 'referral_earning')
        const earnings = await Transaction.aggregate([
            { $match: { userId: userId, packageId: 'referral_earning', status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalEarned = earnings[0]?.total || 0;

        // Total Withdrawn
        const withdrawalsArr = await Transaction.aggregate([
            { $match: { userId: userId, packageId: 'withdrawal', status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalWithdrawn = withdrawalsArr[0]?.total || 0;

        // Count Referrals
        const totalReferrals = await Referral.countDocuments({ referrer: userId });

        res.json({
            success: true,
            stats: {
                totalEarned,
                totalWithdrawn,
                walletBalance: req.user.walletBalance || 0,
                totalReferrals,
                referralCode: req.user.myReferralCode
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET REFERRALS LIST (Who took reference)
router.get('/referrals', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all referrals made by this user
        const referrals = await Referral.find({ referrer: userId }).populate('referee', 'name email phone createdAt role status');

        const detailedReferrals = await Promise.all(referrals.map(async (ref) => {
            // Find payments made by the referee that resulted in commission for this referrer
            // Or just find ANY package payment by referee to show "How much they paid"
            const refereePayments = await Transaction.find({
                userId: ref.referee._id,
                status: 'completed',
                packageId: { $ne: 'referral_earning' } // exclude commissions
            }).sort({ createdAt: -1 });

            const totalPaidByReferee = refereePayments.reduce((acc, curr) => acc + curr.amount, 0);

            // Find commissions earned FROM this specific referee
            const myCommissions = await Transaction.find({
                userId: userId,
                packageId: 'referral_earning',
                status: 'completed',
                'metadata.refereeId': ref.referee._id.toString()
            });
            const myEarningsFromThem = myCommissions.reduce((acc, curr) => acc + curr.amount, 0);

            return {
                id: ref._id,
                referee: {
                    name: ref.referee.name,
                    email: ref.referee.email,
                    phone: ref.referee.phone,
                    role: ref.referee.role,
                    joinedAt: ref.referee.createdAt
                },
                totalPaid: totalPaidByReferee,
                myEarnings: myEarningsFromThem,
                status: ref.referee.status
            };
        }));

        res.json({ success: true, referrals: detailedReferrals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// WITHDRAWAL REQUEST
router.post('/withdraw', authenticate, async (req, res) => {
    try {
        const { amount, bankDetails } = req.body;
        if (amount > req.user.walletBalance) {
            return res.status(400).json({ success: false, error: 'Insufficient balance' });
        }

        // Deduct balance
        req.user.walletBalance -= amount;
        await req.user.save();

        const transaction = new Transaction({
            userId: req.user._id,
            orderId: `WTH-${Date.now()}`,
            amount,
            currency: 'INR',
            gateway: 'Bank Transfer',
            status: 'pending',
            packageId: 'withdrawal',
            metadata: { bankDetails }
        });

        await transaction.save();

        res.json({ success: true, message: 'Withdrawal request submitted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET AVAILABLE OFFERS (Public/User view)
router.get('/offers', authenticate, async (req, res) => {
    try {
        const Offer = require('../models/Offer');
        const role = req.user.role;
        const usedOffers = req.user.usedOffers || [];

        // Find active offers that target this user's role or 'all', and NOT already used
        const offers = await Offer.find({
            _id: { $nin: usedOffers },
            status: 'Active',
            $or: [
                { targetRoles: { $in: [role, 'all', 'All'] } },
                { targetRoles: { $size: 0 } }
            ]
        }).sort({ createdAt: -1 });

        res.json({ success: true, offers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET USED OFFERS HISTORY
router.get('/offers/history', authenticate, async (req, res) => {
    try {
        const Offer = require('../models/Offer');
        const usedOffersIds = req.user.usedOffers || [];

        const offers = await Offer.find({
            _id: { $in: usedOffersIds }
        }).sort({ updatedAt: -1 });

        res.json({ success: true, offers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// VERIFY COUPON CODE
router.post('/verify-coupon', authenticate, async (req, res) => {
    try {
        const { code } = req.body;
        const Offer = require('../models/Offer');
        const role = req.user.role;

        const offer = await Offer.findOne({
            code: code.toUpperCase(),
            status: 'Active',
            $or: [
                { targetRoles: { $in: [role, 'all', 'All'] } },
                { targetRoles: { $size: 0 } }
            ]
        });

        if (!offer) {
            return res.status(404).json({ success: false, error: 'Invalid or expired coupon code' });
        }

        res.json({
            success: true,
            discount: offer.discountValue,
            discountType: offer.discountType,
            minPurchase: offer.minPurchase,
            offerId: offer._id
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
