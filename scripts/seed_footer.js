const mongoose = require('mongoose');
const Settings = require('../server/models/Settings');
const connectDB = require('../server/config/db');
require('dotenv').config({ path: '../server/.env' }); // Adjust path if needed

const seedFooter = async () => {
    await connectDB();

    const socialLinks = [
        { platform: "WhatsApp", url: "https://wa.me/917093704706", icon: "WhatsApp", active: true },
        { platform: "Instagram", url: "https://www.instagram.com/e_advocate_services/", icon: "Instagram", active: true },
        { platform: "Facebook", url: "https://www.facebook.com/eadvocateservices", icon: "Facebook", active: true },
        { platform: "LinkedIn", url: "https://www.linkedin.com/in/e-advocate-services/", icon: "LinkedIn", active: true },
        { platform: "Pinterest", url: "https://www.pinterest.com/eadvocateservices/", icon: "Pinterest", active: true },
        { platform: "YouTube", url: "https://www.youtube.com/channel/UCkl_3tG975FVRBEmleOZRng", icon: "YouTube", active: true },
        { platform: "Twitter", url: "https://x.com/eadvocateservic", icon: "Twitter", active: true },
        { platform: "Threads", url: "https://www.threads.com/@e_advocate_services", icon: "Threads", active: true },
        { platform: "Telegram", url: "https://t.me/tatitoprojects", icon: "Telegram", active: true }
    ];

    const footerPages = [
        { title: "Premium Services", link: "/premium-services", active: true },
        { title: "Careers", link: "/careers", active: true },
        { title: "How it Works", link: "/how-it-works", active: true },
        { title: "Documentation", link: "/documentation-how-it-works", active: true },
        { title: "Site Map", link: "/site-map", active: true },
        { title: "About Us", link: "/about", active: true },
        { title: "Fraud Alert", link: "/fraud-alert", active: true },
        { title: "Terms of Use", link: "/terms", active: true },
        { title: "Third Party Terms", link: "/third-party-terms", active: true },
        { title: "Privacy Policy", link: "/privacy", active: true },
        { title: "Cookie Policy", link: "/cookie-policy", active: true },
        { title: "Summons / Notices", link: "/summons-and-notices", active: true },
        { title: "Grievances", link: "/grievance-redressal", active: true },
        { title: "Refund Policy", link: "/refund", active: true },
        { title: "E-Advocate Centers", link: "/centers", active: true },
        { title: "Advocate How-To", link: "/advocate-how-it-works", active: true },
        { title: "Client How-To", link: "/client-how-it-works", active: true }
    ];

    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        settings.social_links = socialLinks;
        settings.footer_pages = footerPages;

        await settings.save();
        console.log("✅ Footer settings seeded successfully!");
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedFooter();
