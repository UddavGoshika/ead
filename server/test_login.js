const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            password: String
        }));

        const email = 'admin@gmail.com';
        const password = 'admin123';

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log('User not found in DB.');
            process.exit(0);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Hashed Password in DB: ${user.password}`);
        console.log(`Match Result: ${isMatch}`);

        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

testLogin();
