const path = require('path');
const { cloudinary } = require('../config/cloudinary');

/**
 * Normalizes a file path to be used as a public URL.
 * Handles Windows backslashes and ensures it starts with /uploads/
 * @param {string} filePath - The path saved in the database
 * @returns {string} - Publicly accessible URL path
 */
const getImageUrl = (filePath) => {
    if (!filePath) return null;

    let finalPath = filePath;

    // FIX: Sanitize existing Cloudinary URLs for PDFs
    // If we have a PDF pointing to 'image/upload', it often fails (401/404) if the asset is actually 'raw'.
    // We force 'raw/upload' for PDFs to ensure delivery.
    if (finalPath.includes('cloudinary.com') && finalPath.toLowerCase().endsWith('.pdf')) {
        // Replace /image/upload/ with /raw/upload/
        if (finalPath.includes('/image/upload/')) {
            finalPath = finalPath.replace('/image/upload/', '/raw/upload/');
        }
        return finalPath;
    }

    // Check if it is already a full URL or a Data URL (base64)
    if (finalPath.startsWith('http://') || finalPath.startsWith('https://') || finalPath.startsWith('data:')) {
        return finalPath;
    }

    // Convert Windows backslashes to forward slashes
    let cleanPath = finalPath.replace(/\\/g, '/');

    // DETECT CLOUDINARY PUBLIC ID (Bare filename OR Folder/Filename)
    // If it doesn't look like a local 'uploads/' path and Cloudinary is ON
    if (!cleanPath.includes('uploads/') && !cleanPath.startsWith('/') && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            // Determine resource type based on extension
            const isPdf = cleanPath.toLowerCase().endsWith('.pdf');
            const resourceType = isPdf ? 'raw' : 'image';

            // Construct URL using Cloudinary SDK
            return cloudinary.url(cleanPath, {
                secure: true,
                resource_type: resourceType
            });
        } catch (e) {
            console.error("Cloudinary URL generation failed:", e);
            // Fallback to local logic
        }
    }

    // Ensure it starts with /uploads/
    // If it already has uploads/, make sure it starts with /
    if (cleanPath.includes('uploads/')) {
        const index = cleanPath.toLowerCase().indexOf('uploads/');
        cleanPath = cleanPath.substring(index);
    }

    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
};

/**
 * Returns the absolute URL for an image if BASE_URL is provided in env.
 * Otherwise returns the relative path.
 * @param {string} filePath - The path saved in the database
 * @returns {string} - Full absolute URL or relative path
 */
const getFullImageUrl = (filePath) => {
    const relativePath = getImageUrl(filePath);
    if (!relativePath) return null;

    const baseUrl = process.env.BASE_URL || '';
    // If baseUrl is provided and doesn't end with slash, and relativePath starts with slash
    if (baseUrl) {
        return `${baseUrl.replace(/\/$/, '')}${relativePath}`;
    }

    return relativePath;
};

module.exports = {
    getImageUrl,
    getFullImageUrl
};
