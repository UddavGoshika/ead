const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        let needsSave = false;

        const fixPath = (path) => {
            if (path && (path.includes('src/assets/') || path.includes('./src/assets/'))) {
                needsSave = true;
                return path.replace('./src/assets/', '/assets/').replace('src/assets/', '/assets/');
            }
            return path;
        };

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
                    { label: 'Tatito Edverse', link: '#', icon_url: '/assets/edverse.webp' },
                    { label: 'Tatito Carrer Hub', link: '#', icon_url: '/assets/carrer.webp' },
                    { label: 'Tatito Nexus', link: '#', icon_url: '/assets/nexus.webp' },
                    { label: 'Tatito Civic One', link: '#', icon_url: '/assets/civic.webp' },
                    { label: 'Tatito Health+', link: '#', icon_url: '/assets/health.webp' },
                    { label: 'Tatito Fashions', link: '#', icon_url: '/assets/fashion.webp' }
                ],
                logo_url_left: '/assets/eadvocate.webp',
                logo_url_right: '/assets/civic.webp',
                logo_url_hero: '/assets/image.png'
            };
            settings = await Settings.create(defaultSettings);
        } else {
            // Auto-fix existing path issues in DB
            if (settings.ecosystem_links) {
                settings.ecosystem_links = settings.ecosystem_links.map(link => ({
                    ...link,
                    icon_url: fixPath(link.icon_url)
                }));
            }
            settings.logo_url_left = fixPath(settings.logo_url_left);
            settings.logo_url_right = fixPath(settings.logo_url_right);
            settings.logo_url_hero = fixPath(settings.logo_url_hero);

            if (needsSave) {
                await settings.save();
                console.log('Fixed static asset paths in database settings');
            }
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
