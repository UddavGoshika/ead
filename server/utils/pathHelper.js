const path = require('path');

/**
 * Normalizes a file path to be used as a public URL.
 * Handles Windows backslashes and ensures it starts with /uploads/
 * @param {string} filePath - The path saved in the database
 * @returns {string} - Publicly accessible URL path
 */
const getImageUrl = (filePath) => {
    if (!filePath) return null;

    // Check if it is already a full URL (e.g. from Cloudinary/S3)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    // Convert Windows backslashes to forward slashes
    let cleanPath = filePath.replace(/\\/g, '/');

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
