import { pool } from '../config/db';

export interface ListingRow {
    id: number;
    user_id: number;
    store_id?: number;
    title: string;
    description?: string;
    price: number;
    category?: string;
    sub_category?: string;
    condition?: string;
    type?: string;
    location?: string;
    images?: any[];
    metadata?: Record<string, any>;
    featured?: boolean;
    is_promoted?: boolean;
    verified?: boolean;
    status?: string;
    search_vector?: any;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateListingPayload {
    user_id: number;
    store_id?: number;
    title: string;
    description?: string;
    price: number;
    category?: string;
    sub_category?: string;
    condition?: string;
    type?: string;
    location?: string;
    images?: any[];
    metadata?: Record<string, any>;
}

export interface ListingFilters {
    category?: string;
    status?: string;
    store_id?: number;
    verified?: boolean;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
}

export class ListingModel {
    /**
     * Find a listing by its primary key
     */
    static async findById(id: number): Promise<ListingRow | null> {
        const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    /**
     * Find all listings belonging to a store
     */
    static async findByStore(storeId: number, limit = 50, offset = 0): Promise<ListingRow[]> {
        const result = await pool.query(
            'SELECT * FROM listings WHERE store_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [storeId, limit, offset]
        );
        return result.rows;
    }

    /**
     * Find all listings created by a user
     */
    static async findByUser(userId: number, limit = 50, offset = 0): Promise<ListingRow[]> {
        const result = await pool.query(
            'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [userId, limit, offset]
        );
        return result.rows;
    }

    /**
     * Find listings with optional filters
     */
    static async find(filters: ListingFilters = {}): Promise<ListingRow[]> {
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        if (filters.category) {
            conditions.push(`category = $${paramIdx++}`);
            params.push(filters.category);
        }
        if (filters.status) {
            conditions.push(`status = $${paramIdx++}`);
            params.push(filters.status);
        }
        if (filters.store_id !== undefined) {
            conditions.push(`store_id = $${paramIdx++}`);
            params.push(filters.store_id);
        }
        if (filters.verified !== undefined) {
            conditions.push(`verified = $${paramIdx++}`);
            params.push(filters.verified);
        }
        if (filters.featured !== undefined) {
            conditions.push(`featured = $${paramIdx++}`);
            params.push(filters.featured);
        }
        if (filters.search) {
            conditions.push(`search_vector @@ plainto_tsquery('english', $${paramIdx++})`);
            params.push(filters.search);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;

        const result = await pool.query(
            `SELECT * FROM listings ${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
            [...params, limit, offset]
        );
        return result.rows;
    }

    /**
     * Create a new listing
     */
    static async create(payload: CreateListingPayload): Promise<ListingRow> {
        const result = await pool.query(
            `INSERT INTO listings (user_id, store_id, title, description, price, category, sub_category, condition, type, location, images, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                payload.user_id,
                payload.store_id || null,
                payload.title,
                payload.description || null,
                payload.price,
                payload.category || null,
                payload.sub_category || null,
                payload.condition || null,
                payload.type || null,
                payload.location || null,
                JSON.stringify(payload.images || []),
                JSON.stringify(payload.metadata || {}),
            ]
        );
        return result.rows[0];
    }

    /**
     * Update a listing by ID
     */
    static async update(id: number, payload: Partial<CreateListingPayload>): Promise<ListingRow | null> {
        const fields: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        const updatable: (keyof CreateListingPayload)[] = [
            'title', 'description', 'price', 'category', 'sub_category',
            'condition', 'type', 'location', 'images', 'metadata', 'store_id',
        ];

        for (const key of updatable) {
            if (payload[key] !== undefined) {
                fields.push(`${key} = $${paramIdx++}`);
                params.push(key === 'images' || key === 'metadata' ? JSON.stringify(payload[key]) : payload[key]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const result = await pool.query(
            `UPDATE listings SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        );
        return result.rows[0] || null;
    }

    /**
     * Delete a listing by ID
     */
    static async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM listings WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Full-text search across listings
     */
    static async search(query: string, limit = 20): Promise<ListingRow[]> {
        const result = await pool.query(
            `SELECT *, ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
             FROM listings
             WHERE search_vector @@ plainto_tsquery('english', $1) AND status = 'active'
             ORDER BY rank DESC, is_promoted DESC
             LIMIT $2`,
            [query, limit]
        );
        return result.rows;
    }
}
