const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Lead = require('./models/Lead');
const Client = require('./models/Client');
const Advocate = require('./models/Advocate');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const leads = await Lead.find({ clientMobile: { $in: ['6300090582', '9988776655'] } });

    for (const lead of leads) {
        const clientProfile = await Client.findOne({ mobile: lead.clientMobile });
        const advocateProfile = !clientProfile ? await Advocate.findOne({ mobile: lead.clientMobile }) : null;
        const targetProfile = clientProfile || advocateProfile;
        console.log(`Lead: ${lead.clientName}, Mobile: ${lead.clientMobile}, targetUserId: ${targetProfile ? targetProfile.userId : 'NULL'}`);
    }
    process.exit(0);
}
test();
