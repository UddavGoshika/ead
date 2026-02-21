
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const advocates = await Advocate.find({
            $or: [
                { name: /Shiva/i },
                { firstName: /Shiva/i },
                { lastName: /Shiva/i },
                { specialization: /agreement/i },
                { 'practice.specialization': /agreement/i }
            ]
        }).populate('userId');

        console.log('--- FOUND ADVOCATES/PROVIDERS ---');
        advocates.forEach(a => {
            console.log(`ID: ${a.unique_id}, Name: ${a.name || a.firstName}, Role: ${a.userId?.role}, Verified: ${a.verified}, Spec: ${a.specialization || a.practice?.specialization}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
