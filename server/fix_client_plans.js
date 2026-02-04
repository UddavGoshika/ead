const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to DB');
        // Define minimal schema to avoid loading full model with hooks if possible, 
        // or just require the model.
        // Using require model is safer for validations.
        const User = require('./models/User');

        const clients = await User.find({ role: 'client' });
        console.log(`Found ${clients.length} clients. Processing...`);

        let updatedCount = 0;

        for (const user of clients) {
            let plan = user.plan || 'Free';
            let isPremium = false;
            let needsUpdate = false;

            const lowerPlan = plan.toLowerCase();

            // Valid premium plans must contain one of these keywords
            if (lowerPlan.includes('lite') || lowerPlan.includes('pro') || lowerPlan.includes('ultra')) {
                // It's a premium plan string. Ensure isPremium matches.
                if (!user.isPremium) {
                    isPremium = true;
                    needsUpdate = true;
                    console.log(`Client ${user.email} has plan '${plan}' but isPremium=false. Fixing to true.`);
                } else {
                    isPremium = true; // Already true
                }
            } else {
                // It's NOT a valid premium plan string (e.g. 'Free', 'Wallet Recharge Plan', etc.)
                // Force to Free / isPremium: false
                if (plan !== 'Free' || user.isPremium !== false) {
                    plan = 'Free';
                    isPremium = false;
                    needsUpdate = true;
                    console.log(`Client ${user.email} has invalid/free plan '${user.plan}' (Premium: ${user.isPremium}). Resetting to Free/False.`);
                }
            }

            if (needsUpdate) {
                user.plan = plan;
                user.isPremium = isPremium;
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
