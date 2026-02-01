const mongoose = require('mongoose');

// Use strict: false to ignore schema validation errors for existing bad data
const BlogSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Blog = mongoose.model('Blog', BlogSchema);

const MONGO_URI = 'mongodb+srv://eadvocate:Advocate%401.@cluster0.rlkrhz6.mongodb.net/?appName=Cluster0';

console.log('STARTING ROBUST FIX...');

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected.');

        // 1. Update Author Names
        console.log('Updating Author Names...');
        const res1 = await Blog.updateMany(
            { authorName: 'Health Plus Services' },
            { $set: { authorName: 'e-Advocate Services' } }
        );
        console.log(`Fixed ${res1.modifiedCount} "Health Plus" authors.`);

        // 2. Fix Missing CreatedAt (Invalid Date issue)
        console.log('Fixing Dates...');
        const res2 = await Blog.updateMany(
            { createdAt: { $exists: false } },
            { $set: { createdAt: new Date() } }
        );
        console.log(`Fixed ${res2.modifiedCount} missing dates.`);

        // 3. Fix Images
        console.log('Fixing Images...');
        // Replace known bad paths or non-urls
        const res3 = await Blog.updateMany(
            { $or: [{ image: "bg2.png" }, { image: "" }, { image: { $exists: false } }] },
            { $set: { image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800' } }
        );
        console.log(`Fixed ${res3.modifiedCount} images.`);

    })
    .catch(err => console.error(err))
    .finally(() => {
        console.log('Done.');
        mongoose.connection.close();
    });
