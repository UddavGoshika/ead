const mongoose = require('mongoose');
const SupportActivity = require('./server/models/SupportActivity');
require('dotenv').config();

const MONGO_URI = 'mongodb+srv://shivauddav187:shiva187@cluster0.z5vve.mongodb.net/eadvocate?retryWrites=true&w=majority';

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

        // Let's also check if there are any remaining
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
