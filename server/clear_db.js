const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models using current directory relative paths
const User = require('./models/User');
const Advocate = require('./models/Advocate');
const Client = require('./models/Client');
const Activity = require('./models/Activity');
const Message = require('./models/Message');
const Relationship = require('./models/Relationship');
const UnlockedContact = require('./models/UnlockedContact');
const Otp = require('./models/Otp');
const Case = require('./models/Case');
const Call = require('./models/Call');
const CallLog = require('./models/CallLog');
const Notification = require('./models/Notification');
const StaffProfile = require('./models/StaffProfile');
const Lead = require('./models/Lead');
const LegalRequest = require('./models/LegalRequest');
const Ticket = require('./models/Ticket');
const AuditLog = require('./models/AuditLog');
const Referral = require('./models/Referral');
const WorkLog = require('./models/WorkLog');

const clearDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found in environment');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // 1. Deleting non-admin users
        console.log('Deleting non-admin users...');
        const userDelete = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`- Deleted ${userDelete.deletedCount} non-admin users.`);

        // 2. Deleting all profiles
        console.log('Deleting all advocates, clients, and staff profiles...');
        const advDel = await Advocate.deleteMany({});
        const cliDel = await Client.deleteMany({});
        const stfDel = await StaffProfile.deleteMany({});
        console.log(`- Deleted ${advDel.deletedCount} advocates.`);
        console.log(`- Deleted ${cliDel.deletedCount} clients.`);
        console.log(`- Deleted ${stfDel.deletedCount} staff profiles.`);

        // 3. Deleting history and activity
        console.log('Deleting activities, messages, and relationships...');
        await Activity.deleteMany({});
        await Message.deleteMany({});
        await Relationship.deleteMany({});
        await UnlockedContact.deleteMany({});
        await Notification.deleteMany({});
        console.log('- History and activity cleared.');

        // 4. Deleting transactional/operational data
        console.log('Deleting cases, calls, leads, and requests...');
        await Case.deleteMany({});
        await Call.deleteMany({});
        await CallLog.deleteMany({});
        await Lead.deleteMany({});
        await LegalRequest.deleteMany({});
        await Ticket.deleteMany({});
        await Otp.deleteMany({});
        await AuditLog.deleteMany({});
        await Referral.deleteMany({});
        await WorkLog.deleteMany({});
        console.log('- Operations data cleared.');

        console.log('\n✨ Database cleared successfully (Excluding Admin users).');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

clearDB();
