const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendEmail } = require('../utils/mailer');
const { createNotification } = require('../utils/notif');

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

            // NOTIFICATION: LOGIN (Background)
            createNotification('login', `${user.email} logged in`, user.email, user._id).catch(err => {
                console.error("Login Notification Error:", err.message);
            });

            return res.json({
                token: 'user-token-' + user._id,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.email,
                    status: user.status
                }
            });
        }

        // Fallback for hardcoded demo accounts ONLY if user not in DB
        if (email === 'admin@gmail.com' && password === 'admin123') {
            return res.json({
                token: 'mock-token-admin',
                user: { id: '65a001', role: 'admin', name: 'Admin User', email: 'admin@gmail.com' }
            });
        }

        return res.status(400).json({ error: 'Invalid credentials' });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: 'Server error during login. Please check DB connection.' });
    }
});

// SEND OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to MongoDB (upsert)
        await Otp.findOneAndUpdate(
            { email },
            { otp, verified: false, createdAt: new Date() },
            { upsert: true, new: true }
        );
        console.log(`[OTP Send] Saved OTP for ${email}: ${otp}`);

        // Send Email with HTML formatting
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">E-Advocate Verification</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello,</p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">Your verification code is:</p>
                    
                    <div style="background-color: #f0f7ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                        <h1 style="color: #2563eb; font-size: 42px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                        <strong style="color: #dc2626;">⚠️ Security Notice:</strong> This code will expire in 5 minutes. 
                        Do not share this code with anyone.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            </div>
        `;

        const mailResult = await sendEmail(
            email,
            'Your E-Advocate Verification Code',
            `Your verification code is: ${otp}. This code will expire in 5 minutes. Don't share this OTP with anyone.`,
            emailHTML
        );

        if (mailResult.success) {
            res.json({ success: true, message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send email' });
        }
    } catch (err) {
        console.error('Send OTP Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        console.log(`[OTP Verify] Checking OTP for email: ${email}, OTP: ${otp}`);
        const otpDoc = await Otp.findOne({ email, otp });

        if (!otpDoc) {
            console.log(`[OTP Verify] No matching OTP found or OTP expired for ${email}`);
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        console.log(`[OTP Verify] OTP found and valid for ${email}`);
        // Mark as verified in MongoDB
        otpDoc.verified = true;
        await otpDoc.save();

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// REGISTER
router.post('/register', async (req, res) => {
    const { email, password, role, referredBy } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Check if referral code is valid
        let referredById = null;
        if (referredBy) {
            const referrer = await User.findOne({ myReferralCode: referredBy.toUpperCase() });
            if (referrer) referredById = referrer._id;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a new unique referral code for this user
        const myReferralCode = 'EA' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            status: (role === 'admin' || role === 'client') ? 'Active' : 'Pending', // Advocates usually need verification
            myReferralCode,
            referredBy: referredById
        });

        // NOTIFICATION: REGISTER
        createNotification('registration', `New ${role} registered: ${email}`, email, user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },
            token: 'user-token-' + user._id
        });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).send('Server error');
    }
});

// VALIDATE REFERRAL CODE
router.get('/validate-referral/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const referrer = await User.findOne({ myReferralCode: code.toUpperCase() });
        if (!referrer) {
            return res.status(404).json({ success: false, error: 'Invalid referral code' });
        }
        res.json({ success: true, referrerName: referrer.email, referrerId: referrer._id });
    } catch (err) {
        res.status(500).json({ error: 'Server error during validation' });
    }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User with this email does not exist.' });
        }

        // Generate reset token
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;

        const mailResult = await sendEmail(
            email,
            'Password Reset Request',
            `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `${resetUrl}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        );

        if (mailResult.success) {
            res.json({ success: true, message: 'Password reset link sent to your email.' });
        } else {
            res.status(500).json({ error: 'Failed to send reset email.' });
        }
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // Save new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send confirmation email
        await sendEmail(
            user.email,
            'Your password has been changed',
            `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
        );

        res.json({ success: true, message: 'Password has been reset successfully.' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
