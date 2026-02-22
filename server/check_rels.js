const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Relationship = require('./models/Relationship');
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const relCount = await Relationship.countDocuments();
        console.log(`Total Relationships: ${relCount}`);

        const sampleRels = await Relationship.find().limit(10);
        console.log('Sample Relationships:', JSON.stringify(sampleRels, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
