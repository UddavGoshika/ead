const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const StaffProfile = require('./models/StaffProfile');

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const usersCount = await User.countDocuments();
        console.log(`Total Users in DB: ${usersCount}`);

        const users = await User.find().select('email role status');
        console.log('--- Current Users Matrix ---');
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | Status: ${u.status}`);
        });

        const staffProfiles = await StaffProfile.find();
        console.log('\n--- Staff Profiles ---');
        staffProfiles.forEach(p => {
            console.log(`Staff ID: ${p.staffId} | UserID: ${p.userId}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
