const express = require('express');
const router = express.Router();
const ManualPaymentMethod = require('../models/ManualPaymentMethod');
const auth = require('../middleware/auth');

// Middleware to check for Admin role
const adminAuth = (req, res, next) => {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'superadmin' && role !== 'super_admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

// GET ALL METHODS
router.get('/', async (req, res) => {
    try {
        const methods = await ManualPaymentMethod.find();
        res.json({ success: true, methods });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ADD NEW METHOD
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const { name, instructions, details, isActive } = req.body;
        const newMethod = new ManualPaymentMethod({ name, instructions, details, isActive });
        await newMethod.save();
        res.json({ success: true, method: newMethod });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE METHOD
router.patch('/:id', auth, adminAuth, async (req, res) => {
    try {
        const { name, instructions, details, isActive } = req.body;
        const method = await ManualPaymentMethod.findByIdAndUpdate(
            req.params.id,
            { name, instructions, details, isActive },
            { new: true }
        );
        if (!method) return res.status(404).json({ success: false, error: 'Method not found' });
        res.json({ success: true, method });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE METHOD
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const method = await ManualPaymentMethod.findByIdAndDelete(req.params.id);
        if (!method) return res.status(404).json({ success: false, error: 'Method not found' });
        res.json({ success: true, message: 'Method deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
