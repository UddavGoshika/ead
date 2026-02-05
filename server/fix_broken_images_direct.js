const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('./models/Blog');

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.collection('blogs');
        const blogs = await collection.find({}).toArray();
        console.log('Total blogs found:', blogs.length);

        let modifiedCount = 0;
        for (const blog of blogs) {
            let originalImage = blog.image;
            let newImage = originalImage;

            // Fix broken healthplus.in or eadvocate.in URLs pointing to assets
            if (originalImage && (originalImage.includes('healthplus.in') || originalImage.includes('eadvocate.in'))) {
                const match = originalImage.match(/fil\d+\.jpeg/);
                if (match) {
                    newImage = `/assets/${match[0]}`;
                } else {
                    newImage = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800';
                }
            }

            if (newImage !== originalImage) {
                await collection.updateOne(
                    { _id: blog._id },
                    { $set: { image: newImage } }
                );
                modifiedCount++;
                console.log(`Updated Image: "${blog.title}" -> ${newImage}`);
            }
        }

        console.log(`Successfully fixed ${modifiedCount} blog images via direct collection update.`);
        process.exit(0);
    } catch (err) {
        console.error('Fix Error:', err);
        process.exit(1);
    }
};

fix();
