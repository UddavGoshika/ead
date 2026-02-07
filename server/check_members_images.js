
const mongoose = require('mongoose');
const User = require('./models/User');
const Advocate = require('./models/Advocate');
const Client = require('./models/Client');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        console.log('ENV Loading from:', path.join(__dirname, '.env'));
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('URI is:', uri ? 'Defined' : 'Undefined');

        if (!uri) {
            console.error('URI is missing in .env file!');
            const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
            // Try both
            let match = envContent.match(/MONGODB_URI=(.*)/);
            if (!match) match = envContent.match(/MONGO_URI=(.*)/);

            if (match) {
                process.env.MONGODB_URI = match[1].trim();
                console.log('Manually parsed URI from .env file.');
            }
        }

        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected');
        await checkImages();
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const checkImages = async () => {
    console.log('\n--- CHECKING ADVOCATES ---');
    const advocates = await Advocate.find({});
    console.log(`Found ${advocates.length} advocates.`);

    for (const adv of advocates) {
        const p = adv.profilePicPath;
        let exists = false;

        if (p) {
            // Check relative to server root
            const fullPath = path.join(__dirname, p);
            exists = fs.existsSync(fullPath);
            console.log(`Advocate: ${adv.name} (ID: ${adv.unique_id})`);
            console.log(`  DB Value: ${p}`);
            console.log(`  Full Path Checked: ${fullPath}`);
            console.log(`  File Exists: ${exists}`);
        } else {
            // console.log(`Advocate: ${adv.name} (ID: ${adv.unique_id}) - NO IMAGE`);
        }
    }

    console.log('\n--- CHECKING CLIENTS ---');
    const clients = await Client.find({});
    console.log(`Found ${clients.length} clients.`);

    for (const client of clients) {
        let p = client.profilePicPath || client.avatar;
        if (!p) {
            const user = await User.findById(client.userId);
            if (user) p = user.avatar;
        }

        if (p) {
            const fullPath = path.join(__dirname, p);
            const exists = fs.existsSync(fullPath);
            console.log(`Client: ${client.firstName} ${client.lastName} (ID: ${client.unique_id})`);
            console.log(`  DB Value: ${p}`);
            console.log(`  Full Path Checked: ${fullPath}`);
            console.log(`  File Exists: ${exists}`);
        } else {
            // console.log(`Client: ${client.firstName} ${client.lastName} (ID: ${client.unique_id}) - NO IMAGE`);
        }
    }

    mongoose.disconnect();
};

connectDB();
