const mongoose = require('mongoose');
require('dotenv').config();

const auditPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            password: String
        }));

        const unhashedUsers = await User.find({
            password: { $not: /^\$2/ }
        }, 'email password');

        console.log(`Found ${unhashedUsers.length} users with potentially unhashed passwords.`);
        unhashedUsers.forEach(u => console.log(`- ${u.email} : ${u.password}`));

        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

auditPasswords();
