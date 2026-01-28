const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Advocate = require('../models/Advocate');
const { createNotification } = require('../utils/notif');

// GET ALL APPROVED BLOGS
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'Approved' }).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE A BLOG (Advocate only)
router.post('/', async (req, res) => {
    try {
        const { title, content, author, authorName, category, image } = req.body;

        const newBlog = new Blog({
            title,
            content,
            author,
            authorName,
            category,
            image,
            status: 'Pending' // Requires admin approval
        });

        await newBlog.save();

        // NOTIFICATION: BLOG POST
        createNotification('blog', `New blog post by ${authorName}: ${title}`, authorName, author, { blogId: newBlog._id });

        res.json({ success: true, blog: newBlog });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
