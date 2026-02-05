const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('./models/Blog');

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const blogs = await Blog.find({});
        console.log('Total blogs found:', blogs.length);

        let modifiedCount = 0;
        for (const blog of blogs) {
            let originalImage = blog.image;
            let newImage = originalImage;

            // Fix broken healthplus.in or eadvocate.in URLs pointing to assets
            if (originalImage && (originalImage.includes('healthplus.in') || originalImage.includes('eadvocate.in'))) {
                // Extract filename if it ends with filX.jpeg
                const match = originalImage.match(/fil\d+\.jpeg/);
                if (match) {
                    newImage = `/assets/${match[0]}`;
                } else {
                    // Fallback for other broken external images
                    newImage = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800';
                }
            }

            if (newImage !== originalImage) {
                blog.image = newImage;
                await blog.save();
                modifiedCount++;
                console.log(`Updated: "${blog.title}"\n  From: ${originalImage}\n  To: ${newImage}`);
            }
        }

        console.log(`Successfully fixed ${modifiedCount} blog image URLs.`);
        process.exit(0);
    } catch (err) {
        console.error('Fix Error:', err);
        process.exit(1);
    }
};

fix();
