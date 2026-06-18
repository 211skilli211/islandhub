import { pool } from '../config/db';

export interface OrderItem {
    id?: number;
    order_id?: number;
    item_id: number;
    item_type: 'product' | 'rental' | 'service' | 'campaign';
    quantity: number;
    price: number;
    // Extended properties for frontend display
    item_name?: string;
    modifiers?: any;
    photos?: any;
}

export interface Order {
    order_id?: number;
    user_id?: number;
    total_amount: number;
    tax_amount?: number;
    service_fee?: number;
    currency: string;
    status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'preparing' | 'ready'; // Added KDS statuses
    shipping_address?: string;
    order_type?: 'delivery' | 'pickup' | 'dine_in';
    delivery_fee?: number;
    assigned_driver_id?: number;
    delivery_lat?: number;
    delivery_lng?: number;
    payment_method?: string;
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
    items?: OrderItem[];
    customer_name?: string; // For display
}

export class OrderModel {
    static async create(order: Order): Promise<Order> {
        const { user_id, total_amount, currency = 'USD', shipping_address, order_type = 'pickup', delivery_fee = 0 } = order;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderResult = await client.query(
                `INSERT INTO orders (user_id, total_amount, currency, shipping_address, status, order_type, delivery_fee)
         VALUES ($1, $2, $3, $4, 'pending', $5, $6)
         RETURNING *`,
                [user_id, total_amount, currency, shipping_address, order_type, delivery_fee]
            );

            const newOrder = orderResult.rows[0];

            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await client.query(
                        `INSERT INTO order_items (order_id, item_id, item_type, quantity, price)
             VALUES ($1, $2, $3, $4, $5)`,
                        [newOrder.order_id, item.item_id, item.item_type, item.quantity, item.price]
                    );
                }
            }

            await client.query('COMMIT');
            return { ...newOrder, items: order.items };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async findById(order_id: number): Promise<Order | null> {
        const orderResult = await pool.query('SELECT * FROM orders WHERE order_id = $1', [order_id]);
        if (orderResult.rows.length === 0) return null;

        const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
        return { ...orderResult.rows[0], items: itemsResult.rows };
    }

    static async updateStatus(order_id: number, status: string): Promise<Order | null> {
        const result = await pool.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *',
            [status, order_id]
        );
        return result.rows[0] || null;
    }

    static async findByUserId(user_id: number): Promise<Order[]> {
        const result = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        return result.rows;
    }

    // New: Find active orders for a specific store (KDS Logic)
    static async findByStoreId(store_id: number, statusList: string[] = ['paid', 'preparing', 'ready']): Promise<Order[]> {
        // Complex join to get orders containing items from this store
        // We filter by statuses to only show relevant KDS orders
        const query = `
            SELECT DISTINCT o.*, u.name as customer_name
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN menu_items mi ON oi.item_id = mi.item_id AND oi.item_type = 'food'
            LEFT JOIN listings l ON (
                (oi.item_type = 'food' AND mi.listing_id = l.id) OR
                (oi.item_type != 'food' AND oi.item_id = l.id)
            )
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE l.store_id = $1 AND o.status = ANY($2)
            ORDER BY o.created_at ASC
        `;

        const result = await pool.query(query, [store_id, statusList]);
        const orders = result.rows;

        // Populate items for each order
        for (const order of orders) {
            const itemsQuery = `
                SELECT oi.*, 
                       COALESCE(mi.item_name, l.title) as item_name,
                       mi.prep_time
                FROM order_items oi
                LEFT JOIN menu_items mi ON oi.item_id = mi.item_id AND oi.item_type = 'food'
                LEFT JOIN listings l ON (
                    (oi.item_type = 'food' AND mi.listing_id = l.id) OR
                    (oi.item_type != 'food' AND oi.item_id = l.id)
                )
                WHERE oi.order_id = $1 AND l.store_id = $2
            `;
            const itemsRes = await pool.query(itemsQuery, [order.order_id, store_id]);
            order.items = itemsRes.rows;
        }

        return orders;
    }

    // New: Find all orders (Global Admin Logic)
    static async findAll(filters: { store_id?: number; status?: string; limit?: number; offset?: number } = {}): Promise<Order[]> {
        const { store_id, status, limit = 50, offset = 0 } = filters;
        let query = `
            SELECT o.*, u.name as customer_name, s.name as store_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN menu_items mi ON oi.item_id = mi.item_id
            LEFT JOIN menu_sections ms ON mi.section_id = ms.section_id
            LEFT JOIN listings l ON ms.listing_id = l.id
            LEFT JOIN stores s ON l.store_id = s.store_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (store_id) {
            params.push(store_id);
            query += ` AND l.store_id = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND o.status = $${params.length}`;
        }

        query += ` GROUP BY o.order_id, u.name, s.name ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows;
    }
}
