const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const roles = [
    'manager', 'teamlead', 'hr', 'influencer', 'marketer', 'marketing_agency',
    'call_support', 'chat_support', 'personal_agent', 'live_chat',
    'telecaller', 'customer_care', 'data_entry', 'personal_assistant',
    'verifier', 'finance', 'support', 'admin', 'superadmin', 'email_support'
];

const seedUsers = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is not defined');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const password = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        for (const role of roles) {
            const email = `${role.replace('_', '')}@gmail.com`;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log(`User ${email} already exists, updating role and password...`);
                existingUser.role = role;
                existingUser.loginId = role.replace('_', '');
                existingUser.password = hashedPassword;
                existingUser.plainPassword = password;
                existingUser.status = 'Active';
                await existingUser.save();
            } else {
                console.log(`Creating user: ${email} with role: ${role}`);
                const newUser = new User({
                    email,
                    loginId: role.replace('_', ''),
                    password: hashedPassword,
                    plainPassword: password, // As requested by user/schema
                    role,
                    name: role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    status: 'Active',
                    isPremium: true,
                    plan: 'Pro Platinum',
                    planType: 'Ultra Pro',
                    planTier: 'Platinum'
                });
                await newUser.save();
            }
        }

        console.log('✅ Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
