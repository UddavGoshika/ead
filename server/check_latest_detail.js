
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);

        const u = await User.findOne({ role: 'legal_provider' }).sort({ createdAt: -1 });
        if (u) {
            const a = await Advocate.findOne({ userId: u._id });
            if (a) {
                console.log("NAME:", a.name || a.firstName);
                console.log("VERIFIED:", a.verified);
                console.log("ROLE:", u.role);
                console.log("SPECIALIZATION:", a.specialization);
                console.log("PRACTICE_SPEC:", a.practice?.specialization);
                console.log("LEGAL_DOCS:", JSON.stringify(a.legalDocumentation));
                console.log("SPECIALTIES:", JSON.stringify(a.specialties));
            } else {
                console.log("No advocate profile for user", u.email);
            }
        } else {
            console.log("No legal_provider found");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
