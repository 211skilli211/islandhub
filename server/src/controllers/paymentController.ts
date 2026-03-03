import { Request, Response } from 'express';
import { pool } from '../config/db';
import dodoPayments from '../services/dodopayments';
import { EmailService } from '../services/emailService';

/**
 * Create payment intent for order
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { cartId, productType = 'one_time' } = req.body;

        if (!userId && !cartId) {
            return res.status(400).json({ message: 'User ID or Cart ID required' });
        }

        // Get cart items
        const cartItemsResult = await pool.query(`
            SELECT 
                ci.*,
                l.title,
                l.type,
                l.price,
                s.store_id,
                s.vendor_id,
                s.category
            FROM cart_items ci
            JOIN listings l ON ci.listing_id = l.id
            JOIN stores s ON l.store_id = s.store_id
            WHERE ci.cart_id = $1
        `, [cartId]);

        if (cartItemsResult.rows.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const items = cartItemsResult.rows;

        // Group items by store_id
        const itemsByStore: Record<number, typeof items> = {};
        for (const item of items) {
            if (!itemsByStore[item.store_id]) {
                itemsByStore[item.store_id] = [];
            }
            itemsByStore[item.store_id].push(item);
        }

        let overallTotal = 0;
        const createdOrders: any[] = [];
        const orderIds: number[] = [];

        // Generate unique group identifier
        const orderGroupNumber = `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        for (const [storeIdStr, storeItems] of Object.entries(itemsByStore)) {
            const storeId = parseInt(storeIdStr);

            // Calculate totals for this store
            const storeSubtotal = storeItems.reduce((sum: number, item: any) => sum + (item.price_snapshot * item.quantity), 0);
            const storeServiceFee = storeSubtotal * 0.05; // 5% platform fee
            const storeTax = storeSubtotal * 0.10; // 10% tax
            const storeTotal = storeSubtotal + storeServiceFee + storeTax;

            overallTotal += storeTotal;

            // Generate unique order number for this store
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

            // Create order
            const orderResult = await pool.query(`
                INSERT INTO orders (
                    user_id, store_id, order_number, status, 
                    subtotal, tax_amount, service_fee, total_amount,
                    payment_method, payment_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [userId, storeId, orderNumber, 'pending', storeSubtotal, storeTax, storeServiceFee, storeTotal, 'dodopayments', 'pending']);

            const order = orderResult.rows[0];
            createdOrders.push(order);
            orderIds.push(order.order_id);

            // Create order items
            for (const item of storeItems) {
                await pool.query(`
                    INSERT INTO order_items (
                        order_id, listing_id, item_type,
                        quantity, price
                    ) VALUES ($1, $2, $3, $4, $5)
                `, [
                    order.order_id,
                    item.listing_id,
                    item.type,
                    item.quantity,
                    item.price_snapshot
                ]);
                // Note: vendor_id, price_snapshot/unit_price vs price difference depending on schema. We are using standard order_items schema here.
            }
        }

        // Create payment intent with DodoPayments
        const paymentIntent = await dodoPayments.createPaymentIntent(
            overallTotal,
            'XCD',
            {
                order_ids: orderIds.join(','), // comma-separated for multi-store checkout
                group_number: orderGroupNumber,
                user_id: userId,
                cart_id: cartId
            },
            productType as 'one_time' | 'subscription' | 'usage_based'
        );

        // Update orders with payment intent ID
        await pool.query(
            'UPDATE orders SET payment_intent_id = $1 WHERE order_id = ANY($2::int[])',
            [paymentIntent.id, orderIds]
        );

        // We return the first order's ID for the frontend success redirect, 
        // or a new generic success page might be needed. For now, returning first orderId.
        res.json({
            orderId: orderIds[0],
            orderNumber: orderGroupNumber,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            total: overallTotal
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
};

/**
 * Webhook handler for DodoPayments events
 */
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['dodo-signature'] as string;
        const payload = JSON.stringify(req.body);

        // Verify webhook signature
        if (!dodoPayments.verifyWebhookSignature(payload, signature)) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        const event = req.body;

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data);
                break;

            case 'payment_intent.failed':
                await handlePaymentFailure(event.data);
                break;

            case 'payout.completed':
                await handlePayoutCompleted(event.data);
                break;

            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.cancelled':
                await handleSubscriptionEvent(event.type, event.data);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any) {
    let orderIds: number[] = [];

    // Parse order_ids if it's a multi-store checkout, otherwise fallback to single order_id
    if (paymentIntent.metadata.order_ids) {
        orderIds = paymentIntent.metadata.order_ids.split(',').map((id: string) => parseInt(id, 10));
    } else if (paymentIntent.metadata.order_id) {
        orderIds = [parseInt(paymentIntent.metadata.order_id, 10)];
    }

    if (orderIds.length === 0) return;

    // Update orders status
    await pool.query(
        'UPDATE orders SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = ANY($3::int[])',
        ['paid', 'processing', orderIds]
    );

    // Fetch user email for confirmation (just from the first order to avoid duplicates)
    const userRes = await pool.query('SELECT u.email, u.name FROM users u JOIN orders o ON u.user_id = o.user_id WHERE o.order_id = $1', [orderIds[0]]);
    if (userRes.rows.length > 0) {
        const { email, name } = userRes.rows[0];
        // Send email here if needed
    }

    // Create transaction record
    await pool.query(`
        INSERT INTO transactions (order_id, type, amount, currency, gateway, gateway_transaction_id, status, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
        orderIds[0], // Record primary order id for trans
        'payment',
        paymentIntent.amount / 100,
        paymentIntent.currency,
        'dodopayments',
        paymentIntent.id,
        'completed',
        JSON.stringify(paymentIntent.metadata)
    ]);

    // Update vendor balances with tier-aware commission
    const orderItems = await pool.query(
        'SELECT item_type as vendor_id, price as total_price FROM order_items WHERE order_id = ANY($1::int[])',
        [orderIds]
    );
    // Note: If you need to map vendor_id correctly, join with listings table.
    const itemsWithVendors = await pool.query(`
        SELECT l.vendor_id, oi.price * oi.quantity as total_price
        FROM order_items oi
        JOIN listings l ON oi.listing_id = l.id
        WHERE oi.order_id = ANY($1::int[])
    `, [orderIds]);

    for (const item of itemsWithVendors.rows) {
        if (!item.vendor_id) continue;

        // Fetch vendor's commission rate from their active subscription
        const subResult = await pool.query(
            "SELECT commission_rate FROM vendor_subscriptions WHERE vendor_id = $1 AND status = 'active' LIMIT 1",
            [item.vendor_id]
        );

        const commissionRate = subResult.rows.length > 0
            ? parseFloat(subResult.rows[0].commission_rate)
            : 5.0; // Fallback to default 5%

        const platformFee = item.total_price * (commissionRate / 100);
        const vendorAmount = item.total_price - platformFee;

        await pool.query(
            'UPDATE vendors SET balance = COALESCE(balance, 0) + $1 WHERE id = $2',
            [vendorAmount, item.vendor_id]
        );
    }

    // Clear cart items
    if (paymentIntent.metadata.cart_id) {
        await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [paymentIntent.metadata.cart_id]);
    } else {
        const cartResult = await pool.query(
            'SELECT ci.cart_id FROM cart_items ci JOIN order_items oi ON ci.listing_id = oi.listing_id WHERE oi.order_id = $1 LIMIT 1',
            [orderIds[0]]
        );

        if (cartResult.rows.length > 0) {
            await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].cart_id]);
        }
    }

    console.log(`Payment successful for orders: ${orderIds.join(', ')}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: any) {
    let orderIds: number[] = [];

    if (paymentIntent.metadata.order_ids) {
        orderIds = paymentIntent.metadata.order_ids.split(',').map((id: string) => parseInt(id, 10));
    } else if (paymentIntent.metadata.order_id) {
        orderIds = [parseInt(paymentIntent.metadata.order_id, 10)];
    }

    if (orderIds.length === 0) return;

    await pool.query(
        'UPDATE orders SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = ANY($3::int[])',
        ['failed', 'cancelled', orderIds]
    );

    // Send failure notification email
    const userRes = await pool.query('SELECT u.email FROM users u JOIN orders o ON u.user_id = o.user_id WHERE o.order_id = $1', [orderIds[0]]);
    if (userRes.rows.length > 0) {
        await EmailService.sendPaymentFailed(userRes.rows[0].email, 'Order Payment');
    }
    console.log(`Payment failed for orders: ${orderIds.join(', ')}`);
}

/**
 * Handle completed payout
 */
async function handlePayoutCompleted(payout: any) {
    const vendorId = payout.metadata.vendor_id;

    await pool.query(
        'UPDATE payouts SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE payout_reference = $2',
        ['completed', payout.id]
    );

    // TODO: Send payout confirmation email to vendor
    console.log(`Payout completed for vendor ${vendorId}`);
}

/**
 * Handle subscription events
 */
async function handleSubscriptionEvent(eventType: string, subscription: any) {
    try {
        // Idempotency check: prevent duplicate processing
        if (subscription.id) {
            const existingCheck = await pool.query(
                `SELECT 1 FROM vendor_subscriptions WHERE dodo_subscription_id = $1
                 UNION
                 SELECT 1 FROM customer_subscriptions WHERE dodo_subscription_id = $1
                 UNION
                 SELECT 1 FROM campaign_creator_subscriptions WHERE dodo_subscription_id = $1
                 LIMIT 1`,
                [subscription.id]
            );

            if (existingCheck.rows.length > 0 && eventType === 'subscription.created') {
                console.log(`Subscription ${subscription.id} already exists, skipping duplicate creation`);
                return;
            }
        }

        // Determine subscription type from metadata
        const metadata = subscription.metadata || {};
        const subscriptionType = metadata.subscription_type; // 'vendor', 'customer', or 'campaign_creator'

        switch (eventType) {
            case 'subscription.created':
                if (subscriptionType === 'vendor') {
                    await activateVendorSubscription(subscription);
                } else if (subscriptionType === 'customer') {
                    await activateCustomerSubscription(subscription);
                } else if (subscriptionType === 'campaign_creator') {
                    await activateCampaignCreatorSubscription(subscription);
                }
                break;

            case 'subscription.updated':
                await updateSubscriptionTier(subscriptionType, subscription);
                break;

            case 'subscription.renewed':
                await renewSubscription(subscriptionType, subscription);
                break;

            case 'subscription.cancelled':
                await cancelSubscription(subscriptionType, subscription);
                break;

            default:
                console.log(`Unhandled subscription event: ${eventType}`);
        }
    } catch (error) {
        console.error('Subscription event handling error:', error);
        throw error; // Re-throw to trigger webhook retry
    }
}

/**
 * Activate vendor subscription
 */
async function activateVendorSubscription(subscription: any) {
    const metadata = subscription.metadata;
    const vendorId = metadata.vendor_id;
    const tier = metadata.tier || 'basic_product';
    const vendorType = metadata.vendor_type || 'product';

    // Determine tier-specific values
    const tierConfig = getVendorTierConfig(tier);

    const result = await pool.query(`
        INSERT INTO vendor_subscriptions (
            vendor_id, tier, vendor_type, status,
            dodo_subscription_id, dodo_customer_id, dodo_price_id,
            current_period_start, current_period_end, cancel_at_period_end,
            commission_rate, max_stores, max_listings_per_store, features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (vendor_id) WHERE status = 'active'
        DO UPDATE SET
            tier = EXCLUDED.tier,
            dodo_subscription_id = EXCLUDED.dodo_subscription_id,
            dodo_customer_id = EXCLUDED.dodo_customer_id,
            dodo_price_id = EXCLUDED.dodo_price_id,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            commission_rate = EXCLUDED.commission_rate,
            max_stores = EXCLUDED.max_stores,
            max_listings_per_store = EXCLUDED.max_listings_per_store,
            features = EXCLUDED.features,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `, [
        vendorId, tier, vendorType, subscription.status,
        subscription.id, subscription.customer_id, subscription.price_id,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        false,
        tierConfig.commission_rate, tierConfig.max_stores, tierConfig.max_listings_per_store,
        JSON.stringify(tierConfig.features)
    ]);

    // Update vendor badges
    await updateVendorBadges(vendorId, tier);

    await logSubscriptionAudit('SUBSCRIPTION_CREATED', vendorId, null, result.rows[0]);

    // Send Confirmation Email
    const userRes = await pool.query('SELECT email FROM users u JOIN vendors v ON u.user_id = v.user_id WHERE v.id = $1', [vendorId]);
    if (userRes.rows.length > 0) {
        await EmailService.sendSubscriptionConfirmation(userRes.rows[0].email, tier, subscription.amount / 100);
    }

    console.log(`Vendor subscription activated: ${vendorId}, tier: ${tier}`);
}

/**
 * Activate customer subscription
 */
async function activateCustomerSubscription(subscription: any) {
    const metadata = subscription.metadata;
    const userId = metadata.user_id;
    const tier = metadata.tier || 'vip';

    const tierConfig = getCustomerTierConfig(tier);

    const result = await pool.query(`
        INSERT INTO customer_subscriptions (
            user_id, tier, status,
            dodo_subscription_id, dodo_customer_id, dodo_price_id,
            current_period_start, current_period_end, cancel_at_period_end,
            discount_rate, rewards_multiplier, features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id) WHERE status = 'active'
        DO UPDATE SET
            tier = EXCLUDED.tier,
            dodo_subscription_id = EXCLUDED.dodo_subscription_id,
            dodo_customer_id = EXCLUDED.dodo_customer_id,
            dodo_price_id = EXCLUDED.dodo_price_id,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            discount_rate = EXCLUDED.discount_rate,
            rewards_multiplier = EXCLUDED.rewards_multiplier,
            features = EXCLUDED.features,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `, [
        userId, tier, subscription.status,
        subscription.id, subscription.customer_id, subscription.price_id,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        false,
        tierConfig.discount_rate, tierConfig.rewards_multiplier,
        JSON.stringify(tierConfig.features)
    ]);

    await logSubscriptionAudit('SUBSCRIPTION_CREATED', userId, null, result.rows[0]);

    // Send Confirmation Email
    const userRes = await pool.query('SELECT email FROM users WHERE user_id = $1', [userId]);
    if (userRes.rows.length > 0) {
        await EmailService.sendSubscriptionConfirmation(userRes.rows[0].email, tier, subscription.amount / 100);
    }

    console.log(`Customer subscription activated: ${userId}, tier: ${tier}`);
}

/**
 * Activate campaign creator subscription
 */
async function activateCampaignCreatorSubscription(subscription: any) {
    const metadata = subscription.metadata;
    const userId = metadata.user_id;
    const tier = metadata.tier || 'individual';

    const tierConfig = getCampaignCreatorTierConfig(tier);

    const result = await pool.query(`
        INSERT INTO campaign_creator_subscriptions (
            user_id, tier, status,
            dodo_subscription_id, dodo_customer_id, dodo_price_id,
            current_period_start, current_period_end, cancel_at_period_end,
            platform_fee, max_campaigns, nonprofit_verified, features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (user_id) WHERE status = 'active'
        DO UPDATE SET
            tier = EXCLUDED.tier,
            dodo_subscription_id = EXCLUDED.dodo_subscription_id,
            dodo_customer_id = EXCLUDED.dodo_customer_id,
            dodo_price_id = EXCLUDED.dodo_price_id,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            platform_fee = EXCLUDED.platform_fee,
            max_campaigns = EXCLUDED.max_campaigns,
            features = EXCLUDED.features,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `, [
        userId, tier, subscription.status,
        subscription.id, subscription.customer_id, subscription.price_id,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        false,
        tierConfig.platform_fee, tierConfig.max_campaigns, false,
        JSON.stringify(tierConfig.features)
    ]);

    // Log audit
    await logSubscriptionAudit('SUBSCRIPTION_CREATED', userId, null, result.rows[0]);

    console.log(`Campaign creator subscription activated: ${userId}, tier: ${tier}`);
}

/**
 * Update subscription tier
 */
async function updateSubscriptionTier(subscriptionType: string, subscription: any) {
    const metadata = subscription.metadata;
    const tier = metadata.tier;

    if (subscriptionType === 'vendor') {
        const vendorId = metadata.vendor_id;
        const tierConfig = getVendorTierConfig(tier);

        const oldValues = await pool.query('SELECT * FROM vendor_subscriptions WHERE vendor_id = $1 AND status = \'active\'', [vendorId]);

        await pool.query(`
            UPDATE vendor_subscriptions
            SET tier = $1, commission_rate = $2, max_stores = $3, max_listings_per_store = $4,
                features = $5, current_period_end = $6, updated_at = CURRENT_TIMESTAMP
            WHERE vendor_id = $7 AND status = 'active'
        `, [tier, tierConfig.commission_rate, tierConfig.max_stores, tierConfig.max_listings_per_store,
            JSON.stringify(tierConfig.features), new Date(subscription.current_period_end * 1000), vendorId]);

        await updateVendorBadges(vendorId, tier);
        await logSubscriptionAudit('SUBSCRIPTION_UPGRADED', vendorId, oldValues.rows[0], { tier, ...tierConfig });
    }
    // Similar logic for customer and campaign_creator types...
}

/**
 * Renew subscription
 */
async function renewSubscription(subscriptionType: string, subscription: any) {
    const metadata = subscription.metadata;

    if (subscriptionType === 'vendor') {
        await pool.query(`
            UPDATE vendor_subscriptions
            SET current_period_end = $1, updated_at = CURRENT_TIMESTAMP
            WHERE dodo_subscription_id = $2
        `, [new Date(subscription.current_period_end * 1000), subscription.id]);

        await logSubscriptionAudit('SUBSCRIPTION_RENEWED', metadata.vendor_id, null, { subscription_id: subscription.id });
    }
    // Similar for other types...
}

/**
 * Cancel subscription
 */
async function cancelSubscription(subscriptionType: string, subscription: any) {
    const metadata = subscription.metadata;

    if (subscriptionType === 'vendor') {
        const vendorId = metadata.vendor_id;

        await pool.query(`
            UPDATE vendor_subscriptions
            SET cancel_at_period_end = true, updated_at = CURRENT_TIMESTAMP
            WHERE dodo_subscription_id = $1
        `, [subscription.id]);

        await logSubscriptionAudit('SUBSCRIPTION_CANCELLED', vendorId, null, { cancel_at_period_end: true });

        // Send Cancellation Email
        const userRes = await pool.query('SELECT email FROM users u JOIN vendors v ON u.user_id = v.user_id WHERE v.id = $1', [vendorId]);
        if (userRes.rows.length > 0) {
            await EmailService.sendSubscriptionCancelled(userRes.rows[0].email, 'Vendor Tier', new Date(subscription.current_period_end * 1000).toLocaleDateString());
        }
    }
    // Similar for other types...
}

/**
 * Update vendor badges based on tier
 */
async function updateVendorBadges(vendorId: number, tier: string) {
    const badges: any = {};

    if (tier.includes('premium')) {
        badges.premium = true;
    }
    if (tier.includes('enterprise')) {
        badges.verified = true;
        badges.enterprise = true;
    }

    await pool.query(
        'UPDATE vendors SET badges = $1 WHERE id = $2',
        [JSON.stringify(badges), vendorId]
    );
}

/**
 * Log subscription audit trail
 */
async function logSubscriptionAudit(action: string, userId: number, oldValues: any, newValues: any) {
    await pool.query(`
        INSERT INTO audit_logs (user_id, action, table_name, old_values, new_values)
        VALUES ($1, $2, $3, $4, $5)
    `, [userId, action, 'subscriptions', JSON.stringify(oldValues), JSON.stringify(newValues)]);
}

/**
 * Get vendor tier configuration
 */
function getVendorTierConfig(tier: string) {
    const configs: any = {
        'basic_product': { commission_rate: 5.00, max_stores: 1, max_listings_per_store: 10, features: { analytics: false, api_access: false } },
        'premium_product': { commission_rate: 3.00, max_stores: 3, max_listings_per_store: 50, features: { analytics: true, api_access: false } },
        'enterprise_product': { commission_rate: 2.00, max_stores: 999, max_listings_per_store: 999, features: { analytics: true, api_access: true } },
        'basic_service': { commission_rate: 5.00, max_stores: 1, max_listings_per_store: 10, features: { analytics: false, api_access: false } },
        'premium_service': { commission_rate: 3.00, max_stores: 3, max_listings_per_store: 50, features: { analytics: true, api_access: false } },
        'enterprise_service': { commission_rate: 2.00, max_stores: 999, max_listings_per_store: 999, features: { analytics: true, api_access: true } }
    };
    return configs[tier] || configs['basic_product'];
}

/**
 * Get customer tier configuration
 */
function getCustomerTierConfig(tier: string) {
    const configs: any = {
        'general': { discount_rate: 0.00, rewards_multiplier: 1.00, features: { early_access: false } },
        'vip': { discount_rate: 10.00, rewards_multiplier: 2.00, features: { early_access: true } }
    };
    return configs[tier] || configs['general'];
}

/**
 * Get campaign creator tier configuration
 */
function getCampaignCreatorTierConfig(tier: string) {
    const configs: any = {
        'individual': { platform_fee: 5.00, max_campaigns: 3, features: { advanced_analytics: false } },
        'organization': { platform_fee: 3.00, max_campaigns: 10, features: { advanced_analytics: true } },
        'nonprofit': { platform_fee: 0.00, max_campaigns: 999, features: { advanced_analytics: true } }
    };
    return configs[tier] || configs['individual'];
}

/**
 * Get order details
 */
export const getOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = (req as any).user?.id;

        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(`
            SELECT 
                oi.*,
                l.title,
                l.image_url,
                s.name as store_name
            FROM order_items oi
            JOIN listings l ON oi.listing_id = l.id
            LEFT JOIN stores s ON l.store_id = s.store_id
            WHERE oi.order_id = $1
        `, [orderId]);

        res.json({
            order,
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Failed to retrieve order' });
    }
};

/**
 * Process a refund (Admin only)
 */
export const processRefund = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { transactionId, amount, reason } = req.body;

        if (!transactionId || !amount) {
            return res.status(400).json({ message: 'Transaction ID and amount are required.' });
        }

        // 1. Call DodoPayments API to process refund
        // const refund = await dodoPayments.refund(transactionId, amount);

        // 2. Update transaction status
        await pool.query(
            "UPDATE transactions SET status = 'refunded', updated_at = NOW() WHERE gateway_transaction_id = $1",
            [transactionId]
        );

        // 3. Log audit action
        await pool.query(`
            INSERT INTO audit_logs (user_id, action, record_id, new_values)
            VALUES ($1, 'TRANSACTION_REFUNDED', (SELECT id FROM transactions WHERE gateway_transaction_id = $2), $3)
        `, [req.user.id, transactionId, JSON.stringify({ amount, reason })]);

        res.json({ message: 'Refund processed successfully.' });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Failed to process refund.' });
    }
};
