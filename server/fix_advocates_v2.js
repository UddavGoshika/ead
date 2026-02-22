const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Get ALL advocate profiles
        const advocateProfiles = await Advocate.find().populate('userId');
        console.log(`Found ${advocateProfiles.length} advocate profiles`);

        let updatedUsers = 0;
        let verifiedProfiles = 0;

        for (const profile of advocateProfiles) {
            // Ensure profile is verified
            if (!profile.verified) {
                profile.verified = true;
                await profile.save();
                verifiedProfiles++;
            }

            if (profile.userId) {
                const user = await User.findById(profile.userId._id);
                if (user) {
                    // Restore deleted users
                    if (user.status === 'Deleted' || user.status === 'Pending') {
                        user.status = 'Active';
                        await user.save();
                        updatedUsers++;
                    }

                    // Set at least 10 of them to Premium so they show in Featured
                    if (updatedUsers <= 10) {
                        user.isPremium = true;
                        user.plan = 'Ultra Pro Platinum';
                        user.planType = 'Ultra Pro';
                        user.planTier = 'Platinum';
                        await user.save();
                    }
                }
            }
        }

        console.log(`Successfully verified ${verifiedProfiles} profiles.`);
        console.log(`Successfully restored and set ${updatedUsers} users to Active/Premium.`);

        // Final sanity check
        const featuredCount = await Advocate.find().populate({
            path: 'userId',
            match: { isPremium: true }
        });

        const actualFeatured = featuredCount.filter(a => a.userId);
        console.log(`Confirmed Featured Count (with populated user): ${actualFeatured.length}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
