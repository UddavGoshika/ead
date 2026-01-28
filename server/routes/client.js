const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Client = require('../models/Client');
const Otp = require('../models/Otp');
const { createNotification } = require('../utils/notif');

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

const cpUpload = upload.fields([
    { name: 'uploaddocument', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]);

// REGISTER CLIENT
router.post('/register', cpUpload, async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Verify OTP was completed for this email
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({ error: 'Please verify your email with OTP first' });
        }

        // 1. Create User first
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- Referral Logic ---
        let referredBy = null;
        const { referralCode } = req.body;
        if (referralCode) {
            const referrer = await User.findOne({ myReferralCode: referralCode.toUpperCase() });
            if (referrer) referredBy = referrer._id;
        }
        const myReferralCode = 'EA' + Math.random().toString(36).substring(2, 8).toUpperCase();

        user = await User.create({
            email,
            password: hashedPassword,
            role: 'client',
            status: 'Active', // Clients are usually active immediately
            myReferralCode,
            referredBy
        });

        // 2. Create Client Profile
        const clientData = {
            userId: user._id,
            firstName,
            lastName,
            gender: req.body.gender,
            dob: req.body.dob || null,
            mobile: req.body.mobile,
            email,
            documentType: req.body.documentType,
            documentPath: req.files && req.files['uploaddocument'] ? req.files['uploaddocument'][0].path : null,
            signaturePath: req.body.signatureData || (req.files && req.files['signature'] ? req.files['signature'][0].path : null),
            address: {
                country: req.body.country || 'India',
                state: req.body.state,
                city: req.body.city,
                office: req.body.officeAddress,
                permanent: req.body.permanentAddress,
                pincode: req.body.pincode
            },
            legalHelp: {
                category: req.body.category,
                specialization: req.body.specialization,
                subDepartment: req.body.subDepartment,
                mode: req.body.mode,
                advocateType: req.body.advocateType,
                languages: Array.isArray(req.body.languages) ? req.body.languages.join(', ') : req.body.languages,
                issueDescription: req.body.issueDescription
            }
        };

        const newClient = await Client.create(clientData);

        // NOTIFICATION: CLIENT REGISTRATION
        createNotification('registration', `New Client Registered: ${firstName} ${lastName} (${email})`, `${firstName} ${lastName}`, user._id);

        // Delete OTP record
        await Otp.deleteOne({ email });

        res.json({ success: true, clientId: newClient._id });

    } catch (err) {
        console.error('Client Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET ALL CLIENTS
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const dbClients = await Client.find(query);

        const formattedClients = dbClients.map(client => ({
            id: client._id,
            unique_id: `CL-${client._id.toString().slice(-4).toUpperCase()}`,
            name: `${client.firstName} ${client.lastName}`,
            location: client.address?.city ? `${client.address.city}, ${client.address.state}` : (client.address?.state || 'N/A'),
            experience: 'Client',
            specialization: 'Legal Help',
            img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
        }));

        res.json({ success: true, clients: formattedClients });
    } catch (err) {
        console.error('[BACKEND] Client fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
