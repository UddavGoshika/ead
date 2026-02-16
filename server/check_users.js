const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            status: String
        }));

        const count = await User.countDocuments();
        console.log(`Total users: ${count}`);

        const users = await User.find({}, 'email role status').limit(10);
        console.log('Sample users:');
        users.forEach(u => console.log(`- ${u.email} (${u.role}) [${u.status}]`));

        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();
