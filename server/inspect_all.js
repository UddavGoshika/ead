const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({}, { strict: false });
const Blog = mongoose.model('Blog', BlogSchema);

const MONGO_URI = 'mongodb+srv://eadvocate:Advocate%401.@cluster0.rlkrhz6.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const blogs = await Blog.find({});
        console.log(`TOTAL BLOGS: ${blogs.length}`);
        blogs.forEach(b => {
            console.log(JSON.stringify(b, null, 2));
        });
    })
    .catch(console.error)
    .finally(() => mongoose.connection.close());
