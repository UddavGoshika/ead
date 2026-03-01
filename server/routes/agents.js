const express = require('express');
const router = express.Router();

router.get('/stats', (req, res) => {
    const range = req.query.range || 'daily';
    res.json({
        success: true,
        data: [
            { agent: 'Sarah Jenkins', tickets: 45, calls: 12, csat: '9.8', status: 'Online' },
            { agent: 'Mike Ross', tickets: 38, calls: 24, csat: '9.4', status: 'On Call' },
            { agent: 'Rachel Zane', tickets: 52, calls: 8, csat: '9.9', status: 'Wrap Up' }
        ]
    });
});

router.get('/sla', (req, res) => {
    res.json({
        success: true,
        data: { overall_compliance: '94%', breaches_today: 3, highest_risk_agent: 'Mike Ross' }
    });
});

router.get('/csat', (req, res) => {
    res.json({
        success: true,
        data: { average: '9.6', volume: 145, sentiment: 'Highly Positive' }
    });
});

router.post('/warning', (req, res) => {
    res.json({ success: true, message: 'Warning issued to agent.' });
});

router.post('/bonus', (req, res) => {
    res.json({ success: true, message: 'Bonus assigned to agent.' });
});

module.exports = router;
