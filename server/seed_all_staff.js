const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const roles = [
    'general_manager', 'hr', 'finance', 'verifier',
    'marketing_team_lead', 'marketer', 'marketing_agency',
    'support_team_lead', 'call_support', 'live_chat', 'personal_agent',
    'operations_team_lead', 'telecaller', 'customer_care', 'data_entry', 'personal_assistant'
];

const seedStaff = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        for (const role of roles) {
            const email = `${role.replace(/_/g, '.')}@eadvocate.com`;
            const name = role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log(`Updating existing user: ${email}`);
                existingUser.role = role;
                existingUser.password = hashedPassword;
                existingUser.plainPassword = password;
                existingUser.status = 'Active';
                await existingUser.save();
            } else {
                console.log(`Creating new staff user: ${email} (${role})`);
                const newUser = new User({
                    email,
                    password: hashedPassword,
                    plainPassword: password,
                    role,
                    name,
                    status: 'Active',
                    isPremium: true,
                    plan: 'Pro Platinum',
                    planType: 'Ultra Pro',
                    planTier: 'Platinum'
                });
                await newUser.save();
            }
        }

        console.log('\n✅ Core Staff Seeding Successful!');
        console.log('Login Details:');
        roles.forEach(role => {
            console.log(`- ${role}: ${role.replace(/_/g, '.')}@eadvocate.com / password123`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedStaff();
