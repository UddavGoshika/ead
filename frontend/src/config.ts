/**
 * Utility to get the API base URL.
 * In development, it uses VITE_API_URL or localhost:5000.
 * In production, it defaults to the current origin if not provided.
 */
export const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && envUrl !== 'http://localhost:5000') {
        return envUrl;
    }

    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    }

    // In production, if served from same origin, use relative paths
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
