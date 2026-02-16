const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            password: String,
            status: String,
            role: String
        }));

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('admin123', salt);

        const result = await User.updateOne(
            { email: 'admin@gmail.com' },
            { $set: { password: hashed, status: 'Active', role: 'admin' } }
        );

        if (result.matchedCount > 0) {
            console.log('Admin password updated to "admin123" (hashed)');
        } else {
            console.log('Admin user not found. Creating one...');
            await User.create({
                email: 'admin@gmail.com',
                password: hashed,
                status: 'Active',
                role: 'admin'
            });
            console.log('Admin user created successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

fixAdmin();
