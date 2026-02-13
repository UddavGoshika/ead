const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Client = require('../models/Client');
const Advocate = require('../models/Advocate');
const auth = require('../middleware/auth');
const { createNotification } = require('../utils/notif');

// GET all cases for the logged-in user (client)
router.get('/', auth, async (req, res) => {
    try {
        // Find cases where the user is the client OR the assigned advocate
        // Assuming req.user.id is available from auth middleware
        const { search, status, department, subDepartment, state, district, city } = req.query;
        let query = {
            $or: [
                { clientId: req.user.id },
                { advocateId: req.user.id }
            ]
        };

        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { caseId: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (status && status !== 'Status') query.status = status;
        if (department && department !== 'All') query.department = department;
        if (subDepartment && subDepartment !== 'All') query.subDepartment = subDepartment;

        // Location filters (matching within the location string)
        if (state) {
            query.$and = query.$and || [];
            query.$and.push({ location: { $regex: state, $options: 'i' } });
        }
        if (district) {
            query.$and = query.$and || [];
            query.$and.push({ location: { $regex: district, $options: 'i' } });
        }
        if (city) {
            query.$and = query.$and || [];
            query.$and.push({ location: { $regex: city, $options: 'i' } });
        }

        const cases = await Case.find(query)
            .populate('clientId', 'name email image_url unique_id role')
            .populate('advocateId', 'name email image_url unique_id role')
            .sort({ createdAt: -1 });

        res.json({ success: true, cases });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create a new case (Initiated by Advocate or Client)
router.post('/', auth, async (req, res) => {
    try {
        let { clientId, advocateId, title, description, category, location, court, department, subDepartment, requestedDocuments, advocateNotes } = req.body;

        // --- UID Resolution Logic ---
        // Resolve clientId (Client TP-EAD-CLI...)
        if (clientId && typeof clientId === 'string' && (clientId.startsWith('EA-CLI-') || clientId.startsWith('TP-EAD-CLI'))) {
            const clientDoc = await Client.findOne({ unique_id: clientId });
            if (clientDoc && clientDoc.userId) {
                clientId = clientDoc.userId;
            } else {
                return res.status(400).json({ message: 'Invalid Client UID provided' });
            }
        }

        // Resolve advocateId (Advocate TP-EAD-ADV- or TP-EAD-LAS-...)
        if (advocateId && typeof advocateId === 'string' && (advocateId.startsWith('EA-ADV-') || advocateId.startsWith('EA-LAS-') || advocateId.startsWith('TP-EAD-ADV-') || advocateId.startsWith('TP-EAD-LAS-'))) {
            const advDoc = await Advocate.findOne({ unique_id: advocateId });
            if (advDoc && advDoc.userId) {
                advocateId = advDoc.userId;
            } else {
                return res.status(400).json({ message: 'Invalid Advocate UID provided' });
            }
        }

        const newCase = new Case({
            clientId: clientId || req.user.id,
            advocateId: advocateId || (req.user.role.toLowerCase() === 'advocate' ? req.user.id : null),
            title,
            description,
            category,
            location,
            court,
            department,
            subDepartment,
            requestedDocuments,
            advocateNotes,
            status: (req.user.role.toLowerCase() === 'client' && advocateId) ? 'Case Request Received' : (req.user.role.toLowerCase() === 'advocate' ? 'Case Request Received' : 'Open')
        });

        await newCase.save();

        if (advocateId && advocateId.toString() !== req.user.id) {
            // Notification logic removed to prevent errors
        }

        res.status(201).json({ success: true, case: newCase });
    } catch (err) {
        console.error("Backend Case Creation Error:", err);
        res.status(500).json({ message: 'Server error creating case', error: err.message });
    }
});

// PATCH update case (Client Approving and Uploading Docs)
router.patch('/:id/approve', auth, async (req, res) => {
    try {
        const { documents, clientNotes } = req.body;
        const updatedCase = await Case.findOneAndUpdate(
            { _id: req.params.id, clientId: req.user.id },
            {
                status: 'Client Approved',
                documents,
                clientNotes,
                lastUpdate: Date.now()
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({ success: false, message: 'Case not found or unauthorized' });
        }

        res.json({ success: true, case: updatedCase });
    } catch (err) {
        console.error("Backend Case Approval Error:", err);
        res.status(500).json({ message: 'Server error updating case', error: err.message });
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
