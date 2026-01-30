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
const { createNotification } = require('../utils/notif');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../utils/mailer');
const bcrypt = require('bcryptjs');

// MULTER CONFIG FOR BLOG IMAGES
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/blogs';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `blog-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

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
            totalManagers: await User.countDocuments({ role: 'manager' }),
            totalTeamLeads: await User.countDocuments({ role: 'teamlead' }),
            totalStaff: await User.countDocuments({ role: { $in: ['verifier', 'finance', 'support'] } }),
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
            deletedUnits: await User.countDocuments({ status: 'Deleted' })
        };

        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ALL MEMBERS (List view)
router.get('/members', async (req, res) => {
    try {
        const { role, status, search } = req.query;
        let query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query);

        const members = await Promise.all(users.map(async (u) => {
            let profile = null;
            if (u.role.toLowerCase() === 'advocate') {
                profile = await Advocate.findOne({ userId: u._id });
            } else if (u.role.toLowerCase() === 'client') {
                profile = await Client.findOne({ userId: u._id });
            }

            let location = 'N/A';
            if (profile) {
                if (u.role.toLowerCase() === 'advocate' && profile.location?.city) {
                    location = `${profile.location.city}, ${profile.location.state || ''}`;
                } else if (u.role.toLowerCase() === 'client') {
                    const addr = profile.address || {};
                    location = addr.city ? `${addr.city}, ${addr.state || ''}` : (addr.state || 'N/A');
                }
            }

            return {
                id: u._id,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                coins: u.coins,
                plan: u.plan || 'Free',
                name: profile ? (profile.name || `${profile.firstName} ${profile.lastName}`) : 'N/A',
                phone: profile ? (profile.mobile || 'N/A') : 'N/A',
                gender: profile ? profile.gender : 'N/A',
                verified: profile ? profile.verified : false,
                location: location,
                avatar: profile ? (profile.profilePicPath || profile.avatar) : null,
                unique_id: profile ? profile.unique_id : `U-${u._id.toString().slice(-4)}`
            };
        }));

        res.json({ success: true, members });
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
            if (user.role.toLowerCase() === 'advocate') {
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

        if (user.role.toLowerCase() === 'advocate') {
            const advocate = await Advocate.findOneAndUpdate({ userId: user._id }, { verified }, { new: true });
            if (!advocate) return res.status(404).json({ error: 'Advocate profile not found' });

            user.status = verified ? 'Active' : 'Pending';
            await user.save();

            if (verified) {
                const emailSubject = 'Congratulations! Your Advocate Profile is Verified';
                const emailText = `Hello ${advocate.name || advocate.firstName},\n\nWe are pleased to inform you that your advocate profile has been successfully verified. You now have full access to the E-Advocate platform.\n\nYou can login using your registered email and password at:\n${req.protocol}://${req.get('host')}/login\n\nBest regards,\nE-Advocate Team`;
                await sendEmail(user.email, emailSubject, emailText);
            }

            createNotification('profileUpdate', `Your advocate profile was ${verified ? 'verified' : 'unverified'}`, 'Admin', user._id);
            res.json({ success: true, message: `Advocate ${verified ? 'verified' : 'unverified'} successfully` });
        } else if (user.role.toLowerCase() === 'client') {
            user.status = verified ? 'Active' : 'Pending';
            await user.save();

            const profile = await Client.findOne({ userId: user._id });
            if (verified && profile) {
                const emailSubject = 'Important: Your Client Account is Now Active';
                const emailText = `Hello ${profile.firstName} ${profile.lastName},\n\nYour account has been verified and activated by our team. You can now post legal requirements and connect with advocates.\n\nLogin here: ${req.protocol}://${req.get('host')}/login\n\nBest regards,\nE-Advocate Team`;
                await sendEmail(user.email, emailSubject, emailText);
            }

            createNotification('profileUpdate', `Your client profile was ${verified ? 'verified' : 'unverified'}`, 'Admin', user._id);
            res.json({ success: true, message: `Client ${verified ? 'verified' : 'unverified'} successfully` });
        } else {
            res.status(400).json({ error: 'Invalid user role for verification' });
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

        // Update status to Pending
        user.status = 'Pending';
        await user.save();

        let profileName = 'User';
        if (user.role.toLowerCase() === 'advocate') {
            const profile = await Advocate.findOneAndUpdate({ userId: user._id }, { verified: false }, { new: true });
            if (profile) {
                profileName = profile.name || `${profile.firstName} ${profile.lastName}`;
            }
        } else if (user.role.toLowerCase() === 'client') {
            const profile = await Client.findOne({ userId: user._id });
            if (profile) {
                profileName = `${profile.firstName} ${profile.lastName}`;
            }
        }

        // Send Email
        const emailSubject = 'Action Required: Your Verification Request';
        const emailText = `Hello ${profileName},\n\nYour profile verification was not successful for the following reason:\n\n${remarks}\n\nPlease click the link below to verify/update your details:\n${req.protocol}://${req.get('host')}/dashboard\n\nThank you,\nE-Advocate Team`;

        await sendEmail(user.email, emailSubject, emailText);

        res.json({ success: true, message: 'Member rejected and informed via email' });
    } catch (err) {
        console.error('Reject error:', err);
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
        const update = req.body;
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });

        // NOTIFICATION: TICKET UPDATE
        createNotification('ticket', `Ticket ${req.params.id} updated: ${update.status || 'modified'}`, 'Admin', null, { ticketId: req.params.id });

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET MEMBER DETAIL
router.get('/members/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        let profile = null;
        if (user.role.toLowerCase() === 'advocate') {
            profile = await Advocate.findOne({ userId: user._id }).lean();
        } else if (user.role.toLowerCase() === 'client') {
            profile = await Client.findOne({ userId: user._id }).lean();
        }

        const documents = [];
        if (profile) {
            if (user.role.toLowerCase() === 'advocate') {
                if (profile.profilePicPath) documents.push({ name: 'Profile Photo', path: profile.profilePicPath });
                if (profile.education?.certificatePath) documents.push({ name: 'Education Certificate', path: profile.education.certificatePath });
                if (profile.practice?.licensePath) documents.push({ name: 'Practice License', path: profile.practice.licensePath });
                if (profile.idProof?.docPath) documents.push({ name: profile.idProof.docType || 'ID Proof', path: profile.idProof.docPath });
                if (profile.signaturePath) documents.push({ name: 'Signature', path: profile.signaturePath });
            } else {
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

// DELETE MEMBER
router.delete('/members/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role.toLowerCase() === 'advocate') {
            await Advocate.deleteOne({ userId: user._id });
        } else if (user.role.toLowerCase() === 'client') {
            await Client.deleteOne({ userId: user._id });
        }

        await User.findByIdAndDelete(user._id);

        res.json({ success: true, message: 'Member deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= BLOG MANAGEMENT =================

// GET ALL BLOGS
router.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
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
            image: req.file ? `/uploads/blogs/${req.file.filename}` : null,
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

// ONBOARD STAFF MEMBER
router.post('/onboard-staff', async (req, res) => {
    try {
        const { email, fullName, loginId, tempPassword, role } = req.body;

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
            role: role.toUpperCase(),
            status: 'Active',
            coins: 0
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

// IMPERSONATE MEMBER
router.post('/impersonate/:id', async (req, res) => {
    try {
        // Simple security check (should ideally use middleware)
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'No authorization token provided' });

        if (token.startsWith('Bearer ')) token = token.slice(7);

        let isAdmin = false;

        // 1. Handle Mock Admin Token
        if (token.includes('admin') || token.includes('65a001')) {
            isAdmin = true;
        }
        // 2. Handle Real User Token (Database Check)
        else if (token.startsWith('user-token-')) {
            const userId = token.split('user-token-')[1];
            if (require('mongoose').Types.ObjectId.isValid(userId)) {
                const adminRecord = await User.findById(userId);
                if (adminRecord && (adminRecord.role.toLowerCase() === 'admin' || adminRecord.role.toLowerCase() === 'superadmin')) {
                    isAdmin = true;
                }
            }
        }

        if (!isAdmin) {
            return res.status(403).json({ success: false, error: 'Only administrators can impersonate members' });
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
                name: targetUser.email, // Fallback name
                status: targetUser.status
            }
        });
    } catch (err) {
        console.error('Impersonation error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
