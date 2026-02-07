const mongoose = require('mongoose');
const User = require('./models/User');
const Advocate = require('./models/Advocate');
const Client = require('./models/Client');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }
};

const inspect = async () => {
    await connectDB();
    const fs = require('fs');
    let output = '';

    output += '\n--- Recent Advocates ---\n';
    const advocates = await Advocate.find().sort({ createdAt: -1 }).limit(3);
    advocates.forEach(adv => {
        output += `Name: ${adv.name}\n`;
        output += `ProfilePicPath: ${adv.profilePicPath}\n`;
        output += `Documents: ${adv.education?.certificatePath}, ${adv.practice?.licensePath}\n`;
        output += '---\n';
    });

    output += '\n--- Recent Clients ---\n';
    const clients = await Client.find().sort({ createdAt: -1 }).limit(3);
    clients.forEach(c => {
        output += `Name: ${c.firstName} ${c.lastName}\n`;
        output += `ProfilePicPath: ${c.profilePicPath}\n`;
        output += `DocumentPath: ${c.documentPath}\n`;
        output += '---\n';
    });

    fs.writeFileSync('inspect_result.txt', output);
    process.exit();
};

inspect();
