const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const AdminConfig = require('./models/AdminConfig');

const LANGUAGES = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'Hindi' },
    { id: 'as', label: 'Assamese' },
    { id: 'bn', label: 'Bengali' },
    { id: 'brx', label: 'Bodo' },
    { id: 'doi', label: 'Dogri' },
    { id: 'gu', label: 'Gujarati' },
    { id: 'kn', label: 'Kannada' },
    { id: 'ks', label: 'Kashmiri' },
    { id: 'kok', label: 'Konkani' },
    { id: 'mai', label: 'Maithili' },
    { id: 'ml', label: 'Malayalam' },
    { id: 'mni', label: 'Manipuri' },
    { id: 'mr', label: 'Marathi' },
    { id: 'ne', label: 'Nepali' },
    { id: 'or', label: 'Odia' },
    { id: 'pa', label: 'Punjabi' },
    { id: 'sa', label: 'Sanskrit' },
    { id: 'sat', label: 'Santali' },
    { id: 'sd', label: 'Sindhi' },
    { id: 'ta', label: 'Tamil' },
    { id: 'te', label: 'Telugu' },
    { id: 'ur', label: 'Urdu' },
    { id: 'tulu', label: 'Tulu' },
    { id: 'bhoj', label: 'Bhojpuri' }
].map(l => ({ ...l, enabled: true }));

const SPECIALIZATIONS = [
    { id: 'criminal', label: 'Criminal Law' },
    { id: 'civil', label: 'Civil Law' },
    { id: 'family', label: 'Family Law' },
    { id: 'corporate', label: 'Corporate Law' },
    { id: 'constitutional', label: 'Constitutional Law' },
    { id: 'ip', label: 'Intellectual Property' },
    { id: 'cyber', label: 'Cyber Law' },
    { id: 'contract', label: 'Contract Law' },
    { id: 'tort', label: 'Tort Law' },
    { id: 'admin', label: 'Administrative Law' },
    { id: 'labour', label: 'Labour & Employment' },
    { id: 'property', label: 'Property Law' },
    { id: 'banking', label: 'Banking & Finance' },
    { id: 'consumer', label: 'Consumer Protection' },
    { id: 'env', label: 'Environmental Law' },
    { id: 'tax', label: 'Taxation Law' },
    { id: 'hr', label: 'Human Rights' },
    { id: 'arb', label: 'Arbitration & Mediation' },
    { id: 'media', label: 'Media & Entertainment' },
    { id: 'browse', label: 'Browse Profiles' }
].map(s => ({ ...s, enabled: true }));

const COURTS = [
    { id: 'supreme', label: 'Supreme Court' },
    { id: 'high', label: 'High Court' },
    { id: 'district', label: 'District Court' },
    { id: 'sessions', label: 'Sessions Court' },
    { id: 'consumer', label: 'Consumer Court' },
    { id: 'other', label: 'Other' }
].map(c => ({ ...c, enabled: true }));

const SUB_DEPARTMENTS = [
    // ... (rest of SUB_DEPARTMENTS remains same)
    // Criminal
    { id: 'ipc_crpc', label: 'IPC & CrPC', parent: 'criminal' },
    { id: 'cyber_crimes', label: 'Cyber Crimes', parent: 'criminal' },
    { id: 'juvenile_justice', label: 'Juvenile Justice', parent: 'criminal' },
    { id: 'white_collar', label: 'White-Collar Crime', parent: 'criminal' },
    { id: 'narcotics', label: 'Narcotics Law', parent: 'criminal' },
    // Family
    { id: 'marriage_divorce', label: 'Marriage & Divorce', parent: 'family' },
    { id: 'maintenance', label: 'Maintenance', parent: 'family' },
    { id: 'adoption', label: 'Adoption', parent: 'family' },
    { id: 'hindu_law', label: 'Hindu Law', parent: 'family' },
    { id: 'muslim_law', label: 'Muslim Law', parent: 'family' },
    // Corporate
    { id: 'company_inc', label: 'Company Incorporation', parent: 'corporate' },
    { id: 'm_a', label: 'Mergers & Acquisitions', parent: 'corporate' },
    { id: 'insolvency', label: 'Insolvency & Bankruptcy', parent: 'corporate' },
    { id: 'sebi', label: 'SEBI Compliance', parent: 'corporate' },
    // IP
    { id: 'patents', label: 'Patents', parent: 'ip' },
    { id: 'trademarks', label: 'Trademarks', parent: 'ip' },
    { id: 'copyrights', label: 'Copyrights', parent: 'ip' },
    // Property
    { id: 'rera', label: 'Real Estate (RERA)', parent: 'property' },
    { id: 'lease_rent', label: 'Lease & Rent', parent: 'property' },
    { id: 'land_titles', label: 'Land Titles', parent: 'property' },
    // Taxation
    { id: 'income_tax', label: 'Income Tax', parent: 'tax' },
    { id: 'gst', label: 'GST Law', parent: 'tax' },
    // Labour
    { id: 'wages', label: 'Wages & Salary', parent: 'labour' },
    { id: 'industrial_dispute', label: 'Industrial Disputes', parent: 'labour' },
    // Banking
    { id: 'debt_recovery', label: 'Debt Recovery', parent: 'banking' },
    { id: 'loan_default', label: 'Loan Default', parent: 'banking' }
].map(sd => ({ ...sd, enabled: true }));

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate');
        console.log('Connected to MongoDB');

        const roles = ['advocate', 'client', 'legal_provider'];

        for (const role of roles) {
            const attributes = [
                {
                    id: 'specialization',
                    title: 'Specialization',
                    options: SPECIALIZATIONS
                },
                {
                    id: 'sub_department',
                    title: 'Sub Department',
                    options: SUB_DEPARTMENTS
                },
                {
                    id: 'practice_area',
                    title: 'Practice Area (Courts)',
                    options: COURTS
                },
                {
                    id: 'language',
                    title: 'Languages Spoken',
                    options: LANGUAGES
                },
                {
                    id: 'experience',
                    title: 'Experience Level',
                    options: [
                        { id: "0-2", label: "0–2 Years", enabled: true },
                        { id: "3-5", label: "3–5 Years", enabled: true },
                        { id: "6-10", label: "6–10 Years", enabled: true },
                        { id: "10+", label: "10+ Years", enabled: true }
                    ]
                }
            ];

            await AdminConfig.findOneAndUpdate(
                { type: 'ATTRIBUTE_CONFIG', role },
                { value: attributes, lastUpdated: Date.now() },
                { upsert: true, new: true }
            );
            console.log(`Seeded attributes for role: ${role}`);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
