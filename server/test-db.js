const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eadvocate';

console.log('Testing connection to:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('SUCCESS: MongoDB Connected ✅');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: MongoDB Connection Error ❌:', err.message);
        process.exit(1);
    });
