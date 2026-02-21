
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);

        const users = await User.find({ role: 'legal_provider' }).sort({ createdAt: -1 });

        for (const u of users) {
            const a = await Advocate.findOne({ userId: u._id });
            console.log(`EMAIL: ${u.email}`);
            console.log(`STATUS: ${u.status}`);
            if (a) {
                console.log(`U_ID: ${a.unique_id}`);
                console.log(`VERIFIED: ${a.verified}`);
                console.log(`LEGAL_DOCS: ${JSON.stringify(a.legalDocumentation)}`);
            }
            console.log('---');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
