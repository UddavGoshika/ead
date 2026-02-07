const express = require('express');
const mongoose = require('mongoose');
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
    filename: (req, file, cb) => {
        const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, Date.now() + '-' + sanitized);
    }
});
const upload = multer({ storage: storage });

const cpUpload = upload.fields([
    { name: 'uploaddocument', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]);

// Helper to generate unique ID
async function generateClientId() {
    let id;
    let exists = true;
    const prefix = 'TP-EAD-CLI';

    while (exists) {
        // Generate exactly 4 random digits (0000-9999)
        const digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        id = `${prefix}${digits}`;
        const existing = await Client.findOne({ unique_id: id });
        if (!existing) exists = false;
    }
    return id;
}

// REGISTER CLIENT
router.post('/register', cpUpload, async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase() : '';
        const { password, firstName, lastName } = req.body;

        // Verify OTP was completed for this email
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({ error: 'Please verify your email with OTP first' });
        }

        // 1. Create or Update User
        let user = await User.findOne({ email });
        if (user) {
            const clientExists = await Client.findOne({ userId: user._id });
            if (clientExists) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // User exists but no client profile - likely a failed previous attempt
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

        if (user) {
            user.password = hashedPassword;
            user.role = 'client';
            user.status = 'Pending';
            user.referredBy = referredBy;
            await user.save();
        } else {
            user = await User.create({
                email,
                password: hashedPassword,
                role: 'client',
                status: 'Pending',
                myReferralCode,
                referredBy
            });
        }

        // 2. Generate Unique Client ID
        const clientId = await generateClientId();

        // 3. Create Client Profile
        const clientData = {
            userId: user._id,
            unique_id: clientId,
            firstName,
            lastName,
            gender: req.body.gender,
            dob: req.body.dob || null,
            mobile: req.body.mobile,
            email,
            documentType: req.body.documentType,
            documentPath: req.files && req.files['uploaddocument'] ? req.files['uploaddocument'][0].path : null,
            profilePicPath: req.files && req.files['profilePic'] ? req.files['profilePic'][0].path : null,
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

        res.json({ success: true, id: newClient._id, clientId: clientId });

    } catch (err) {
        console.error('Client Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET ALL CLIENTS
router.get('/', async (req, res) => {
    try {
        const { search, category, specialization, subDepartment, consultationMode, languages, city, state } = req.query;
        let query = { verified: true };
        const conditions = [];

        const buildCondition = (field, value) => {
            if (!value || value === 'Department' || value === 'Select States' || value === 'Select Cities' || value === 'Consultation Mode') return null;

            const terms = value.split(',').map(t => t.trim()).filter(t => t);
            if (terms.length === 0) return null;

            if (terms.length === 1) {
                return { [field]: { $regex: terms[0], $options: 'i' } };
            }

            return {
                $or: terms.map(term => ({ [field]: { $regex: term, $options: 'i' } }))
            };
        };

        if (search) {
            conditions.push({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { unique_id: { $regex: search, $options: 'i' } }
                ]
            });
        }

        const catCond = (category !== 'featured' && category !== 'normal') ? buildCondition('legalHelp.category', category) : null;
        if (catCond) conditions.push(catCond);

        const specCond = buildCondition('legalHelp.specialization', specialization);
        if (specCond) conditions.push(specCond);

        const subDeptCond = buildCondition('legalHelp.subDepartment', subDepartment);
        if (subDeptCond) conditions.push(subDeptCond);

        const modeCond = buildCondition('legalHelp.mode', consultationMode);
        if (modeCond) conditions.push(modeCond);

        const cityCond = buildCondition('address.city', city);
        if (cityCond) conditions.push(cityCond);

        const stateCond = buildCondition('address.state', state);
        if (stateCond) conditions.push(stateCond);

        const langCond = buildCondition('legalHelp.languages', languages);
        if (langCond) conditions.push(langCond);

        if (conditions.length > 0) {
            query.$and = conditions;
        }

        console.log('[BACKEND DEBUG] Client Query:', JSON.stringify(query));
        let dbClients = await Client.find(query).populate('userId', 'plan isPremium email phone');
        console.log(`[BACKEND DEBUG] Total DB Clients Found: ${dbClients.length}`);

        // Helper: Plan Weight Hierarchy
        const getPlanWeight = (userIdObj) => {
            if (!userIdObj) return 0;

            const plan = (userIdObj.plan || '').toLowerCase();
            const type = (userIdObj.planType || '').toLowerCase();
            const tier = (userIdObj.planTier || '').toLowerCase();
            const isPremium = userIdObj.isPremium;

            if (!isPremium && plan !== 'free') {
                // Double check if plan name implies premium
                if (plan.includes('pro') || plan.includes('platinum') || plan.includes('gold') || plan.includes('silver')) {
                    // Treat as premium for weighting if it has these keywords
                } else if (plan !== 'free' && plan !== '') {
                    // Other plans might be premium too
                } else {
                    return 0; // Truly Free
                }
            }

            if (plan === 'free') return 0;

            let score = 0;
            // Hierarchy: Pro > Pro Lite > Free
            // Tiers: Platinum > Gold > Silver

            if (plan.includes('pro') && !plan.includes('lite')) score += 2000;
            else if (plan.includes('pro lite')) score += 1000;

            if (plan.includes('platinum')) score += 300;
            else if (plan.includes('gold')) score += 200;
            else if (plan.includes('silver')) score += 100;

            // Fallback to searching in type/tier fields if plan string doesn't have it
            if (score === 0) {
                if (type.includes('pro') && !type.includes('lite')) score += 2000;
                else if (type.includes('pro lite')) score += 1000;

                if (tier.includes('platinum')) score += 300;
                else if (tier.includes('gold')) score += 200;
                else if (tier.includes('silver')) score += 100;
            }

            return score;
        };

        // Handle category logic (Plan based filtering and sorting)
        if (category === 'featured') {
            // "Higher-paid premium plans must always appear at the top. Profile visibility should decrease as the plan level goes down."
            // We include everyone but sort them.
            dbClients.sort((a, b) => getPlanWeight(b.userId) - getPlanWeight(a.userId));
        } else if (category === 'normal') {
            // "In the Normal Profiles section, show only Free registered clients. never show premium client in normal profiles"
            dbClients = dbClients.filter(c => {
                const weight = getPlanWeight(c.userId);
                const isPremium = c.userId?.isPremium;
                const plan = (c.userId?.plan || '').toLowerCase();
                return !isPremium && weight === 0 && (plan === 'free' || plan === '');
            });
        }

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
        // Admin Override
        if (authHeader && (authHeader.includes('admin') || authHeader.includes('mock'))) viewerIsPremium = true;

        const formattedClients = dbClients.map(client => {
            const shouldMask = !viewerIsPremium;
            let displayName = `${client.firstName} ${client.lastName}`;
            let displayId = client.unique_id || `CL-${client._id.toString().slice(-4).toUpperCase()}`;

            if (shouldMask) {
                displayName = displayName.substring(0, 2) + '...';
                displayId = displayId.substring(0, 2) + '...';
            }

            return {
                id: client._id,
                role: 'client',
                userId: client.userId?._id || client.userId,
                unique_id: client.unique_id || `CL-${client._id.toString().slice(-4).toUpperCase()}`,
                name: displayName,
                display_name: displayName,
                display_id: displayId,
                firstName: client.firstName,
                lastName: client.lastName,
                location: client.address?.city ? `${client.address.city}, ${client.address.state}` : (client.address?.state || 'Unknown Location'),
                address: client.address,
                legalHelp: client.legalHelp,
                category: client.legalHelp?.category || 'General',
                experience: 'Client Profile',
                specialization: client.legalHelp?.specialization || 'General Legal Help',
                image_url: client.profilePicPath ? `/${client.profilePicPath.replace(/\\/g, '/')}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
                isMasked: shouldMask
            };
        });

        res.json({ success: true, clients: formattedClients });
    } catch (err) {
        console.error('[BACKEND] Client fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET SINGLE CLIENT BY USER ID
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let client = await Client.findOne({
            $or: [
                { userId: mongoose.isValidObjectId(userId) ? userId : null },
                { _id: mongoose.isValidObjectId(userId) ? userId : null },
                { unique_id: userId }
            ]
        }).populate('userId');

        if (!client) {
            console.log(`[CLIENT FETCH] No Client profile found for UserID: ${userId}. Attempting auto-creation...`);

            // Only search for user if it's a valid ObjectId
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(404).json({ success: false, error: 'Client profile not found and User ID is invalid' });
            }

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            const clientId = await generateClientId();
            client = await Client.create({
                userId: user._id,
                unique_id: clientId,
                email: user.email,
                firstName: user.name?.split(' ')[0] || 'New',
                lastName: user.name?.split(' ')[1] || 'Client',
                address: { country: 'India' },
                legalHelp: {}
            });
        }

        // Detect Viewer Id
        let viewerId = null;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
            if (token && token.startsWith('user-token-')) {
                viewerId = token.replace('user-token-', '');
            }
        }

        // CHECK IF CONTACT ALREADY UNLOCKED
        let contactInfo = null;
        if (viewerId && require('mongoose').Types.ObjectId.isValid(viewerId)) {
            const Activity = require('../models/Activity');
            const unlocked = await Activity.findOne({
                sender: viewerId,
                receiver: client.userId?._id || client.userId,
                type: 'view_contact'
            });
            if (unlocked) {
                contactInfo = {
                    email: client.email || (client.userId && client.userId.email) || 'N/A',
                    mobile: client.mobile || (client.userId && client.userId.phone) || 'N/A',
                    whatsapp: client.whatsapp || client.mobile || 'N/A'
                };
            }
        }

        const formattedClient = {
            id: client._id,
            role: 'client',
            userId: client.userId?._id || client.userId,
            unique_id: client.unique_id,
            name: `${client.firstName} ${client.lastName}`.trim(),
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            mobile: client.mobile,
            location: client.address,
            legalHelp: client.legalHelp,
            img: client.profilePicPath ? `/${client.profilePicPath.replace(/\\/g, '/')}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            image_url: client.profilePicPath ? `/${client.profilePicPath.replace(/\\/g, '/')}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            profilePicPath: client.profilePicPath,
            contactInfo: contactInfo
        };

        res.json({ success: true, client: formattedClient });
    } catch (err) {
        console.error('[BACKEND] Client detail fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE CLIENT PROFILE
// UPDATE CLIENT PROFILE
// UPDATE CLIENT PROFILE
router.put('/update/:uniqueId', upload.single('profilePic'), async (req, res) => {
    try {
        const { uniqueId } = req.params;
        let updateData = req.body;

        console.log(`[UPDATE CLIENT START] UniqueID: ${uniqueId}`);
        console.log(`[UPDATE CLIENT] Content-Type: ${req.headers['content-type']}`);
        // console.log(`[UPDATE CLIENT] Body Keys: ${Object.keys(updateData).join(', ')}`);
        // console.log(`[UPDATE CLIENT] Body:`, JSON.stringify(updateData, null, 2));

        const client = await Client.findOne({ unique_id: uniqueId });
        if (!client) {
            console.error(`[UPDATE CLIENT ERROR] Client not found: ${uniqueId}`);
            return res.status(404).json({ error: 'Client not found' });
        }

        // --- Personal Details ---
        if (updateData.firstName !== undefined) client.firstName = updateData.firstName.trim();
        if (updateData.lastName !== undefined) client.lastName = updateData.lastName.trim();
        if (updateData.gender !== undefined) client.gender = updateData.gender;
        if (updateData.dob !== undefined) client.dob = updateData.dob;
        if (updateData.mobile !== undefined) client.mobile = updateData.mobile;

        // Map frontend 'idProofType' to backend 'documentType'
        if (updateData.idProofType !== undefined) client.documentType = updateData.idProofType;

        // --- Address / Location ---
        // Handle explicit address object update logic
        if (updateData.address) {
            // Need to parse if it came as string (FormData edge case)
            let addr = updateData.address;
            if (typeof addr === 'string') {
                try { addr = JSON.parse(addr); } catch (e) { }
            }
            client.address = { ...client.address, ...addr };
        }

        // Handle mapped location fields (from Frontend 'Location Details' form)
        // Note: Frontend sends 'location' object.
        if (updateData.location) {
            let loc = updateData.location;
            if (typeof loc === 'string') {
                try { loc = JSON.parse(loc); } catch (e) { }
            }
            // Mongoose Subdocument update: Assign individual fields to ensure change tracking
            if (loc.state !== undefined) client.address.state = loc.state;
            if (loc.city !== undefined) client.address.city = loc.city;
            if (loc.pincode !== undefined) client.address.pincode = loc.pincode;
            if (loc.officeAddress !== undefined) client.address.office = loc.officeAddress;
            if (loc.permanentAddress !== undefined) client.address.permanent = loc.permanentAddress;
            if (loc.country !== undefined) client.address.country = loc.country;
        }

        // --- Legal Preferences ---
        if (updateData.legalHelp) {
            let lh = updateData.legalHelp;
            if (typeof lh === 'string') {
                try { lh = JSON.parse(lh); } catch (e) { }
            }
            client.legalHelp = { ...client.legalHelp, ...lh };
        }

        // Direct field mapping if not nested
        if (updateData.category !== undefined) client.legalHelp.category = updateData.category;
        if (updateData.specialization !== undefined) client.legalHelp.specialization = updateData.specialization;
        if (updateData.subDepartment !== undefined) client.legalHelp.subDepartment = updateData.subDepartment;
        if (updateData.mode !== undefined) client.legalHelp.mode = updateData.mode;
        if (updateData.languages !== undefined) client.legalHelp.languages = updateData.languages;
        if (updateData.issueDescription !== undefined) client.legalHelp.issueDescription = updateData.issueDescription;

        // --- File Upload Handling ---
        if (req.file) {
            client.profilePicPath = req.file.path;
            console.log(`[UPDATE CLIENT] Updated Profile Pic Path: ${req.file.path}`);
        }

        // Mark modified if needed (Mongoose usually auto-detects)
        // client.markModified('address'); 

        const savedClient = await client.save();
        console.log(`[UPDATE CLIENT SUCCESS] Saved client: ${savedClient.unique_id}, Name: ${savedClient.firstName} ${savedClient.lastName}`);

        res.json({ success: true, client: savedClient });
    } catch (err) {
        console.error('[UPDATE CLIENT CRITICAL ERROR]:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
