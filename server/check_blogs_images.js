const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('./models/Blog');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const blogs = await Blog.find({});
        console.log('Total blogs:', blogs.length);
        blogs.forEach(b => {
            console.log(`ID: ${b._id}, Title: ${b.title}, Image: ${b.image}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
};

test();
