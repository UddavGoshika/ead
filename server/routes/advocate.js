const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Otp = require('../models/Otp');
const { createNotification } = require('../utils/notif');

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

const advUpload = upload.fields([
    { name: 'adr-profilePic', maxCount: 1 },
    { name: 'adr-degreeCert', maxCount: 1 },
    { name: 'adr-idProof', maxCount: 1 },
    { name: 'adr-practiceLicense', maxCount: 1 }
]);

// Helper to generate unique ID
async function generateAdvocateId() {
    let id;
    let exists = true;
    while (exists) {
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
        id = `ADV-${randomNum}`;
        const existing = await Advocate.findOne({ unique_id: id });
        if (!existing) exists = false;
    }
    return id;
}

router.post('/register', (req, res, next) => {
    advUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({
                error: `File upload error: ${err.message}`,
                field: err.field
            });
        } else if (err) {
            console.error('Unknown Upload Error:', err);
            return res.status(500).json({ error: 'Upload failed' });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Verify OTP was completed for this email
        const otpRecord = await Otp.findOne({ email, otp: req.body.otp });
        if (!otpRecord || !otpRecord.verified) {
            // Check if it was verified even without the specific OTP in this request (fallback)
            const genericOtpRecord = await Otp.findOne({ email, verified: true });
            if (!genericOtpRecord) {
                return res.status(400).json({ error: 'Please verify your email with OTP first' });
            }
        }

        // Check if user exists
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

        // 1. Create User first
        user = await User.create({
            email,
            password: hashedPassword,
            role: 'advocate',
            status: 'Pending', // Needs admin verification
            myReferralCode,
            referredBy
        });

        // 2. Generate Unique Advocate ID
        const advId = await generateAdvocateId();

        // 3. Create Advocate Profile
        const files = req.files || {};
        const parseValue = (val) => {
            try {
                if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                    return JSON.parse(val);
                }
            } catch (e) { }
            return val;
        };

        const advocateData = {
            userId: user._id,
            unique_id: advId,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            gender: req.body.gender,
            mobile: req.body.mobile,
            email: email,
            dob: req.body.dob || null,
            idProofType: req.body.idProofType,
            profilePicPath: files['adr-profilePic'] ? files['adr-profilePic'][0].path : null,
            verified: false,
            education: {
                degree: req.body.degree,
                university: req.body.university,
                college: req.body.college,
                gradYear: req.body.passingYear,
                enrollmentNo: req.body.enrollmentNumber,
                certificatePath: files['adr-degreeCert'] ? files['adr-degreeCert'][0].path : null
            },
            practice: {
                court: req.body.courtOfPractice,
                experience: req.body.experienceRange,
                specialization: req.body.specialization,
                barState: req.body.stateBar,
                barAssociation: req.body.barAssociation,
                licensePath: files['adr-practiceLicense'] ? files['adr-practiceLicense'][0].path : null
            },
            location: {
                state: req.body.currState,
                city: req.body.currCity,
                pincode: req.body.currPincode,
                country: 'India'
            },
            career: {
                bio: req.body.careerBio,
                languages: Array.isArray(parseValue(req.body.languages)) ? parseValue(req.body.languages).join(', ') : req.body.languages
            },
            availability: {
                days: Array.isArray(parseValue(req.body.availableDays)) ? parseValue(req.body.availableDays) : [req.body.availableDays],
                timeSlots: [req.body.workStart, req.body.workEnd],
                consultationFee: req.body.consultFee ? Number(req.body.consultFee) : 0
            },
            idProof: {
                docType: req.body.idProofType,
                docPath: files['adr-idProof'] ? files['adr-idProof'][0].path : null
            }
        };

        const newAdvocate = await Advocate.create(advocateData);

        // NOTIFICATION: ADVOCATE REGISTRATION
        createNotification('registration', `New Advocate Registered: ${firstName} ${lastName} (${email})`, `${firstName} ${lastName}`, user._id);

        // Delete OTP record after successful registration
        await Otp.deleteOne({ email });

        res.json({ success: true, id: newAdvocate._id, advocateId: advId });

    } catch (err) {
        console.error('Advocate Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { verified: true };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'practice.specialization': { $regex: search, $options: 'i' } }
            ];
        }

        const dbAdvocates = await Advocate.find(query);

        const advocates = dbAdvocates.map(adv => ({
            id: adv._id,
            unique_id: adv.unique_id || 'N/A',
            name: adv.name || `${adv.firstName} ${adv.lastName}`,
            location: adv.location?.city ? `${adv.location.city}, ${adv.location.state}` : (adv.location?.state || 'Unknown'),
            experience: adv.practice?.experience || '0 Years',
            specialties: adv.practice?.specialization ? [adv.practice.specialization] : [],
            bio: adv.career?.bio || '',
            image_url: adv.profilePicPath ? `/${adv.profilePicPath.replace(/\\/g, '/')}` : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
        }));

        res.json({ success: true, advocates });
    } catch (err) {
        console.error('Advocate fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single advocate by unique_id
router.get('/:uniqueId', async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const advocate = await Advocate.findOne({ unique_id: uniqueId });

        if (!advocate) {
            return res.status(404).json({ success: false, error: 'Advocate not found' });
        }

        const formattedAdvocate = {
            id: advocate._id,
            unique_id: advocate.unique_id,
            name: advocate.name || `${advocate.firstName} ${advocate.lastName}`,
            firstName: advocate.firstName,
            lastName: advocate.lastName,
            gender: advocate.gender,
            location: advocate.location?.city ? `${advocate.location.city}, ${advocate.location.state}` : (advocate.location?.state || 'Unknown'),
            experience: advocate.practice?.experience || '0 Years',
            specialties: advocate.practice?.specialization ? [advocate.practice.specialization] : [],
            bio: advocate.career?.bio || '',
            education: advocate.education,
            practice: advocate.practice,
            availability: advocate.availability,
            image_url: advocate.profilePicPath ? `/${advocate.profilePicPath.replace(/\\/g, '/')}` : null
        };

        res.json({ success: true, advocate: formattedAdvocate });
    } catch (err) {
        console.error('Single advocate fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
