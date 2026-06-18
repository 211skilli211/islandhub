import { pool } from '../config/db';

export interface StoreRow {
    store_id: number;
    user_id: number;
    name: string;
    description?: string;
    category?: string;
    type?: string;
    logo_url?: string;
    banner_url?: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    is_active?: boolean;
    is_featured?: boolean;
    is_verified?: boolean;
    metadata?: Record<string, any>;
    settings?: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateStorePayload {
    user_id: number;
    name: string;
    description?: string;
    category?: string;
    type?: string;
    logo_url?: string;
    banner_url?: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    metadata?: Record<string, any>;
    settings?: Record<string, any>;
}

export interface StoreFilters {
    category?: string;
    type?: string;
    is_active?: boolean;
    is_featured?: boolean;
    user_id?: number;
    limit?: number;
    offset?: number;
}

export class StoreModel {
    /**
     * Find a store by its primary key
     */
    static async findById(storeId: number): Promise<StoreRow | null> {
        const result = await pool.query('SELECT * FROM stores WHERE store_id = $1', [storeId]);
        return result.rows[0] || null;
    }

    /**
     * Find all stores owned by a user
     */
    static async findByUser(userId: number): Promise<StoreRow[]> {
        const result = await pool.query(
            'SELECT * FROM stores WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    /**
     * Find stores with optional filters
     */
    static async find(filters: StoreFilters = {}): Promise<StoreRow[]> {
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        if (filters.category) {
            conditions.push(`category = $${paramIdx++}`);
            params.push(filters.category);
        }
        if (filters.type) {
            conditions.push(`type = $${paramIdx++}`);
            params.push(filters.type);
        }
        if (filters.is_active !== undefined) {
            conditions.push(`is_active = $${paramIdx++}`);
            params.push(filters.is_active);
        }
        if (filters.is_featured !== undefined) {
            conditions.push(`is_featured = $${paramIdx++}`);
            params.push(filters.is_featured);
        }
        if (filters.user_id !== undefined) {
            conditions.push(`user_id = $${paramIdx++}`);
            params.push(filters.user_id);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;

        const result = await pool.query(
            `SELECT * FROM stores ${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
            [...params, limit, offset]
        );
        return result.rows;
    }

    /**
     * Create a new store
     */
    static async create(payload: CreateStorePayload): Promise<StoreRow> {
        const result = await pool.query(
            `INSERT INTO stores (user_id, name, description, category, type, logo_url, banner_url, location, address, phone, email, website, metadata, settings)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [
                payload.user_id,
                payload.name,
                payload.description || null,
                payload.category || null,
                payload.type || null,
                payload.logo_url || null,
                payload.banner_url || null,
                payload.location || null,
                payload.address || null,
                payload.phone || null,
                payload.email || null,
                payload.website || null,
                JSON.stringify(payload.metadata || {}),
                JSON.stringify(payload.settings || {}),
            ]
        );
        return result.rows[0];
    }

    /**
     * Update a store
     */
    static async update(storeId: number, payload: Partial<CreateStorePayload>): Promise<StoreRow | null> {
        const fields: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        const updatable: (keyof CreateStorePayload)[] = [
            'name', 'description', 'category', 'type', 'logo_url', 'banner_url',
            'location', 'address', 'phone', 'email', 'website', 'metadata', 'settings',
        ];

        for (const key of updatable) {
            if (payload[key] !== undefined) {
                fields.push(`${key} = $${paramIdx++}`);
                params.push(
                    key === 'metadata' || key === 'settings' ? JSON.stringify(payload[key]) : payload[key]
                );
            }
        }

        if (fields.length === 0) return this.findById(storeId);

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(storeId);

        const result = await pool.query(
            `UPDATE stores SET ${fields.join(', ')} WHERE store_id = $${paramIdx} RETURNING *`,
            params
        );
        return result.rows[0] || null;
    }

    /**
     * Soft-delete (deactivate) a store
     */
    static async deactivate(storeId: number): Promise<StoreRow | null> {
        const result = await pool.query(
            'UPDATE stores SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE store_id = $1 RETURNING *',
            [storeId]
        );
        return result.rows[0] || null;
    }

    /**
     * Hard-delete a store
     */
    static async delete(storeId: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM stores WHERE store_id = $1', [storeId]);
        return (result.rowCount ?? 0) > 0;
    }
}
