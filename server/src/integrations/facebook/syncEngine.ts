import { sql } from '../config/db';

const FB_GRAPH_API = 'https://graph.facebook.com/v20.0';

interface FacebookCatalogConfig {
    appId: string;
    appSecret: string;
    accessToken: string;
    catalogId: string;
    businessId: string;
    pageId: string;
}

interface ProductForSync {
    id: number | string;
    title: string;
    description: string;
    price: number;
    currency: string;
    imageUrl: string;
    productUrl: string;
    availability: 'in stock' | 'out of stock';
    condition: 'new' | 'refurbished' | 'used';
    brand: string;
    category: string;
    retailerId: string;
    inventoryCount?: number;
}

interface SyncResult {
    synced: number;
    failed: number;
    errors: Array<{ retailerId: string; error: string }>;
    retryQueue: ProductForSync[];
}

/**
 * Facebook Commerce Catalog API Client
 * Handles product sync, batch operations, and error recovery
 */
export class FacebookCatalogClient {
    private config: FacebookCatalogConfig;
    private rateLimitDelay = 100; // ms between API calls

    constructor(config: FacebookCatalogConfig) {
        this.config = config;
    }

    /**
     * Make a rate-limited API call to Facebook Graph API
     */
    private async apiCall<T>(
        method: 'GET' | 'POST' | 'DELETE',
        endpoint: string,
        params: Record<string, string> = {},
        body?: Record<string, any>
    ): Promise<T> {
        const url = new URL(`${FB_GRAPH_API}${endpoint}`);
        url.searchParams.set('access_token', this.config.accessToken);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

        const options: RequestInit = { method };
        if (body) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url.toString(), options);
        const data = await response.json();

        if (data.error) {
            throw new FacebookAPIError(data.error);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

        return data as T;
    }

    /**
     * List all products in the catalog
     */
    async listProducts(limit = 100, after?: string): Promise<{ data: any[]; paging?: { cursors: { before: string; after: string }; next?: string } }> {
        const params: Record<string, string> = {
            fields: 'id,name,price,currency,availability,image_url,url,retailer_id,brand',
            limit: String(limit),
        };
        if (after) params.after = after;

        return this.apiCall('GET', `/${this.config.catalogId}/products`, params);
    }

    /**
     * Get a single product by retailer ID
     */
    async getProductByRetailerId(retailerId: string): Promise<any> {
        const { data } = await this.listProducts(100);
        return data.find((p: any) => p.retailer_id === retailerId);
    }

    /**
     * Create a single product in the catalog
     */
    async createProduct(product: ProductForSync): Promise<{ id: string }> {
        return this.apiCall('POST', `/${this.config.catalogId}/products`, {}, {
            retailer_id: product.retailerId,
            name: product.title.slice(0, 100),
            description: product.description.slice(0, 5000),
            price: Math.round(product.price * 100), // cents
            currency: product.currency,
            image_url: product.imageUrl,
            url: product.productUrl,
            availability: product.availability,
            condition: product.condition,
            brand: product.brand.slice(0, 100),
            category: product.category,
            ...(product.inventoryCount !== undefined ? {
                inventory: String(product.inventoryCount),
            } : {}),
        });
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId: string, updates: Partial<ProductForSync>): Promise<{ success: boolean }> {
        const fbUpdates: Record<string, any> = {};
        if (updates.title) fbUpdates.name = updates.title.slice(0, 100);
        if (updates.description) fbUpdates.description = updates.description.slice(0, 5000);
        if (updates.price) fbUpdates.price = Math.round(updates.price * 100);
        if (updates.currency) fbUpdates.currency = updates.currency;
        if (updates.imageUrl) fbUpdates.image_url = updates.imageUrl;
        if (updates.productUrl) fbUpdates.url = updates.productUrl;
        if (updates.availability) fbUpdates.availability = updates.availability;
        if (updates.brand) fbUpdates.brand = updates.brand.slice(0, 100);
        if (updates.inventoryCount !== undefined) fbUpdates.inventory = String(updates.inventoryCount);

        return this.apiCall('POST', `/${productId}`, {}, fbUpdates);
    }

    /**
     * Delete a product from the catalog
     */
    async deleteProduct(productId: string): Promise<{ success: boolean }> {
        return this.apiCall('DELETE', `/${productId}`);
    }

    /**
     * Batch create/update products (up to 50 per batch)
     */
    async batchSync(products: ProductForSync[]): Promise<{ handles: string[] }> {
        const requests = products.map((p, i) => ({
            method: 'CREATE',
            retailer_id: p.retailerId,
            data: {
                retailer_id: p.retailerId,
                name: p.title.slice(0, 100),
                description: p.description.slice(0, 5000),
                price: Math.round(p.price * 100),
                currency: p.currency,
                image_url: p.imageUrl,
                url: p.productUrl,
                availability: p.availability,
                condition: p.condition,
                brand: p.brand.slice(0, 100),
                category: p.category,
            },
        }));

        return this.apiCall('POST', `/${this.config.catalogId}/items_batch`, {}, { requests });
    }
}

/**
 * Custom error class for Facebook API errors
 */
export class FacebookAPIError extends Error {
    code: number;
    subcode?: number;
    type: string;

    constructor(error: any) {
        super(error.message);
        this.name = 'FacebookAPIError';
        this.code = error.code;
        this.subcode = error.error_subcode;
        this.type = error.type;
    }
}

/**
 * Product field mapper — IslandHub listings → Facebook product format
 */
export function mapListingToFacebookProduct(listing: any, store: any, baseUrl: string): ProductForSync {
    const price = typeof listing.price === 'string' ? parseFloat(listing.price) : (listing.price || 0);
    const inventoryCount = listing.metadata?.inventory_count;
    const isProduct = listing.type === 'product';
    const isService = listing.type === 'service';
    const isRental = listing.type === 'rental';

    let availability: 'in stock' | 'out of stock' = 'in stock';
    if (isProduct && inventoryCount !== undefined) {
        availability = inventoryCount > 0 ? 'in stock' : 'out of stock';
    }

    // Build category string
    let category = listing.category || 'Other';
    if (listing.sub_category) {
        category = `${category} > ${listing.sub_category}`;
    }

    return {
        id: listing.id,
        title: listing.title || 'Untitled',
        description: listing.description || '',
        price: price,
        currency: listing.currency || 'XCD',
        imageUrl: listing.image_url || `${baseUrl}/og-default.jpg`,
        productUrl: `${baseUrl}/store/${store.slug}/listings/${listing.id}`,
        availability,
        condition: 'new',
        brand: store.name || store.business_name || store.vendor_name || 'IslandHub',
        category,
        retailerId: `${store.slug}-${listing.id}`,
        inventoryCount,
    };
}

/**
 * Sync orchestrator — manages the full catalog sync process
 */
export class FacebookSyncEngine {
    private client: FacebookCatalogClient;
    private baseUrl: string;

    constructor(config: FacebookCatalogConfig, baseUrl: string) {
        this.client = new FacebookCatalogClient(config);
        this.baseUrl = baseUrl;
    }

    /**
     * Full catalog sync — pushes all active listings to Facebook
     */
    async fullSync(stores: any[], listings: any[]): Promise<SyncResult> {
        const result: SyncResult = {
            synced: 0,
            failed: 0,
            errors: [],
            retryQueue: [],
        };

        // Map all listings to Facebook format
        const products: ProductForSync[] = [];
        for (const listing of listings) {
            const store = stores.find((s: any) => s.store_id === listing.store_id);
            if (store && listing.status === 'active') {
                products.push(mapListingToFacebookProduct(listing, store, this.baseUrl));
            }
        }

        // Process in batches of 50
        const batchSize = 50;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            try {
                await this.client.batchSync(batch);
                result.synced += batch.length;

                // Log success
                for (const p of batch) {
                    await this.logSyncStatus(p.id, 'CREATE', 'synced', p.retailerId);
                }
            } catch (error: any) {
                if (error instanceof FacebookAPIError && error.code === 4) {
                    // Rate limit — add to retry queue
                    result.retryQueue.push(...batch);
                } else {
                    // Other error — mark all in batch as failed
                    result.failed += batch.length;
                    for (const p of batch) {
                        result.errors.push({ retailerId: p.retailerId, error: error.message });
                        await this.logSyncStatus(p.id, 'CREATE', 'failed', p.retailerId, error.message);
                    }
                }
            }
        }

        // Retry failed items with smaller batches
        if (result.retryQueue.length > 0) {
            const retryResult = await this.retrySync(result.retryQueue);
            result.synced += retryResult.synced;
            result.failed -= retryResult.synced;
        }

        return result;
    }

    /**
     * Sync a single listing (for real-time updates)
     */
    async syncListing(listing: any, store: any): Promise<{ success: boolean; facebookProductId?: string; error?: string }> {
        try {
            const product = mapListingToFacebookProduct(listing, store, this.baseUrl);

            // Check if product already exists
            const existing = await this.client.getProductByRetailerId(product.retailerId);

            if (existing) {
                // Update
                await this.client.updateProduct(existing.id, product);
                await this.logSyncStatus(product.id, 'UPDATE', 'synced', product.retailerId);
                return { success: true, facebookProductId: existing.id };
            } else {
                // Create
                const result = await this.client.createProduct(product);
                await this.logSyncStatus(product.id, 'CREATE', 'synced', product.retailerId);
                return { success: true, facebookProductId: result.id };
            }
        } catch (error: any) {
            await this.logSyncStatus(
                listing.id,
                'CREATE',
                'failed',
                `${store.slug}-${listing.id}`,
                error.message
            );
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a listing from Facebook catalog
     */
    async unsyncListing(retailerId: string): Promise<{ success: boolean }> {
        try {
            const existing = await this.client.getProductByRetailerId(retailerId);
            if (existing) {
                await this.client.deleteProduct(existing.id);
            }
            return { success: true };
        } catch (error: any) {
            return { success: false };
        }
    }

    /**
     * Retry sync with smaller batches
     */
    private async retrySync(products: ProductForSync[]): Promise<{ synced: number }> {
        let synced = 0;
        const batchSize = 10;

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            try {
                await this.client.batchSync(batch);
                synced += batch.length;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Extra delay on retry
            } catch {
                // Give up on this batch
            }
        }

        return { synced };
    }

    /**
     * Log sync status to database
     */
    private async logSyncStatus(
        productId: number | string,
        action: string,
        status: string,
        retailerId: string,
        errorMessage?: string
    ): Promise<void> {
        try {
            await sql`
                INSERT INTO facebook_sync_log (product_id, action, status, retailer_id, error_message)
                VALUES (${String(productId)}, ${action}, ${status}, ${retailerId}, ${errorMessage || null})
            `;
        } catch {
            // Don't let logging failures break the sync
        }
    }
}
