const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to DB');
        const User = require('./models/User');

        const users = await User.find({ role: { $in: ['client', 'advocate'] } });
        console.log(`Found ${users.length} users (clients/advocates). Processing...`);

        let updatedCount = 0;

        for (const user of users) {
            let plan = user.plan || 'Free';
            let isPremium = false;
            let needsUpdate = false;
            let planType = user.planType || 'Free';
            let planTier = user.planTier;

            const lowerPlan = plan.toLowerCase();

            // Valid premium plans must contain one of these keywords
            if (lowerPlan.includes('lite') || lowerPlan.includes('pro') || lowerPlan.includes('ultra')) {
                // It's a premium plan string. Ensure leads are correct.

                // Determine Plan details
                let newPlanType = 'Free';
                if (lowerPlan.includes('lite')) newPlanType = 'Pro Lite';
                else if (lowerPlan.includes('ultra')) newPlanType = 'Ultra Pro';
                else if (lowerPlan.includes('pro')) newPlanType = 'Pro';

                let newPlanTier = null;
                if (lowerPlan.includes('silver')) newPlanTier = 'Silver';
                else if (lowerPlan.includes('gold')) newPlanTier = 'Gold';
                else if (lowerPlan.includes('platinum')) newPlanTier = 'Platinum';

                // Check isPremium
                if (!user.isPremium) {
                    isPremium = true;
                    needsUpdate = true;
                    console.log(`User ${user.email} (${user.role}) has plan '${plan}' but isPremium=false. Fixing to true.`);
                } else {
                    isPremium = true; // Already true
                }

                // Check consistency of planType/Tier
                if (user.planType !== newPlanType || user.planTier !== newPlanTier) {
                    planType = newPlanType;
                    planTier = newPlanTier;
                    needsUpdate = true;
                    console.log(`User ${user.email} updating details: ${user.planType}->${newPlanType}, ${user.planTier}->${newPlanTier}`);
                }

            } else {
                // It's Free
                if (plan !== 'Free' || user.isPremium !== false) {
                    plan = 'Free';
                    isPremium = false;
                    planType = 'Free';
                    planTier = null;
                    needsUpdate = true;
                    console.log(`User ${user.email} reset to Free.`);
                }
            }

            if (needsUpdate) {
                user.plan = plan;
                user.isPremium = isPremium;
                user.planType = planType;
                user.planTier = planTier;
                await user.save();
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} users.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
