const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ FATAL ERROR: MONGODB_URI environment variable is not defined.');
            console.error('Please check your .env file or deployment settings (Render/Railway).');
            process.exit(1);
        }

        const conn = await mongoose.connect(uri, {
            family: 4 // Force IPv4 to avoid DNS/IPv6 resolution issues
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
