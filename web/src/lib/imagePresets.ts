// Image dimension presets for IslandHub
// All dimensions in pixels, aspect ratios optimized for different use cases

export const IMAGE_PRESETS = {
    // Profile & User Images
    profile_avatar: {
        width: 512,
        height: 512,
        aspectRatio: 1,
        label: 'Profile Avatar',
        maxSizeMB: 2,
        format: 'webp' as const,
        quality: 85
    },

    // Store/Vendor Images
    store_logo: {
        width: 256,
        height: 256,
        aspectRatio: 1,
        label: 'Store Logo',
        maxSizeMB: 1,
        format: 'webp' as const,
        quality: 80
    },
    store_banner: {
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        label: 'Store Banner',
        maxSizeMB: 5,
        format: 'webp' as const,
        quality: 85
    },

    // Product/Listing Images
    listing: {
        width: 1200,
        height: 900,
        aspectRatio: 4 / 3,
        label: 'Listing Image',
        maxSizeMB: 5,
        format: 'webp' as const,
        quality: 85
    },
    product_grid: {
        width: 800,
        height: 800,
        aspectRatio: 1,
        label: 'Product Grid',
        maxSizeMB: 3,
        format: 'webp' as const,
        quality: 80
    },
    product_detail: {
        width: 1024,
        height: 1024,
        aspectRatio: 1,
        label: 'Product Detail',
        maxSizeMB: 4,
        format: 'webp' as const,
        quality: 85
    },

    // User Generated Content
    user_banner: {
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        label: 'User Banner',
        maxSizeMB: 5,
        format: 'webp' as const,
        quality: 85
    },

    // Community Events
    event_cover: {
        width: 1200,
        height: 675,
        aspectRatio: 16 / 9,
        label: 'Event Cover',
        maxSizeMB: 4,
        format: 'webp' as const,
        quality: 85
    },

    // Advertisements
    ad_banner: {
        width: 1200,
        height: 628,
        aspectRatio: 1.91 / 1,
        label: 'Advertisement Banner',
        maxSizeMB: 5,
        format: 'webp' as const,
        quality: 85
    },

    // Blog/Posts
    post_image: {
        width: 1200,
        height: 630,
        aspectRatio: 1.91 / 1,
        label: 'Blog Post Image',
        maxSizeMB: 4,
        format: 'webp' as const,
        quality: 85
    },

    // Hero/Featured
    hero: {
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        label: 'Hero Image',
        maxSizeMB: 8,
        format: 'webp' as const,
        quality: 90
    }
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

// Map categories to their default presets
export const CATEGORY_PRESET_MAP: Record<string, ImagePreset> = {
    avatar: 'profile_avatar',
    profile: 'profile_avatar',
    user: 'profile_avatar',
    logo: 'store_logo',
    store_logo: 'store_logo',
    banner: 'store_banner',
    store_banner: 'store_banner',
    listing: 'listing',
    product: 'product_detail',
    item: 'product_grid',
    event: 'event_cover',
    cover: 'user_banner',
    post: 'post_image',
    hero: 'hero',
    ad: 'ad_banner'
};

export function getPresetForCategory(category: string): ImagePreset {
    const normalized = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return CATEGORY_PRESET_MAP[normalized] || 'listing';
}

export function getPresetDimensions(preset: ImagePreset) {
    return IMAGE_PRESETS[preset];
}
