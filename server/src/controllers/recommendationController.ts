/**
 * AI Recommendation Controller
 * Provides personalized product/service recommendations
 */

import { Request, Response } from 'express';
import { pool } from '../config/db';
import { generateEmbedding } from '../services/embeddingService';

// Get personalized recommendations for user
export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { type = 'all', limit = 10, offset = 0 } = req.query;

        // Get user's browsing/purchase history for personalization
        const userHistory = await pool.query(
            `SELECT listing_id FROM orders o
             JOIN order_items oi ON oi.order_id = o.order_id
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC
             LIMIT 20`,
            [user.id]
        );

        const categoryIds = userHistory.rows.map((r: any) => r.listing_id);

        // Build recommendation query based on user history
        let query = `
            SELECT l.*, s.business_name as vendor_name, s.logo_url as vendor_logo,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.id) as review_count
            FROM listings l
            JOIN stores s ON s.id = l.store_id
            LEFT JOIN reviews r ON r.listing_id = l.id
            WHERE l.status = 'active' AND l.is_approved = TRUE
        `;

        const params: any[] = [];
        let paramIndex = 1;

        // If user has history, personalize
        if (categoryIds.length > 0) {
            query += ` AND l.category_id IN (SELECT category_id FROM listings WHERE id = ANY($${paramIndex}::int[]))`;
            params.push(categoryIds);
            paramIndex++;
        }

        // Filter by type if specified
        if (type !== 'all' && type !== 'all') {
            query += ` AND l.service_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        query += `
            GROUP BY l.id, s.id
            ORDER BY ${categoryIds.length > 0 ? 'CASE WHEN l.category_id IN (SELECT category_id FROM listings WHERE id = ANY($1::int[])) THEN 0 ELSE 1 END, ' : ''}
                   l.view_count DESC, avg_rating DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(parseInt(limit as string), parseInt(offset as string));

        const result = await pool.query(query, params);

        res.json({ 
            recommendations: result.rows,
            personalization: categoryIds.length > 0 ? 'based_on_history' : 'popular'
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
};

// Get similar listings based on vector similarity
export const getSimilarListings = async (req: Request, res: Response) => {
    try {
        const { listing_id } = req.params;
        const { limit = 5 } = req.query;

        // Get the source listing
        const listing = await pool.query(
            `SELECT title, description, category_id, price FROM listings WHERE id = $1`,
            [listing_id]
        );

        if (listing.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        const l = listing.rows[0];

        // Generate embedding for the listing
        const embedding = await generateEmbedding(`${l.title} ${l.description}`);
        
        if (!embedding) {
            // Fallback to category-based similarity
            return getSimilarByCategory(req, res);
        }

        // Search using vector similarity
        const { toPgVector } = await import('../services/embeddingService');
        const vectorStr = toPgVector(embedding.embedding);

        const result = await pool.query(
            `SELECT l.*, s.business_name as vendor_name,
                   1 - (l.embedding <=> $1::vector) as similarity
            FROM listings l
            JOIN stores s ON s.id = l.store_id
            LEFT JOIN LATERAL (
                SELECT embedding FROM listings WHERE id = l.id
            ) ON TRUE
            WHERE l.id != $2 AND l.status = 'active' AND l.is_approved = TRUE
              AND l.embedding <=> $1::vector < 0.3
            ORDER BY l.embedding <=> $1::vector
            LIMIT $3`,
            [vectorStr, listing_id, parseInt(limit as string)]
        );

        res.json({ similar: result.rows });
    } catch (error) {
        console.error('Get similar listings error:', error);
        getSimilarByCategory(req, res);
    }
};

// Fallback: Similar by category
async function getSimilarByCategory(req: Request, res: Response) {
    const { listing_id } = req.params;
    const { limit = 5 } = req.query;

    const listing = await pool.query(
        `SELECT category_id FROM listings WHERE id = $1`,
        [listing_id]
    );

    if (listing.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    const result = await pool.query(
        `SELECT l.*, s.business_name as vendor_name
         FROM listings l
         JOIN stores s ON s.id = l.store_id
         WHERE l.category_id = $1 AND l.id != $2 AND l.status = 'active'
         ORDER BY l.view_count DESC
         LIMIT $3`,
        [listing.rows[0].category_id, listing_id, parseInt(limit as string)]
    );

    res.json({ similar: result.rows, method: 'category' });
}

// Trending listings
export const getTrending = async (req: Request, res: Response) => {
    try {
        const { limit = 10, timeframe = '7d' } = req.query;

        let days = 7;
        if (timeframe === '30d') days = 30;
        if (timeframe === '24h') days = 1;

        const result = await pool.query(
            `SELECT l.*, s.business_name as vendor_name,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT oi.id) as recent_orders
            FROM listings l
            JOIN stores s ON s.id = l.store_id
            LEFT JOIN order_items oi ON oi.listing_id = l.id
            LEFT JOIN orders o ON o.order_id = oi.order_id AND o.created_at > NOW() - INTERVAL '${days} days'
            LEFT JOIN reviews r ON r.listing_id = l.id
            WHERE l.status = 'active' AND l.is_approved = TRUE
            GROUP BY l.id, s.id
            ORDER BY (l.view_count + COALESCE(COUNT(DISTINCT oi.id), 0) * 10) DESC
            LIMIT $1`,
            [parseInt(limit as string)]
        );

        res.json({ trending: result.rows });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ error: 'Failed to get trending' });
    }
};

// Personalized homepage sections
export const getHomepageSections = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Get categories user has interacted with
        const categories = await pool.query(
            `SELECT DISTINCT l.category_id, COUNT(*) as interaction_count
             FROM listings l
             JOIN order_items oi ON oi.listing_id = l.id
             JOIN orders o ON o.order_id = oi.order_id AND o.user_id = $1
             GROUP BY l.category_id
             ORDER BY interaction_count DESC
             LIMIT 3`,
            [user.id]
        );

        const sections = [];

        // Personalized for you
        if (categories.rows.length > 0) {
            const personalized = await pool.query(
                `SELECT l.*, s.business_name as vendor_name
                 FROM listings l
                 JOIN stores s ON s.id = l.store_id
                 WHERE l.category_id = ANY($1) AND l.status = 'active'
                 ORDER BY l.view_count DESC
                 LIMIT 6`,
                [categories.rows.map((c: any) => c.category_id)]
            );
            sections.push({ title: 'Recommended for You', type: 'personalized', items: personalized.rows });
        }

        // Trending
        const trending = await pool.query(
            `SELECT l.*, s.business_name as vendor_name
             FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.status = 'active' AND l.is_approved = TRUE
             ORDER BY l.view_count DESC
             LIMIT 6`
        );
        sections.push({ title: 'Trending Now', type: 'trending', items: trending.rows });

        // Recently viewed (if we tracked it)
        const recent = await pool.query(
            `SELECT l.*, s.business_name as vendor_name
             FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.status = 'active' AND l.is_approved = TRUE
             ORDER BY l.created_at DESC
             LIMIT 6`
        );
        sections.push({ title: 'New Arrivals', type: 'new', items: recent.rows });

        // Deals/discounts
        const deals = await pool.query(
            `SELECT l.*, s.business_name as vendor_name
             FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.status = 'active' AND l.is_approved = TRUE AND l.sale_price IS NOT NULL
             ORDER BY l.sale_price ASC
             LIMIT 6`
        );
        sections.push({ title: 'Hot Deals', type: 'deals', items: deals.rows });

        res.json({ sections });
    } catch (error) {
        console.error('Get homepage sections error:', error);
        res.status(500).json({ error: 'Failed to get homepage sections' });
    }
};

export default {
    getRecommendations,
    getSimilarListings,
    getTrending,
    getHomepageSections
};