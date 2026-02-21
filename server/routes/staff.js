const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Lead = require('../models/Lead');
const CallLog = require('../models/CallLog');
const StaffProfile = require('../models/StaffProfile');
const StaffReport = require('../models/StaffReport');

// Use auth for all routes here
router.use(auth);

// Get assigned leads for current staff
router.get('/my-leads', async (req, res) => {
    try {
        const staffId = req.user.id;
        const leads = await Lead.find({ staffId }).sort({ createdAt: -1 }).lean();

        // Enhance leads with userId if they are registered users
        const enhancedLeads = await Promise.all(leads.map(async (lead) => {
            // Web-to-web calls need a User ID. Check Client/Advocate profiles for this mobile.
            const Client = require('../models/Client');
            const Advocate = require('../models/Advocate');

            const clientProfile = await Client.findOne({ mobile: lead.clientMobile });
            const advocateProfile = !clientProfile ? await Advocate.findOne({ mobile: lead.clientMobile }) : null;

            const targetProfile = clientProfile || advocateProfile;

            return {
                ...lead,
                targetUserId: targetProfile ? targetProfile.userId : null
            };
        }));

        res.json({ success: true, leads: enhancedLeads });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
});

// Update lead status and record activity
router.post('/leads/:id/update', async (req, res) => {
    try {
        const { status, notes, callData, urgency, budget, genuine, city, problem } = req.body;
        const WorkLog = require('../models/WorkLog');

        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

        // Update main fields
        if (status) lead.leadStatus = status;
        if (notes) lead.notes = notes;
        if (urgency) lead.qualityUrgency = urgency;
        if (budget) lead.qualityBudgetLine = budget;
        if (genuine) lead.qualityGenuine = genuine;
        if (city) lead.clientCity = city;
        if (problem) lead.problem = problem;

        // Push to history
        lead.history.push({ status: status || lead.leadStatus, notes: notes || lead.notes });
        await lead.save();

        // Create a WorkLog entry for the admin dashboard
        await WorkLog.create({
            staffId: req.user.id,
            leadId: lead._id,
            title: `Lead Sync: ${lead.clientName}`,
            description: notes || `Updated status to ${status}`,
            type: 'status_update',
            tags: [status, lead.category]
        });

        if (callData) {
            await CallLog.create({
                staffId: req.user.id,
                leadId: lead._id,
                ...callData
            });

            // Also log call as work log
            await WorkLog.create({
                staffId: req.user.id,
                leadId: lead._id,
                title: `${callData.mode} Call: ${lead.clientName}`,
                description: callData.notes || 'Interaction completed',
                type: 'call',
                duration: `${Math.floor(callData.duration / 60)}m ${callData.duration % 60}s`,
                tags: ['Call', callData.mode, status]
            });
        }

        // Auto-update staff metrics if converted
        if (status === 'Converted') {
            await StaffProfile.findOneAndUpdate(
                { userId: req.user.id },
                { $inc: { solvedCases: 1 } }
            );
        }

        res.json({ success: true, lead });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, error: 'Failed to update lead' });
    }
});

// Get staff's own call logs
router.get('/call-logs', async (req, res) => {
    try {
        const logs = await CallLog.find({ staffId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(200)
            .populate('leadId', 'clientName clientMobile leadStatus')
            .lean();
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch call logs' });
    }
});

// Get staff's own performance snapshot
router.get('/performance', async (req, res) => {
    try {
        let profile = await StaffProfile.findOne({ userId: req.user.id });
        if (!profile) {
            // Return empty stats if no profile exists yet
            profile = { solvedCases: 0, pendingCases: 0, successRate: '0%' };
        }
        const callsToday = await CallLog.countDocuments({
            staffId: req.user.id,
            timestamp: { $gte: new Date().setHours(0, 0, 0, 0) }
        });
        const convertedLeads = await Lead.countDocuments({
            staffId: req.user.id,
            leadStatus: 'Converted'
        });

        res.json({
            success: true,
            stats: {
                solvedCases: profile.solvedCases,
                pendingCases: profile.pendingCases,
                successRate: profile.successRate,
                callsToday,
                convertedLeads
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch performance' });
    }
});

// Get all members for directory (Role-based access)
router.get('/all-members', async (req, res) => {
    try {
        const userRole = (req.user.role || '').toLowerCase();
        let query = {};

        // Group A: General Operations (Telecaller, Data Entry, Customer Care) -> See ALL Active Members (Clients, Advocates, Legal Advisors ONLY)
        if (['telecaller', 'customer_care', 'data_entry', 'verifier', 'support', 'manager', 'teamlead'].includes(userRole)) {
            query = {
                role: { $in: ['client', 'advocate', 'legal_provider'] },
                status: 'Active'
            };
        }
        // Group B: Premium Support (Chat, Call, Agents) -> See PREMIUM Members Only (Clients, Advocates, Legal Advisors ONLY)
        else if (['chat_support', 'call_support', 'personal_agent', 'chat_agent', 'call_agent'].includes(userRole)) {
            query = {
                role: { $in: ['client', 'advocate', 'legal_provider'] },
                isPremium: true,
                status: 'Active'
            };
        } else {
            return res.json({ success: true, members: [] });
        }

        const users = await User.find(query).sort({ createdAt: -1 }).select('name email role isPremium plan status mobile').lean();

        // Enrich with correct mobile/location from profiles
        const Advocate = require('../models/Advocate');
        const Client = require('../models/Client');

        const members = await Promise.all(users.map(async (u) => {
            let profile = null;
            if (u.role === 'advocate') profile = await Advocate.findOne({ userId: u._id }).select('mobile location practice');
            else if (u.role === 'client') profile = await Client.findOne({ userId: u._id }).select('mobile location');

            let mobile = u.mobile || profile?.mobile || 'N/A';
            let city = profile?.location?.city || 'N/A';
            let category = u.role === 'advocate' ? 'Advocate' : 'Client';

            return {
                _id: u._id, // Use User ID as primary key for list
                clientName: u.name || u.email,
                clientMobile: mobile,
                clientCity: city,
                category: category,
                leadStatus: 'Active', // Default status for directory view
                problem: u.isPremium ? 'Premium Member' : 'Approved Member',
                isDirectoryItem: true, // Flag for frontend
                targetUserId: u._id
            };
        }));

        res.json({ success: true, members });

    } catch (error) {
        console.error('Fetch members error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch members' });
    }
});

module.exports = router;
