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
                site_name: 'e-Advocate',
                hero_title: 'e-Advocate Services',
                hero_subtitle: 'A secure digital bridge between clients and professionals. Discover trusted experts, connect instantly, and manage your legal journey with confidence through our premium platform.',
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
            // Force revert branding if it was changed (Auto-healing)
            let changed = false;
            if (!settings.hero_title || settings.hero_title.toLowerCase().includes('health')) {
                settings.hero_title = 'e-Advocate Services';
                changed = true;
            }
            if (!settings.logo_url_left || settings.logo_url_left.includes('health')) {
                settings.logo_url_left = '/assets/eadvocate.webp';
                changed = true;
            }
            if (!settings.logo_url_hero || settings.logo_url_hero.includes('health')) {
                settings.logo_url_hero = '/assets/image.png';
                changed = true;
            }

            // Fix site_name
            if (!settings.site_name || settings.site_name.toLowerCase().includes('health') || settings.site_name.includes('Tatito')) {
                settings.site_name = 'E-Advocate Services';
                changed = true;
            }

            // Auto-fix existing path issues in DB and Rename Health links
            if (settings.ecosystem_links) {
                settings.ecosystem_links = settings.ecosystem_links.map(link => {
                    let newLink = { ...link, icon_url: fixPath(link.icon_url) };

                    if (newLink.label && (newLink.label.includes('Health') || newLink.label.includes('Tatito Health'))) {
                        newLink.label = 'E-Advocate Services';
                        newLink.icon_url = '/assets/eadvocate.webp';
                        changed = true;
                    }
                    return newLink;
                });
            }
            settings.logo_url_left = fixPath(settings.logo_url_left);
            settings.logo_url_right = fixPath(settings.logo_url_right);
            settings.logo_url_hero = fixPath(settings.logo_url_hero);

            if (needsSave || changed) {
                await settings.save();
                console.log('Fixed branding, site name, and static asset paths in database settings');
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
            // If updating manager_permissions, handle Mixed type carefully
            if (req.body.manager_permissions) {
                settings.manager_permissions = req.body.manager_permissions;
                settings.markModified('manager_permissions');
            }

            // Update other fields from req.body
            Object.keys(req.body).forEach(key => {
                if (key !== 'manager_permissions') {
                    settings[key] = req.body[key];
                }
            });

            await settings.save();
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
