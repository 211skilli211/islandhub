import axios from 'axios';

// Get base URL from environment variable
// We fall back to localhost if not set, but the intention is to use the environment variable
const getBaseUrl = () => {
    // Priority 1: Environment variable (useful for production)
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '');

    if (typeof window !== 'undefined') {
        const { hostname, protocol } = window.location;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

        // Check if hostname is an IP address (for mobile/LAN testing)
        const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

        // Priority 2: Localhost override
        // If the frontend is running on localhost, we always assume the backend is too.
        // This prevents stale tunnel/production URLs in .env from breaking local dev.
        if (isLocal) {
            console.log('[API] Running on localhost, using http://localhost:5001');
            return 'http://localhost:5001';
        }

        // Priority 3: Tunnel logic
        // If we are on a tunnel (e.g., *.trycloudflare.com), and the backend is served through the same tunnel
        if (hostname.includes('trycloudflare.com')) {
            console.log('[API] Running on Cloudflare tunnel, using same hostname');
            return `${protocol}//${hostname}`;
        }

        // Priority 4: LAN / Mobile IP detection
        // If we're accessing via IP address (mobile/LAN), use that IP with backend port
        if (isIpAddress) {
            const lanUrl = `${protocol}//${hostname}:5001`;
            console.log('[API] Detected LAN/Mobile IP access, using:', lanUrl);
            return lanUrl;
        }

        // Priority 5: Remote IP override
        // If we're on a real device/LAN IP but the env points to localhost, we MUST override
        if (!isLocal && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
            const fallbackUrl = `${protocol}//${hostname}:5001`;
            console.log('[API] Non-localhost access with localhost env, using:', fallbackUrl);
            return fallbackUrl;
        }
    }

    console.log('[API] Using environment URL:', envUrl || 'http://localhost:5001');
    return envUrl || 'http://localhost:5001';
};

export const BASE_URL = getBaseUrl();
if (typeof window !== 'undefined') {
    console.log('[API] Final resolved API BASE_URL:', BASE_URL);
}

export const DEFAULT_PLACEHOLDER = 'file-1769965232226-73669333.jpg';

export const getImageUrl = (path?: string | { url?: string } | null) => {
    if (!path) return undefined;
    // Handle photo objects with url property
    if (typeof path === 'object' && path.url) {
        path = path.url;
    }
    // Ensure path is a string
    if (typeof path !== 'string') return undefined;
    if (path.startsWith('http')) return path;

    // Clean user input that might already have /uploads
    let cleanPath = path;
    if (cleanPath.startsWith('/uploads/')) {
        return `${BASE_URL}${cleanPath}`;
    }

    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    // Ensure we don't double-prefix uploads if the path already has it (handling various edge cases)
    const finalPath = cleanPath.includes('/uploads/') ? cleanPath : `/uploads${cleanPath}`;
    return `${BASE_URL}${finalPath}`;
};

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor to add the auth token and ensure /api prefix
api.interceptors.request.use(
    (config) => {
        // Log for debugging (can be removed later)
        // console.log('Original Request:', config.url);

        // Ensure relative URLs are handled correctly
        const isAbsolute = /^https?:\/\//i.test(config.url || '');
        if (!isAbsolute) {
            // Ensure path starts with /
            let path = config.url || '';
            if (!path.startsWith('/')) path = `/${path}`;

            // Prepend /api if missing
            if (!path.startsWith('/api/')) {
                path = `/api${path}`;
            }
            config.url = path;
        }

        // console.log('Transformed Request:', config.url);

        // Check if we are running on the client side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        // Check if response is HTML (often a 404 or 500 error page from Next.js/Express)
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML response from API - likely a 404 or misconfigured route:', response.config.url);
            return Promise.reject(new Error('API returned HTML instead of JSON. Possible 404 or Server Error.'));
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        // Log detailed error for debugging
        if (error.response) {
            console.error(`API Error [${error.response.status}] ${error.config?.url}:`, error.response.data);
        } else {
            console.error(`API Network/Connection Error [${error.config?.url}]:`, error.message);
        }
        return Promise.reject(error);
    }
);

export { api };
export default api;
