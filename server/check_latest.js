
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Check for latest legal_provider users
        const users = await User.find({ role: 'legal_provider' }).sort({ createdAt: -1 }).limit(5);
        console.log('--- LATEST LEGAL PROVIDERS (USERS) ---');
        for (const u of users) {
            const adv = await Advocate.findOne({ userId: u._id });
            console.log(`User: ${u.email}, ID: ${u._id}, Role: ${u.role}, Status: ${u.status}`);
            if (adv) {
                console.log(`  Advocate Profile: UniqueID: ${adv.unique_id}, Verified: ${adv.verified}, Spec: ${adv.specialization}, LegalDocs: ${JSON.stringify(adv.legalDocumentation)}`);
            } else {
                console.log(`  No Advocate profile found for this user!`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
