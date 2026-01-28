const mongoose = require('mongoose');
require('dotenv').config();
const Advocate = require('./models/Advocate');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eadvocate';

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to DB');
        const count = await Advocate.countDocuments();
        console.log('Total advocates:', count);

        const adv = await Advocate.findOne({ unique_id: 'ADV-514044' });
        console.log('Searching for ADV-514044:', adv);

        const all = await Advocate.find({}, { unique_id: 1 }).limit(10);
        console.log('Some existing IDs:', all.map(a => a.unique_id));

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
