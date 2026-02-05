const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./models/Settings');

const test = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');
        const settings = await Settings.findOne();
        console.log('Settings found:', settings);
        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
};

test();
