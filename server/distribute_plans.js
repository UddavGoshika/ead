const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Reset all advocates to free first
        await User.updateMany(
            { role: 'advocate' },
            { $set: { isPremium: false, plan: 'Free', planType: '', planTier: '' } }
        );

        // Get all advocates
        const advocates = await User.find({ role: 'advocate' });

        // Assign different tiers to different advocates for serial sorting
        // 1. Ultra Pro Platinum (Highest)
        for (let i = 0; i < 3 && i < advocates.length; i++) {
            advocates[i].isPremium = true;
            advocates[i].plan = 'Ultra Pro Platinum';
            advocates[i].planType = 'Ultra Pro';
            advocates[i].planTier = 'Platinum';
            await advocates[i].save();
        }

        // 2. Pro Gold
        for (let i = 3; i < 6 && i < advocates.length; i++) {
            advocates[i].isPremium = true;
            advocates[i].plan = 'Pro Gold';
            advocates[i].planType = 'Pro';
            advocates[i].planTier = 'Gold';
            await advocates[i].save();
        }

        // 3. Pro Lite Silver
        for (let i = 6; i < 9 && i < advocates.length; i++) {
            advocates[i].isPremium = true;
            advocates[i].plan = 'Pro Lite Silver';
            advocates[i].planType = 'Pro Lite';
            advocates[i].planTier = 'Silver';
            await advocates[i].save();
        }

        // The rest remain 'Free' for normal profiles

        console.log('Advocates distributed across tiers:');
        console.log('- 3 Ultra Pro Platinum (Top Row)');
        console.log('- 3 Pro Gold (Middle)');
        console.log('- 3 Pro Lite Silver (Lower Premium)');
        console.log(`- ${advocates.length - 9} Free Advocates (Normal Profiles)`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
