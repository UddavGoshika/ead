const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/models/User');
const Advocate = require('./server/models/Advocate');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const advocatesCount = await Advocate.countDocuments();
        const usersCount = await User.countDocuments({ role: 'advocate' });
        const legalProvidersCount = await User.countDocuments({ role: 'legal_provider' });

        const verifiedAdvocates = await Advocate.countDocuments({ verified: true });

        console.log(`Total Advocate Profiles in DB: ${advocatesCount}`);
        console.log(`Users with role 'advocate': ${usersCount}`);
        console.log(`Users with role 'legal_provider': ${legalProvidersCount}`);
        console.log(`Verified Advocate Profiles: ${verifiedAdvocates}`);

        if (verifiedAdvocates === 0) {
            console.log('WARNING: No verified advocates found. They will not show up in the dashboard!');
        }

        const sample = await Advocate.find().limit(3).populate('userId', 'role isPremium status');
        console.log('Sample Profiles:', JSON.stringify(sample.map(s => ({
            id: s.unique_id,
            verified: s.verified,
            role: s.userId?.role,
            isPremium: s.userId?.isPremium,
            status: s.userId?.status
        })), null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
