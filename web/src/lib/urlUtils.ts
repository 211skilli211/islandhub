/**
 * Utility functions for handling API URLs and asset paths
 */

/**
 * Get the base API URL from environment variable
 * Falls back to localhost:5000 if not set
 */
export const getApiBaseUrl = (): string => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:5000';
};

/**
 * Convert a backend-relative image path to a full URL
 * @param path - The relative path from the backend (e.g., "/uploads/image.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // If it's already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Construct full URL from backend
    const baseUrl = getApiBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

/**
 * Get multiple image URLs from an array of paths
 */
export const getImageUrls = (paths: (string | null | undefined)[]): string[] => {
    return paths.map(getImageUrl).filter(Boolean);
};
