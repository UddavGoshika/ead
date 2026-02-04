const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find().limit(5);
    users.forEach(u => {
        console.log(`User: ${u.email}, Key: ${Object.keys(u.toObject()).join(', ')}`);
    });
    process.exit(0);
}
check();
