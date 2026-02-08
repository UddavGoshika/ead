import { API_BASE_URL } from '../config';

/**
 * Formats an image path from the backend to be usable in an <img> tag.
 * Prepends API_BASE_URL if the path is relative.
 */
export const formatImageUrl = (path: string | null | undefined): string => {
    if (!path) return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

    // If it's already a full URL or blob, return as is
    if (path.startsWith('http') || path.startsWith('blob:')) return path;

    // 1. Normalize slashes (handle Windows backslashes)
    let cleanPath = path.replace(/\\/g, '/');

    // 2. Handle absolute paths by finding 'uploads/'
    // This is crucial for legacy data that might contain absolute server paths
    const uploadIndex = cleanPath.toLowerCase().indexOf('uploads/');
    if (uploadIndex !== -1) {
        cleanPath = cleanPath.substring(uploadIndex);
    }

    // Ensure path starts with /
    if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
    }

    // 3. If API_BASE_URL exists and we are not in dev-proxy mode, prepend it
    // Note: If API_BASE_URL is empty, it means we're in prod on same origin (proxy works)
    if (API_BASE_URL) {
        return `${API_BASE_URL.replace(/\/$/, '')}${cleanPath}`;
    }

    return cleanPath;
};
