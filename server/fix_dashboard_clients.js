const mongoose = require('mongoose');
require('dotenv').config();
const Client = require('./models/Client');

const fixClients = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const result = await Client.updateMany(
            { unique_id: { $regex: /^TP-EAD-CLI-/ } }, // Target my seeded clients
            { $set: { verified: true } }
        );

        console.log(`Updated ${result.modifiedCount} clients to verified: true`);

        // Also ensure all advocates are verified just in case
        const Advocate = require('./models/Advocate');
        const advResult = await Advocate.updateMany(
            { unique_id: { $regex: /^TP-EAD-ADV-/ } },
            { $set: { verified: true } }
        );
        console.log(`Updated ${advResult.modifiedCount} advocates to verified: true`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixClients();
