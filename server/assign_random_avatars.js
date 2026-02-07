
const mongoose = require('mongoose');
const User = require('./models/User');
const Advocate = require('./models/Advocate');
const Client = require('./models/Client');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const images = [
    'uploads/default_avatar.png',
    'uploads/1770177808927-Virat Kohli.jpg',
    'uploads/1770177808933-hari.jpg',
    'uploads/1769678134993-537550c77eedcb12e9717e2aefcb9cbf.jpg',
    'uploads/1770269945288-1d87bc1f107fe4688b052e1f2bc79f89.jpg'
];

const connectDB = async () => {
    try {
        console.log('ENV Loading from:', path.join(__dirname, '.env'));
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!uri) {
            console.error('URI is missing in .env file!');
            const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
            let match = envContent.match(/MONGODB_URI=(.*)/);
            if (!match) match = envContent.match(/MONGO_URI=(.*)/);
            if (match) process.env.MONGODB_URI = match[1].trim();
        }

        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected');
        await assignImages();
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const assignImages = async () => {
    console.log('\n--- UPDATING ADVOCATES ---');
    const advocates = await Advocate.find({});

    for (const adv of advocates) {
        let needsUpdate = false;
        const p = adv.profilePicPath;

        if (!p || !fs.existsSync(path.join(__dirname, p))) {
            needsUpdate = true;
        }

        if (needsUpdate) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            adv.profilePicPath = randomImage;
            await adv.save();
            console.log(`Updated Advocate: ${adv.name} -> ${randomImage}`);

            // Sync with User
            if (adv.userId) {
                await User.findByIdAndUpdate(adv.userId, { avatar: randomImage });
            }
        }
    }

    console.log('\n--- UPDATING CLIENTS ---');
    const clients = await Client.find({});

    for (const client of clients) {
        let needsUpdate = false;
        let p = client.profilePicPath || client.avatar;

        if (!p || !fs.existsSync(path.join(__dirname, p))) {
            needsUpdate = true;
        }

        if (needsUpdate) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            client.profilePicPath = randomImage;
            client.avatar = randomImage;
            await client.save();
            console.log(`Updated Client: ${client.firstName} ${client.lastName} -> ${randomImage}`);

            if (client.userId) {
                await User.findByIdAndUpdate(client.userId, { avatar: randomImage });
            }
        }
    }

    console.log('\n--- UPDATING REMAINING USERS ---');
    const users = await User.find({ role: { $in: ['admin', 'staff'] } });
    for (const u of users) {
        if (!u.avatar || !fs.existsSync(path.join(__dirname, u.avatar))) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            u.avatar = randomImage;
            await u.save();
            console.log(`Updated User (${u.role}): ${u.email} -> ${randomImage}`);
        }
    }

    console.log('Done!');
    mongoose.disconnect();
};

connectDB();
