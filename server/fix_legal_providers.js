const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find all Legal Providers
        const legalProviders = await Advocate.find().populate('userId');

        console.log(`Found ${legalProviders.length} total advocate/provider profiles.`);

        for (const p of legalProviders) {
            if (p.userId && p.userId.role === 'legal_provider') {
                console.log(`Fixing Legal Provider: ${p.name} (${p.unique_id})`);

                // Fix prefix if it's LAS or something else
                if (p.unique_id && p.unique_id.includes('LAS')) {
                    p.unique_id = p.unique_id.replace('LAS', 'LSP');
                    console.log(`- Updated ID prefix to LSP: ${p.unique_id}`);
                }

                // Ensure profile is verified
                p.verified = true;

                // Add some default legal documentation services if they are empty
                if (!p.legalDocumentation || p.legalDocumentation.length === 0) {
                    p.legalDocumentation = [
                        'Agency Agreement',
                        'Arbitration Agreement',
                        'Consultancy Agreement',
                        'NDA',
                        'Affidavits',
                        'Legal Notices'
                    ];
                    console.log(`- Added missing legal services for ${p.name}`);
                }

                await p.save();

                // Ensure user status is Active and visibility is ON
                const user = await User.findById(p.userId._id);
                if (user) {
                    user.status = 'Active';
                    if (!user.privacySettings) user.privacySettings = {};
                    user.privacySettings.showProfile = true;
                    await user.save();
                    console.log(`- Activated and made public: ${user.email}`);
                }
            }
        }

        console.log('Finished fixing legal provider profiles.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
