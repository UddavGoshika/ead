const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findById('6983050c7cb5e3e7dbe88015');
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
}
check();
