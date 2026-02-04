const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Lead = require('./models/Lead');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Target Staff User
        const staffEmail = 'riya.sharma@eadvocate.com';
        const staff = await User.findOne({ email: staffEmail });

        if (!staff) {
            console.error('Staff user not found!');
            process.exit(1);
        }

        const sampleLeads = [
            {
                source: 'Direct Web',
                assignedBPO: 'In-House',
                clientName: 'Shiva Uddav',
                clientMobile: '6300090582', // Matching existing member
                clientCity: 'Hyderabad',
                category: 'Civil',
                problem: 'Property encroachment issue in Banjara Hills',
                qualityGenuine: 'Verified',
                qualityUrgency: 'High',
                staffId: staff._id,
                leadStatus: 'New'
            },
            {
                source: 'Facebook Ad',
                assignedBPO: 'Outsourced',
                clientName: 'Suresh Kumar',
                clientMobile: '9988776655', // Matching existing member
                clientCity: 'Vizag',
                category: 'Criminal',
                problem: 'Anticipatory bail for a business dispute.',
                qualityGenuine: 'Verified',
                qualityUrgency: 'Critical',
                staffId: staff._id,
                leadStatus: 'New'
            },
            {
                source: 'Referral',
                assignedBPO: 'In-House',
                clientName: 'Rahul Verma',
                clientMobile: '8877665544', // New mobile (regular call test)
                clientCity: 'Delhi',
                category: 'Family',
                problem: 'Divorce consultation and child custody inquiry.',
                qualityGenuine: 'Unverified',
                qualityUrgency: 'Medium',
                staffId: staff._id,
                leadStatus: 'New'
            }
        ];

        // Clear old leads for this staff to keep it clean (Optional)
        // await Lead.deleteMany({ staffId: staff._id });

        const created = await Lead.insertMany(sampleLeads);
        console.log(`Successfully added ${created.length} test leads for ${staffEmail}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
