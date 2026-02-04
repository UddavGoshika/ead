const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const auth = require('../middleware/auth');

// GET all cases for the logged-in user (client)
router.get('/', auth, async (req, res) => {
    try {
        // Find cases where the user is the client OR the assigned advocate
        // Assuming req.user.id is available from auth middleware
        const cases = await Case.find({
            $or: [
                { clientId: req.user.id },
                { advocateId: req.user.id }
            ]
        }).sort({ createdAt: -1 });

        res.json({ success: true, cases });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create a new case
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, category, location, court, department, subDepartment } = req.body;

        const newCase = new Case({
            clientId: req.user.id,
            title,
            description,
            category,
            location,
            court,
            department,
            subDepartment
        });

        await newCase.save();
        res.status(201).json({ success: true, case: newCase });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating case' });
    }
});

// GET specific case
router.get('/:id', auth, async (req, res) => {
    try {
        const uniqueCase = await Case.findById(req.params.id)
            .populate('clientId', 'name email image_url unique_id')
            .populate('advocateId', 'name email image_url unique_id');

        if (!uniqueCase) {
            return res.status(404).json({ message: 'Case not found' });
        }
        res.json(uniqueCase);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
