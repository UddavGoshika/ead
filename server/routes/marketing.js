const express = require('express');
const router = express.Router();

router.get('/campaigns', (req, res) => {
    const status = req.query.status || 'active';
    const campaigns = status === 'active'
        ? [
            { id: 'C1', name: 'Q4 Enterprise Push', budget: 50000, spent: 12000, leads: 450 },
            { id: 'C2', name: 'SaaS Retargeting', budget: 15000, spent: 8000, leads: 120 }
        ]
        : [
            { id: 'C3', name: 'Summer Promo', budget: 20000, spent: 20000, leads: 310 }
        ];

    res.json({ success: true, data: campaigns });
});

router.get('/budget', (req, res) => {
    res.json({
        success: true,
        data: { total_budget: 250000, utilized: 145000, remaining: 105000 }
    });
});

router.get('/conversions', (req, res) => {
    res.json({
        success: true,
        data: { visitors: 150000, signups: 8500, paid_conversions: 1200, rate: '0.8%' }
    });
});

router.get('/lead-sources', (req, res) => {
    res.json({
        success: true,
        data: [
            { source: 'Organic Search', percentage: 45 },
            { source: 'Paid Social', percentage: 30 },
            { source: 'Referrals', percentage: 15 },
            { source: 'Direct', percentage: 10 }
        ]
    });
});

router.get('/funnel', (req, res) => {
    res.json({
        success: true,
        data: {
            top_of_funnel: 50000,
            marketing_qualified: 15000,
            sales_qualified: 5000,
            closed_won: 1200
        }
    });
});

router.get('/roi', (req, res) => {
    res.json({
        success: true,
        data: { blended_cac: "$145", ltv_cac_ratio: "4.2", payback_period: "8 months" }
    });
});

router.patch('/campaign/pause', (req, res) => {
    res.json({ success: true, message: 'Campaign paused.', id: req.body.campaignId });
});

router.patch('/campaign/budget', (req, res) => {
    res.json({ success: true, message: 'Budget adjusted.', id: req.body.campaignId });
});

// GET /api/marketing/team-performance
router.get('/team-performance', (req, res) => {
    res.json({
        success: true,
        data: [
            { member: 'Sarah Kim', campaign_count: 5, conversion_avg: '4.2%', rating: '4.9/5' },
            { member: 'Tom Hardy', campaign_count: 3, conversion_avg: '3.8%', rating: '4.7/5' }
        ]
    });
});

// GET /api/marketing/seo-growth
router.get('/seo-growth', (req, res) => {
    res.json({
        success: true,
        data: { organic_traffic: 125000, domain_authority: 72, keyword_ranking_top10: 450 }
    });
});

// GET /api/marketing/market-analysis
router.get('/market-analysis', (req, res) => {
    res.json({
        success: true,
        data: [
            { segment: 'Tech Startups', attractiveness: 'High', share: '12%' },
            { segment: 'Legal Firms', attractiveness: 'Medium', share: '8%' }
        ]
    });
});

// GET /api/marketing/agency-management
router.get('/agency-management', (req, res) => {
    res.json({
        success: true,
        data: [
            { agency: 'Sky-High Ads', budget_managed: 45000, roas: '5.2x', status: 'Active' },
            { agency: 'Social Pulse', budget_managed: 20000, roas: '3.8x', status: 'Reviewing' }
        ]
    });
});

module.exports = router;
