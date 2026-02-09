const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const Otp = require('../models/Otp');
const { sendEmail } = require('../utils/mailer');
const { createNotification } = require('../utils/notif');
const authMiddleware = require('../middleware/auth');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/cloudinary');



// LOGIN
router.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    const { password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        let user = await User.findOne({ email });

        // If not found by email, try searching by staffId in StaffProfile
        if (!user) {
            const profile = await StaffProfile.findOne({ staffId: email });
            if (profile) {
                user = await User.findById(profile.userId);
            }
        }

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

            // NOTIFICATION: LOGIN (Background)
            createNotification('login', `${user.email} logged in`, user.email, user._id).catch(err => {
                console.error("Login Notification Error:", err.message);
            });

            let uniqueId = null;
            let displayName = user.email;
            let userImage = null;
            let rejectionReason = null;

            if (user.role === 'advocate' || user.role === 'legal_provider') {
                const Advocate = require('../models/Advocate');
                const advocate = await Advocate.findOne({ userId: user._id });
                if (advocate) {
                    uniqueId = advocate.unique_id;
                    displayName = advocate.name || advocate.firstName + ' ' + advocate.lastName;
                    userImage = advocate.profilePicPath ? `/${advocate.profilePicPath.replace(/\\/g, '/')}` : null;
                    rejectionReason = advocate.rejectionReason;
                }
            } else if (user.role === 'client') {
                const Client = require('../models/Client');
                const client = await Client.findOne({ userId: user._id });
                if (client) {
                    uniqueId = client.unique_id;
                    displayName = client.firstName ? `${client.firstName} ${client.lastName}` : user.email;
                    userImage = client.profilePicPath ? `/${client.profilePicPath.replace(/\\/g, '/')}` : null;
                    rejectionReason = client.rejectionReason;
                }
            } else {
                // Check StaffProfile for rejection reason
                const profile = await StaffProfile.findOne({ userId: user._id });
                if (profile) {
                    rejectionReason = profile.rejectionReason;
                }
            }

            // CHECK STATUS AFTER PROFILE FETCH TO INCLUDE REASON
            if (['Blocked', 'Deactivated', 'Deleted'].includes(user.status)) {
                return res.status(403).json({
                    error: 'ACCOUNT_RESTRICTED',
                    message: `Your account is ${user.status}. Please contact support.`,
                    rejectionReason: rejectionReason
                });
            }

            if (['Pending', 'Reverify'].includes(user.status)) {
                return res.status(403).json({
                    error: 'ACCOUNT_PENDING',
                    message: `Your account is pending verification. Please check back later.`,
                    rejectionReason: rejectionReason
                });
            }

            return res.json({
                token: 'user-token-' + user._id,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: displayName,
                    unique_id: uniqueId || `TP-EAD-${user._id.toString().slice(-6).toUpperCase()}`,
                    image_url: userImage,
                    status: user.status,
                    rejectionReason: rejectionReason,
                    plan: user.plan || 'Free',
                    isPremium: (user.isPremium || (user.plan && user.plan.toLowerCase() !== 'free')) && (!user.demoExpiry || new Date() < new Date(user.demoExpiry)),
                    coins: (user.plan && user.plan.toLowerCase() === 'free') ? 0 : (user.coins || 0),
                    coinsReceived: user.coinsReceived || 0,
                    coinsUsed: user.coinsUsed || 0,
                    walletBalance: user.walletBalance || 0
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
        return res.status(500).json({ success: false, error: err.message, stack: err.stack });

    }
});

// GET CURRENT USER (Me)
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
    if (!token || !token.startsWith('user-token-')) {
        // Fallback for admin mock
        if (token === 'mock-token-admin') {
            return res.json({
                success: true,
                user: { id: '65a001', role: 'admin', name: 'Admin User', email: 'admin@gmail.com', plan: 'Pro Platinum', isPremium: true }
            });
        }
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const userId = token.replace('user-token-', '');
        let user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        // CHECK DEMO EXPIRY
        if (user.isPremium && user.plan.includes('Demo') && user.demoExpiry) {
            if (new Date() > new Date(user.demoExpiry)) {
                console.log(`[DEMO EXPIRED] User ${user.email} demo ended.`);
                user.plan = 'Free';
                user.isPremium = false;
                user.planType = 'Free';
                user.planTier = null;
                user.demoExpiry = null;
                user.coins = 0; // Forced coins = 0 on target plan change (Free)
                await user.save();
            }
        }

        // Forced check for any free plan
        if (user.plan && user.plan.toLowerCase() === 'free' && user.coins > 0) {
            user.coins = 0;
            await user.save();
        }

        let uniqueId = null;
        let displayName = user.email; // Default
        let userImage = null;
        let rejectionReason = null;

        if (user.role === 'advocate' || user.role === 'legal_provider') {
            const Advocate = require('../models/Advocate');
            const advocate = await Advocate.findOne({ userId: user._id });
            if (advocate) {
                uniqueId = advocate.unique_id;
                displayName = advocate.name || advocate.firstName + ' ' + advocate.lastName;
                userImage = advocate.profilePicPath ? `/${advocate.profilePicPath.replace(/\\/g, '/')}` : null;
            }
        } else if (user.role === 'client') {
            const Client = require('../models/Client');
            const client = await Client.findOne({ userId: user._id });
            if (client) {
                uniqueId = client.unique_id;
                displayName = client.firstName ? `${client.firstName} ${client.lastName}` : user.email;
                userImage = client.profilePicPath ? `/${client.profilePicPath.replace(/\\/g, '/')}` : null;
                rejectionReason = client.rejectionReason;
            }
        } else {
            const profile = await StaffProfile.findOne({ userId: user._id });
            if (profile) {
                rejectionReason = profile.rejectionReason;
            }
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: displayName,
                unique_id: uniqueId || `TP-EAD-${user._id.toString().slice(-6).toUpperCase()}`,
                image_url: userImage,
                status: user.status,
                rejectionReason: rejectionReason,
                plan: user.plan || 'Free',
                isPremium: (user.isPremium || (user.plan && user.plan.toLowerCase() !== 'free')) && (!user.demoExpiry || new Date() < new Date(user.demoExpiry)),
                coins: (user.plan && user.plan.toLowerCase() === 'free') ? 0 : (user.coins || 0),
                coinsReceived: user.coinsReceived || 0,
                coinsUsed: user.coinsUsed || 0,
                walletBalance: user.walletBalance || 0
            }
        });
    } catch (err) {
        console.error('Fetch Me Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ACTIVATE DEMO / TRIAL
router.post('/activate-demo', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Rule 14: Available once per year
        if (user.lastDemoDate) {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (user.lastDemoDate > oneYearAgo) {
                return res.status(400).json({ error: 'Demo trial already used this year. Available once per year.' });
            }
        }

        if (user.isPremium && !user.plan.includes('Trial')) {
            return res.status(400).json({ error: 'You are already on a Premium Plan.' });
        }

        // Activate Demo (Rule 14)
        // Plan: Pro Lite – Silver
        // Duration: 12 hours
        // Label: “Temporary – 1 Day Trial”
        user.plan = 'Temporary – 1 Day Trial';
        user.planType = 'Pro Lite';
        user.planTier = 'Silver';
        user.isPremium = true;
        user.demoUsed = true;
        user.lastDemoDate = new Date();
        user.demoExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 Hours

        // Initialize coins for demo usage
        if (user.coins < 5) {
            const topup = 5 - (user.coins || 0);
            user.coins = 5;
            user.coinsReceived = (user.coinsReceived || 0) + topup;
        }

        await user.save();
        createNotification('system', `Demo activated: ${user.email}`, user.email, user._id);

        res.json({ success: true, message: 'Temporary – 1 Day Trial activated (12 Hours)', user });

    } catch (err) {
        console.error('Demo Activation Error:', err);
        res.status(500).json({ error: 'Server error' });

    }
});

// SEND OTP
router.post('/send-otp', async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    const { checkUnique } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        if (checkUnique) {
            const user = await User.findOne({ email });
            if (user) return res.status(400).json({ error: 'Email already registered. Please login or use a different email.' });
        }

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
            console.error('Mail Send Failed:', mailResult.error);
            // Return the specific error from mailer (e.g. invalid login, timeout)
            res.status(500).json({ error: 'Failed to send email: ' + mailResult.error });
        }
    } catch (err) {
        console.error('Send OTP Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    const { otp } = req.body;
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
    const email = req.body.email ? req.body.email.toLowerCase() : '';
    const { password, role, referredBy } = req.body;

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
            plainPassword: password, // Storing for admin visibility (Development Only)
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
                status: user.status,
                plan: user.plan || 'Free',
                isPremium: user.isPremium || false,
                coins: user.coins || 0,
                coinsReceived: user.coinsReceived || 0,
                coinsUsed: user.coinsUsed || 0
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
        user.plainPassword = password;

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

// CHANGE PASSWORD (Logged In)
router.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.plainPassword = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// RESUBMIT PROFILE DOCUMENTS
router.post('/resubmit-profile', authMiddleware, upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'license', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let profile;
        const role = user.role.toLowerCase();

        if (role === 'advocate' || role === 'legal_provider') {
            profile = await Advocate.findOne({ userId: user._id });
        } else if (role === 'client') {
            profile = await Client.findOne({ userId: user._id });
        } else {
            profile = await StaffProfile.findOne({ userId: user._id });
        }

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Update files in profile
        if (req.files['idProof']) {
            const filePath = `uploads/docs/${req.files['idProof'][0].filename}`;
            if (role === 'client') {
                profile.documentPath = filePath;
            } else if (role === 'advocate' || role === 'legal_provider') {
                profile.idProof = { docType: profile.idProofType || 'ID Proof', docPath: filePath };
            }
        }

        if (req.files['license'] && (role === 'advocate' || role === 'legal_provider')) {
            profile.practice.licensePath = `uploads/docs/${req.files['license'][0].filename}`;
        }

        if (req.files['certificate'] && (role === 'advocate' || role === 'legal_provider')) {
            profile.education.certificatePath = `uploads/docs/${req.files['certificate'][0].filename}`;
        }

        user.status = 'Reverify';
        await user.save();
        await profile.save();

        createNotification('profileUpdate', 'Your profile documents were resubmitted for verification.', 'System', user._id);

        res.json({ success: true, message: 'Profile resubmitted successfully. Status changed to Reverify.' });
    } catch (err) {
        console.error('Resubmit error:', err);
        res.status(500).json({ error: 'Server error during resubmission' });
    }
});

module.exports = router;
