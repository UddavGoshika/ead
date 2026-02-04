const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const Client = require('./models/Client');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const clients = await Client.find({}, 'mobile email userId');
        const advocates = await Advocate.find({}, 'mobile email userId');

        console.log('--- Clients with Mobile ---');
        clients.forEach(c => console.log(`Email: ${c.email}, Mobile: ${c.mobile}, UserID: ${c.userId}`));

        console.log('--- Advocates with Mobile ---');
        advocates.forEach(a => console.log(`Email: ${a.email}, Mobile: ${a.mobile}, UserID: ${a.userId}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
