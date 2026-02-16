const mongoose = require('mongoose');
const SupportActivity = require('./models/SupportActivity');
require('dotenv').config({ path: './.env' });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
}

async function cleanLogs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const res = await SupportActivity.deleteMany({
            $or: [
                { agentEmail: /admin/i },
                { sentByAgentEmail: /admin/i },
                { agentRole: /admin/i },
                { agentName: /admin/i }
            ]
        });

        console.log(`Successfully deleted ${res.deletedCount} admin logs.`);

        const remaining = await SupportActivity.countDocuments();
        console.log(`Remaining logs in database: ${remaining}`);

    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

cleanLogs();
