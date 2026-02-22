const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Get ALL advocate profiles that are NOT legal providers
        const advocateProfiles = await Advocate.find().populate('userId');
        console.log(`Checking ${advocateProfiles.length} total profiles...`);

        let premiumCount = 0;
        for (const profile of advocateProfiles) {
            if (profile.userId && profile.userId.role === 'advocate') {
                const user = await User.findById(profile.userId._id);
                if (user) {
                    user.status = 'Active';
                    user.isPremium = true;
                    user.plan = 'Ultra Pro Platinum';
                    user.planType = 'Ultra Pro';
                    user.planTier = 'Platinum';
                    await user.save();

                    profile.verified = true;
                    await profile.save();

                    premiumCount++;
                }
            }
        }

        console.log(`Done! Forced ${premiumCount} advocates to be Active, Verified, and Premium.`);

        // Audit check
        const finalCount = await Advocate.find().populate({
            path: 'userId',
            match: { isPremium: true, role: 'advocate' }
        });
        const realFeatured = finalCount.filter(a => a.userId);
        console.log(`Final Confirm: ${realFeatured.length} featured advocates ready.`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
