const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Otp = require('../models/Otp');
const UnlockedContact = require('../models/UnlockedContact');
const Relationship = require('../models/Relationship');
const { createNotification } = require('../utils/notif');
const { getImageUrl } = require('../utils/pathHelper');

// Storage config
const { upload } = require('../config/cloudinary');

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
    const prefix = (role === 'legal_provider') ? 'TP-EAD-LAS' : 'TP-EAD-ADV';

    while (exists) {
        // Generate exactly 4 random digits (1000-9999)
        const digits = Math.floor(1000 + Math.random() * 9000).toString();
        id = `${prefix}${digits}`;
        const existing = await Advocate.findOne({ unique_id: id });
        if (!existing) exists = false;
    }
    console.log(`[ID GEN] Generated UNIQUE ${role} ID: ${id}`);
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
        const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
        const { password, firstName, lastName } = req.body;
        // Check if user exists (Strict - One Email One Role)
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Email already registered. You cannot create multiple accounts/roles with the same email.' });
        }

        // Verify OTP was completed for this email
        const submittedOtp = req.body.otp || req.body.emailOtp;
        const otpRecord = await Otp.findOne({ email, otp: submittedOtp });
        if (!otpRecord || !otpRecord.verified) {
            // Check if it was verified even without the specific OTP in this request (fallback)
            const genericOtpRecord = await Otp.findOne({ email, verified: true });
            if (!genericOtpRecord) {
                return res.status(400).json({ error: 'Please verify your email with OTP first' });
            }
        }

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

        // 1. Create or Update User
        if (user) {
            user.password = hashedPassword;
            user.plainPassword = password;
            user.role = req.body.role || 'advocate';
            user.status = 'Pending';
            user.referredBy = referredBy;
            await user.save();
        } else {
            user = await User.create({
                email,
                password: hashedPassword,
                plainPassword: password,
                role: req.body.role || 'advocate',
                status: 'Pending',
                myReferralCode,
                referredBy
            });
        }

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
            signaturePath: files['signature'] ? files['signature'][0].path : null,
            legalDocumentation: Array.isArray(parseValue(req.body.legalDocumentation)) ? parseValue(req.body.legalDocumentation) : []
        };

        const newAdvocate = await Advocate.create(advocateData);

        // NOTIFICATION: ADVOCATE REGISTRATION
        createNotification('registration', `New Advocate Registered: ${firstName} ${lastName} (${email})`, `${firstName} ${lastName}`, user._id);

        // Delete OTP record after successful registration
        await Otp.deleteOne({ email });

        res.json({ success: true, id: newAdvocate._id, advocateId: advId, token: 'user-token-' + user._id });

    } catch (err) {
        console.error('Advocate Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const { search, specialization, court, state, city, experience, languages, category, excludeInteracted, excludeSelf, verified: verifiedQuery } = req.query;

        // 1. Detect Viewer Plan (Auth Optional)
        let viewerIsPremium = false;
        let viewerId = null;
        const authHeader = req.headers.authorization;
        // const User = require('../models/User'); // Ensure User is available - User is already imported at the top

        if (authHeader) {
            const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
            if (token && token.startsWith('user-token-')) {
                viewerId = token.replace('user-token-', '');
                if (require('mongoose').Types.ObjectId.isValid(viewerId)) {
                    const viewer = await User.findById(viewerId);
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

        let query = {};
        if (verifiedQuery === 'all') {
            // No verified filter
        } else if (verifiedQuery === 'false') {
            query.verified = false;
        } else {
            query.verified = true; // Default
        }

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

        // SERVER-DRIVEN FILTERING: Exclude Interacted Profiles
        if (viewerId) {
            if (excludeSelf !== 'false') {
                if (!query.$and) query.$and = [];
                query.$and.push({ userId: { $ne: viewerId } }); // Don't show self
            }

            if (excludeInteracted !== 'false') {
                const relationships = await Relationship.find({
                    $or: [{ user1: viewerId }, { user2: viewerId }],
                    state: { $nin: ['NONE', 'SHORTLISTED'] }
                });
                const excludedUserIds = relationships.map(rel =>
                    rel.user1.toString() === viewerId.toString() ? rel.user2 : rel.user1
                );

                if (excludedUserIds.length > 0) {
                    if (!query.$and) query.$and = [];
                    query.$and.push({ userId: { $nin: excludedUserIds } });
                }
            }
        }

        let dbAdvocates = await Advocate.find(query).populate('userId', 'plan planType planTier isPremium email phone privacySettings status role');

        // Filter out private profiles and deleted users
        dbAdvocates = dbAdvocates.filter(adv => {
            if (!adv.userId) return false;
            if (adv.userId.status === 'Deleted') return false;
            const privacy = adv.userId.privacySettings || { showProfile: true };
            return privacy.showProfile !== false;
        });

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

        // 5. FETCH UNLOCKED IDS FOR VIEWER
        let unlockedIds = new Set();
        if (viewerId) {
            const unlocked = await require('../models/UnlockedContact').find({ viewer_user_id: viewerId });
            unlocked.forEach(u => unlockedIds.add(u.profile_user_id.toString()));
        }

        const advocates = dbAdvocates.map(adv => {
            const user = adv.userId;
            const isPremium = user?.isPremium || false;

            const isUnlocked = unlockedIds.has(user?._id?.toString());
            const shouldMask = !viewerIsPremium && !isUnlocked;

            let displayName = adv.name || `${adv.firstName} ${adv.lastName}`;
            let displayId = adv.unique_id || 'N/A';
            let displayImage = getImageUrl(adv.profilePicPath) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

            return {
                id: adv._id,
                // Critical: expose real role so dashboards can include legal providers
                role: (user?.role || 'advocate'),
                userId: user?._id || adv.userId,
                unique_id: adv.unique_id,
                name: displayName,
                display_id: displayId,
                location: adv.location?.city ? `${adv.location.city}, ${adv.location.state}` : (adv.location?.state || 'Unknown'),
                experience: adv.practice?.experience || '0 Years',
                specialties: adv.practice?.specialization ? [adv.practice.specialization] : [],
                legalDocumentation: Array.isArray(adv.legalDocumentation) ? adv.legalDocumentation : [],
                verified: adv.verified === true,
                bio: shouldMask ? '' : (adv.career?.bio || ''),
                image_url: displayImage,
                isFeatured: isPremium,
                isMasked: shouldMask,
                specialization: adv.practice?.specialization || 'Legal Services',
                category: adv.practice?.specialization || 'General',
                bar_council_id: shouldMask ? 'XXXXXXXXXX' : (adv.education?.enrollmentNo || adv.practice?.barAssociation || 'N/A')
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
        const advocate = await Advocate.findOne({ userId }).populate('userId', 'privacySettings notificationSettings messageSettings');

        if (!advocate) {
            return res.status(404).json({ success: false, error: 'Advocate profile not found' });
        }

        res.json({
            success: true,
            advocate: {
                ...advocate.toObject(),
                image_url: getImageUrl(advocate.profilePicPath)
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
        let query = {};
        if (uniqueId.startsWith('TP-EAD-') || uniqueId.startsWith('ADV-')) {
            // Strict Unique ID lookup
            query = { unique_id: uniqueId };
            console.log(`[STRICT] Fetching by Unique ID: ${uniqueId}`);
        } else if (require('mongoose').Types.ObjectId.isValid(uniqueId)) {
            // Strict User/Object ID lookup
            query = { $or: [{ _id: uniqueId }, { userId: uniqueId }] };
            console.log(`[STRICT] Fetching by Object ID: ${uniqueId}`);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid ID format' });
        }

        const advocate = await Advocate.findOne(query).populate('userId', 'plan planType planTier isPremium email phone privacySettings notificationSettings messageSettings status');

        if (!advocate || (advocate.userId && advocate.userId.status === 'Deleted')) {
            return res.status(404).json({ success: false, error: 'Advocate not found or deleted' });
        }

        // 1. Detect Viewer
        let viewerIsPremium = false;
        let viewerIsAdvisor = false;
        let viewerId = null;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
            if (token && token.startsWith('user-token-')) {
                viewerId = token.replace('user-token-', '');
                if (require('mongoose').Types.ObjectId.isValid(viewerId)) {
                    const viewer = await User.findById(viewerId);
                    if (viewer) {
                        const planStr = (viewer.plan || '').toLowerCase();
                        if (viewer.isPremium || (planStr !== 'free' && planStr !== '')) {
                            viewerIsPremium = true;
                        }
                        if (viewer.role === 'legal_provider' || viewer.role === 'advocate') {
                            viewerIsAdvisor = true;
                        }
                    }
                }
            }
            if (authHeader.includes('admin') || authHeader.includes('mock')) {
                viewerIsPremium = true;
                viewerIsAdvisor = true;
            }
        }

        const isOwner = viewerId && viewerId.toString() === advocate.userId?._id?.toString();

        // 3. CHECK IF CONTACT UNLOCKED
        let contactUnlocked = false;
        if (viewerId) {
            const isUnlocked = await require('../models/UnlockedContact').findOne({
                viewer_user_id: viewerId,
                profile_user_id: advocate.userId?._id || advocate.userId
            });
            if (isUnlocked) contactUnlocked = true;
        }

        const shouldShowReal = isOwner || contactUnlocked || viewerIsAdvisor;

        // ALWAYS show contact info as per request to remove restrictions
        let contactInfo = {
            email: advocate.email || (advocate.userId && advocate.userId.email) || 'N/A',
            mobile: advocate.mobile || advocate.phone || (advocate.userId && advocate.userId.phone) || 'N/A',
            whatsapp: advocate.whatsapp || advocate.mobile || 'N/A'
        };

        // FETCH RELATIONSHIP STATUS
        let relationshipState = 'NONE';
        if (viewerId && advocate.userId) {
            const advUserId = advocate.userId._id || advocate.userId;
            const u1 = viewerId.toString() < advUserId.toString() ? viewerId.toString() : advUserId.toString();
            const u2 = viewerId.toString() < advUserId.toString() ? advUserId.toString() : viewerId.toString();

            const rel = await Relationship.findOne({ user1: u1, user2: u2 });
            if (rel) {
                relationshipState = rel.state;
                // Refine state based on who initiated
                if (rel.state === 'INTEREST') {
                    relationshipState = rel.requester.toString() === viewerId.toString() ? 'INTEREST_SENT' : 'INTEREST_RECEIVED';
                } else if (rel.state === 'SUPER_INTEREST') {
                    relationshipState = rel.requester.toString() === viewerId.toString() ? 'SUPER_INTEREST_SENT' : 'SUPER_INTEREST_RECEIVED';
                }
            }
        }

        // OWNER PRIVACY OVERRIDES
        const privacy = advocate.userId?.privacySettings || { showProfile: true, showContact: true, showEmail: true };
        const msgSettings = advocate.userId?.messageSettings || { allowDirectMessages: true };

        // 1. If showProfile is false, most info should be masked even for premium, unless it's the owner themselves
        const profileHidden = !privacy.showProfile && !isOwner;

        // 2. MASKING
        const shouldMask = false;

        let displayName = advocate.name || `${advocate.firstName} ${advocate.lastName}`;
        let displayId = advocate.unique_id;
        let displayImage = getImageUrl(advocate.profilePicPath) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';
        let bio = advocate.career?.bio || '';

        // Contact Info Overrides - If UNLOCKED (Paid), show it regardless of public privacy
        if (!shouldShowReal) {
            contactInfo = null; // Let frontend handle masked display
        }

        const formattedAdvocate = {
            id: advocate._id,
            role: 'advocate',
            userId: advocate.userId?._id || advocate.userId,
            unique_id: advocate.unique_id,
            name: displayName,
            display_id: displayId,
            firstName: shouldMask ? displayName : advocate.firstName,
            lastName: shouldMask ? '' : advocate.lastName,
            gender: advocate.gender,
            location: advocate.location?.city ? `${advocate.location.city}, ${advocate.location.state}` : (advocate.location?.state || 'Unknown'),
            experience: advocate.practice?.experience || '0 Years',
            specialties: advocate.practice?.specialization ? [advocate.practice.specialization] : [],
            bio: bio,
            education: (shouldMask || profileHidden) ? null : advocate.education,
            practice: (shouldMask || profileHidden) ? null : advocate.practice,
            availability: (shouldMask || profileHidden) ? null : advocate.availability,
            image_url: displayImage,
            isBlur: false,
            isFeatured: advocate.userId?.isPremium || false,
            isMasked: !shouldShowReal,
            contactInfo: contactInfo,
            allowChat: msgSettings.allowDirectMessages,
            allowCall: viewerIsPremium,
            allowVideo: viewerIsPremium,
            allowMeet: viewerIsPremium,
            licenseId: shouldShowReal ? (advocate.education?.enrollmentNo || 'N/A') : 'XXXXXXXXXX',
            privacySettings: privacy,
            notificationSettings: advocate.userId?.notificationSettings,
            messageSettings: msgSettings,
            relationship_state: relationshipState
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
