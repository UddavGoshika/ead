const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'admin@gmail.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.findOneAndUpdate(
            { email },
            {
                password: hashedPassword,
                role: 'admin',
                status: 'Active',
                plan: 'Pro Platinum',
                isPremium: true
            },
            { upsert: true, new: true }
        );

        console.log('Admin user updated/created:', admin.email);
        process.exit(0);
    } catch (err) {
        console.error('Error fixing admin:', err);
        process.exit(1);
    }
}

fixAdmin();
