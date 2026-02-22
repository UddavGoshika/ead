const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const providers = await Advocate.find().populate('userId');
        console.log('Total Profiles:', providers.length);

        providers.forEach(p => {
            console.log(`- ${p.name} | Role: ${p.userId?.role} | ID: ${p.unique_id} | Verified: ${p.verified}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
