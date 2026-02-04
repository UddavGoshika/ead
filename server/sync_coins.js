const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function syncCoins() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to Database');

        const User = require('./models/User');
        const Activity = require('./models/Activity'); // Use the proper model

        const users = await User.find({});
        console.log(`Found ${users.length} users. Calculating coin history...`);

        let totalUpdated = 0;

        for (const user of users) {
            // Find all coin-based activities for this user
            const activities = await Activity.find({
                sender: user._id.toString(),
                type: { $in: ['interest', 'superInterest', 'chat', 'view_contact'] }
            });

            // Calculate coinsUsed from history
            let calculatedUsed = 0;
            activities.forEach(act => {
                if (act.metadata && act.metadata.cost) {
                    calculatedUsed += act.metadata.cost;
                } else {
                    // Fallback for older activities without metadata
                    if (act.type === 'interest') calculatedUsed += 1;
                    if (act.type === 'superInterest') calculatedUsed += 2;
                    if (act.type === 'chat') calculatedUsed += 1;
                    if (act.type === 'view_contact') calculatedUsed += 1;
                }
            });

            // Rule: coinsReceived = currentBalance + calculatedUsed
            let calculatedReceived = (user.coins || 0) + calculatedUsed;

            console.log(`User: ${user.email} | Coins: ${user.coins} | Calculated Used: ${calculatedUsed} | Calculated Received: ${calculatedReceived}`);

            user.coinsUsed = calculatedUsed;
            user.coinsReceived = calculatedReceived;

            await user.save();
            totalUpdated++;
        }

        console.log(`Sync complete. ${totalUpdated} users updated.`);
        process.exit(0);
    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

syncCoins();
