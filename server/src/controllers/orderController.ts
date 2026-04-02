import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { EmailService } from '../services/emailService';
import { LogisticsService } from '../services/logisticsService';
import { pool } from '../config/db';

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, shipping_address, currency, order_type = 'pickup', delivery_fee = 0 } = req.body;
        const user_id = (req as any).user?.id || null;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await OrderModel.create({
            user_id,
            total_amount,
            currency: currency || 'USD',
            shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
            status: 'pending',
            order_type,
            delivery_fee,
            items
        });

        if (user_id) {
            try {
                const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [user_id]);
                if (userResult.rows[0]) {
                    await EmailService.sendOrderConfirmation(
                        userResult.rows[0].email,
                        `ORD-${order.id}`,
                        total_amount,
                        currency || 'USD',
                        items.length
                    );
                }
            } catch (emailErr) {
                console.error('Failed to send order confirmation email:', emailErr);
            }
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error creating order' });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.findById(parseInt(id as string));
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });
        const orders = await OrderModel.findByUserId(user_id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// New: Get active orders for a specific store (KDS)
export const getStoreOrders = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const { status } = req.query; // Optional filter

        let statuses: string[] = ['paid', 'preparing', 'ready', 'pending']; // Default KDS statuses
        if (typeof status === 'string') {
            statuses = status.split(',');
        } else if (Array.isArray(status)) {
            statuses = status.map(s => String(s)); // Safe conversion
        }

        // @ts-ignore
        const orders = await OrderModel.findByStoreId(parseInt(storeId), statuses as any);
        // const orders: any[] = [];
        res.json(orders);
    } catch (error) {
        console.error('getStoreOrders error:', error);
        res.status(500).json({ message: 'Server error fetching store orders' });
    }
};

// New: Update order status (with logging/transitions)
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || typeof status !== 'string') return res.status(400).json({ message: 'Status is required and must be a string' });

        const validStatuses = ['pending', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled', 'picked_up'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // @ts-ignore
        const updatedOrder = await OrderModel.updateStatus(parseInt(id), status as string);

        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

        // Auto-dispatch logistics if order is ready for delivery
        if (status === 'ready' && updatedOrder.order_type === 'delivery' && updatedOrder.order_id) {
            await LogisticsService.createDeliveryFromOrder(updatedOrder.order_id);
        }

        console.log(`Order ${id} status updated to ${status}`);

        res.json(updatedOrder);
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// NEW: Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user_id = (req as any).user?.id;

        await client.query('BEGIN');

        // Get order details
        const orderResult = await client.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [parseInt(id as string)]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Check if user owns the order or is admin
        if (order.user_id !== user_id && (req as any).user?.role !== 'admin') {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled
        const cancellableStatuses = ['pending', 'paid', 'processing'];
        if (!cancellableStatuses.includes(order.status)) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: `Cannot cancel order with status: ${order.status}. Order must be pending, paid, or processing.`
            });
        }

        // Update order status
        await client.query(
            `UPDATE orders 
             SET status = 'cancelled', 
                 cancelled_at = CURRENT_TIMESTAMP,
                 cancelled_by = $1,
                 cancellation_reason = $2
             WHERE order_id = $3`,
            [user_id, reason || 'Customer requested cancellation', parseInt(id as string)]
        );

        // If payment was made, mark for refund
        if (order.payment_status === 'captured' || order.payment_status === 'completed') {
            await client.query(
                `UPDATE orders 
                 SET refund_amount = total_amount,
                     refund_reason = $1
                 WHERE order_id = $2`,
                [`Order cancelled: ${reason || 'Customer requested'}`, parseInt(id as string)]
            );

            // TODO: Trigger refund through payment provider
            console.log(`Refund required for order ${id}: ${order.total_amount}`);
        }

        // Restore inventory (if applicable)
        const itemsResult = await client.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [parseInt(id as string)]
        );

        for (const item of itemsResult.rows) {
            if (item.listing_id) {
                // Restore inventory count
                await client.query(
                    'UPDATE listings SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [item.quantity, item.listing_id]
                );
            }
        }

        // Log status change
        await client.query(
            `INSERT INTO order_status_history (order_id, status, previous_status, changed_by, changed_by_type, notes)
             VALUES ($1, 'cancelled', $2, $3, 'customer', $4)`,
            [parseInt(id as string), order.status, user_id, reason || 'Customer requested cancellation']
        );

        // Send cancellation email
        if (order.user_id) {
            const userResult = await client.query('SELECT email, name FROM users WHERE user_id = $1', [order.user_id]);
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                try {
                    await EmailService.sendOrderCancellationEmail(
                        user.email,
                        order.order_number,
                        order.total_amount,
                        order.currency,
                        reason || 'Customer requested cancellation'
                    );
                } catch (emailError) {
                    console.error('Failed to send cancellation email:', emailError);
                }
            }
        }

        await client.query('COMMIT');

        res.json({
            message: 'Order cancelled successfully',
            order_id: parseInt(id as string),
            status: 'cancelled',
            requires_refund: order.payment_status === 'captured' || order.payment_status === 'completed'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('cancelOrder error:', error);
        res.status(500).json({ message: 'Server error cancelling order' });
    } finally {
        client.release();
    }
};

// NEW: Get order status history
export const getOrderStatusHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        // Verify user owns the order or is admin
        const orderResult = await pool.query(
            'SELECT user_id FROM orders WHERE order_id = $1',
            [parseInt(id as string)]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (orderResult.rows[0].user_id !== user_id && (req as any).user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const historyResult = await pool.query(
            `SELECT h.*, u.name as changed_by_name
             FROM order_status_history h
             LEFT JOIN users u ON h.changed_by = u.user_id
             WHERE h.order_id = $1
             ORDER BY h.created_at DESC`,
            [parseInt(id as string)]
        );

        res.json(historyResult.rows);
    } catch (error) {
        console.error('getOrderStatusHistory error:', error);
        res.status(500).json({ message: 'Server error fetching order history' });
    }
};
