
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        console.log('Connecting to:', uri.split('@')[1] || 'localhost');
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const advocates = await Advocate.find({ $or: [{ name: /Shiva/i }, { firstName: /Shiva/i }] }).populate('userId');
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
