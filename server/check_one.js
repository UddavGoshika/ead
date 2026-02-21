
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);

        const a = await Advocate.findOne({ unique_id: 'TP-EAD-LAS9413' }).populate('userId');
        if (a) {
            console.log(JSON.stringify({
                name: a.name || a.firstName,
                verified: a.verified,
                role: a.userId?.role,
                specialization: a.specialization,
                practiceSpec: a.practice?.specialization,
                legalDocumentation: a.legalDocumentation
            }, null, 2));
        } else {
            console.log('Not found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
