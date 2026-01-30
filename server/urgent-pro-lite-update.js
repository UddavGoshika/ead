const mongoose = require('mongoose');
const Package = require('./models/Package');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function urgentUpdate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Target: Pro Lite category -> Silver tier
        const result = await Package.updateMany(
            { name: "Pro Lite", "tiers.name": "Silver" },
            { $set: { "tiers.$.price": 1 } }
        );

        console.log(`Updated ${result.modifiedCount} Pro Lite Silver packages to 1 Rupee.`);
        console.log('Urgent update completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Urgent update failed:', err);
        process.exit(1);
    }
}

urgentUpdate();
