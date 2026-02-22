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
    social_links: [
        {
            platform: { type: String, required: true },
            url: { type: String, required: true },
            icon: { type: String, default: 'Link' },
            active: { type: Boolean, default: true }
        }
    ],
    footer_pages: [
        {
            title: { type: String, required: true },
            link: { type: String, required: true },
            active: { type: Boolean, default: true }
        }
    ],
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
    },
    invoice_header_url: { type: String, default: '/assets/left-logo.jpeg' },
    languages: [
        { name: String, code: String, rtl: { type: Boolean, default: false }, enabled: { type: Boolean, default: true } }
    ],
    default_language: { type: String, default: 'en' },
    currencies: [
        { name: String, symbol: String, code: String, enabled: { type: Boolean, default: true } }
    ],
    default_currency: { type: String, default: 'INR' },
    currency_format: {
        symbol_format: { type: String, default: '[Symbol] [Amount]' },
        decimal_separator: { type: String, default: '.' },
        no_of_decimals: { type: Number, default: 2 }
    },
    payment_methods: {
        razorpay: { enabled: Boolean, key: String, secret: String },
        stripe: { enabled: Boolean, key: String, secret: String },
        paypal: { enabled: Boolean, clientId: String, secret: String },
        manual: { enabled: Boolean, details: String }
    },
    smtp_settings: {
        host: String,
        port: Number,
        user: String,
        pass: String,
        sender_email: String,
        sender_name: String,
        encryption: { type: String, default: 'tls' }
    },
    email_templates: [
        { key: String, title: String, subject: String, body: String, active: { type: Boolean, default: true } }
    ],
    third_party_settings: {
        google_recaptcha: {
            activation: { type: Boolean, default: false },
            site_key: String,
            secret_key: String,
            v3_score: { type: String, default: '0.5' },
            enable_for_registration: { type: Boolean, default: false },
            enable_for_contact: { type: Boolean, default: false }
        },
        google_analytics: {
            activation: { type: Boolean, default: false },
            tracking_id: String
        },
        facebook_pixel: {
            activation: { type: Boolean, default: false },
            pixel_id: String
        },
        tawk_to: {
            activation: { type: Boolean, default: false },
            widget_id: String
        }
    },
    social_login: {
        google: { activation: { type: Boolean, default: false }, client_id: String, client_secret: String },
        facebook: { activation: { type: Boolean, default: false }, app_id: String, app_secret: String },
        twitter: { activation: { type: Boolean, default: false }, client_id: String, client_secret: String }
    },
    push_notification: {
        activation: { type: Boolean, default: false },
        fcm_api_key: String,
        fcm_auth_domain: String,
        fcm_project_id: String,
        fcm_storage_bucket: String,
        fcm_messaging_sender_id: String,
        fcm_app_id: String,
        firebase_server_key: String
    },
    addons: [
        { id: Number, name: String, version: String, image: String, enabled: { type: Boolean, default: true }, identifier: String }
    ],
    dashboard_promos: {
        client: { type: String, default: 'UPTO 53% OFF ALL MEMBERSHIP PLANS' },
        advocate: { type: String, default: 'UPTO 53% OFF ALL MEMBERSHIP PLANS' },
        legal_provider: { type: String, default: 'UPTO 53% OFF ALL MEMBERSHIP PLANS' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
