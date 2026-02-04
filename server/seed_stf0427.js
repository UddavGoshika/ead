const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Lead = require('./models/Lead');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const staff = await User.findById('6983050c7cb5e3e7dbe88015');

        if (!staff) {
            console.error('Staff user not found!');
            process.exit(1);
        }

        const sampleLeads = [
            {
                source: 'Live Chat',
                assignedBPO: 'Internal',
                clientName: 'Sai Kiran',
                clientMobile: '6300090582', // Matching existing member for call test
                clientCity: 'Warangal',
                category: 'Property',
                problem: 'Need urgent consultation regarding land registration dispute.',
                qualityGenuine: 'Verified',
                qualityUrgency: 'Critical',
                staffId: staff._id,
                leadStatus: 'New'
            },
            {
                source: 'Inbound Call',
                assignedBPO: 'Internal',
                clientName: 'Priyanka Reddy',
                clientMobile: '9123456789',
                clientCity: 'Hyderabad',
                category: 'Corporate',
                problem: 'Company registration and GST filing support.',
                qualityGenuine: 'Unverified',
                qualityUrgency: 'Medium',
                staffId: staff._id,
                leadStatus: 'New'
            }
        ];

        const created = await Lead.insertMany(sampleLeads);
        console.log(`Successfully added ${created.length} test leads for STF0427 (Rahul)`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
