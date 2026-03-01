const express = require('express');
const router = express.Router();

// GET /api/tickets
router.get('/', (req, res) => {
    const scope = req.query.scope || 'all';
    const filter = req.query.filter || 'none';

    res.json({
        success: true,
        data: [
            { id: 'TKT-1001', subject: 'Login Issue', user: 'bob@example.com', priority: 'High', status: 'Open', sla: 'Danger' },
            { id: 'TKT-1002', subject: 'Billing Error', user: 'alice@example.com', priority: 'Medium', status: 'In Progress', sla: 'Safe' },
            { id: 'TKT-1003', subject: 'Feature Request', user: 'charlie@example.com', priority: 'Low', status: 'New', sla: 'Safe' }
        ]
    });
});

router.patch('/assign', (req, res) => {
    res.json({ success: true, message: 'Assigned successfully.' });
});

router.patch('/close', (req, res) => {
    res.json({ success: true, message: 'Ticket closed.' });
});

router.patch('/escalate', (req, res) => {
    res.json({ success: true, message: 'Ticket escalated.' });
});

router.delete('/', (req, res) => {
    res.json({ success: true, message: 'Ticket deleted.' });
});

module.exports = router;
