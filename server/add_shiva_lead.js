const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Lead = require('./models/Lead');
const User = require('./models/User');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const staff = await User.findOne({ email: 'rahul.v@gmail.com' });
        if (!staff) {
            console.error('Rahul not found');
            process.exit(1);
        }

        console.log(`Adding Shiva Uddav lead specifically for Staff ID: ${staff._id} (Rahul)`);

        const shivaLead = {
            source: 'Direct Web',
            assignedBPO: 'Internal',
            clientName: 'Shiva Uddav',
            clientMobile: '6300090582', // Shiva's actual registered mobile
            clientCity: 'Hyderabad',
            category: 'Civil Litigation',
            problem: 'Property dispute matter for Shiva Uddav.',
            qualityGenuine: 'Verified',
            qualityUrgency: 'High',
            staffId: staff._id,
            leadStatus: 'New'
        };

        const result = await Lead.create(shivaLead);
        console.log(`Success! Lead added with ID: ${result._id}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fix();
