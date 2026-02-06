import { pool } from '../config/db';
import { OrderModel } from '../models/Order';

interface RevenueCalculation {
    amount: number;
    commission: number;
    netRevenue: number;
    platformFee?: number;
    driverFee?: number;
}

export class RevenueService {
    /**
     * Calculate revenue based on service type and pricing rules
     */
    static async calculateRevenue(serviceType: string, baseAmount: number): Promise<RevenueCalculation> {
        // Commission rates by service type
        const commissionRates = {
            'delivery': 0.20,      // 20% commission
            'pickup': 0.15,        // 15% commission
            'taxi': 0.25,          // 25% commission
            'service': 0.18        // 18% commission
        };

        const commissionRate = commissionRates[serviceType as keyof typeof commissionRates] || 0.20;
        const commission = baseAmount * commissionRate;
        const netRevenue = baseAmount - commission;

        return {
            amount: baseAmount,
            commission,
            netRevenue,
            platformFee: commission * 0.8,  // 80% of commission goes to platform
            driverFee: commission * 0.2     // 20% of commission goes to driver
        };
    }

    /**
     * Create order from completed delivery listing
     */
    static async createOrderFromDelivery(listingId: number, listing: any): Promise<any> {
        try {
            const order = await OrderModel.create({
                user_id: listing.creator_id,
                total_amount: parseFloat(listing.price),
                currency: 'USD',
                shipping_address: listing.location?.address || JSON.stringify(listing.location),
                order_type: 'delivery',
                delivery_fee: 0,
                status: 'fulfilled',
                items: [{
                    item_id: listing.id,
                    item_type: 'service',
                    quantity: 1,
                    price: parseFloat(listing.price),
                    item_name: listing.title
                }]
            });

            console.log(`Order created for delivery ${listingId}: Order ID ${order.order_id}`);
            return order;
        } catch (error) {
            console.error(`Failed to create order for delivery ${listingId}:`, error);
            throw error;
        }
    }

    /**
     * Create revenue record from completed delivery
     */
    static async createRevenueFromDelivery(
        deliveryId: number,
        listing: any,
        orderId: number,
        driverId?: number
    ): Promise<any> {
        try {
            const revenue = await this.calculateRevenue(
                listing.service_type || 'delivery',
                parseFloat(listing.price)
            );

            const result = await pool.query(
                `INSERT INTO revenue_orders 
                 (user_id, vendor_id, listing_id, amount, commission, net_revenue, status, transaction_id)
                 VALUES ($1, $2, $3, $4, $5, $6, 'paid', $7)
                 RETURNING *`,
                [
                    listing.creator_id,
                    listing.creator_id, // For service listings, creator is the vendor
                    deliveryId,
                    revenue.amount,
                    revenue.commission,
                    revenue.netRevenue,
                    `delivery_${deliveryId}_${orderId}_${Date.now()}`
                ]
            );

            console.log(`Revenue created for delivery ${deliveryId}: Revenue ID ${result.rows[0].order_id}`);

            // If there's a driver, create driver payout record
            if (driverId && revenue.driverFee && revenue.driverFee > 0) {
                await this.createDriverPayout(driverId, deliveryId, revenue.driverFee);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Failed to create revenue for delivery ${deliveryId}:`, error);
            throw error;
        }
    }

    /**
     * Create driver payout record
     */
    static async createDriverPayout(driverId: number, deliveryId: number, amount: number): Promise<any> {
        try {
            await pool.query(
                `INSERT INTO driver_payouts 
                 (driver_id, delivery_id, amount, status, created_at)
                 VALUES ($1, $2, $3, 'pending', NOW())
                 RETURNING *`,
                [driverId, deliveryId, amount]
            );

            console.log(`Driver payout created for driver ${driverId}, delivery ${deliveryId}: $${amount}`);
        } catch (error) {
            console.error(`Failed to create driver payout for delivery ${deliveryId}:`, error);
            // Don't throw here - payout failure shouldn't block revenue creation
        }
    }

    /**
     * Credit funds to a partner wallet and record the transaction
     */
    static async creditWallet(userId: number, amount: number, type: 'sale' | 'delivery_fee' | 'commission' | 'tip', refType: string, refId: number, notes: string, storeId?: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get or create wallet
            let walletRes = await client.query(
                'SELECT * FROM partner_wallets WHERE user_id = $1 AND partner_type = $2 FOR UPDATE',
                [userId, storeId ? 'vendor' : 'driver']
            );

            let wallet;
            if (walletRes.rows.length === 0) {
                const createRes = await client.query(
                    `INSERT INTO partner_wallets (user_id, partner_type, store_id, balance, withdrawable_balance, lifetime_earnings) 
                     VALUES ($1, $2, $3, 0, 0, 0) RETURNING *`,
                    [userId, storeId ? 'vendor' : 'driver', storeId || null]
                );
                wallet = createRes.rows[0];
            } else {
                wallet = walletRes.rows[0];
            }

            // 2. Update balances
            const newBalance = Number(wallet.balance) + amount;
            const newWithdrawable = Number(wallet.withdrawable_balance) + amount;
            const newLifetime = Number(wallet.lifetime_earnings) + amount;

            await client.query(
                `UPDATE partner_wallets 
                 SET balance = $1, withdrawable_balance = $2, lifetime_earnings = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE wallet_id = $4`,
                [newBalance, newWithdrawable, newLifetime, wallet.wallet_id]
            );

            // 3. Record transaction
            await client.query(
                `INSERT INTO wallet_transactions 
                 (wallet_id, amount, transaction_type, reference_type, reference_id, balance_before, balance_after, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [wallet.wallet_id, amount, type, refType, refId, wallet.balance, newBalance, notes]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Wallet credit failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Complete revenue creation process for a delivery
     */
    static async processDeliveryRevenue(deliveryId: number, listing: any, driverId?: number): Promise<any> {
        try {
            console.log(`Processing revenue for completed delivery: ${deliveryId}`);

            // Step 1: Create order
            const order = await this.createOrderFromDelivery(deliveryId, listing);

            // Step 2: Create revenue record
            const revenue = await this.createRevenueFromDelivery(
                deliveryId,
                listing,
                order.order_id,
                driverId
            );

            // Step 3: Update listing with order reference
            await pool.query(
                'UPDATE listings SET order_id = $1 WHERE id = $2',
                [order.order_id, deliveryId]
            );

            // Step 4: WALLET INTEGRATION
            const vendorId = listing.creator_id;
            const notes = `Revenue from ${listing.service_type || 'delivery'} #${deliveryId}`;

            // Credit Vendor (Net Revenue)
            await this.creditWallet(vendorId, revenue.netRevenue, 'sale', 'order', order.order_id, notes);

            // Credit Driver (if exists)
            if (driverId) {
                const driverAmount = revenue.commission * 0.2; // 20% of commission as defined in calculateRevenue
                if (driverAmount > 0) {
                    await this.creditWallet(driverId, driverAmount, 'delivery_fee', 'order', order.order_id, `Delivery fee for #${deliveryId}`);
                }
            }

            return {
                success: true,
                orderId: order.order_id,
                revenueId: revenue.order_id,
                totalAmount: listing.price,
                commission: revenue.commission,
                netRevenue: revenue.netRevenue
            };
        } catch (error) {
            console.error(`Failed to process revenue for delivery ${deliveryId}:`, error);
            throw error;
        }
    }

    /**
     * Get revenue statistics for a time period
     */
    static async getRevenueStats(startDate?: string, endDate?: string): Promise<any> {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(amount) as gross_revenue,
                    SUM(commission) as total_commission,
                    SUM(net_revenue) as net_revenue,
                    AVG(amount) as avg_order_value
                FROM revenue_orders 
                WHERE status = 'paid'
            `;
            const params: any[] = [];

            if (startDate) {
                query += ` AND created_at >= $${params.length + 1}`;
                params.push(startDate);
            }

            if (endDate) {
                query += ` AND created_at <= $${params.length + 1}`;
                params.push(endDate);
            }

            const result = await pool.query(query, params);
            return result.rows[0];
        } catch (error) {
            console.error('Failed to get revenue stats:', error);
            throw error;
        }
    }

    /**
     * Get driver earnings
     */
    static async getDriverEarnings(driverId: number, startDate?: string, endDate?: string): Promise<any> {
        try {
            let query = `
                SELECT 
                    dp.*,
                    l.title as delivery_title,
                    l.price as delivery_amount
                FROM driver_payouts dp
                JOIN listings l ON dp.delivery_id = l.id
                WHERE dp.driver_id = $1
            `;
            const params: any[] = [driverId];

            if (startDate) {
                query += ` AND dp.created_at >= $${params.length + 1}`;
                params.push(startDate);
            }

            if (endDate) {
                query += ` AND dp.created_at <= $${params.length + 1}`;
                params.push(endDate);
            }

            query += ` ORDER BY dp.created_at DESC`;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Failed to get driver earnings:', error);
            throw error;
        }
    }
}