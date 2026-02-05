const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const auth = require('../middleware/auth');

// GET ALL PAGES
router.get('/', async (req, res) => {
    try {
        const pages = await Page.find().sort({ title: 1 });
        res.json({ success: true, pages });
    } catch (err) {
        console.error('Fetch Pages Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE NEW PAGE
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin' && req.user.role.toLowerCase() !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        const { title, route, content, status, category, isCustom } = req.body;
        const newPage = await Page.create({ title, route, content, status, category, isCustom });
        res.json({ success: true, page: newPage });
    } catch (err) {
        console.error('Create Page Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE PAGE
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin' && req.user.role.toLowerCase() !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        const updatedPage = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, page: updatedPage });
    } catch (err) {
        console.error('Update Page Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE PAGE
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin' && req.user.role.toLowerCase() !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        await Page.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Page deleted successfully' });
    } catch (err) {
        console.error('Delete Page Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
