const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    site_name: { type: String, default: 'e-Advocate Services' },
    site_title: { type: String, default: 'India\'s Premier Legal Platform' },
    hero_title: { type: String, default: 'e-Advocate Services' },
    hero_subtitle: { type: String, default: 'A secure digital bridge between clients and professionals. Discover trusted experts, connect instantly, and manage your legal journey with confidence through our premium platform.' },
    marquee_text: { type: String, default: '• Verified Advocates • 24/7 Legal Consultation • Secure Platform' },
    logo_url_left: { type: String, default: '/assets/eadvocate.webp' },
    logo_url_right: { type: String, default: '/assets/civic.webp' },
    logo_url_hero: { type: String, default: '/assets/image.png' },
    header_menu: [
        { label: { type: String }, link: { type: String } }
    ],
    ecosystem_links: [
        { label: { type: String }, link: { type: String }, icon_url: { type: String } }
    ],
    footer_text: { type: String, default: '© 2025 E-Advocate Services. All Rights Reserved.' },
    contact_email: { type: String, default: 'info.eadvocateservices@gmail.com' },
    contact_phone: { type: String, default: '' },
    social_links: {
        instagram: { type: String, default: '#' },
        facebook: { type: String, default: '#' },
        linkedin: { type: String, default: '#' },
        twitter: { type: String, default: '#' },
        whatsapp: { type: String, default: '#' }
    },
    member_code_prefix: { type: String, default: 'AMC' },
    male_min_age: { type: Number, default: 21 },
    female_min_age: { type: Number, default: 19 },
    profile_pic_privacy: { type: String, default: 'All' },
    gallery_privacy: { type: String, default: 'All' },
    activations: {
        https: { type: Boolean, default: false },
        maintenance: { type: Boolean, default: false },
        wallet: { type: Boolean, default: true },
        email_phone_verify: { type: Boolean, default: false },
        reg_verify: { type: Boolean, default: true },
        member_verify: { type: Boolean, default: true },
        premium_only_profile: { type: Boolean, default: true },
        pic_approval: { type: Boolean, default: false },
        disable_encoding: { type: Boolean, default: true }
    },
    manager_permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
    appearance: {
        primary_color: { type: String, default: '#3b82f6' },
        dark_mode: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
