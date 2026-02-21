
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
                console.log("USER_STATUS:", u.status);
                console.log("PRIVACY:", JSON.stringify(u.privacySettings));
                console.log("PROFILE_PIC:", a.profilePicPath);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
