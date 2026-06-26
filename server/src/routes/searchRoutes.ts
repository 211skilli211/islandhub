import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

/**
 * Global search across listings, stores, providers, and products.
 * Query params: q (search term), type (all|listing|vendor|provider), limit, offset
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, type = 'all', limit = '20', offset = '0' } = req.query;
    const searchTerm = (q as string || '').trim();
    const searchPattern = `%${searchTerm}%`;
    const resultLimit = Math.min(parseInt(limit as string) || 20, 100);
    const resultOffset = parseInt(offset as string) || 0;

    if (!searchTerm) {
      return res.json([]);
    }

    const results: any[] = [];

    // Search listings/stores
    if (type === 'all' || type === 'listing' || type === 'stores') {
      const storeResults = await pool.query(
        `SELECT
          s.id::text as id,
          s.name as business_name,
          s.name,
          s.description,
          s.slug,
          s.business_name as vendor_name,
          s.address_line1 as location,
          s.banner_url as logo_url,
          s.subtype,
          s.is_featured,
          s.type,
          s.created_at,
          'listing' as result_type
        FROM stores s
        WHERE s.is_active = true
          AND (
            s.name ILIKE $1
            OR s.description ILIKE $1
            OR s.subtype ILIKE $1
            OR s.business_name ILIKE $1
          )
        LIMIT $2 OFFSET $3`,
        [searchPattern, resultLimit, resultOffset]
      );
      results.push(...storeResults.rows);
    }

    // Search service providers
    if (type === 'all' || type === 'service_provider' || type === 'provider' || type === 'vendor') {
      const providers = await pool.query(
        `SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.name as vendor_name,
          '' as location,
          sp.image_url as logo_url,
          sp.profession as subtype,
          sp.is_featured,
          'service_provider' as type,
          'vendor' as result_type
        FROM service_providers sp
          WHERE sp.name ILIKE $1
          OR sp.specialty ILIKE $1
          OR sp.description ILIKE $1
        LIMIT $2 OFFSET $3`,
        [searchPattern, resultLimit, resultOffset]
      );
      results.push(...providers.rows);
    }

    // Search tour operators
    if (type === 'all' || type === 'tour_operator' || type === 'vendor') {
      const tours = await pool.query(
        `SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.name as vendor_name,
          '' as location,
          sp.image_url as logo_url,
          'tour_operator' as subtype,
          sp.is_featured,
          'tour_operator' as type,
          'vendor' as result_type
        FROM service_providers sp
        WHERE sp.specialty ILIKE '%tour%'
          AND (
            sp.name ILIKE $1
            OR sp.specialty ILIKE $1
          )
        LIMIT $2 OFFSET $3`,
        [searchPattern, resultLimit, resultOffset]
      );
      results.push(...tours.rows);
    }

    // Search coop members (vendors)
    if (type === 'all' || type === 'coop_member' || type === 'vendor') {
      const coops = await pool.query(
        `SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.name as vendor_name,
          '' as location,
          sp.image_url as logo_url,
          'coop_member' as subtype,
          sp.is_featured,
          'coop_member' as type,
          'vendor' as result_type
        FROM service_providers sp
          WHERE sp.name ILIKE $1
          OR sp.specialty ILIKE $1
        LIMIT $2 OFFSET $3`,
        [searchPattern, resultLimit, resultOffset]
      );
      results.push(...coops.rows);
    }

    // Deduplicate by id
    const seen = new Set();
    const deduped = results.filter(r => {
      const key = `${r.result_type}-${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json(deduped);
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Get featured providers for a hub type (for marquee display).
 * Query params: type (hub type), subtype (category), limit
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const { type, subtype, limit = '10' } = req.query;
    const resultLimit = Math.min(parseInt(limit as string) || 10, 20);

    let query;
    if (type === 'rentals' || type === 'cars' || type === 'tours') {
      query = await pool.query(
        `SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.image_url as logo_url,
          sp.is_featured,
          COALESCE(sp.rating, 4.5) as rating,
          COALESCE(sp.review_count, 0) as review_count
        FROM service_providers sp
        WHERE sp.is_featured = true
        ORDER BY sp.rating DESC NULLS LAST
        LIMIT $1`,
        [resultLimit]
      );
    } else {
      query = await pool.query(
        `SELECT
          s.id::text as id,
          s.name as business_name,
          s.name,
          s.description,
          s.slug,
          s.banner_url as logo_url,
          s.is_featured,
          s.subtype,
          s.type
        FROM stores s
        WHERE s.is_active = true AND s.is_featured = true
        ORDER BY s.created_at DESC
        LIMIT $1`,
        [resultLimit]
      );
    }

    res.json(query.rows);
  } catch (error) {
    console.error('Featured providers error:', error);
    res.status(500).json({ error: 'Failed to fetch featured providers' });
  }
});

/**
 * Get all listings/products for a provider/store.
 * Query params: slug, type (store|provider)
 */
router.get('/provider/:slug/listings', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { type = 'store' } = req.query;

    if (type === 'provider') {
      const providers = await pool.query(
        `SELECT
          sp.id::text as id,
          sp.name,
          sp.slug,
          sp.specialty,
          sp.description,
          sp.image_url as logo_url,
          sp.rating,
          sp.review_count,
          sp.is_featured,
          sp.credentials,
          sp.years_exp,
          sp.hourly_rate,
          sp.is_verified
        FROM service_providers sp
        WHERE sp.slug = $1
        LIMIT 1`,
        [slug]
      );

      if (providers.rows.length === 0) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      const services = await pool.query(
        `SELECT * FROM services
        WHERE provider_id = $1
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 50`,
        [providers.rows[0].id]
      );

      res.json({ provider: providers.rows[0], services: services.rows });
    } else {
      const stores = await pool.query(
        `SELECT
          s.id::text as id,
          s.name,
          s.slug,
          s.business_name,
          s.description,
          s.banner_url as logo_url,
          s.address_line1 as location,
          s.subtype,
          s.is_featured,
          s.phone,
          s.email,
          s.website,
          v.lat,
          v.lng
        FROM stores s
        LEFT JOIN vendors v ON s.vendor_id = v.user_id
        WHERE s.slug = $1 AND s.is_active = true
        LIMIT 1`,
        [slug]
      );

      if (stores.rows.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const listings = await pool.query(
        `SELECT * FROM listings
        WHERE store_id = $1
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 50`,
        [stores.rows[0].id]
      );

      const products = await pool.query(
        `SELECT * FROM products
        WHERE store_id = $1
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 50`,
        [stores.rows[0].id]
      );

      res.json({ store: stores.rows[0], listings: listings.rows, products: products.rows });
    }
  } catch (error) {
    console.error('Provider listings error:', error);
    res.status(500).json({ error: 'Failed to fetch provider listings' });
  }
});

export default router;
