import { pool } from '../config/db';

/**
 * Subscription Scheduler
 * Runs daily to process cancellations and downgrades.
 * Handles Neon serverless connection timeouts with retry logic.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T | void> {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            console.error(`[Scheduler] Attempt ${i + 1} failed:`, lastError.message);

            // Check if it's a connection-related error
            if (lastError.message.includes('Connection') ||
                lastError.message.includes('timeout') ||
                lastError.message.includes('terminated')) {
                if (i < retries - 1) {
                    console.log(`[Scheduler] Retrying in ${RETRY_DELAY}ms...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    continue;
                }
            }
            // Don't retry for "relation does not exist" errors - table is missing
            if (lastError.message.includes('relation') && lastError.message.includes('does not exist')) {
                console.log('[Scheduler] Tables missing, skipping subscription check.');
                return;
            }
            throw error;
        }
    }
    throw lastError;
}

export const runSubscriptionScheduler = async () => {
    console.log('[Scheduler] Running subscription check...');

    await withRetry(async () => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Process Vendor Subscription Downgrades
            // Tiers set to 'cancelled' or move to 'basic' after period end if cancel_at_period_end is true
            const vendorResult = await client.query(`
                UPDATE vendor_subscriptions 
                SET status = 'cancelled', 
                    updated_at = CURRENT_TIMESTAMP
                WHERE status = 'active' 
                AND cancel_at_period_end = TRUE 
                AND current_period_end <= CURRENT_TIMESTAMP
                RETURNING vendor_id, tier
            `);

            if (vendorResult.rows.length > 0) {
                console.log(`[Scheduler] Downgraded ${vendorResult.rows.length} vendor subscriptions.`);
                for (const row of vendorResult.rows) {
                    // Log audit action
                    await client.query(`
                        INSERT INTO audit_logs (user_id, action, old_values, new_values)
                        SELECT user_id, 'SUBSCRIPTION_EXPIRED', 
                               jsonb_build_object('tier', tier), 
                               jsonb_build_object('status', 'cancelled')
                        FROM vendors WHERE id = $1
                    `, [row.vendor_id]);
                }
            }

            // 2. Process Customer VIP Downgrades
            const customerResult = await client.query(`
                UPDATE customer_subscriptions 
                SET status = 'inactive', 
                    updated_at = CURRENT_TIMESTAMP
                WHERE status = 'active' 
                AND cancel_at_period_end = TRUE 
                AND current_period_end <= CURRENT_TIMESTAMP
                RETURNING user_id
            `);

            if (customerResult.rows.length > 0) {
                console.log(`[Scheduler] Expired ${customerResult.rows.length} customer VIP subscriptions.`);
            }

            // 3. Process Campaign Creator Downgrades
            const creatorResult = await client.query(`
                UPDATE campaign_creator_subscriptions 
                SET status = 'inactive', 
                    updated_at = CURRENT_TIMESTAMP
                WHERE status = 'active' 
                AND cancel_at_period_end = TRUE 
                AND current_period_end <= CURRENT_TIMESTAMP
                RETURNING user_id
            `);

            if (creatorResult.rows.length > 0) {
                console.log(`[Scheduler] Expired ${creatorResult.rows.length} creator subscriptions.`);
            }

            await client.query('COMMIT');
            console.log('[Scheduler] Subscription check completed successfully.');
        } catch (error) {
            await client.query('ROLLBACK').catch(() => { });
            console.error('[Scheduler] Error processing subscriptions:', error);
            throw error;
        } finally {
            client.release();
        }
    });
};

/**
 * Initialize the scheduler to run at a specific interval.
 * In production, this might be a cron job.
 * Here we run it every 24 hours (or much more frequently for testing).
 */
export const initScheduler = () => {
    // Run immediately on start
    runSubscriptionScheduler();

    // Run every 12 hours (43,200,000 ms)
    setInterval(() => {
        runSubscriptionScheduler();
    }, 12 * 60 * 60 * 1000);
};
