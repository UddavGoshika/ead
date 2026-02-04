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

module.exports = router;
