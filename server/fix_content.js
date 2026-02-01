const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, required: true },
    category: { type: String, default: 'General' },
    image: { type: String },
    status: { type: String },
    createdAt: { type: Date }
}, { timestamps: true });

const Blog = mongoose.model('Blog', BlogSchema);

const MONGO_URI = 'mongodb+srv://eadvocate:Advocate%401.@cluster0.rlkrhz6.mongodb.net/?appName=Cluster0';

console.log('INSPECTING BLOGS...');

mongoose.connect(MONGO_URI)
    .then(async () => {
        const blogs = await Blog.find({});
        console.log(`Found ${blogs.length} blogs.`);

        for (const b of blogs) {
            console.log('------------------------------------------------');
            console.log(`ID: ${b._id}`);
            console.log(`Title: ${b.title}`);
            console.log(`AuthorName: "${b.authorName}"`); // Check for 'Health Plus Services'
            console.log(`Image: ${b.image}`);
            console.log(`CreatedAt: ${b.createdAt} (Type: ${typeof b.createdAt})`);
        }

        // AUTO-FIX SECTION
        console.log('\n--- ATTEMPTING FIXES ---');

        // 1. Fix Author Name
        const authorUpdate = await Blog.updateMany(
            { authorName: { $regex: /Health Plus/i } },
            { $set: { authorName: 'e-Advocate Services' } }
        );
        console.log(`Updated ${authorUpdate.modifiedCount} blogs with 'Health Plus' author name.`);

        // 2. Fix Invalid Dates
        // If createdAt is null or invalid, set it to now
        const blogsToFixDate = blogs.filter(b => !b.createdAt || isNaN(new Date(b.createdAt).getTime()));
        for (const b of blogsToFixDate) {
            console.log(`Fixing date for: ${b.title}`);
            b.createdAt = new Date();
            await b.save();
        }

        // 3. Fix Images (generic placeholder for broken ones)
        // We'll replace the known bad ones or empty ones
        const imageUpdate = await Blog.updateMany(
            { $or: [{ image: null }, { image: "" }, { image: "bg2.png" }] }, // Add specific bad paths if seen
            { $set: { image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800' } }
        );
        console.log(`Updated ${imageUpdate.modifiedCount} blogs with empty/bad images.`);

    })
    .catch(err => console.error(err))
    .finally(() => {
        mongoose.connection.close();
    });
