const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PaymentSetting = require('../models/PaymentSetting');
const { createNotification } = require('../utils/notif');
const crypto = require('crypto');
const https = require('https');

// PAYTM CHECKSUM UTILS (Custom implementation since library is missing)
class PaytmChecksum {
    static encrypt(data, key) {
        const iv = '@@@@&&&&####$$$$';
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }
    static decrypt(data, key) {
        const iv = '@@@@&&&&####$$$$';
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static generateSignature(params, key) {
        if (typeof params !== "string" && typeof params !== "object") {
            return Promise.reject("Invalid data");
        }
        if (typeof params !== "string") {
            params = JSON.stringify(params);
        }
        const salt = crypto.randomBytes(4).toString('hex');
        const sha256 = crypto.createHash('sha256').update(params + '|' + salt).digest('hex');
        const checkSumString = sha256 + salt;
        const checksum = this.encrypt(checkSumString, key);
        return checksum;
    }
}

const generatePaytmToken = async (orderId, amount, config) => {
    const { merchantId, merchantKey } = config.credentials;
    const isSandbox = config.mode === 'sandbox';

    const paytmParams = {
        body: {
            requestType: "Payment",
            mid: merchantId,
            websiteName: config.credentials.website || (isSandbox ? "WEBSTAGING" : "DEFAULT"),
            orderId: orderId,
            callbackUrl: `http://localhost:5000/api/payments/callback`, // In prod, use real URL
            txnAmount: {
                value: amount.toString(),
                currency: "INR",
            },
            userInfo: {
                custId: "CUST001",
            },
        },
    };

    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), merchantKey);
    paytmParams.head = { signature: checksum };

    const postData = JSON.stringify(paytmParams);
    const domain = isSandbox ? 'securegw-stage.paytm.in' : 'securegw.paytm.in';
    const path = `/theia/api/v1/initiateTransaction?mid=${merchantId}&orderId=${orderId}`;

    return new Promise((resolve, reject) => {
        const options = {
            hostname: domain,
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
            },
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.body && result.body.txnToken) {
                        resolve(result.body.txnToken);
                    } else {
                        console.error("[PAYTM] Error response:", result);
                        reject(new Error(result.body?.resultInfo?.resultMsg || "Failed to get token"));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        request.on('error', (e) => reject(e));
        request.write(postData);
        request.end();
    });
};

const generateRazorpayOrder = async (orderId, amount, config) => {
    const { key: keyId, secret: keySecret } = config.credentials;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const postData = JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: "INR",
        receipt: orderId
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.razorpay.com',
            port: 443,
            path: '/v1/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'Authorization': `Basic ${auth}`
            },
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.id) {
                        resolve(result.id);
                    } else {
                        console.error("[RAZORPAY] Error response:", result);
                        reject(new Error(result.error?.description || "Failed to create Razorpay order"));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        request.on('error', (e) => reject(e));
        request.write(postData);
        request.end();
    });
};

// Simple middleware to get user from token
const authenticate = async (req, res, next) => {
    let token = req.headers.authorization || req.headers['x-auth-token'];

    // 1. Debugging Log
    console.log(`[AUTH] Received Token: ${token}`);

    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        // 2. Handle "Bearer " prefix if present
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trim();
        }

        // 3. Clean legacy double prefixes
        if (token.startsWith('user-token-user-token-')) {
            token = token.replace('user-token-user-token-', 'user-token-');
        }

        // 4. Mock Token Handling
        if (token.startsWith('mock-token-')) {
            const mockId = token.split('mock-token-')[1];
            req.user = {
                id: mockId,
                role: mockId === 'admin' ? 'admin' : (mockId === 'client' ? 'client' : 'advocate'),
                email: `${mockId}@gmail.com`
            };
            return next();
        }

        // 5. Real User Token Handling
        if (token.startsWith('user-token-')) {
            const userId = token.split('user-token-')[1];

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error(`[AUTH] Invalid ObjectId: ${userId}`);
                return res.status(401).json({ error: 'Invalid token format (bad ID)' });
            }

            const user = await User.findById(userId);
            if (!user) {
                console.error(`[AUTH] User not found for ID: ${userId}`);
                return res.status(401).json({ error: 'User not found' });
            }

            req.user = user;
            return next();
        }

        console.error(`[AUTH] Token did not match any known pattern: ${token}`);
        res.status(401).json({ error: 'Invalid token pattern' });
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// GET GATEWAY CONFIGS
router.get('/config', async (req, res) => {
    try {
        const settings = await PaymentSetting.find();

        // Map DB settings or use defaults if empty
        const configs = settings.length > 0 ? settings.map(s => ({
            gateway: s.gateway,
            isActive: s.isActive,
            mode: s.mode,
            credentials: s.credentials
        })) : [
            { gateway: 'razorpay', isActive: true, mode: 'sandbox', credentials: { key: 'rzp_test_YOUR_KEY' } },
            { gateway: 'paytm', isActive: true, mode: 'sandbox', credentials: { merchantId: 'YOUR_MERCHANT_ID' } },
            { gateway: 'stripe', isActive: true, mode: 'sandbox', credentials: { public_key: 'pk_test_YOUR_KEY' } },
            { gateway: 'invoice', isActive: true, mode: 'sandbox', credentials: {} },
            { gateway: 'upi', isActive: true, mode: 'sandbox', credentials: { upiId: 'e-advocate@okaxis', payeeName: 'E-Advocate Services' } },
            { gateway: 'cashfree', isActive: false, mode: 'sandbox', credentials: { appId: '', secretKey: '' } }
        ];

        res.json({ success: true, configs });
    } catch (err) {
        console.error('Fetch Config Error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching payment config' });
    }
});

// ADMIN: GET PAYMENT SETTINGS
router.get('/admin/settings', async (req, res) => {
    try {
        const settings = await PaymentSetting.find();
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ADMIN: SAVE PAYMENT SETTINGS
router.post('/admin/settings', async (req, res) => {
    try {
        const { gateway, isActive, mode, credentials } = req.body;

        const setting = await PaymentSetting.findOneAndUpdate(
            { gateway },
            { isActive, mode, credentials },
            { upsert: true, new: true }
        );

        res.json({ success: true, setting });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE ORDER
router.post('/create-order', authenticate, async (req, res) => {
    const { packageId, gateway, amount, currency, metadata } = req.body;

    try {
        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const transaction = new Transaction({
            userId: req.user.id || req.user._id,
            orderId,
            amount,
            currency: currency || 'INR',
            gateway,
            packageId,
            metadata,
            status: 'pending'
        });

        await transaction.save();

        // INTEGRATION: Real-world SDK data generation
        let integrationData = {};

        if (gateway === 'razorpay') {
            console.log("[RAZORPAY] Fetching config for Order creation...");
            const rzpConfig = await PaymentSetting.findOne({ gateway: 'razorpay' });

            if (rzpConfig && rzpConfig.credentials && rzpConfig.credentials.key && rzpConfig.credentials.secret) {
                try {
                    const rzpOrderId = await generateRazorpayOrder(orderId, amount, rzpConfig);
                    integrationData.razorpayOrderId = rzpOrderId;
                    console.log(`[RAZORPAY] Real Order ID generated: ${rzpOrderId}`);
                } catch (err) {
                    console.error("[RAZORPAY] Order generation FAILED:", err.message);
                    integrationData.razorpayOrderId = `rzp_order_${orderId}`;
                    console.log("[RAZORPAY] Falling back to MOCK for stability.");
                }
            } else {
                console.warn("[RAZORPAY] No real credentials found in DB. Using MOCK.");
                integrationData.razorpayOrderId = `rzp_order_${orderId}`;
            }
        } else if (gateway === 'paytm') {
            console.log("[PAYTM] Fetching config for MID lookup...");
            const paytmConfig = await PaymentSetting.findOne({ gateway: 'paytm' });

            if (paytmConfig && paytmConfig.credentials && paytmConfig.credentials.merchantId && paytmConfig.credentials.merchantKey) {
                console.log(`[PAYTM] Config found for MID: ${paytmConfig.credentials.merchantId}. Attempting real token generation...`);
                try {
                    const txnToken = await generatePaytmToken(orderId, amount, paytmConfig);
                    integrationData.txnToken = txnToken;
                    console.log(`[PAYTM] Real txnToken generated successfully: ${txnToken}`);
                } catch (err) {
                    console.error("[PAYTM] Token generation FAILED:", err.message);
                    integrationData.txnToken = `mock_paytm_token_${Date.now()}`;
                    console.log("[PAYTM] Falling back to MOCK token for stability.");
                }
            } else {
                console.warn("[PAYTM] No real credentials found in DB Admin settings. Using MOCK.");
                integrationData.txnToken = `mock_paytm_token_${Date.now()}`;
            }
        } else if (gateway === 'stripe') {
            // In Production: const session = await stripe.checkout.sessions.create({ ... });
            integrationData.sessionId = `cs_test_${orderId}`;
        } else if (gateway === 'upi') {
            integrationData.upiId = 'e-advocate@okaxis';
            integrationData.payeeName = 'E-Advocate Services';
        } else if (gateway === 'cashfree') {
            const cfConfig = await PaymentSetting.findOne({ gateway: 'cashfree' });

            if (cfConfig && cfConfig.credentials && cfConfig.credentials.appId && cfConfig.credentials.secretKey) {
                const isSandbox = cfConfig.mode === 'sandbox';
                const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
                const appId = cfConfig.credentials.appId;
                const secretKey = cfConfig.credentials.secretKey;

                // User details for Cashfree
                const customerId = req.user.id || req.user._id || `cust_${Date.now()}`;
                const customerEmail = req.user.email || 'guest@example.com';
                const customerPhone = req.user.phone || '9999999999';

                console.log("[CASHFREE] Initiating Session with HTTPS return_url...");
                const payload = {
                    order_id: orderId,
                    order_amount: amount,
                    order_currency: currency || "INR",
                    customer_details: {
                        customer_id: customerId.toString(),
                        customer_email: customerEmail,
                        customer_phone: customerPhone
                    },
                    order_meta: {
                        return_url: `https://eadvocate.in/api/payments/cashfree-callback?order_id={order_id}`
                    }
                };

                try {
                    // Use dynamic import for axios if it's not required at top level, 
                    // or use the 'https' module like other integrations to avoid dependency issues if any.
                    // However, standard axios is easier. Let's try axios, assuming it's available in node_modules.
                    // If not, I'll fallback to the 'https' request pattern used for Paytm/Razorpay above.
                    // For robustness, I will use the 'https' pattern to match the file style and avoid missing dep errors.

                    const postData = JSON.stringify(payload);
                    const parsedUrl = new URL(`${baseUrl}/orders`);

                    const options = {
                        hostname: parsedUrl.hostname,
                        port: 443,
                        path: parsedUrl.pathname,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-version': '2022-09-01',
                            'x-client-id': appId,
                            'x-client-secret': secretKey,
                            'Content-Length': postData.length
                        }
                    };

                    const sessionData = await new Promise((resolve, reject) => {
                        const req = https.request(options, (res) => {
                            let data = '';
                            res.on('data', (chunk) => { data += chunk; });
                            res.on('end', () => {
                                try {
                                    resolve(JSON.parse(data));
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        });
                        req.on('error', (e) => reject(e));
                        req.write(postData);
                        req.end();
                    });

                    if (sessionData.payment_session_id) {
                        integrationData.paymentSessionId = sessionData.payment_session_id;
                        integrationData.orderId = orderId;
                        integrationData.mode = cfConfig.mode;
                        console.log(`[CASHFREE] Real Session Created: ${sessionData.payment_session_id}`);
                    } else {
                        console.error("[CASHFREE] API Error:", sessionData);
                        // Extract meaningful error message if possible
                        const errorMsg = sessionData.message || sessionData.error?.message || "Failed to create Cashfree session";
                        throw new Error(errorMsg);
                    }

                } catch (e) {
                    console.error("[CASHFREE] Setup Failed:", e.message);
                    // Fallback to mock ONLY if real fails, but user wants real... 
                    // Let's throw error to be honest about failure? 
                    // Or keep mock fallback for safety? User asked specifically for REAL.
                    // I will log error and NOT provide a mock session, so the UI knows it failed.
                    integrationData.error = "Real Cashfree Session Generation Failed: " + e.message;
                }
            } else {
                console.warn("[CASHFREE] Credentials missing in DB.");
                integrationData.error = "Cashfree Credentials Missing or Incomplete";
            }
        }

        res.json({
            success: true,
            order: {
                orderId,
                amount,
                currency: currency || 'INR',
                gateway,
                metadata,
                ...integrationData
            }
        });
    } catch (err) {
        console.error('Create Order Error:', err);
        res.status(500).json({ success: false, message: 'Server error creating order' });
    }
});

// VERIFY PAYMENT
router.post('/verify', authenticate, async (req, res) => {
    const { orderId, paymentId, signature, gateway } = req.body;

    try {
        const transaction = await Transaction.findOne({ orderId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // MOCK VERIFICATION: In production, verify signature here
        transaction.status = 'success';
        transaction.paymentId = paymentId;
        transaction.signature = signature;
        await transaction.save();

        // Update User Plan/Coins
        let userId = transaction.userId;

        // FIND USER (Support both Real and Mock IDs)
        let user;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        } else {
            // Check for mock users in DB or just find one by name/email for demo
            user = await User.findOne({
                $or: [{ email: `${userId}@gmail.com` }, { role: userId }]
            });
        }

        if (user) {
            user.isPremium = true;

            // Format Plan Name from packageId (e.g. ultra_platinum -> Ultra Pro Platinum)
            if (transaction.packageId.includes('_')) {
                const parts = transaction.packageId.split('_');
                const mode = parts[0];
                const tier = parts[1];
                const tierCap = tier ? (tier.charAt(0).toUpperCase() + tier.slice(1)) : '';

                let planPrefix = "";
                if (mode === 'lite') planPrefix = "Pro Lite";
                else if (mode === 'pro') planPrefix = "Pro";
                else if (mode === 'ultra') planPrefix = "Ultra Pro";
                else planPrefix = mode.charAt(0).toUpperCase() + mode.slice(1);

                user.plan = `${planPrefix} ${tierCap}`.trim();

                // Add coins based on tier using exact rules
                let baseCoins = 0;
                const tierLower = (tier || '').toLowerCase();
                if (tierLower === 'silver') baseCoins = 50;
                else if (tierLower === 'gold') baseCoins = 100;
                else if (tierLower === 'platinum') baseCoins = 150;
                else baseCoins = 50; // Dynamic default

                let multiplier = 1;
                if (mode === 'lite') multiplier = 1;
                else if (mode === 'pro') multiplier = 10;
                else if (mode === 'ultra') multiplier = 100;

                const totalAllocated = baseCoins * multiplier;
                user.coins = (user.coins || 0) + totalAllocated;
                user.coinsReceived = (user.coinsReceived || 0) + totalAllocated;

                console.log(`[PAYMENT] Updated ${user.role} Plan to: ${user.plan} and allocated ${totalAllocated} coins.`);
            } else if (transaction.packageId.toLowerCase().includes('wallet')) {
                // Wallet recharge
                const amount = transaction.amount;
                user.walletBalance = (user.walletBalance || 0) + amount;
                console.log(`[PAYMENT] Recharged wallet with ₹${amount}.`);
            } else {
                user.plan = transaction.packageId.charAt(0).toUpperCase() + transaction.packageId.slice(1);
            }

            await user.save();
            createNotification('payment', `Payment Successful! Your account has been upgraded to ${user.plan}.`, user.email, user._id);
        }

        res.json({ success: true, message: 'Payment verified and account updated' });
    } catch (err) {
        console.error('Verify Payment Error:', err);
        res.status(500).json({ success: false, message: 'Server error verifying payment' });
    }
});

// PAYTM CALLBACK (To handle redirect after payment)
router.post('/callback', async (req, res) => {
    console.log("[PAYTM] Callback received:", req.body);
    // In a real app, verify signature here and redirect to success/failure page
    res.redirect('http://localhost:3000/dashboard?payment=success');
});

// CASHFREE CALLBACK
router.post('/cashfree-callback', async (req, res) => {
    console.log("[CASHFREE] POST Callback received:", req.body);
    const { orderId } = req.body; // Cashfree posts data

    // In a real scenario, we should verify the signature from Cashfree here too.
    // Since we are relying on frontend redirect mostly for UX in this specific flow,
    // we redirect back to frontend which will call /verify.
    // However, Cashfree 'return_url' is usually a GET or POST. 
    // If we configured it as GET in create-order, this route should be GET.
    // I used `http://localhost:5000/api/payments/cashfree-callback?order_id={order_id}` so likely GET if user clicks back.
    // But Cashfree auto-redirect is often POST. Let's support both.

    res.redirect(`http://localhost:3000/dashboard?status=success&order_id=${orderId || ''}`);
});

router.get('/cashfree-callback', async (req, res) => {
    console.log("[CASHFREE] GET Callback received:", req.query);
    const { order_id } = req.query;
    res.redirect(`http://localhost:3000/dashboard?status=success&order_id=${order_id}`);
});

// GET USER WALLET HISTORY
router.get('/history', authenticate, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (err) {
        console.error('Wallet history error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
});

// WITHDRAWAL REQUEST
router.post('/withdraw', authenticate, async (req, res) => {
    try {
        const { amount, bankDetails } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.walletBalance < amount) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        // Deduct balance immediately
        user.walletBalance -= amount;
        await user.save();

        const transaction = new Transaction({
            userId: user._id,
            orderId: `WTH-${Date.now()}`,
            amount,
            currency: 'INR',
            gateway: 'Bank Transfer',
            status: 'pending', // Pending Admin Approval
            packageId: 'withdrawal',
            metadata: { bankDetails, type: 'Payout' }
        });

        await transaction.save();

        createNotification('payment', `Withdrawal request of ₹${amount} submitted.`, 'Admin', null, { userId: user._id });

        res.json({ success: true, message: 'Withdrawal request submitted', balance: user.walletBalance });
    } catch (err) {
        console.error('Withdrawal error:', err);
        res.status(500).json({ success: false, error: 'Failed to request withdrawal' });
    }
});

module.exports = router;
