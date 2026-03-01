const express = require('express');
const router = express.Router();

router.get('/tasks', (req, res) => {
    const status = req.query.status || 'active';
    const tasks = status === 'active'
        ? [
            { id: 'T1', title: 'Q3 Server Migration', owner: 'DevOps', progress: 85, dueDate: '2026-03-01' },
            { id: 'T2', title: 'Compliance Audit Update', owner: 'Legal', progress: 40, dueDate: '2026-03-15' }
        ]
        : [
            { id: 'T3', title: 'Vendor Contract Renewal', owner: 'Procurement', progress: 10, dueDate: '2026-02-20' }
        ];
    res.json({ success: true, data: tasks });
});

router.get('/bottlenecks', (req, res) => {
    res.json({
        success: true,
        data: [
            { process: 'Client Onboarding', delay: '4 days', severity: 'High' },
            { process: 'Invoice Approval', delay: '2 days', severity: 'Medium' }
        ]
    });
});

router.get('/completion-rate', (req, res) => {
    res.json({
        success: true,
        data: { weekly_target: 150, completed: 142, rate: '94.6%' }
    });
});

router.patch('/task/reassign', (req, res) => {
    res.json({ success: true, message: 'Task reassigned successfully.', id: req.body.taskId });
});

router.patch('/task/close', (req, res) => {
    res.json({ success: true, message: 'Task closed.', id: req.body.taskId });
});

// GET /api/operations/resource-planning
router.get('/resource-planning', (req, res) => {
    res.json({
        success: true,
        data: [
            { department: 'Support', capacity: '90%', head_count: 45, need_next_month: 2 },
            { department: 'Marketing', capacity: '75%', head_count: 12, need_next_month: 0 }
        ]
    });
});

// GET /api/operations/quality-audit
router.get('/quality-audit', (req, res) => {
    res.json({
        success: true,
        data: [
            { audit_id: 'QA-501', process: 'Telecalling V3', score: '94%', result: 'Pass' },
            { audit_id: 'QA-502', process: 'Email Support', score: '82%', result: 'Warning' }
        ]
    });
});

// GET /api/operations/agent-metrics
router.get('/agent-metrics', (req, res) => {
    res.json({
        success: true,
        data: [
            { agent: 'Sarah J', talk_time: '5h 12m', conversion: '12%', status: 'Active' },
            { agent: 'Mike R', talk_time: '4h 45m', conversion: '9%', status: 'On Break' }
        ]
    });
});

// GET /api/operations/data-tracking
router.get('/data-tracking', (req, res) => {
    res.json({
        success: true,
        data: [
            { stream: 'Legal Documents', volume: 1450, accuracy: '99.2%', delay: '0.5h' },
            { stream: 'Financial Receipts', volume: 850, accuracy: '98.5%', delay: '1.2h' }
        ]
    });
});

// GET /api/operations/ops-reports
router.get('/ops-reports', (req, res) => {
    res.json({
        success: true,
        data: [
            { report: 'Efficiency Report Feb', generated: '2026-02-27', type: 'PDF' },
            { report: 'SLA Analysis Q1', generated: '2026-02-15', type: 'Excel' }
        ]
    });
});

// GET /api/operations/supply_chain
router.get('/supply-chain', (req, res) => {
    res.json({
        success: true,
        data: [
            { vendor: 'AWS', service: 'Infrastructure', cost_mo: 12000, health: 'Optimal' },
            { vendor: 'Twilio', service: 'Telecom', cost_mo: 4500, health: 'Warning' }
        ]
    });
});

module.exports = router;
