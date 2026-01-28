const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            const defaultSettings = {
                header_menu: [
                    { label: 'Browse Profiles', link: '/search' },
                    { label: 'File Case', link: 'https://filing.ecourts.gov.in/pdedev/' },
                    { label: 'Case Status', link: 'https://services.ecourts.gov.in/ecourtindia_v6/' },
                    { label: 'Blogs', link: '/blogs' },
                    { label: 'About', link: '/about' }
                ],
                ecosystem_links: [
                    { label: 'Tatito Edverse', link: '#', icon_url: 'src/assets/edverse.webp' },
                    { label: 'Tatito Carrer Hub', link: '#', icon_url: 'src/assets/carrer.webp' },
                    { label: 'Tatito Nexus', link: '#', icon_url: 'src/assets/nexus.webp' },
                    { label: 'Tatito Civic One', link: '#', icon_url: 'src/assets/civic.webp' },
                    { label: 'Tatito Health+', link: '#', icon_url: 'src/assets/health.webp' },
                    { label: 'Tatito Fashions', link: '#', icon_url: 'src/assets/fashion.webp' }
                ]
            };
            settings = await Settings.create(defaultSettings);
        }

        res.json(settings);
    } catch (err) {
        console.error('Settings GET error:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE settings
router.post('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = await Settings.create(req.body);
        }

        res.json({ success: true, settings });
    } catch (err) {
        console.error('Settings POST error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
