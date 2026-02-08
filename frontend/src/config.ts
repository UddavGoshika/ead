/**
 * Utility to get the API base URL.
 * In development, it uses VITE_API_URL or localhost:5000.
 * In production, it defaults to the current origin if not provided.
 */
export const getApiBaseUrl = () => {
    // 1. Check if VITE_API_URL is explicitly set (highest priority)
    const envUrl = import.meta.env.VITE_API_URL;

    // In production (not localhost), we MUST have a URL if frontend and backend are separate
    if (envUrl && window.location.hostname !== 'localhost') {
        return envUrl;
    }

    // 2. In development (localhost)
    if (window.location.hostname === 'localhost') {
        return envUrl || 'http://localhost:5000';
    }

    // 3. Fallback: If hosted on same origin in production, use empty string for relative paths
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
