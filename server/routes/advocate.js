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
    { name: 'adr-practiceLicense', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]);

// Helper to generate unique ID
async function generateAdvocateId(role = 'advocate') {
    let id;
    let exists = true;
    // TP-EAD-LAS for Legal Advisor (legal_provider), TP-EAD-ADV for Advocate
    const prefix = (role === 'legal_provider') ? 'TP-EAD-LAS' : 'TP-EAD-ADV';

    while (exists) {
        // 4 digits: 1000 to 9999
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        id = `${prefix}${randomNum}`;
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
            role: req.body.role || 'advocate',
            status: 'Pending', // Needs admin verification
            myReferralCode,
            referredBy
        });

        // 2. Generate Unique Advocate ID
        const advId = await generateAdvocateId(req.body.role);

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
            },
            signaturePath: files['signature'] ? files['signature'][0].path : null
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
        const { search, specialization, court, state, city, experience, languages, category } = req.query;

        // 1. Detect Viewer Plan (Auth Optional)
        let viewerIsPremium = false;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
            if (token && token.startsWith('user-token-')) {
                const userId = token.replace('user-token-', '');
                if (require('mongoose').Types.ObjectId.isValid(userId)) {
                    const viewer = await User.findById(userId);
                    if (viewer) {
                        const planStr = (viewer.plan || '').toLowerCase();
                        if (viewer.isPremium || (planStr !== 'free' && planStr !== '')) {
                            viewerIsPremium = true;
                        }
                    }
                }
            }
        }
        // Admin Override (for testing)
        if (authHeader && (authHeader.includes('admin') || authHeader.includes('mock'))) viewerIsPremium = true;

        let query = { verified: true };
        const conditions = [];

        const buildCondition = (field, value) => {
            if (!value || value === 'Select Court' || value === 'Department' || value === 'Select States' || value === 'Select Cities' || value === 'Experience') return null;
            const terms = value.split(',').map(t => t.trim()).filter(t => t);
            if (terms.length === 0) return null;
            if (terms.length === 1) return { [field]: { $regex: terms[0], $options: 'i' } };
            return { $or: terms.map(term => ({ [field]: { $regex: term, $options: 'i' } })) };
        };

        if (search) {
            conditions.push({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { 'practice.specialization': { $regex: search, $options: 'i' } },
                    { unique_id: { $regex: search, $options: 'i' } }
                ]
            });
        }

        const specCond = buildCondition('practice.specialization', specialization);
        if (specCond) conditions.push(specCond);
        const courtCond = buildCondition('practice.court', court);
        if (courtCond) conditions.push(courtCond);
        const stateCond = buildCondition('location.state', state);
        if (stateCond) conditions.push(stateCond);
        const cityCond = buildCondition('location.city', city);
        if (cityCond) conditions.push(cityCond);
        const expCond = buildCondition('practice.experience', experience);
        if (expCond) conditions.push(expCond);
        const langCond = buildCondition('career.languages', languages);
        if (langCond) conditions.push(langCond);

        if (conditions.length > 0) query.$and = conditions;

        let dbAdvocates = await Advocate.find(query).populate('userId', 'plan planType planTier isPremium');

        // Helper: Strict Plan Weight Hierarchy (Rule 4)
        const getPlanWeight = (user) => {
            if (!user) return 0;
            if (!user.isPremium) return 0;

            let score = 0;
            const type = (user.planType || '').toLowerCase();
            const tier = (user.planTier || '').toLowerCase();

            // Type Order: Ultra Pro (300) > Pro (200) > Pro Lite (100)
            if (type.includes('ultra pro')) score += 3000;
            else if (type.includes('pro')) score += 2000;
            else if (type.includes('pro lite')) score += 1000;

            // Tier Order: Platinum (300) > Gold (200) > Silver (100)
            if (tier === 'platinum') score += 300;
            else if (tier === 'gold') score += 200;
            else if (tier === 'silver') score += 100;

            return score;
        };

        if (category === 'featured') {
            // Rule 3: Featured Profiles = Premium advocates only
            dbAdvocates = dbAdvocates.filter(adv => adv.userId?.isPremium);
            dbAdvocates.sort((a, b) => getPlanWeight(b.userId) - getPlanWeight(a.userId));
        } else if (category === 'normal') {
            // Rule 3: Normal Profiles = Free advocates only
            dbAdvocates = dbAdvocates.filter(adv => !adv.userId?.isPremium);
        }

        const advocates = dbAdvocates.map(adv => {
            const user = adv.userId;
            const isPremium = user?.isPremium || false;

            // MASKING LOGIC
            // If viewer is NOT premium AND listing is Featured (Premium), we might show it (as per "Profile List... Profile image blurred"). 
            // WAIT - "Normal Profiles: Advocates on Free plan only", "Featured: Advocates on any premium plan". 
            // "Free clients: Cannot see contact info". 
            // "Profile List (Normal & Featured)... Profile image: blurred... Name: show first 2 chars".
            // This applies to ALL profiles if the VIEWER is FREE.

            const shouldMask = !viewerIsPremium;

            let displayName = adv.name || `${adv.firstName} ${adv.lastName}`;
            let displayId = adv.unique_id || 'N/A';
            let displayImage = adv.profilePicPath ? `/${adv.profilePicPath.replace(/\\/g, '/')}` : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

            // Mask details if viewer is Free
            if (shouldMask) {
                // Name: first 2 chars
                displayName = displayName.substring(0, 2) + '...';
                displayId = displayId.substring(0, 2) + '...';
                // Image: We send a flag or the frontend blurs it. 
                // Spec say "Profile image: blurred".
                // We'll add a flag `isBlurred: true` so frontend applies CSS filter.
            }

            return {
                id: adv._id,
                userId: user?._id || adv.userId, // RULE: Always expose User ID for interactions
                unique_id: adv.unique_id, // RULE FIX: Never mask routing ID
                name: displayName,
                display_id: displayId, // Masked version for UI if needed
                location: adv.location?.city ? `${adv.location.city}, ${adv.location.state}` : (adv.location?.state || 'Unknown'),
                experience: adv.practice?.experience || '0 Years',
                specialties: adv.practice?.specialization ? [adv.practice.specialization] : [],
                bio: shouldMask ? '' : (adv.career?.bio || ''), // Hide bio if masked
                image_url: displayImage,
                isFeatured: isPremium,
                isMasked: shouldMask // Frontend uses this to apply blur/lock UI
            };
        });

        res.json({ success: true, advocates });
    } catch (err) {
        console.error('Advocate fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Current Advocate Profile (Me)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1]; // "user-token-ID"
        if (!token || !token.startsWith('user-token-')) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const userId = token.replace('user-token-', '');
        const advocate = await Advocate.findOne({ userId });

        if (!advocate) {
            return res.status(404).json({ success: false, error: 'Advocate profile not found' });
        }

        res.json({
            success: true,
            advocate: {
                ...advocate.toObject(),
                image_url: advocate.profilePicPath ? `/${advocate.profilePicPath.replace(/\\/g, '/')}` : null
            }
        });
    } catch (err) {
        console.error('Fetch Me Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single advocate by unique_id OR _id
router.get('/:uniqueId', async (req, res) => {
    try {
        const { uniqueId } = req.params;
        let query = { unique_id: uniqueId };

        // Check if input is a valid MongoDB ObjectId
        if (require('mongoose').Types.ObjectId.isValid(uniqueId)) {
            query = { _id: uniqueId };
        }

        // If query failed with _id, try unique_id fallback?
        // Actually, if it looks like an ObjectId, we search by _id. 
        // If nothing found, it returns null. 
        // But some unique_ids might be coincidental hex? Unlikely (TP-EAD...).
        // A robust way: $or: [{unique_id: uniqueId}, {_id: ...}] if valid.

        if (require('mongoose').Types.ObjectId.isValid(uniqueId)) {
            query = { $or: [{ _id: uniqueId }, { unique_id: uniqueId }, { userId: uniqueId }] };
        } else {
            query = { unique_id: uniqueId };
        }

        const advocate = await Advocate.findOne(query).populate('userId', 'plan planType planTier isPremium');

        if (!advocate) {
            return res.status(404).json({ success: false, error: 'Advocate not found' });
        }

        // 1. Detect Viewer Plan
        let viewerIsPremium = false;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
            if (token && token.startsWith('user-token-')) {
                const userId = token.replace('user-token-', '');
                if (require('mongoose').Types.ObjectId.isValid(userId)) {
                    const viewer = await User.findById(userId);
                    if (viewer) {
                        const planStr = (viewer.plan || '').toLowerCase();
                        if (viewer.isPremium || (planStr !== 'free' && planStr !== '')) {
                            viewerIsPremium = true;
                        }
                    }
                }
            }
        }
        if (authHeader && (authHeader.includes('admin') || authHeader.includes('mock'))) viewerIsPremium = true;

        const plan = advocate.userId?.plan || 'Free';
        const isFeatured = advocate.userId?.isPremium || false;

        // MASKING
        const shouldMask = !viewerIsPremium; // Strictly mask for ALL profiles if viewer is Free

        let displayName = advocate.name || `${advocate.firstName} ${advocate.lastName}`;
        let displayId = advocate.unique_id;
        let displayImage = advocate.profilePicPath ? `/${advocate.profilePicPath.replace(/\\/g, '/')}` : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';
        let bio = advocate.career?.bio || '';

        if (shouldMask) {
            displayName = displayName.substring(0, 2) + '...';
            displayId = displayId.substring(0, 2) + '...';
            bio = ''; // Hide Bio
            // Image blurring handled by frontend isMasked flag
        }

        const formattedAdvocate = {
            id: advocate._id,
            userId: advocate.userId?._id || advocate.userId,
            unique_id: advocate.unique_id, // RULE FIX: Never mask routing ID
            name: displayName,
            display_id: displayId,
            firstName: shouldMask ? displayName : advocate.firstName,
            lastName: shouldMask ? '' : advocate.lastName, // Hide full last name
            gender: advocate.gender,
            location: advocate.location?.city ? `${advocate.location.city}, ${advocate.location.state}` : (advocate.location?.state || 'Unknown'),
            experience: advocate.practice?.experience || '0 Years',
            specialties: advocate.practice?.specialization ? [advocate.practice.specialization] : [],
            bio: bio,
            education: shouldMask ? null : advocate.education, // Hide details
            practice: shouldMask ? null : advocate.practice, // Hide details
            availability: shouldMask ? null : advocate.availability, // Hide details
            image_url: displayImage,
            isFeatured: isFeatured,
            isMasked: shouldMask
        };

        res.json({ success: true, advocate: formattedAdvocate });
    } catch (err) {
        console.error('Single advocate fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE ADVOCATE PROFILE
router.put('/update/:uniqueId', upload.single('profilePic'), async (req, res) => {
    try {
        const { uniqueId } = req.params;
        let updateData = req.body;
        console.log(`[UPDATE DEBUG] Request for UniqueID: ${uniqueId}`);
        console.log(`[UPDATE DEBUG] RAW Payload:`, JSON.stringify(updateData, null, 2));

        const advocate = await Advocate.findOne({ unique_id: uniqueId });
        console.log(`[UPDATE] Found advocate: ${advocate?._id}`);
        if (!advocate) return res.status(404).json({ error: 'Advocate not found' });

        if (updateData.firstName) advocate.firstName = updateData.firstName;
        if (updateData.lastName) advocate.lastName = updateData.lastName;
        if (updateData.name) advocate.name = updateData.name;
        // Mobile update needs care, but allowing as per request
        if (updateData.mobile) advocate.mobile = updateData.mobile;

        if (updateData.gender) advocate.gender = updateData.gender;
        if (updateData.dob) advocate.dob = updateData.dob;
        if (updateData.idProofType) advocate.idProofType = updateData.idProofType;

        if (updateData.location) advocate.location = { ...advocate.location, ...updateData.location };
        if (updateData.education) advocate.education = { ...advocate.education, ...updateData.education };
        if (updateData.practice) advocate.practice = { ...advocate.practice, ...updateData.practice };
        if (updateData.career) advocate.career = { ...advocate.career, ...updateData.career };

        // --- File Upload Handling ---
        if (req.file) {
            advocate.profilePicPath = req.file.path;
            console.log(`[UPDATE ADVOCATE] Updated Profile Pic: ${req.file.path}`);
        }

        const savedAdvocate = await advocate.save();
        console.log(`[UPDATE DEBUG] Saved Advocate Name: ${savedAdvocate.name}`);
        console.log(`[UPDATE DEBUG] Saved Advocate FirstName: ${savedAdvocate.firstName}`);

        if (savedAdvocate.userId && savedAdvocate.name) {
            const User = require('../models/User'); // Ensure import
            await User.findByIdAndUpdate(savedAdvocate.userId, { name: savedAdvocate.name });
            console.log(`[UPDATE DEBUG] Synced name to User model`);
        }

        res.json({ success: true, advocate: savedAdvocate });
    } catch (err) {
        console.error('Update Advocate Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
