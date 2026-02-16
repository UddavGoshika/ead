const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Client = require('../models/Client');
const Otp = require('../models/Otp');
const UnlockedContact = require('../models/UnlockedContact');
const { createNotification } = require('../utils/notif');
const { getImageUrl, getFullImageUrl } = require('../utils/pathHelper');
const Relationship = require('../models/Relationship');

// Storage config
const { upload } = require('../config/cloudinary');

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
        // Generate exactly 6 random digits (000000-999999)
        const digits = Math.floor(100000 + Math.random() * 900000).toString();
        id = `${prefix}${digits}`;
        const existing = await Client.findOne({ unique_id: id });
        if (!existing) exists = false;
    }
    console.log(`[ID GEN] Generated UNIQUE Client ID: ${id}`);
    return id;
}

// REGISTER CLIENT
router.post('/register', cpUpload, async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
        const { password, firstName, lastName } = req.body;

        // 1. Check if User exists (Strict - One Email One Role)
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Email already registered. You cannot create multiple accounts/roles with the same email.' });
        }

        // 2. Verify OTP was completed for this email
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({ error: 'Please verify your email with OTP first' });
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
            user.plainPassword = password;
            user.role = 'client';
            user.status = 'Pending';
            user.referredBy = referredBy;
            await user.save();
        } else {
            user = await User.create({
                email,
                password: hashedPassword,
                plainPassword: password,
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

        res.json({ success: true, id: newClient._id, clientId: clientId, token: 'user-token-' + user._id });

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

        // 1. Detect Viewer Plan (Auth Optional)
        let viewerIsPremium = false;
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
                    }
                }
            }
        }
        // Admin Override
        if (authHeader && (authHeader.includes('admin') || authHeader.includes('mock'))) viewerIsPremium = true;

        if (conditions.length > 0) {
            query.$and = conditions;
        }

        // SERVER-DRIVEN FILTERING: Exclude Interacted Profiles
        if (viewerId) {
            const relationships = await Relationship.find({
                $or: [{ user1: viewerId }, { user2: viewerId }],
                state: { $nin: ['NONE', 'SHORTLISTED'] }
            });
            const excludedUserIds = relationships.map(rel =>
                rel.user1.toString() === viewerId.toString() ? rel.user2 : rel.user1
            );

            if (!query.$and) query.$and = [];
            query.$and.push({ userId: { $ne: viewerId } }); // Don't show self
            if (excludedUserIds.length > 0) {
                query.$and.push({ userId: { $nin: excludedUserIds } });
            }
        }

        console.log('[BACKEND DEBUG] Client Query:', JSON.stringify(query));
        let dbClients = await Client.find(query).populate('userId', 'plan isPremium email phone privacySettings status');

        // Filter out private profiles and deleted users
        dbClients = dbClients.filter(client => {
            if (!client.userId) return false;
            if (client.userId.status === 'Deleted') return false;
            const privacy = client.userId.privacySettings || { showProfile: true };
            return privacy.showProfile !== false;
        });
        console.log(`[BACKEND DEBUG] Total DB Clients Found: ${dbClients.length}`);

        // Helper: Plan Weight Hierarchy
        const getPlanWeight = (userIdObj) => {
            if (!userIdObj) return 0;
            const plan = (userIdObj.plan || '').toLowerCase();
            if (plan === 'free') return 0;
            let score = 0;
            if (plan.includes('pro') && !plan.includes('lite')) score += 2000;
            else if (plan.includes('pro lite')) score += 1000;
            if (plan.includes('platinum')) score += 300;
            else if (plan.includes('gold')) score += 200;
            else if (plan.includes('silver')) score += 100;
            return score;
        };

        // Handle category logic
        if (category === 'featured') {
            dbClients.sort((a, b) => getPlanWeight(b.userId) - getPlanWeight(a.userId));
        } else if (category === 'normal') {
            dbClients = dbClients.filter(c => {
                const weight = getPlanWeight(c.userId);
                const isPremium = c.userId?.isPremium;
                const plan = (c.userId?.plan || '').toLowerCase();
                return !isPremium && weight === 0 && (plan === 'free' || plan === '');
            });
        }

        const formattedClients = dbClients.map(client => {
            const shouldMask = !viewerIsPremium;
            let displayName = `${client.firstName} ${client.lastName}`;
            let displayId = client.unique_id || `CL-${client._id.toString().slice(-4).toUpperCase()}`;

            if (shouldMask) {
                displayName = displayName.substring(0, 2) + '*****';
                displayId = displayId.substring(0, 2) + '*****';
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
                image_url: getImageUrl(client.profilePicPath) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
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
        let query = {};
        if (userId.startsWith('TP-EAD-CLI')) {
            query = { unique_id: userId };
            console.log(`[STRICT] Fetching Client by Unique ID: ${userId}`);
        } else if (mongoose.isValidObjectId(userId)) {
            query = { $or: [{ userId: userId }, { _id: userId }] };
            console.log(`[STRICT] Fetching Client by Object ID: ${userId}`);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid Client ID format' });
        }

        let client = await Client.findOne(query).populate('userId');

        if (!client || (client.userId && client.userId.status === 'Deleted')) {
            return res.status(404).json({ success: false, error: 'Client profile not found or deleted' });
        }

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

        // Detect Viewer Plan
        let viewerIsPremium = false;
        if (viewerId && require('mongoose').Types.ObjectId.isValid(viewerId)) {
            const viewer = await User.findById(viewerId);
            if (viewer && viewer.isPremium) viewerIsPremium = true;
        }

        // CHECK IF CONTACT ALREADY UNLOCKED (Activity or UnlockedContact)
        let contactInfo = null;
        if (viewerId && require('mongoose').Types.ObjectId.isValid(viewerId)) {
            const unlocked = await UnlockedContact.findOne({
                viewer_user_id: viewerId,
                profile_user_id: client.userId?._id || client.userId
            });
            if (unlocked) {
                contactInfo = {
                    email: client.email || (client.userId && client.userId.email) || 'N/A',
                    mobile: client.mobile || (client.userId && client.userId.phone) || 'N/A',
                    whatsapp: client.whatsapp || client.mobile || 'N/A'
                };
            }
        }

        // FETCH RELATIONSHIP STATUS
        let relationshipState = 'NONE';
        if (viewerId && client.userId) {
            const clientUserId = client.userId._id || client.userId;
            const u1 = viewerId.toString() < clientUserId.toString() ? viewerId.toString() : clientUserId.toString();
            const u2 = viewerId.toString() < clientUserId.toString() ? clientUserId.toString() : viewerId.toString();

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
        const privacy = client.userId?.privacySettings || { showProfile: true, showContact: true, showEmail: true };
        const msgSettings = client.userId?.messageSettings || { allowDirectMessages: true };
        const isOwner = viewerId && viewerId.toString() === client.userId?._id?.toString();

        // Contact Info Overrides
        if (contactInfo) {
            // Unlocked -> Show everything
            // if (!privacy.showContact && !isOwner) contactInfo.mobile = 'Hidden by User';
            // if (!privacy.showEmail && !isOwner) contactInfo.email = 'Hidden by User';
        }

        const shouldMask = !viewerIsPremium && !isOwner;
        let displayName = `${client.firstName} ${client.lastName}`.trim();
        let displayId = client.unique_id;

        if (shouldMask && !isOwner) {
            displayName = displayName.substring(0, 2) + '*****';
            // User requested: "in free users detailed profile the id is masked"
            displayId = displayId.substring(0, 2) + '*****';
        }

        const formattedClient = {
            id: client._id,
            role: 'client',
            userId: client.userId?._id || client.userId,
            unique_id: client.unique_id,
            display_id: displayId,
            name: displayName,
            firstName: shouldMask ? displayName.split(' ')[0] : client.firstName,
            lastName: shouldMask ? '' : client.lastName,
            email: (privacy.showEmail || isOwner || contactInfo) ? client.email : 'Hidden',
            mobile: (privacy.showContact || isOwner || contactInfo) ? client.mobile : 'Hidden',
            location: client.address,
            legalHelp: client.legalHelp,
            img: getImageUrl(client.profilePicPath) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            image_url: getImageUrl(client.profilePicPath) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            profilePicPath: client.profilePicPath,
            isBlur: shouldMask,
            isMasked: shouldMask,
            contactInfo: contactInfo,
            privacySettings: privacy,
            notificationSettings: client.userId?.notificationSettings,
            messageSettings: msgSettings,
            allowChat: msgSettings.allowDirectMessages,
            allowCall: viewerIsPremium,
            allowVideo: viewerIsPremium,
            allowMeet: viewerIsPremium,
            relationship_state: relationshipState,
            isFeatured: client.userId?.isPremium || false
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
