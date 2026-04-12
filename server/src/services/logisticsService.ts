import { pool } from '../config/db';
import { notifyAllDrivers } from './notificationService';
import { calculateFare } from '../controllers/logisticsController';

export const LogisticsService = {
    async createDeliveryFromOrder(orderId: number) {
        try {
            // 1. Fetch order details with user and store info
            const orderRes = await pool.query(`
                SELECT 
                    o.*, 
                    u.name as customer_name,
                    u.phone as customer_phone,
                    s.business_name as store_name,
                    s.location as store_location,
                    s.user_id as vendor_id
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                JOIN stores s ON (SELECT listing_id FROM order_items WHERE order_id = o.order_id LIMIT 1) IS NOT NULL -- Simplified store link
                WHERE o.order_id = $1
            `, [orderId]);

            // Note: The store link in the sample query above is slightly flawed because an order can have items from different listings.
            // But usually in our system, one order = one store transaction for delivery.
            // Let's refine the store lookup.
            
            const refinedOrderRes = await pool.query(`
                SELECT 
                    o.*, 
                    u.name as customer_name,
                    s.name as store_name,
                    s.location as store_location,
                    s.vendor_id as store_vendor_id
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN listings l ON oi.listing_id = l.id
                JOIN stores s ON l.store_id = s.store_id
                WHERE o.order_id = $1
                LIMIT 1
            `, [orderId]);

            if (refinedOrderRes.rows.length === 0) return null;

            const order = refinedOrderRes.rows[0];

            // 2. Prevent duplicate jobs
            const existingJob = await pool.query(
                "SELECT id FROM listings WHERE extra_details->>'order_id' = $1",
                [orderId.toString()]
            );
            if (existingJob.rows.length > 0) return null;

            // 3. Prepare locations
            const pickup = order.store_location;
            const dropoff = order.shipping_address;

            // 4. Calculate fare (if not already set in order)
            const price = order.delivery_fee > 0 ? order.delivery_fee : await calculateFare('delivery', 'economy');

            // 5. Create the job listing
            const result = await pool.query(`
                INSERT INTO listings (
                    creator_id, title, description, price, category, type,
                    service_type, pickup_location, dropoff_location, 
                    transport_status, extra_details, pricing_details
                ) VALUES ($1, $2, $3, $4, 'service', 'service', 'delivery', $5, $6, 'pending', $7, $8)
                RETURNING *
            `, [
                order.user_id,
                `Delivery: Order #${order.order_number || orderId}`,
                `Express delivery from ${order.store_name} to ${order.customer_name}`,
                price,
                pickup,
                dropoff,
                JSON.stringify({
                    order_id: orderId,
                    customer_name: order.customer_name,
                    store_name: order.store_name,
                    is_auto_generated: true
                }),
                JSON.stringify({
                    base_fare: price,
                    distance: 0, // Could be calculated
                    duration: 0
                })
            ]);

            const job = result.rows[0];

            // 6. Notify drivers
            await notifyAllDrivers('new_order_delivery', {
                jobId: job.id,
                title: job.title,
                price: job.price,
                pickup: order.store_name
            });

            return job;
        } catch (error) {
            console.error('Failed to auto-create delivery job:', error);
            return null;
        }
    }
};
