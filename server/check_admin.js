const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            password: String,
            role: String,
            status: String
        }));

        const admin = await User.findOne({ email: 'admin@gmail.com' });
        if (admin) {
            console.log('Admin user found in DB.');
            console.log(`Email: ${admin.email}`);
            console.log(`Password starts with: ${admin.password ? admin.password.substring(0, 4) : 'NULL'}`);
            if (admin.password && !admin.password.startsWith('$2')) {
                console.log('WARNING: Admin password is NOT hashed!');
            }
        } else {
            console.log('Admin user NOT found in DB.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();
