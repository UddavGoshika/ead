const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Advocate = require('../models/Advocate');
const User = require('../models/User');
const { createNotification } = require('../utils/notif');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { upload } = require('../config/cloudinary');

// GET ALL APPROVED BLOGS
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'Approved' }).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET SINGLE BLOG (and increment view)
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// LIKE BLOG
router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });

        const likeIndex = blog.likes.indexOf(userId);
        if (likeIndex === -1) {
            blog.likes.push(userId);
        } else {
            blog.likes.splice(likeIndex, 1);
        }

        await blog.save();
        res.json({ success: true, likes: blog.likes.length, isLiked: blog.likes.includes(userId) });
    } catch (err) {
        console.error('Like Blog Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// SAVE BLOG
router.post('/:id/save', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        const saveIndex = blog.saves.indexOf(userId);
        if (saveIndex === -1) {
            blog.saves.push(userId);
        } else {
            blog.saves.splice(saveIndex, 1);
        }

        await blog.save();
        res.json({ success: true, saves: blog.saves.length, isSaved: blog.saves.includes(userId) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SHARE BLOG
router.post('/:id/share', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
        res.json({ success: true, shares: blog.shares });
    } catch (err) {
        console.error('Share Blog Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// COMMENT ON BLOG
router.post('/:id/comment', async (req, res) => {
    try {
        const { userId, userName, text } = req.body;
        if (!userId || !text) return res.status(400).json({ error: 'User ID and text required' });

        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        blog.comments.push({ user: userId, userName: userName || 'User', text });
        await blog.save();

        res.json({ success: true, comments: blog.comments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// CREATE A BLOG (Advocate only)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, authorName, category } = req.body;

        const newBlog = new Blog({
            title,
            content,
            author,
            authorName,
            category,
            image: req.file ? req.file.path : req.body.image,
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
