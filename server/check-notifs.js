const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eadvocate')
    .then(async () => {
        console.log('Connected to DB');
        const notifs = await Notification.find().sort({ createdAt: -1 });
        console.log(`Found ${notifs.length} notifications:`);
        notifs.forEach(n => {
            console.log(`- [${n.createdAt}] ${n.type}: ${n.message} (Read: ${n.read})`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
