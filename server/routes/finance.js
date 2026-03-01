const express = require('express');
const router = express.Router();

router.get('/revenue', (req, res) => {
    res.json({
        success: true,
        data: {
            total_revenue: 1450000,
            monthly_recurring: 125000,
            yoy_growth: "18%",
            breakdown: [
                { source: 'Subscriptions', amount: 1100000 },
                { source: 'Services', amount: 250000 },
                { source: 'One-time', amount: 100000 }
            ]
        }
    });
});

router.get('/expenses', (req, res) => {
    res.json({
        success: true,
        data: {
            total_expenses: 850000,
            burn_rate: 45000,
            breakdown: [
                { category: 'Payroll', amount: 500000 },
                { category: 'Infrastructure', amount: 200000 },
                { category: 'Marketing', amount: 150000 }
            ]
        }
    });
});

router.get('/refunds', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'R1', customer: 'Acme Corp', amount: 500, reason: 'Duplicate Charge', status: 'Pending' },
            { id: 'R2', customer: 'Beta LLC', amount: 150, reason: 'Dissatisfied', status: 'Approved' },
            { id: 'R3', customer: 'Charlie Inc', amount: 2000, reason: 'SLA Breach', status: 'Pending' }
        ]
    });
});

router.get('/payouts', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'P1', affiliate: 'Partner A', amount: 1200, status: 'Unpaid' },
            { id: 'P2', affiliate: 'Partner B', amount: 800, status: 'Paid' },
            { id: 'P3', affiliate: 'Partner C', amount: 450, status: 'Unpaid' }
        ]
    });
});

router.post('/refund/approve', (req, res) => {
    // Mock approve logic
    res.json({ success: true, message: 'Refund approved successfully.', id: req.body.refundId });
});

router.patch('/payout/mark-paid', (req, res) => {
    // Mock payout logic
    res.json({ success: true, message: 'Payout marked as paid.', id: req.body.payoutId });
});

// GET /api/finance/invoices
router.get('/invoices', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'INV-100', client: 'Alice Corp', amount: 5000, status: 'Paid', date: '2026-02-15' },
            { id: 'INV-101', client: 'Bob LLC', amount: 2500, status: 'Overdue', date: '2026-02-01' }
        ]
    });
});

// GET /api/finance/payroll
router.get('/payroll', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'PAY-1', employee: 'John Doe', salary: 7500, status: 'Processed' },
            { id: 'PAY-2', employee: 'Jane Doe', salary: 8200, status: 'Pending' }
        ]
    });
});

// GET /api/finance/reconciliation
router.get('/reconciliation', (req, res) => {
    res.json({
        success: true,
        data: [
            { bank: 'Chase Main', book_balance: 154000, bank_balance: 154000, diff: 0, status: 'Reconciled' },
            { bank: 'SVB Operating', book_balance: 85200, bank_balance: 84100, diff: 1100, status: 'Discrepancy' }
        ]
    });
});

// GET /api/finance/budget-reports
router.get('/budget-reports', (req, res) => {
    res.json({
        success: true,
        data: [
            { project: 'Expansion Asia', budget: 500000, allocated: 125000, variance: '+375k' },
            { project: 'R&D AI', budget: 300000, allocated: 310000, variance: '-10k' }
        ]
    });
});

// GET /api/finance/tax-compliance
router.get('/tax-compliance', (req, res) => {
    res.json({
        success: true,
        data: [
            { filing: 'US Corporate Tax 2025', deadline: '2026-04-15', status: 'In Preparation' },
            { filing: 'VAT Q1 2026', deadline: '2026-04-30', status: 'Pending' }
        ]
    });
});

module.exports = router;
