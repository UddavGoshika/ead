const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Restore advocates
        await User.updateMany(
            { role: 'advocate', status: 'Deleted' },
            { $set: { status: 'Active' } }
        );

        // 2. Verify all profiles
        await Advocate.updateMany({}, { $set: { verified: true } });

        // 3. Make some premium
        const advocates = await User.find({ role: 'advocate', status: 'Active' }).limit(5);
        for (const adv of advocates) {
            adv.isPremium = true;
            adv.plan = 'Ultra Pro Platinum';
            await adv.save();
        }

        console.log(`Successfully restored advocates and set ${advocates.length} as Premium.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
