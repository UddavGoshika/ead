const mongoose = require('mongoose');
const User = require('./models/User');
const StaffProfile = require('./models/StaffProfile');
const bcrypt = require('bcryptjs');
const SupportActivity = require('./models/SupportActivity');
require('dotenv').config({ path: './.env' });

const MONGO_URI = process.env.MONGODB_URI;

async function createAgents() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const agents = [
            {
                email: 'agent.charlie@eadvocate.com',
                fullName: 'Charlie Agent',
                loginId: 'AGENT001',
                password: 'password123',
                role: 'email_support'
            },
            {
                email: 'agent.sarah@eadvocate.com',
                fullName: 'Sarah Agent',
                loginId: 'AGENT002',
                password: 'password123',
                role: 'email_support'
            }
        ];

        for (const a of agents) {
            const exists = await User.findOne({ email: a.email });
            if (exists) {
                console.log(`Agent ${a.email} already exists.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(a.password, salt);

            const newUser = await User.create({
                email: a.email,
                password: hashedPassword,
                name: a.fullName,
                phone: '9876543210',
                plainPassword: a.password,
                role: a.role,
                status: 'Active'
            });

            await StaffProfile.create({
                userId: newUser._id,
                staffId: a.loginId,
                department: 'Support',
                vendor: 'Internal',
                level: 'L1'
            });

            console.log(`Created agent: ${a.email} (Login ID: ${a.loginId})`);
        }

    } catch (err) {
        console.error('Error creating agents:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

createAgents();
