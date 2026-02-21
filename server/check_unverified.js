
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);

        const u = await User.findOne({ email: 'nakefat325@esyline.com' });
        if (u) {
            const a = await Advocate.findOne({ userId: u._id });
            if (a) {
                console.log("NAME:", a.name || a.firstName);
                console.log("VERIFIED:", a.verified);
                console.log("STATUS:", u.status);
                console.log("ROLE:", u.role);
                console.log("LEGAL_DOCS:", JSON.stringify(a.legalDocumentation));
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
