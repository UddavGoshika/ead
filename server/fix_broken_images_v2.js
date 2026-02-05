const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('./models/Blog');

const DEFAULT_AUTHOR_ID = '697a6d17c535a870f2e77d7a';
const DEFAULT_AUTHOR_NAME = 'e-Advocate Services';

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const blogs = await Blog.find({});
        console.log('Total blogs found:', blogs.length);

        let modifiedCount = 0;
        for (const blog of blogs) {
            let originalImage = blog.image;
            let newImage = originalImage;
            let needsSave = false;

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
                blog.image = newImage;
                needsSave = true;
            }

            // Fix missing required fields that cause validation errors
            if (!blog.author) {
                blog.author = new DEFAULT_AUTHOR_ID; // Force string to ObjectId if needed, but Mongoose usually handles it
                blog.authorName = blog.authorName || DEFAULT_AUTHOR_NAME;
                needsSave = true;
                console.log(`Fixing missing author for: "${blog.title}"`);
            }

            if (needsSave) {
                try {
                    await blog.save();
                    modifiedCount++;
                    console.log(`Updated: "${blog.title}" -> ${blog.image}`);
                } catch (saveErr) {
                    console.error(`Failed to save blog "${blog.title}":`, saveErr.message);
                }
            }
        }

        console.log(`Successfully fixed ${modifiedCount} blogs.`);
        process.exit(0);
    } catch (err) {
        console.error('Fix Error:', err);
        process.exit(1);
    }
};

fix();
