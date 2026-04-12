import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { RevenueService } from '../services/revenueService';
import { pool } from '../config/db';

/**
 * Complete checkout process - converts cart/listings to orders
 */
export const checkout = async (req: Request, res: Response) => {
    try {
        const { items, shipping_address, currency = 'USD', order_type = 'pickup' } = req.body;
        const user_id = (req as any).user?.id;

        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // Calculate total and validate items
        let total_amount = 0;
        const validItems = [];

        for (const item of items) {
            // Verify listing exists and is available
            const listingResult = await pool.query(
                'SELECT * FROM listings WHERE id = $1 AND status = $2',
                [item.id, 'active']
            );

            if (listingResult.rows.length === 0) {
                return res.status(400).json({ message: `Item ${item.id} not available` });
            }

            const listing = listingResult.rows[0];
            const itemTotal = parseFloat(listing.price) * item.quantity;
            total_amount += itemTotal;

            validItems.push({
                item_id: item.id,
                item_type: listing.category,
                quantity: item.quantity,
                price: parseFloat(listing.price),
                item_name: listing.title
            });
        }

        // Create order
        const order = await OrderModel.create({
            user_id,
            total_amount,
            currency,
            shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
            order_type,
            delivery_fee: 0,
            status: 'pending',
            items: validItems
        });

        // Update listings status to 'sold' if applicable
        await Promise.all(
            validItems.map(item =>
                pool.query(
                    'UPDATE listings SET status = $1 WHERE id = $2',
                    ['sold', item.item_id]
                )
            )
        );

        res.status(201).json({
            success: true,
            order,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Checkout failed' });
    }
};

/**
 * Get user's orders with comprehensive data
 */
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

        const orders = await OrderModel.findByUserId(user_id);

        // Enrich orders with additional data
        const enrichedOrders = await Promise.all(
            orders.map(async (order: any) => {
                // Get order items with listing details
                const itemsResult = await pool.query(`
                    SELECT oi.*, l.title, l.category, l.images, l.service_type, l.transport_status
                    FROM order_items oi
                    LEFT JOIN listings l ON oi.item_id = l.id
                    WHERE oi.order_id = $1
                `, [order.order_id]);

                // Get order history/updates
                const historyResult = await pool.query(`
                    SELECT * FROM order_history 
                    WHERE order_id = $1 
                    ORDER BY created_at DESC
                `, [order.order_id]);

                return {
                    ...order,
                    items: itemsResult.rows,
                    history: historyResult.rows
                };
            })
        );

        res.json({
            success: true,
            orders: enrichedOrders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

/**
 * Get order details with full context
 */
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const order = await OrderModel.findById(parseInt(id));
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Verify ownership
        if (order.user_id !== user_id && (req as any).user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get detailed items
        const itemsResult = await pool.query(`
            SELECT oi.*, l.title, l.category, l.images, l.service_type, l.transport_status,
                   l.location as pickup_location, l.metadata, u.name as creator_name
            FROM order_items oi
            LEFT JOIN listings l ON oi.item_id = l.id
            LEFT JOIN users u ON l.creator_id = u.user_id
            WHERE oi.order_id = $1
        `, [order.order_id]);

        // Get revenue info for this order
        const revenueResult = await pool.query(`
            SELECT * FROM revenue_orders 
            WHERE listing_id IN (SELECT item_id FROM order_items WHERE order_id = $1)
        `, [order.order_id]);

        res.json({
            success: true,
            order: {
                ...order,
                items: itemsResult.rows,
                revenue: revenueResult.rows
            }
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const order = await OrderModel.findById(parseInt(id));
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Verify ownership
        if (order.user_id !== user_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if order can be cancelled
        if (['fulfilled', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled' });
        }

        // Update order status
        const updatedOrder = await OrderModel.updateStatus(parseInt(id), 'cancelled');

        // Restore listings to active status
        await pool.query(`
            UPDATE listings 
            SET status = 'active' 
            WHERE id IN (SELECT item_id FROM order_items WHERE order_id = $1)
        `, [parseInt(id)]);

        // Create order history entry
        await pool.query(`
            INSERT INTO order_history (order_id, status, notes, created_by)
            VALUES ($1, 'cancelled', 'Order cancelled by customer', $2)
        `, [parseInt(id), user_id]);

        res.json({
            success: true,
            order: updatedOrder,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Failed to cancel order' });
    }
};

/**
 * Get comprehensive dashboard data including orders, donations, and requests
 */
export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

        // Get all dashboard data in parallel
        const [ordersResult, donationsResult, requestsResult] = await Promise.all([
            OrderModel.findByUserId(user_id),
            pool.query('SELECT * FROM donations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [user_id]),
            pool.query(`
                SELECT * FROM listings 
                WHERE creator_id = $1 AND service_type IN ('taxi', 'delivery', 'pickup')
                ORDER BY created_at DESC LIMIT 10
            `, [user_id])
        ]);

        res.json({
            success: true,
            data: {
                orders: ordersResult,
                donations: donationsResult.rows,
                logistics_requests: requestsResult.rows
            }
        });
    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
};