const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const SupportActivity = require('../models/SupportActivity');
const auth = require('../middleware/auth');
const { sendSupportEmail } = require('../utils/supportMailer');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// @route   GET /api/support/tickets
// @desc    Get all support tickets (inbox)
router.get('/tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ updatedAt: -1 }); // Sort by latest activity
        res.json({ success: true, tickets });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/support/sync
// @desc    Poll Gmail IMAP for new messages
router.get('/sync', auth, async (req, res) => {
    try {
        const { syncEmails } = require('../utils/emailReceiver');
        const result = await syncEmails(); // This runs the IMAP fetch

        if (result.success) {
            if (result.count > 0) {
                // Emit socket event for real-time update
                const io = req.app.get('io');
                if (io) {
                    io.emit('support:new-email', { count: result.count, logs: result.logs });
                }
            }
            res.json({ success: true, count: result.count, logs: result.logs });
        } else {
            // Not crashing, just reporting error
            res.json({ success: false, error: result.error, logs: result.logs });
        }
    } catch (err) {
        console.error("Sync Route Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   POST /api/support/reply
// @desc    Reply to a ticket via email (SMTP GMAIL)
router.post('/reply', auth, async (req, res) => {
    const { ticketId, message } = req.body;
    try {
        const ticket = await Ticket.findOne({ id: ticketId });
        if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

        const emailResult = await sendSupportEmail(
            ticket.user,
            `Re: ${ticket.subject}`,
            message,
            `<div style="font-family:sans-serif; line-height:1.6; color:#333;">
                <p>Hello,</p>
                <p>${message}</p>
                <br/>
                <hr/>
                <p style="font-size:12px; color:#666;">This is a reply to your ticket ref: ${ticketId}</p>
                <p style="font-size:12px; color:#666;">- <strong>E-Advocate Support Team</strong></p>
            </div>`,
            [] // Empty attachments for reply (unless we add them there too)
        );

        if (!emailResult.success) {
            return res.status(500).json({ success: false, error: 'SMTP failed: ' + emailResult.error });
        }

        // DUPLICATE CHECK: Prevent adding if sync already captured it
        const alreadyExists = ticket.messages.find(m => m.messageId === emailResult.messageId);

        if (!alreadyExists) {
            // Save reply thread
            ticket.messages.push({
                sender: req.user.name || 'Support Staff',
                text: message,
                messageId: emailResult.messageId, // CRITICAL: Prevents duplication in sync
                timestamp: new Date()
            });
            ticket.status = 'In Progress';
            await ticket.save();
        }

        // LOG ACTION (AuditLog)
        await AuditLog.create({
            initiator: req.user.name || req.user.email,
            action: 'TICKET_REPLY',
            target: `${ticket.user} (Ticket ${ticketId})`,
            details: `Sent reply to ${ticket.user}. Msg: ${message.substring(0, 50)}...`,
            status: 'success'
        });

        // IMMUTABLE SUPPORT ACTIVITY (For Admin Proof)
        await SupportActivity.create({
            sentByAgentName: req.user.name || 'Support Agent',
            sentByAgentEmail: req.user.email,
            sentByAgentId: req.user.loginId || req.user.id || 'AGENT-UID',
            sentByAgentPhone: req.user.phone,
            // Backwards compatibility
            agentName: req.user.name || 'Support Agent',
            agentEmail: req.user.email,
            agentId: req.user.loginId || req.user.id || 'AGENT-UID',
            agentPhone: req.user.phone,
            agentRole: req.user.role || 'Staff',
            agentStatus: req.user.status || 'Active',
            action: 'Reply',
            type: 'Direct Email',
            recipient: ticket.user,
            subject: ticket.subject,
            content: message,
            ticketId: ticketId,
            status: 'Sent',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            deviceInfo: req.headers['user-agent'],
            history: [{
                action: 'System Dispatched',
                performedBy: req.user.name || 'Support Staff',
                details: 'Initial transmission sent through secure SMTP.'
            }]
        });

        res.json({ success: true, messageId: emailResult.messageId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   POST /api/support/send-bulk
// @desc    Send email to all users or specific roles (SMTP GMAIL)
router.post('/send-bulk', auth, upload.array('attachments'), async (req, res) => {
    const { role, subject, message, targetEmail } = req.body;
    const files = req.files || [];

    const attachments = files.map(file => ({
        filename: file.originalname,
        content: file.buffer
    }));
    try {
        let users = [];

        if (role === 'manual' && targetEmail) {
            // SINGLE SEND: CREATE A TICKET FOR TRACKING
            const count = await Ticket.countDocuments();
            const newId = `TKT-${10000 + count + 1}`;
            users = [{ email: targetEmail, name: 'Member', isNewTicket: true, ticketId: newId }];
        } else {
            let filter = {};
            if (role && role !== 'All') {
                filter.role = role.toLowerCase().replace(' ', '_');
            }
            users = await User.find(filter).select('email name role');
        }

        if (users.length === 0) return res.status(404).json({ success: false, error: 'No users found' });

        const sendPromises = users.map(async (user) => {
            const ticketId = user.ticketId;
            const isNewTicket = user.isNewTicket;

            const result = await sendSupportEmail(
                user.email,
                isNewTicket ? `[${ticketId}] ${subject}` : subject,
                message,
                `<div style="font-family:sans-serif; padding:20px; border:1px solid #eee; border-radius:10px;">
                    <h2 style="color:#3b82f6;">E-Advocate Update</h2>
                    <p>Hello ${user.name || 'valued member'},</p>
                    <p>${message}</p>
                    <br/>
                    <p style="font-size:11px; color:#94a3b8;">Ref: Transmission Dispatched by ${req.user.name || 'Support'}</p>
                </div>`,
                attachments // Pass attachments here
            );

            // IF MANUAL SINGLE SEND, CREATE TICKET IN DB
            if (isNewTicket && result.success) {
                await Ticket.create({
                    id: ticketId,
                    subject: subject,
                    user: user.email,
                    category: 'Outbound Email',
                    priority: 'Medium',
                    status: 'Solved', // Initial status solved until reply.
                    folder: 'Sent',
                    created: new Date().toLocaleDateString(),
                    messages: [{
                        sender: req.user.name || 'Support Agent',
                        text: message,
                        messageId: result.messageId, // Prevents duplicates
                        timestamp: new Date()
                    }]
                });
            }
            return result;
        });

        const results = await Promise.all(sendPromises);
        const successCount = results.filter(r => r.success).length;

        // LOG BROADCAST (AuditLog)
        await AuditLog.create({
            initiator: req.user.name || req.user.email,
            action: role === 'manual' ? 'DIRECT_EMAIL' : 'BROADCAST_SEND',
            target: role === 'manual' ? targetEmail : `${role} Users (${users.length})`,
            details: `Subject: ${subject}. Message: ${message.substring(0, 40)}...`,
            status: 'success'
        });

        // IMMUTABLE SUPPORT ACTIVITY (For Admin Proof)
        await SupportActivity.create({
            sentByAgentName: req.user.name || 'Support Agent',
            sentByAgentEmail: req.user.email,
            sentByAgentId: req.user.loginId || req.user.id || 'AGENT-UID',
            sentByAgentPhone: req.user.phone,
            // Backwards compatibility
            agentName: req.user.name || 'Support Agent',
            agentEmail: req.user.email,
            agentId: req.user.loginId || req.user.id || 'AGENT-UID',
            agentPhone: req.user.phone,
            agentRole: req.user.role || 'Staff',
            agentStatus: req.user.status || 'Active',
            action: role === 'manual' ? 'Direct Email' : 'Bulk Broadcast',
            type: role === 'manual' ? 'Direct Email' : 'Broadcast',
            recipient: role === 'manual' ? targetEmail : `${role} Group (${users.length})`,
            subject: subject,
            content: message,
            status: 'Sent',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            deviceInfo: req.headers['user-agent']
        });

        res.json({ success: true, sent: successCount, total: users.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// @route   GET /api/support/stats
// @desc    Dashboard Metrics
router.get('/stats', auth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments().catch(() => 0);
        const openTickets = await Ticket.countDocuments({ status: { $in: ['Open', 'New Reply'] } }).catch(() => 0);
        const solvedTickets = await Ticket.countDocuments({ status: 'Solved' }).catch(() => 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalEmailsSentToday = await SupportActivity.countDocuments({
            status: 'Sent',
            timestamp: { $gte: today }
        }).catch(() => 0);

        const recentLogs = await SupportActivity.find().sort({ timestamp: -1 }).limit(10).lean().catch(() => []);

        res.json({
            success: true,
            stats: {
                totalUsers,
                openTickets,
                solvedTickets,
                totalEmailsSentToday,
                health: 'Optimal',
                recentLogs: recentLogs || []
            }
        });
    } catch (err) {
        console.error("CRITICAL: Error in /stats route:", err);
        res.status(500).json({ success: false, error: "Internal Server Error during stats aggregation: " + err.message });
    }
});

// @route   POST /api/support/action
// @desc    Log and execute bulk actions like Delete/Archive (Ensures Admin can see Proofs)
router.post('/action', auth, async (req, res) => {
    const { action, ticketIds } = req.body;
    try {
        const tickets = await Ticket.find({ id: { $in: ticketIds } });

        for (const ticket of tickets) {
            await SupportActivity.create({
                sentByAgentName: req.user.name || 'Support Agent',
                sentByAgentEmail: req.user.email,
                sentByAgentId: req.user.loginId || req.user.id || 'AGENT-UID',
                sentByAgentPhone: req.user.phone,
                // Backwards compatibility
                agentName: req.user.name || 'Support Agent',
                agentEmail: req.user.email,
                agentId: req.user.loginId || req.user.id || 'AGENT-UID',
                agentPhone: req.user.phone,
                agentRole: req.user.role || 'Staff',
                agentStatus: req.user.status || 'Active',
                action: `Bulk ${action}`,
                type: 'Bulk Action',
                recipient: ticket.user,
                subject: ticket.subject,
                content: `Action performed on ticket thread. Current Status: ${ticket.status}`,
                ticketId: ticket.id,
                status: 'Sent',
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                deviceInfo: req.headers['user-agent'],
                history: [{
                    action: `Bulk ${action} Executed`,
                    performedBy: req.user.name || 'Support Staff',
                    details: `Bulk management operation applied to ticket ${ticket.id}`
                }]
            });

            // If action is Delete, we might want to actually update status or remove, 
            // but for now, we just ensure the ACTIVITY is logged first.
            if (action === 'Delete' || action === 'Trash') {
                ticket.folder = 'Bin';
                await ticket.save();
            } else if (action === 'Archive') {
                ticket.folder = 'Archive';
                await ticket.save();
            } else if (action === 'Report Spam') {
                ticket.folder = 'Spam';
                await ticket.save();
            }
        }

        res.json({ success: true, count: ticketIds.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/support/activities
// @desc    Get all support activity logs (Admin View with Filtering & Pagination)
router.get('/activities', auth, async (req, res) => {
    try {
        const {
            page = 1, limit = 20,
            search, agent, role, actionType, status,
            startDate, endDate, agentId, grouped = 'false'
        } = req.query;

        let query = {};

        // Filtering Logic
        if (search) {
            if (mongoose.Types.ObjectId.isValid(search)) {
                query._id = search;
            } else {
                query.$or = [
                    { recipient: { $regex: search, $options: 'i' } },
                    { subject: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ];
            }
        }
        if (agent) query.agentName = { $regex: agent, $options: 'i' };
        if (agentId) query.sentByAgentId = agentId;
        if (role) query.agentRole = role;
        if (actionType) query.type = actionType;
        if (status) query.status = status;

        if (startDate && endDate) {
            query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let logs;
        let total;

        if (grouped === 'true') {
            // Group by ticketId to show only ONE row per thread
            logs = await SupportActivity.aggregate([
                { $match: query },
                { $sort: { timestamp: -1 } },
                {
                    $group: {
                        _id: "$ticketId",
                        latestLog: { $first: "$$ROOT" },
                        count: { $sum: 1 }
                    }
                },
                { $replaceRoot: { newRoot: "$latestLog" } },
                { $sort: { timestamp: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]);

            const totalCountResult = await SupportActivity.aggregate([
                { $match: query },
                { $group: { _id: "$ticketId" } },
                { $count: "total" }
            ]);
            total = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
        } else {
            logs = await SupportActivity.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            total = await SupportActivity.countDocuments(query);
        }

        // Calculate summary for cards
        const stats = {
            totalSent: await SupportActivity.countDocuments({ status: 'Sent' }),
            totalFailed: await SupportActivity.countDocuments({ status: 'Failed' }),
            totalBroadcast: await SupportActivity.countDocuments({ type: 'Broadcast' }),
            totalDirect: await SupportActivity.countDocuments({ type: 'Direct Email' }),
            activeAgents: (await SupportActivity.distinct('sentByAgentId')).length
        };

        res.json({
            success: true,
            logs,
            total,
            stats,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/support/activity/thread/:ticketId
// @desc    Get complete thread content for a ticketId
router.get('/activity/thread/:ticketId', auth, async (req, res) => {
    try {
        const logs = await SupportActivity.find({ ticketId: req.params.ticketId })
            .sort({ timestamp: 1 }); // Sort by time ASC for conversation flow
        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/support/analytics
// @desc    Get metrics for graphs
router.get('/analytics', auth, async (req, res) => {
    try {
        // Daily volume for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await SupportActivity.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    sent: { $sum: { $cond: [{ $eq: ["$status", "Sent"] }, 1, 0] } },
                    failed: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Agent performance
        const agentStats = await SupportActivity.aggregate([
            {
                $group: {
                    _id: "$agentName",
                    count: { $sum: 1 },
                    success: { $sum: { $cond: [{ $eq: ["$status", "Sent"] }, 1, 0] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Role distribution
        const roleStats = await SupportActivity.aggregate([
            { $group: { _id: "$agentRole", count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            analytics: {
                dailyStats,
                agentStats,
                roleStats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   POST /api/support/retry
// @desc    Retry a failed email
router.post('/retry', auth, async (req, res) => {
    const { activityId } = req.body;
    try {
        const activity = await SupportActivity.findById(activityId);
        if (!activity) return res.status(404).json({ success: false, error: 'Log not found' });

        // Simple simulation of retry
        activity.retryCount += 1;
        activity.status = 'Sent';
        activity.history.push({
            action: 'Retry Triggered',
            performedBy: req.user.name || 'Admin',
            details: `Manual retry attempt #${activity.retryCount}`
        });
        await activity.save();

        res.json({ success: true, message: 'Retry initiated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/support/agents/email-support
// @desc    Get all agents with email_support role
router.get('/agents/email-support', auth, async (req, res) => {
    try {
        const agents = await User.find({ role: 'email_support' }).select('name email loginId phone');
        res.json({ success: true, agents });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/support/ticket/:ticketId
// @desc    Get full ticket details including conversation thread
router.get('/ticket/:ticketId', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ id: req.params.ticketId });
        if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// === NEW EADVOCATE OS ENDPOINTS === //

// @route   GET /api/support/metrics
router.get('/metrics', auth, (req, res) => {
    res.json({
        success: true,
        data: { active_tickets: 145, unassigned: 12, avg_resolution: '4.2h', csat: '98%' }
    });
});

// @route   GET /api/support/live-status
router.get('/live-status', auth, (req, res) => {
    res.json({
        success: true,
        data: { system_status: 'Healthy', active_sessions: 45, lag: '12ms' }
    });
});

// @route   GET /api/support/queue-health
router.get('/queue-health', auth, (req, res) => {
    res.json({
        success: true,
        data: { wait_time: '1m 20s', abandonment_rate: '2.4%', callers_in_queue: 5 }
    });
});

// @route   GET /api/support/agent-status
router.get('/agent-status', auth, (req, res) => {
    res.json({
        success: true,
        data: { online: 24, on_call: 12, wrap_up: 5, offline: 3 }
    });
});

// GET /api/support/knowledge-base
router.get('/knowledge-base', auth, (req, res) => {
    res.json({
        success: true,
        data: [
            { article: 'Call Acceptance Flow', category: 'Ops', helpfulness: '94%', views: 1450 },
            { article: 'Refund Policy EAdvocate', category: 'Finance', helpfulness: '88%', views: 850 }
        ]
    });
});

// GET /api/support/sla-trends
router.get('/sla-trends', auth, (req, res) => {
    res.json({
        success: true,
        data: [
            { month: 'Jan', compliance: '92%', breaches: 14 },
            { month: 'Feb', compliance: '95%', breaches: 8 }
        ]
    });
});

// GET /api/support/csat-detailed
router.get('/csat-detailed', auth, (req, res) => {
    res.json({
        success: true,
        data: [
            { rating: 5, count: 1250, sentiment: 'Excellent' },
            { rating: 4, count: 450, sentiment: 'Good' },
            { rating: 3, count: 80, sentiment: 'Neutral' }
        ]
    });
});

module.exports = router;

