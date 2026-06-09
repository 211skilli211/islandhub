import { Router } from 'express';
import { sql } from '../db';

const router = Router();

/**
 * Global search across listings, stores, providers, and products.
 * Query params: q (search term), type (all|listing|vendor|provider), limit, offset
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 20, offset = 0 } = req.query;
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
      const storeResults = await sql`
        SELECT
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
            s.name ILIKE ${searchPattern}
            OR s.description ILIKE ${searchPattern}
            OR s.subtype ILIKE ${searchPattern}
            OR s.business_name ILIKE ${searchPattern}
          )
        LIMIT ${resultLimit} OFFSET ${resultOffset}
      `;
      results.push(...storeResults);
    }

    // Search service providers
    if (type === 'all' || type === 'service_provider' || type === 'provider' || type === 'vendor') {
      const providers = await sql`
        SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.name as vendor_name,
          '',
          sp.image_url as logo_url,
          sp.profession as subtype,
          sp.is_featured as is_featured,
          'service_provider' as type,
          'vendor' as result_type
        FROM service_providers sp
        WHERE (
          sp.name ILIKE ${searchPattern}
          OR sp.specialty ILIKE ${searchPattern}
          OR sp.description ILIKE ${searchPattern}
        )
        LIMIT ${resultLimit} OFFSET ${resultOffset}
      `;
      results.push(...providers);
    }

    // Search tour operators
    if (type === 'all' || type === 'tour_operator' || type === 'vendor') {
      const tours = await sql`
        SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.name as vendor_name,
          '',
          sp.image_url as logo_url,
          'tour_operator' as subtype,
          sp.is_featured as is_featured,
          'tour_operator' as type,
          'vendor' as result_type
        FROM service_providers sp
        WHERE sp.specialty ILIKE '%tour%'
          AND (
            sp.name ILIKE ${searchPattern}
            OR sp.specialty ILIKE ${searchPattern}
          )
        LIMIT ${resultLimit} OFFSET ${resultOffset}
      `;
      results.push(...tours);
    }

    // Search coop members (vendors)
    if (type === 'all' || type === 'coop_member' || type === 'vendor') {
      const coops = await sql`
        SELECT
          sp.id::text as id,
          sp.name as business_name,
          sp.name,
          sp.specialty as description,
          sp.slug,
          sp.name as vendor_name,
          '',
          sp.image_url as logo_url,
          'coop_member' as subtype,
          sp.is_featured as is_featured,
          'coop_member' as type,
          'vendor' as result_type
        FROM service_providers sp
        WHERE (
          sp.name ILIKE ${searchPattern}
          OR sp.specialty ILIKE ${searchPattern}
        )
        LIMIT ${resultLimit} OFFSET ${resultOffset}
      `;
      results.push(...coops);
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
router.get('/featured', async (req, res) => {
  try {
    const { type, subtype, limit = 10 } = req.query;
    const resultLimit = Math.min(parseInt(limit as string) || 10, 20);

    let query;
    if (type === 'rentals' || type === 'cars' || type === 'tours') {
      query = sql`
        SELECT
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
        LIMIT ${resultLimit}
      `;
    } else {
      query = sql`
        SELECT
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
        LIMIT ${resultLimit}
      `;
    }

    const results = await query;
    res.json(results);
  } catch (error) {
    console.error('Featured providers error:', error);
    res.status(500).json({ error: 'Failed to fetch featured providers' });
  }
});

/**
 * Get all listings/products for a provider/store.
 * Query params: slug, type (store|provider)
 */
router.get('/provider/:slug/listings', async (req, res) => {
  try {
    const { slug } = req.params;
    const { type = 'store' } = req.query;

    if (type === 'provider') {
      // Get service provider and their services
      const providers = await sql`
        SELECT
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
        WHERE sp.slug = ${slug}
        LIMIT 1
      `;

      if (providers.length === 0) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      const services = await sql`
        SELECT * FROM services
        WHERE provider_id = ${providers[0].id}
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 50
      `;

      res.json({ provider: providers[0], services });
    } else {
      // Get store and its listings
      const stores = await sql`
        SELECT
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
          s.website
        FROM stores s
        WHERE s.slug = ${slug} AND s.is_active = true
        LIMIT 1
      `;

      if (stores.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const listings = await sql`
        SELECT * FROM listings
        WHERE store_id = ${stores[0].id}
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const products = await sql`
        SELECT * FROM products
        WHERE store_id = ${stores[0].id}
        AND is_active = true
        ORDER BY created_at DESC
        LIMIT 50
      `;

      res.json({ store: stores[0], listings, products });
    }
  } catch (error) {
    console.error('Provider listings error:', error);
    res.status(500).json({ error: 'Failed to fetch provider listings' });
  }
});

export default router;
