const mongoose = require('mongoose');
const Blog = require('./models/Blog');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eadvocate')
    .then(async () => {
        console.log('Connected to DB');
        const blogs = await Blog.find().sort({ createdAt: -1 });
        console.log(`Found ${blogs.length} blogs:`);
        blogs.forEach(b => {
            console.log(`- [${b.createdAt}] ${b.title} by ${b.authorName} (Status: ${b.status})`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
