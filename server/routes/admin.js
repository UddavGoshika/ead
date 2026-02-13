const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const Ticket = require('../models/Ticket');
const Package = require('../models/Package');
const Attribute = require('../models/Attribute');
const Blog = require('../models/Blog');
const AuditLog = require('../models/AuditLog');
const Transaction = require('../models/Transaction'); // Added Transaction model
const LegalRequest = require('../models/LegalRequest');
const StaffProfile = require('../models/StaffProfile');
const StaffReport = require('../models/StaffReport');
const Lead = require('../models/Lead');
const AdminConfig = require('../models/AdminConfig');
const CommissionRule = require('../models/CommissionRule');

const Contact = require('../models/Contact');

const { createNotification } = require('../utils/notif');
const { getImageUrl } = require('../utils/pathHelper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../utils/mailer');
const bcrypt = require('bcryptjs');

const { upload } = require('../config/cloudinary');

// GET ATTRIBUTES BY CATEGORY
router.get('/attributes', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) query.category = category;
        const attributes = await Attribute.find(query);
        res.json({ success: true, attributes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE/UPDATE ATTRIBUTE
router.post('/attributes', async (req, res) => {
    try {
        const { id, category, name, active } = req.body;
        let attr;
        if (id) {
            attr = await Attribute.findByIdAndUpdate(id, { category, name, active }, { new: true, upsert: true });
        } else {
            attr = await Attribute.findOneAndUpdate({ category, name }, { category, name, active }, { new: true, upsert: true });
        }
        res.json({ success: true, attribute: attr });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE ATTRIBUTE
router.delete('/attributes/:id', async (req, res) => {
    try {
        await Attribute.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Attribute deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ALL PACKAGES
router.get('/packages', async (req, res) => {
    try {
        const { memberType } = req.query;
        let query = {};
        if (memberType) query.memberType = memberType;
        const packages = await Package.find(query);
        res.json({ success: true, packages });
    } catch (err) {
        console.error(`[ADMIN] Error fetching packages: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE/UPDATE PACKAGE
router.post('/packages', async (req, res) => {
    try {
        const { id, memberType, name, category, description, icon, gradient, tiers, featured, sortOrder } = req.body;
        const packageName = name || category;

        let pkg;
        if (id) {
            pkg = await Package.findByIdAndUpdate(id, {
                memberType,
                name: packageName,
                description,
                icon,
                gradient,
                tiers,
                featured,
                sortOrder
            }, { new: true });
        } else {
            pkg = await Package.create({
                memberType,
                name: packageName,
                description,
                icon,
                gradient,
                tiers,
                featured,
                sortOrder
            });
        }

        res.json({ success: true, pkg });
    } catch (err) {
        console.error(`[ADMIN] Error saving package: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE PACKAGE
router.delete('/packages/:id', async (req, res) => {
    try {
        await Package.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Package deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET DASHBOARD STATS
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            totalAdvocates: await User.countDocuments({ role: 'advocate' }),
            totalClients: await User.countDocuments({ role: 'client' }),
            totalManagers: await User.countDocuments({ role: { $in: ['manager', 'MANAGER'] } }),
            totalTeamLeads: await User.countDocuments({ role: { $in: ['teamlead', 'TEAMLEAD'] } }),
            totalStaff: await User.countDocuments({
                role: { $nin: ['client', 'advocate', 'admin'], $exists: true }
            }),
            hrMetrics: {
                attritionRate: 2.1,
                engagementScore: 88,
                diversityIndex: 42,
                hiringPipeline: 14,
                headcountTrend: [120, 125, 128, 132, 138, 142]
            },
            verifiedAdvocates: await Advocate.countDocuments({ verified: true }),
            pendingAdvocates: await Advocate.countDocuments({ verified: false }),
            activeUnits: await User.countDocuments({ status: 'Active' }),
            blockedUnits: await User.countDocuments({ status: 'Blocked' }),
            deactivatedUnits: await User.countDocuments({ status: 'Deactivated' }),
            deletedUnits: await User.countDocuments({ status: 'Deleted' }),
            totalRevenue: await (async () => {
                const Transaction = require('../models/Transaction');
                const agg = await Transaction.aggregate([
                    { $match: { status: { $in: ['success', 'completed'] } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]);
                return agg[0] ? agg[0].total : 0;
            })()
        };

        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET REVENUE CHART DATA (Current Year: Jan - Dec)
router.get('/revenue-chart', async (req, res) => {
    try {
        const Transaction = require('../models/Transaction');

        // Calculate date: Start of Current Year (Jan 1)
        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1); // Jan 1st, 00:00:00
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // Dec 31st

        const revenueData = await Transaction.aggregate([
            {
                $match: {
                    status: { $in: ['success', 'completed'] },
                    createdAt: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" }
                    },
                    // Divide by 100 assuming amount is in paise/cents
                    revenue: { $sum: { $divide: ["$amount", 100] } }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        // Format for frontend (Jan, Feb, ... Dec)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Prepare full year array initialized to 0
        const formattedData = monthNames.map((name, index) => {
            const found = revenueData.find(r => r._id.month === (index + 1));
            return {
                month: name,
                revenue: found ? Math.round(found.revenue) : 0
            };
        });

        res.json({ success: true, data: formattedData });
    } catch (err) {
        console.error('Revenue chart error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ALL MEMBERS (Strict Filtered)
router.get('/members', async (req, res) => {
    try {
        const { role, status, search, context } = req.query;
        let query = {};

        // 1. Basic Filters
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { unique_id: { $regex: search, $options: 'i' } } // Look in User model if it exists there (unlikely but safe)
            ];
        }

        // 2. Strict Context Filtering (User Level)
        if (context === 'free') {
            query.$or = [{ plan: 'Free' }, { plan: { $exists: false } }, { plan: null }];
        } else if (context === 'premium') {
            query.plan = { $nin: ['Free', null], $exists: true };
        } else if (context === 'blocked') {
            query.status = 'Blocked';
        } else if (context === 'deactivated') {
            query.status = 'Deactivated';
        } else if (context === 'deleted') {
            query.status = 'Deleted';
        } else if (context === 'pending') {
            query.status = { $in: ['Pending', 'Active', 'Reverify'] };
        } else if (context === 'reverify') {
            query.status = 'Reverify';
        }

        // 2. Default status filter (Exclude Deleted by default if not strictly requested)
        if (!query.status && !context) {
            query.status = { $ne: 'Deleted' };
        }

        const users = await User.find(query).sort({ createdAt: -1 }).lean();

        const members = await Promise.all(users.map(async (u) => {
            let profile = null;
            if (u.role.toLowerCase() === 'advocate' || u.role.toLowerCase() === 'legal_provider') {
                profile = await Advocate.findOne({
                    $or: [
                        { userId: u._id },
                        { unique_id: search && search.includes('-') ? search : null } // Fallback for ID search
                    ]
                }).lean();
            } else if (u.role.toLowerCase() === 'client') {
                profile = await Client.findOne({
                    $or: [
                        { userId: u._id },
                        { unique_id: search && search.includes('-') ? search : null }
                    ]
                }).lean();
            } else {
                profile = await StaffProfile.findOne({ userId: u._id }).lean();
            }

            // If we found a profile via ID search that doesn't match the current user, skip it in this map (it will be found via its own User record)
            if (profile && profile.userId && profile.userId.toString() !== u._id.toString()) {
                // This shouldn't happen often if IDs are unique across users, but let's be safe.
                // We'll just fetch based on userId normally to keep it simple.
                profile = await (u.role.toLowerCase() === 'client' ? Client : Advocate).findOne({ userId: u._id }).lean();
            }

            let location = 'N/A';
            if (profile) {
                if ((u.role.toLowerCase() === 'advocate' || u.role.toLowerCase() === 'legal_provider') && profile.location?.city) {
                    location = `${profile.location.city}, ${profile.location.state || ''}`;
                } else if (u.role.toLowerCase() === 'client') {
                    const addr = profile.address || {};
                    location = addr.city ? `${addr.city}, ${addr.state || ''}` : (addr.state || 'N/A');
                }
            }

            const normalizePath = getImageUrl;

            // Normalize ALL paths in the profile object
            if (profile) {
                if (profile.profilePicPath) profile.profilePicPath = normalizePath(profile.profilePicPath);
                if (profile.signaturePath) profile.signaturePath = normalizePath(profile.signaturePath);
                if (profile.documentPath) profile.documentPath = normalizePath(profile.documentPath);

                if (profile.education?.certificatePath) profile.education.certificatePath = normalizePath(profile.education.certificatePath);
                if (profile.practice?.licensePath) profile.practice.licensePath = normalizePath(profile.practice.licensePath);
                if (profile.idProof?.docPath) profile.idProof.docPath = normalizePath(profile.idProof.docPath);
            }

            return {
                id: u._id,
                email: u.email,
                plainPassword: u.plainPassword || null,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                coins: u.coins,
                plan: u.plan || 'Free',
                name: profile ? (profile.name || `${profile.firstName} ${profile.lastName}`) : 'N/A',
                phone: profile ? (profile.mobile || 'N/A') : 'N/A',
                gender: profile ? profile.gender : 'N/A',
                verified: profile ? profile.verified : false,
                verifiedAt: profile ? profile.verifiedAt : null,
                reported: profile ? (profile.reported || 0) : 0,
                location: location,
                avatar: profile ? normalizePath(profile.profilePicPath || profile.avatar) : null,
                image: profile ? normalizePath(profile.profilePicPath || profile.avatar) : null,
                unique_id: profile ? profile.unique_id : `U-${u._id.toString().slice(-4)}`,
                specialization: profile ? (profile.practice?.specialization || 'N/A') : 'N/A',
                legalDocumentation: profile ? (profile.legalDocumentation || []) : [],
                rejectionReason: profile ? (profile.rejectionReason || '') : '',
                verificationStatus: profile?.verified ? 'Verified' : (profile?.rejectionReason ? 'Rejected' : 'Pending'),
                // Enhanced Document Fields for Admin Verification
                education: profile?.education,
                practice: profile?.practice,
                idProof: profile?.idProof,
                signaturePath: profile?.signaturePath ? normalizePath(profile.signaturePath) : null,
                documentPath: profile?.documentPath ? normalizePath(profile.documentPath) : null,
                documentType: profile?.documentType,
                legalHelp: profile?.legalHelp,
                career: profile?.career,
                availability: profile?.availability,
                interests: profile?.interests,
                superInterests: profile?.superInterests,
                address: profile?.address,
                dob: profile?.dob
            };
        }));

        // 3. Strict Context Filtering (Profile Level)
        let filteredMembers = members;
        if (context === 'free') {
            // Only verified free members
            filteredMembers = members.filter(m => m.verified === true && (m.plan === 'Free' || !m.plan) && m.status !== 'Deleted');
        } else if (context === 'premium') {
            // Only verified premium members
            filteredMembers = members.filter(m => m.verified === true && m.plan !== 'Free' && m.plan && m.status !== 'Deleted');
        } else if (context === 'approved') {
            filteredMembers = members.filter(m => m.verified === true && m.status === 'Active');
        } else if (context === 'pending') {
            // Strictly unverified non-blocked
            filteredMembers = members.filter(m => !m.verified && m.status !== 'Blocked' && m.status !== 'Deleted');
        } else if (context === 'reported') {
            filteredMembers = members.filter(m => m.reported > 0);
        } else if (context === 'unapproved') {
            // Alias for pending or slightly different? Usually unverified.
            filteredMembers = members.filter(m => !m.verified && m.status !== 'Deleted');
        } else if (context === 'rejected') {
            // Specifically members who have been rejected
            filteredMembers = members.filter(m => !m.verified && (m.status === 'Rejected' || m.verificationStatus === 'Rejected') && m.status !== 'Deleted');
        } else if (context === 'reverify') {
            filteredMembers = members.filter(m => m.status === 'Reverify');
        }

        res.json({ success: true, members: filteredMembers });
    } catch (err) {
        console.error('Members fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE USER STATUS
router.patch('/members/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        createNotification('profileUpdate', `Member status updated to ${status} for ${user.email}`, 'Admin', null, { userId: user._id, status });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// VERIFY ADVOCATE
router.patch('/members/:id/verify', async (req, res) => {
    try {
        const { verified, remarks } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!verified && remarks) {
            // Rejection logic
            user.status = 'Pending';
            await user.save();

            let profileName = 'User';
            if (user.role.toLowerCase() === 'advocate' || user.role.toLowerCase() === 'legal_provider') {
                const profile = await Advocate.findOneAndUpdate({ userId: user._id }, { verified: false }, { new: true });
                if (profile) profileName = profile.name || `${profile.firstName} ${profile.lastName}`;
            } else if (user.role.toLowerCase() === 'client') {
                const profile = await Client.findOne({ userId: user._id });
                if (profile) profileName = `${profile.firstName} ${profile.lastName}`;
            }

            const emailSubject = 'Action Required: Your Verification Request';
            const emailText = `Hello ${profileName},\n\nYour profile verification was not successful for the following reason:\n\n${remarks}\n\nPlease click the link below to verify/update your details:\n${req.protocol}://${req.get('host')}/dashboard\n\nThank you,\nE-Advocate Team`;

            await sendEmail(user.email, emailSubject, emailText);

            return res.json({ success: true, message: 'Member rejected and informed via email' });
        }

        const roleLower = user.role.toLowerCase();
        if (roleLower === 'advocate' || roleLower === 'legal_provider') {
            const advocate = await Advocate.findOneAndUpdate(
                { userId: user._id },
                { verified, verifiedAt: verified ? new Date() : null },
                { new: true }
            );
            if (!advocate) return res.status(404).json({ error: 'Advocate profile not found' });

            user.status = verified ? 'Active' : 'Pending';
            if (verified) {
                user.plan = 'Free';
                user.planType = 'Free';
                user.planTier = null;
                user.isPremium = false;
            }
            await user.save();

            if (verified) {
                const emailSubject = 'Welcome to E-Advocate - Your Profile is Verified!';
                const emailText = `Hello ${advocate.firstName || advocate.name},\n\nCongratulations! Your advocate profile has been successfully verified. You now have full access to the E-Advocate platform.\n\n**Your Unique ID: ${advocate.unique_id || 'N/A'}**\n\nYou can login using your registered email and password at:\n${req.protocol}://${req.get('host')}/login\n\nBest regards,\nE-Advocate Team`;
                await sendEmail(user.email, emailSubject, emailText);
            }

            createNotification('profileUpdate', `Your advocate profile was ${verified ? 'verified' : 'unverified'}`, 'Admin', user._id);
            res.json({ success: true, message: `Advocate ${verified ? 'verified' : 'unverified'} successfully` });
        } else if (user.role.toLowerCase() === 'client') {
            const profile = await Client.findOneAndUpdate(
                { userId: user._id },
                { verified, verifiedAt: verified ? new Date() : null },
                { new: true }
            );
            if (!profile) return res.status(404).json({ error: 'Client profile not found' });

            user.status = verified ? 'Active' : 'Pending';
            if (verified) {
                user.plan = 'Free';
                user.planType = 'Free';
                user.planTier = null;
                user.isPremium = false;
            }
            await user.save();

            if (verified) {
                const emailSubject = 'Welcome to E-Advocate - Your Profile is Verified!';
                const emailText = `Hello ${profile.firstName || 'User'},\n\nCongratulations! Your account has been verified and activated by our team. You can now post legal requirements and connect with advocates.\n\n**Your Unique ID: ${profile.unique_id || 'N/A'}**\n\nLogin here: ${req.protocol}://${req.get('host')}/login\n\nBest regards,\nE-Advocate Team`;
                await sendEmail(user.email, emailSubject, emailText);
            }

            createNotification('profileUpdate', `Your client profile was ${verified ? 'verified' : 'unverified'}`, 'Admin', user._id);
            res.json({ success: true, message: `Client ${verified ? 'verified' : 'unverified'} successfully` });
        } else {
            // Handle Staff Verification
            const profile = await StaffProfile.findOneAndUpdate(
                { userId: user._id },
                { verified, verifiedAt: verified ? new Date() : null },
                { new: true }
            );
            if (!profile) return res.status(404).json({ error: 'Staff profile not found' });

            user.status = verified ? 'Active' : 'Pending';
            await user.save();

            if (verified) {
                const emailSubject = 'Welcome to E-Advocate - Your Staff Account is Verified!';
                const emailText = `Hello,\n\nCongratulations! Your staff account (${user.role}) has been successfully verified. You now have access to the staff portal.\n\nLogin here: ${req.protocol}://${req.get('host')}/login\n\nBest regards,\nE-Advocate Team`;
                await sendEmail(user.email, emailSubject, emailText);
            }

            createNotification('profileUpdate', `Your staff profile was ${verified ? 'verified' : 'unverified'}`, 'Admin', user._id);
            res.json({ success: true, message: `Staff ${verified ? 'verified' : 'unverified'} successfully` });
        }
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// REJECT & INFORM MEMBER
router.patch('/members/:id/reject-inform', async (req, res) => {
    try {
        const { remarks } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update status to Rejected
        user.status = 'Rejected';
        await user.save();

        let profileName = 'User';
        const roleLower = user.role.toLowerCase();
        if (roleLower === 'advocate' || roleLower === 'legal_provider') {
            const profile = await Advocate.findOneAndUpdate(
                { userId: user._id },
                { verified: false, rejectionReason: remarks },
                { new: true }
            );
            if (profile) {
                profileName = profile.name || `${profile.firstName} ${profile.lastName}`;
            }
        } else if (user.role.toLowerCase() === 'client') {
            const profile = await Client.findOneAndUpdate(
                { userId: user._id },
                { verified: false, rejectionReason: remarks },
                { new: true }
            );
            if (profile) {
                profileName = `${profile.firstName} ${profile.lastName}`;
            }
        } else {
            // Handle Staff Rejection
            const profile = await StaffProfile.findOneAndUpdate(
                { userId: user._id },
                { verified: false, rejectionReason: remarks },
                { new: true }
            );
            if (profile) {
                profileName = `Staff Member (${user.email})`;
            }
        }

        // Send Email
        const emailSubject = 'Action Required: Your Verification Request Status';
        const emailText = `Hello ${profileName},\n\nThank you for your interest in E-Advocate.\n\nWe've reviewed your registration documents, and unfortunately, we couldn't verify your profile at this time for the following reason:\n\n**Reason for Rejection:**\n${remarks}\n\n**Solution & Next Steps:**\nTo get your profile approved, please:\n1. Log in to your dashboard here: ${req.protocol}://${req.get('host')}/login\n2. Navigate to the profile or document section.\n3. Correct the issues mentioned above (e.g., upload a clearer ID proof, correct your name, etc.).\n4. Resubmit your profile for verification.\n\nOur team will review your updated information within 12-24 hours.\n\nThank you,\nE-Advocate Team`;

        await sendEmail(user.email, emailSubject, emailText);

        res.json({ success: true, message: 'Member rejected and informed via email' });
    } catch (err) {
        console.error('Reject error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ALL CONTACT QUERIES
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, contacts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ALL TICKETS
router.get('/tickets', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const tickets = await Ticket.find(query);
        res.json({ success: true, tickets });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE TICKET (Assign/Status)
router.patch('/tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        let ticket;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            ticket = await Ticket.findByIdAndUpdate(id, update, { new: true });
        }

        if (!ticket) {
            ticket = await Ticket.findOneAndUpdate({ id: id }, update, { new: true });
        }

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // NOTIFICATION: TICKET UPDATE
        createNotification('ticket', `Ticket ${ticket.id} updated: ${update.status || 'modified'}`, 'Admin', null, { ticketId: ticket.id });

        res.json({ success: true, ticket });
    } catch (err) {
        console.error('Ticket update error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET MEMBER DETAIL
router.get('/members/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        let profile = null;
        if (user.role.toLowerCase() === 'advocate' || user.role.toLowerCase() === 'legal_provider') {
            profile = await Advocate.findOne({ userId: user._id }).lean();
        } else if (user.role.toLowerCase() === 'client') {
            profile = await Client.findOne({ userId: user._id }).lean();
        }

        const normalizePath = getImageUrl;

        const documents = [];
        if (profile) {
            // Normalize ALL paths in the profile object itself
            if (profile.profilePicPath) profile.profilePicPath = normalizePath(profile.profilePicPath);
            if (profile.signaturePath) profile.signaturePath = normalizePath(profile.signaturePath);
            if (profile.documentPath) profile.documentPath = normalizePath(profile.documentPath);

            if (profile.education?.certificatePath) {
                profile.education.certificatePath = normalizePath(profile.education.certificatePath);
            }
            if (profile.practice?.licensePath) {
                profile.practice.licensePath = normalizePath(profile.practice.licensePath);
            }
            if (profile.idProof?.docPath) {
                profile.idProof.docPath = normalizePath(profile.idProof.docPath);
            }

            if (user.role.toLowerCase() === 'advocate' || user.role.toLowerCase() === 'legal_provider') {
                if (profile.profilePicPath) documents.push({ name: 'Profile Photo', path: profile.profilePicPath });
                if (profile.education?.certificatePath) documents.push({ name: 'Education Certificate', path: profile.education.certificatePath });
                if (profile.practice?.licensePath) documents.push({ name: 'Practice License', path: profile.practice.licensePath });
                if (profile.idProof?.docPath) documents.push({ name: profile.idProof.docType || 'ID Proof', path: profile.idProof.docPath });
                if (profile.signaturePath) documents.push({ name: 'Signature', path: profile.signaturePath });
            } else {
                if (profile.profilePicPath) documents.push({ name: 'Profile Photo', path: profile.profilePicPath });
                if (profile.documentPath) documents.push({ name: profile.documentType || 'Verification Document', path: profile.documentPath });
                if (profile.signaturePath) documents.push({ name: 'Signature', path: profile.signaturePath });
            }
        }

        res.json({ success: true, member: { user, profile, documents } });
    } catch (err) {
        console.error('Member detail error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE MEMBER PACKAGE
router.patch('/members/:id/package', async (req, res) => {
    try {
        const { plan } = req.body;

        // Derive detailed packaging info
        let isPremium = false;
        let planType = 'Free';
        let planTier = null;

        const lowerPlan = (plan || 'Free').toLowerCase();

        if (lowerPlan !== 'free') {
            isPremium = true;

            // Determine Plan Type
            if (lowerPlan.includes('lite')) planType = 'Pro Lite';
            else if (lowerPlan.includes('ultra')) planType = 'Ultra Pro';
            else if (lowerPlan.includes('pro')) planType = 'Pro';

            // Determine Tier
            if (lowerPlan.includes('silver')) planTier = 'Silver';
            else if (lowerPlan.includes('gold')) planTier = 'Gold';
            else if (lowerPlan.includes('platinum')) planTier = 'Platinum';
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const oldPlan = user.plan;
        user.plan = plan;
        user.planType = planType;
        user.planTier = planTier;
        user.isPremium = isPremium;

        // If upgraded to premium and plan changed
        if (isPremium && plan !== oldPlan) {
            let baseCoins = 0;
            const tierLower = (planTier || '').toLowerCase();
            if (tierLower === 'silver') baseCoins = 50;
            else if (tierLower === 'gold') baseCoins = 100;
            else if (tierLower === 'platinum') baseCoins = 150;
            else baseCoins = 50;

            const multiplier = lowerPlan.includes('ultra') ? 100 : lowerPlan.includes('lite') ? 1 : 10;
            const totalAllocated = baseCoins * multiplier;

            user.coins = (user.coins || 0) + totalAllocated;
            user.coinsReceived = (user.coinsReceived || 0) + totalAllocated;
        }

        await user.save();

        createNotification('system', `Your plan has been updated to ${plan} by Admin.`, 'Admin', user._id);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE MEMBER WALLET
router.patch('/members/:id/wallet', async (req, res) => {
    try {
        const { amount, type } = req.body; // type: 'add' or 'deduct'
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const val = parseInt(amount);
        if (isNaN(val)) return res.status(400).json({ error: 'Invalid amount' });

        if (type === 'add') {
            user.coins = (user.coins || 0) + val;
            user.coinsReceived = (user.coinsReceived || 0) + val;
        } else {
            user.coins = Math.max(0, (user.coins || 0) - val);
        }
        await user.save();

        createNotification('payment', `Admin ${type === 'add' ? 'added' : 'deducted'} ${val} coins. New Balance: ${user.coins}`, 'Admin', user._id);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// BULK DELETE MEMBERS
router.post('/members/bulk-delete', async (req, res) => {
    try {
        const { ids, permanent } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });

        if (permanent) {
            // Permanent Delete Logic
            // 1. Get users to find their roles (to delete profiles)
            const users = await User.find({ _id: { $in: ids } });

            for (const user of users) {
                const role = (user.role || '').toLowerCase();
                if (role === 'advocate' || role === 'legal_provider') {
                    await Advocate.deleteOne({ userId: user._id });
                } else if (role === 'client') {
                    await Client.deleteOne({ userId: user._id });
                } else {
                    await StaffProfile.deleteOne({ userId: user._id });
                }
            }

            await User.deleteMany({ _id: { $in: ids } });
            return res.json({ success: true, message: `Permanently deleted ${ids.length} members` });

        } else {
            // Soft Delete Users by updating status
            await User.updateMany({ _id: { $in: ids } }, { status: 'Deleted' });
            return res.json({ success: true, message: `Moved ${ids.length} members to deleted list successfully` });
        }

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SOFT DELETE MEMBER
router.delete('/members/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.status = 'Deleted';
        await user.save();

        res.json({ success: true, message: 'Member moved to deleted items' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// PERMANENT DELETE MEMBER
router.delete('/members/:id/permanent', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role.toLowerCase() === 'advocate') {
            await Advocate.deleteOne({ userId: user._id });
        } else if (user.role.toLowerCase() === 'client') {
            await Client.deleteOne({ userId: user._id });
        }

        await User.findByIdAndDelete(user._id);
        res.json({ success: true, message: 'Member deleted permanently from database' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// RESTORE MEMBER
router.patch('/members/:id/restore', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.status = 'Active';
        await user.save();

        res.json({ success: true, message: 'Member restored successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= BLOG MANAGEMENT =================

// GET ALL BLOGS WITH FILTERS
router.get('/blogs', async (req, res) => {
    try {
        const { status, search, sort } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (req.query.onlyAdmin === 'true') {
            query.authorName = 'e-Advocate Services'; // This is the name used in seed script
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { authorName: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'Newest') sortOption = { createdAt: -1 };
        else if (sort === 'Oldest') sortOption = { createdAt: 1 };
        else if (sort === 'Views') sortOption = { views: -1 };

        const blogs = await Blog.find(query).sort(sortOption);
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE BLOG WITH IMAGE
router.post('/blogs', upload.single('image'), async (req, res) => {
    try {
        const { title, category, content, status, authorName, author } = req.body;

        const blog = await Blog.create({
            title,
            category,
            content,
            status: status || 'Pending',
            image: req.file ? req.file.path : null,
            author,
            authorName: authorName || 'Admin'
        });

        res.json({ success: true, blog });
    } catch (err) {
        console.error('Error creating blog:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// APPROVE BLOG
router.post('/blogs/:id/approve', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        if (blog.author) {
            createNotification('blog', `Your blog post "${blog.title}" has been approved!`, 'Admin', blog.author, { blogId: blog._id });
        }

        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// REJECT BLOG
router.post('/blogs/:id/reject', async (req, res) => {
    try {
        const { remarks } = req.body;
        const blog = await Blog.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        if (blog.author) {
            createNotification('blog', `Your blog post "${blog.title}" was rejected. Reason: ${remarks || 'Review requirements not met.'}`, 'Admin', blog.author, { blogId: blog._id });
        }

        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE BLOG
router.patch('/blogs/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.path;
        }

        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE BLOG
router.delete('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ONBOARD STAFF MEMBER
router.post('/onboard-staff', async (req, res) => {
    try {
        const { email, fullName, loginId, tempPassword, role, department, vendor, level } = req.body;

        if (!email || !fullName || !loginId || !tempPassword || !role) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const newUser = await User.create({
            email,
            password: hashedPassword,

            plainPassword: tempPassword,

            role: role.toLowerCase(), // Changed from toUpperCase() to match Mongoose enum
            status: 'Active',
            coins: 0
        });

        // Create Staff Profile
        await StaffProfile.create({
            userId: newUser._id,
            staffId: loginId,
            department: department || 'General',
            vendor: vendor || 'Internal',
            level: level || 'Junior'
        });

        const emailSubject = `Welcome to E-Advocate: Your Professional Credentials for ${role}`;
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Hello ${fullName},</h2>
                <p>Your account has been created as a <strong>${role}</strong>.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
                    <p><strong>Login ID:</strong> ${loginId}</p>
                    <p><strong>Password:</strong> ${tempPassword}</p>
                </div>
                <p>Please login at <a href="${req.protocol}://${req.get('host')}">E-Advocate Workspace</a></p>
                <p>You will be required to change your password on first login.</p>
            </div>
        `;

        await sendEmail(email, emailSubject, emailHTML.replace(/<[^>]*>?/gm, ''), emailHTML);

        res.json({
            success: true,
            message: 'Staff onboarded successfully',
            userId: newUser._id
        });

    } catch (err) {
        console.error('Onboarding Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ALL STAFF WITH PROFILES
router.get('/staff', async (req, res) => {
    try {
        // Fetch all users EXCEPT 'client' and 'advocate' to include all staff roles
        const users = await User.find({
            role: { $nin: ['client', 'advocate'], $exists: true }
        });

        const staffList = await Promise.all(users.map(async (u) => {
            const profile = await StaffProfile.findOne({ userId: u._id });
            return {
                id: u._id,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                profile: profile || {}
            };
        }));

        res.json({ success: true, staff: staffList });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET STAFF PERFORMANCE REPORTS
router.get('/staff/:id/reports', async (req, res) => {
    try {
        const { frequency } = req.query;
        let query = { staffId: req.params.id };
        if (frequency) query.frequency = frequency;

        const reports = await StaffReport.find(query).sort({ createdAt: -1 });
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET STAFF DETAILED WORK LOGS
router.get('/staff/:id/work-logs', async (req, res) => {
    try {
        const WorkLog = require('../models/WorkLog');
        const logs = await WorkLog.find({ staffId: req.params.id }).sort({ timestamp: -1 });
        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET REPORT LEADS
router.get('/reports/:id/leads', async (req, res) => {
    try {
        const leads = await Lead.find({ reportId: req.params.id });
        res.json({ success: true, leads });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ALLOCATE PROJECT TO STAFF
router.post('/staff/:id/allocate', async (req, res) => {
    try {
        const { project } = req.body;
        const profile = await StaffProfile.findOneAndUpdate(
            { userId: req.params.id },
            { currentProject: project },
            { new: true }
        );
        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= FINANCIAL MANAGEMENT =================
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });

        const enrichedTransactions = await Promise.all(transactions.map(async (t) => {
            const user = await User.findById(t.userId);
            let profile = null;
            if (user) {
                if (user.role.toLowerCase() === 'advocate') {
                    profile = await Advocate.findOne({ userId: user._id });
                } else if (user.role.toLowerCase() === 'client') {
                    profile = await Client.findOne({ userId: user._id });
                }
            }

            return {
                id: t._id,
                memberName: profile ? (profile.name || `${profile.firstName} ${profile.lastName}`) : 'Unknown',
                memberId: profile ? profile.unique_id : (user ? user._id : 'N/A'),
                email: user ? user.email : 'N/A',
                mobile: profile ? (profile.mobile || 'N/A') : 'N/A',
                role: user ? user.role : 'N/A',
                packageName: t.packageId || 'Custom',
                subPackage: (t.metadata && t.metadata.tier) || 'Standard',
                paymentMethod: t.gateway || 'N/A',
                amount: `₹${t.amount.toLocaleString()}`,
                discount: t.metadata && t.metadata.discount ? `₹${t.metadata.discount}` : '₹0.00',
                tax: t.metadata && t.metadata.tax ? `₹${t.metadata.tax}` : '₹0.00',
                netAmount: `₹${t.amount.toLocaleString()}`,
                status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
                transactionId: t.paymentId || t.orderId,
                transactionDate: t.createdAt.toLocaleString()
            };
        }));

        res.json({ success: true, transactions: enrichedTransactions });
    } catch (err) {
        console.error('Transaction fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE TRANSACTION STATUS (For Withdrawals/Refunds)
router.patch('/transactions/:id/status', async (req, res) => {
    try {
        const { status, remarks } = req.body; // status: 'Completed' | 'Failed'
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        const previousStatus = transaction.status;
        transaction.status = status;
        if (remarks) transaction.message = remarks;

        await transaction.save();

        if (status === 'Failed' && previousStatus !== 'Failed') {
            const user = await User.findById(transaction.userId);
            if (user) {
                if (transaction.packageId === 'withdrawal') {
                    user.walletBalance = (user.walletBalance || 0) + transaction.amount;
                    await user.save();
                    createNotification('payment', `Withdrawal of ₹${transaction.amount} was rejected and refunded.`, 'Admin', user._id);
                }
            }
        }
        else if (status === 'Completed' && previousStatus !== 'Completed') {
            createNotification('payment', `Transaction ${transaction.orderId} processed successfully.`, 'Admin', transaction.userId);
        }

        res.json({ success: true, transaction });
    } catch (err) {
        console.error('Update transaction error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// IMPERSONATE MEMBER
router.post('/impersonate/:id', async (req, res) => {
    try {
        // Simple security check (should ideally use middleware)
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'No authorization token provided' });

        if (token.startsWith('Bearer ')) token = token.slice(7);
        token = token.trim().replace(/^"|"$/g, ''); // Remove quotes if present

        let isAdmin = false;
        let debugRole = 'N/A';

        // 1. Handle Mock Admin Token
        if (token.includes('admin') || token.includes('65a001')) {
            isAdmin = true;
            debugRole = 'Mock Admin';
        }
        // 2. Handle Real User Token (Database Check)
        else if (token.startsWith('user-token-')) {
            const userId = token.split('user-token-')[1];
            if (require('mongoose').Types.ObjectId.isValid(userId)) {
                const adminRecord = await User.findById(userId);
                if (adminRecord) {
                    debugRole = adminRecord.role;
                    const r = adminRecord.role.toLowerCase();
                    if (r === 'admin' || r === 'superadmin' || r === 'administrator') {
                        isAdmin = true;
                    }
                }
            }
        }

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: `Only administrators can impersonate members. Your role: ${debugRole}`
            });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ success: false, error: 'User not found' });

        // In this system, tokens are 'user-token-' + ID
        const impersonationToken = 'user-token-' + targetUser._id;

        res.json({
            success: true,
            token: impersonationToken,
            user: {
                id: targetUser._id,
                email: targetUser.email,
                role: targetUser.role,
                name: targetUser.email,
                status: targetUser.status
            }
        });
    } catch (err) {
        console.error('Impersonation error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= LEGAL REQUEST MANAGEMENT =================

// GET ALL LEGAL REQUESTS
router.get('/legal-requests', async (req, res) => {
    try {
        const { type, status } = req.query;
        let query = {};
        if (type) query.type = type;
        if (status && status !== 'All') query.status = status;

        const requests = await LegalRequest.find(query).sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        console.error('Legal requests fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE/UPDATE LEGAL REQUEST
router.post('/legal-requests', async (req, res) => {
    try {
        const data = req.body;
        let request;
        if (data._id) {
            request = await LegalRequest.findByIdAndUpdate(data._id, data, { new: true });
        } else if (data.id) { // sometimes frontend uses 'id' instead of '_id'
            request = await LegalRequest.findByIdAndUpdate(data.id, data, { new: true });
        } else {
            // Generate requestId if not provided
            if (!data.requestId) {
                const prefix = data.type === 'Affidavit' ? 'AFF' : data.type === 'Agreement' ? 'AGR' : 'NTC';
                const count = await LegalRequest.countDocuments({ type: data.type });
                data.requestId = `${prefix}-REQ-${1000 + count + 1}`;
            }
            request = await LegalRequest.create(data);
        }
        res.json({ success: true, request });
    } catch (err) {
        console.error('Legal request save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE LEGAL REQUEST
router.delete('/legal-requests/:id', async (req, res) => {
    try {
        await LegalRequest.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Legal request deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ================= PROFILE CONFIGURATION MANAGEMENT =================

// GET SECTIONS CONFIG
router.get('/config/sections/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const config = await AdminConfig.findOne({ type: 'SECTION_CONFIG', role });
        res.json({ success: true, sections: config ? config.value : [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SAVE SECTIONS CONFIG
router.post('/config/sections/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const { sections } = req.body;

        const config = await AdminConfig.findOneAndUpdate(
            { type: 'SECTION_CONFIG', role },
            { value: sections, lastUpdated: Date.now() },
            { new: true, upsert: true }
        );

        res.json({ success: true, sections: config.value });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ATTRIBUTES CONFIG
router.get('/config/attributes/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const config = await AdminConfig.findOne({ type: 'ATTRIBUTE_CONFIG', role });
        res.json({ success: true, attributes: config ? config.value : [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SAVE ATTRIBUTES CONFIG
router.post('/config/attributes/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const { attributes } = req.body;

        const config = await AdminConfig.findOneAndUpdate(
            { type: 'ATTRIBUTE_CONFIG', role },
            { value: attributes, lastUpdated: Date.now() },
            { new: true, upsert: true }
        );

        res.json({ success: true, attributes: config.value });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= REFERRAL COMMISSION MANAGEMENT =================
// GET ALL RULES
router.get('/referral/rules', async (req, res) => {
    try {
        const rules = await CommissionRule.find().sort({ createdAt: 1 });
        res.json({ success: true, rules });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE/UPDATE RULE
router.post('/referral/rules', async (req, res) => {
    try {
        const data = req.body;
        let rule;
        if (data._id) {
            rule = await CommissionRule.findByIdAndUpdate(data._id, data, { new: true });
        } else {
            rule = await CommissionRule.create(data);
        }
        res.json({ success: true, rule });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE RULE
router.delete('/referral/rules/:id', async (req, res) => {
    try {
        await CommissionRule.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Rule deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// TEST EMAIL ENDPOINTS FOR ADMIN DEMO
router.post('/test-reject-email', async (req, res) => {
    try {
        const { email, remarks } = req.body;
        const profileName = 'Demo Member';

        const emailSubject = 'Action Required: Your Verification Request Status';
        const emailText = `Hello ${profileName},\n\nThank you for your interest in E-Advocate.\n\nWe've reviewed your registration documents, and unfortunately, we couldn't verify your profile at this time for the following reason:\n\n**Reason for Rejection:**\n${remarks || 'Sample rejection reason.'}\n\n**Solution & Next Steps:**\nTo get your profile approved, please:\n1. Log in to your dashboard here: ${req.protocol}://${req.get('host')}/login\n2. Navigate to the profile or document section.\n3. Correct the issues mentioned above (e.g., upload a clearer ID proof, correct your name, etc.).\n4. Resubmit your profile for verification.\n\nOur team will review your updated information within 12-24 hours.\n\nThank you,\nE-Advocate Team`;

        await sendEmail(email, emailSubject, emailText);
        res.json({ success: true, message: 'Test rejection email sent' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/test-approve-email', async (req, res) => {
    try {
        const { email } = req.body;
        const profileName = 'Demo Member';
        const uniqueId = 'TP-EAD-DEMO-123456';

        const emailSubject = 'Welcome to E-Advocate - Your Profile is Verified!';
        const emailText = `Hello ${profileName},\n\nCongratulations! Your account has been successfully verified. You now have full access to the E-Advocate platform.\n\n**Your Unique ID: ${uniqueId}**\n\nLogin here: ${req.protocol}://${req.get('host')}/login\n\nBest regards,\nE-Advocate Team`;

        await sendEmail(email, emailSubject, emailText);
        res.json({ success: true, message: 'Test approval email sent' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
