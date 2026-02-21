
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./server/models/User');
const Advocate = require('./server/models/Advocate');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eadvocate');
        console.log('Connected to DB');

        const advocates = await Advocate.find({ $or: [{ name: /Shiva/i }, { firstName: /Shiva/i }] });
        console.log('Found Advocates:', JSON.stringify(advocates, null, 2));

        const users = await User.find({ role: 'legal_provider' });
        console.log('Found Legal Providers (Users):', JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
