
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eadvocate';
        await mongoose.connect(uri);

        const advocates = await Advocate.find({
            $or: [
                { specialization: /agreement/i },
                { 'practice.specialization': /agreement/i },
                { legalDocumentation: /agreement/i },
                { name: /shiva/i }
            ]
        }).populate('userId');

        console.log(`Found ${advocates.length} results`);
        advocates.forEach(a => {
            console.log(`ID: ${a.unique_id}, Name: ${a.name || a.firstName}, Verified: ${a.verified}, Role: ${a.userId?.role}, Spec: ${a.specialization}, PracSpec: ${a.practice?.specialization}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
