const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Call = require('../models/Call');
const Ticket = require('../models/Ticket');
const Lead = require('../models/Lead');
const User = require('../models/User');

// ==========================================
// LIVE OVERVIEW & CALL QUEUE MODULES
// ==========================================

// GET /api/os/calls/live (Live Overview)
router.get('/calls/live', async (req, res) => {
    try {
        const liveCalls = await Call.find({ status: { $in: ['ringing', 'accepted'] } })
            .sort({ timestamp: -1 })
            .limit(50)
            .populate('caller receiver');

        // Transform for table
        const formattedCalls = liveCalls.map(c => ({
            id: c._id,
            caller_number: c.caller?.email || 'Unknown',
            intent: c.type || 'General Inquiry',
            wait_time: c.status === 'ringing' ? '0:45' : 'N/A',
            status: c.status,
            assigned_agent: c.receiver?.name || 'Unassigned',
        }));

        res.json({ success: true, liveCalls: formattedCalls });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/os/calls/queue (Call Queue)
router.get('/calls/queue', async (req, res) => {
    try {
        const queueCalls = await Call.find({ status: 'ringing' })
            .sort({ timestamp: -1 })
            .limit(20)
            .populate('caller');

        res.json({ success: true, queueCalls });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/os/calls/action
router.post('/calls/action', async (req, res) => {
    try {
        const { callId, action } = req.body;
        // mock actions for 'accept', 'reject', 'mute', 'hold', 'transfer', 'record', 'force-route', 'monitor'
        const call = await Call.findById(callId);
        if (call) {
            if (action === 'accept') call.status = 'accepted';
            if (action === 'reject') call.status = 'rejected';
            if (action === 'force-route' || action === 'reassign') {
                // mock reassignment
                call.status = 'ringing';
            }
            await call.save();
        }
        res.json({ success: true, action, callId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ==========================================
// TICKET MONITOR MODULE
// ==========================================

router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .sort({ createdAt: -1 })
            .limit(100);

        const formattedTickets = tickets.map(t => ({
            id: t.id || t._id,
            _id: t._id,
            customer: t.user,
            priority: t.priority,
            status: t.status,
            assigned_agent: t.assignedTo,
            created_at: t.createdAt,
        }));

        res.json({ success: true, tickets: formattedTickets });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.patch('/tickets/:id/action', async (req, res) => {
    try {
        const { action, agentName } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

        if (action === 'assign') {
            ticket.assignedTo = agentName || 'Assigned Agent';
            ticket.status = 'In Progress';
        } else if (action === 'escalate') {
            ticket.priority = 'High';
        } else if (action === 'close') {
            ticket.status = 'Solved';
        }

        await ticket.save();
        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ==========================================
// LEAD MANAGEMENT MODULE
// ==========================================

router.get('/leads', async (req, res) => {
    try {
        const leads = await Lead.find()
            .sort({ createdAt: -1 })
            .limit(100);

        const formattedLeads = leads.map(l => ({
            id: l._id,
            name: l.clientName,
            phone: l.clientMobile,
            email: 'N/A',
            source: l.source,
            status: l.leadStatus,
            assigned_agent: l.assignedBPO,
            conversion_probability: l.qualityGenuine === 'Verified' ? '80%' : '30%',
        }));

        res.json({ success: true, leads: formattedLeads });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.patch('/leads/:id/action', async (req, res) => {
    try {
        const { action, agentName } = req.body;
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

        if (action === 'assign') {
            lead.assignedBPO = agentName || 'Assigned BPO';
        } else if (action === 'convert') {
            lead.leadStatus = 'Converted';
        }

        await lead.save();
        res.json({ success: true, lead });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/leads/:id', async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ==========================================
// AGENT PERFORMANCE MODULE
// ==========================================

router.get('/agents/performance', async (req, res) => {
    try {
        // Mock agent performance data based on users
        const agents = await User.find({ role: { $in: ['support_team_lead', 'call_support', 'live_chat', 'personal_agent'] } }).limit(20);

        const performance = agents.map(a => ({
            id: a._id,
            agent_name: a.name || a.email,
            tickets_closed: Math.floor(Math.random() * 50) + 10,
            calls_handled: Math.floor(Math.random() * 100) + 20,
            sla_score: (Math.random() * (100 - 80) + 80).toFixed(1) + '%',
            status: Math.random() > 0.2 ? 'Active' : 'Offline'
        }));

        res.json({ success: true, performance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ==========================================
// ANALYTICS & DASHBOARD METRICS
// ==========================================

router.get('/analytics/call-volume', async (req, res) => {
    try {
        // Mock 7-day volume
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = labels.map(() => Math.floor(Math.random() * 200) + 50);

        res.json({ success: true, chartData: { labels, datasets: [{ label: 'Call Volume', data, borderColor: '#3b82f6' }] } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/analytics/ticket-resolution', async (req, res) => {
    try {
        // Mock 7-day resolution rate
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = labels.map(() => Math.floor(Math.random() * 100) + 20);

        res.json({ success: true, chartData: { labels, datasets: [{ label: 'Tickets Resolved', data, borderColor: '#10b981' }] } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
