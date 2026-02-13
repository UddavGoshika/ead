const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage Engine
const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine resource type based on file mimetype
        const isRaw = file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        return {
            folder: 'eadvocate_uploads',
            // CRITICAL: Force 'raw' for PDFs/Docs so they are not treated as images
            resource_type: isRaw ? 'raw' : 'image',
            // Ensure public access
            access_mode: 'public',
            // Keep original name helps with downloading (optional, but good for PDFs)
            use_filename: true,
            unique_filename: true,
            // Allowed formats (Multer-Storage-Cloudinary might ignore this if resource_type is raw, but good to have)
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
            // format: isRaw && file.mimetype === 'application/pdf' ? 'pdf' : undefined, // For raw, format is part of filename usually
        };
    },
});

// Local Storage Engine (Fallback or Dev)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, Date.now() + '-' + sanitized);
    }
});

// Select storage based on environment
// You can force Cloudinary by setting USE_CLOUDINARY=true in .env
const storage = (process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true')
    ? cloudStorage
    : diskStorage;

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = {
    upload,
    cloudinary
};
