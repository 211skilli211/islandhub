import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

/**
 * GET /api/facebook/sync-status
 * Get sync status overview for admin dashboard
 */
router.get('/sync-status', async (req: Request, res: Response) => {
    try {
        const statusCountsResult = await pool.query(
            `SELECT status, COUNT(*) as count
            FROM facebook_sync_log
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY status`
        );

        const recentErrorsResult = await pool.query(
            `SELECT product_id, retailer_id, error_message, created_at
            FROM facebook_sync_log
            WHERE status = 'failed'
            ORDER BY created_at DESC
            LIMIT 10`
        );

        const totalSyncedResult = await pool.query(
            `SELECT COUNT(DISTINCT product_id) as count
            FROM facebook_sync_log
            WHERE status = 'synced'`
        );

        res.json({
            statusCounts: statusCountsResult.rows.reduce((acc: any, row: any) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {}),
            recentErrors: recentErrorsResult.rows,
            totalSynced: parseInt(totalSyncedResult.rows[0]?.count || '0'),
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/facebook/sync-log
 * Get paginated sync log
 */
router.get('/sync-log', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const status = req.query.status as string;
        const offset = (page - 1) * limit;

        let logsResult;
        if (status) {
            logsResult = await pool.query(
                `SELECT * FROM facebook_sync_log
                WHERE status = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3`,
                [status, limit, offset]
            );
        } else {
            logsResult = await pool.query(
                `SELECT * FROM facebook_sync_log
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2`,
                [limit, offset]
            );
        }

        const countResult = await pool.query('SELECT COUNT(*) as total FROM facebook_sync_log');

        res.json({
            logs: logsResult.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].total),
                pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/facebook/sync-product
 * Trigger sync for a single product
 * Requires: listingId in body
 */
router.post('/sync-product', async (req: Request, res: Response) => {
    try {
        const { listingId } = req.body;

        // Get listing data
        const listingResult = await pool.query(
            `SELECT l.*, s.name as store_name, s.slug as store_slug,
                   s.name as business_name, s.id as store_id
            FROM listings l
            JOIN stores s ON l.store_id = s.store_id
            WHERE l.id = $1`,
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        const listing = listingResult.rows[0];
        const store = {
            store_id: listing.store_id,
            name: listing.store_name || listing.business_name,
            slug: listing.store_slug,
        };

        // Check if config exists
        const config = await getFacebookConfig();
        if (!config) {
            return res.status(400).json({ error: 'Facebook catalog not configured' });
        }

        // Sync the product
        const { FacebookSyncEngine } = require('./syncEngine');
        const engine = new FacebookSyncEngine(config, process.env.BASE_URL || 'https://islandhub.app');
        const result = await engine.syncListing(listing, store);

        if (result.success) {
            // Update listing with Facebook product ID
            await pool.query(
                `UPDATE listings
                SET facebook_product_id = $1
                WHERE id = $2`,
                [result.facebookProductId, listingId]
            );
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/facebook/sync-all
 * Trigger full catalog sync
 * This should be called by a cron job, not manually for large catalogs
 */
router.post('/sync-all', async (req: Request, res: Response) => {
    try {
        const config = await getFacebookConfig();
        if (!config) {
            return res.status(400).json({ error: 'Facebook catalog not configured' });
        }

        // Get all active listings with store data
        const listingsResult = await pool.query(
            `SELECT l.*, s.name as store_name, s.slug as store_slug,
                   s.name as business_name, s.store_id
            FROM listings l
            JOIN stores s ON l.store_id = s.store_id
            WHERE l.status = 'active' AND s.status = 'active'`
        );

        const storesResult = await pool.query('SELECT * FROM stores WHERE status = \'active\'');

        const { FacebookSyncEngine } = require('./syncEngine');
        const engine = new FacebookSyncEngine(config, process.env.BASE_URL || 'https://islandhub.app');
        const result = await engine.fullSync(storesResult.rows, listingsResult.rows);

        res.json({
            message: 'Sync completed',
            ...result,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/facebook/vendor-connection/:storeId
 * Get Facebook connection status for a vendor
 */
router.get('/vendor-connection/:storeId', async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        const connectionResult = await pool.query(
            `SELECT id, store_id, facebook_page_id, facebook_catalog_id,
                   status, permissions, created_at, updated_at
            FROM facebook_vendor_connections
            WHERE store_id = $1
            AND status = 'active'
            LIMIT 1`,
            [storeId]
        );

        res.json({
            connected: connectionResult.rows.length > 0,
            connection: connectionResult.rows[0] || null,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/facebook/vendor-connection/:storeId
 * Disconnect vendor's Facebook account
 */
router.delete('/vendor-connection/:storeId', async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        await pool.query(
            `UPDATE facebook_vendor_connections
            SET status = 'revoked', updated_at = NOW()
            WHERE store_id = $1`,
            [storeId]
        );

        res.json({ success: true, message: 'Facebook connection revoked' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Helper: Get Facebook config from environment/database
 */
async function getFacebookConfig(): Promise<any> {
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const accessToken = process.env.FB_ACCESS_TOKEN;
    const catalogId = process.env.FB_CATALOG_ID;
    const businessId = process.env.FB_BUSINESS_ID;
    const pageId = process.env.FB_PAGE_ID;

    if (!appId || !appSecret || !accessToken || !catalogId) {
        return null;
    }

    return { appId, appSecret, accessToken, catalogId, businessId, pageId };
}

export default router;
