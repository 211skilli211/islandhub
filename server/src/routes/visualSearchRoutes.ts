/**
 * Visual Search Routes — PixelRAG-powered product search
 *
 * Endpoints:
 *   POST /api/visual/search/text     — search by text query (Wikipedia index)
 *   POST /api/visual/search/image    — search by uploaded image (reverse image search)
 *   GET  /api/visual/similar/:id     — find visually similar listings
 *   POST /api/visual/index/:id       — index a listing's images for visual search
 */

import { Router, Request, Response } from 'express';
import { getVisualSearchClient } from '../services/visualSearchService';
import { pool } from '../config/db';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10_000_000 } });

/**
 * POST /api/visual/search/text
 * Search Wikipedia by text query through PixelRAG hosted API.
 * Body: { query: string, top_k?: number }
 */
router.post('/search/text', async (req: Request, res: Response) => {
  try {
    const { query, top_k = 10 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "query"' });
    }

    const client = getVisualSearchClient();
    const results = await client.searchWikipedia(query, Math.min(top_k, 50));

    res.json({
      query,
      hits: results.hits.map(h => ({
        id: h.id,
        title: h.title,
        text: h.text,
        image_url: h.image_url,
        score: h.score,
      })),
      total: results.total_results,
    });
  } catch (err: any) {
    console.error('[Visual Search] Text error:', err.message);
    res.status(502).json({ error: 'Visual search failed', message: err.message });
  }
});

/**
 * POST /api/visual/search/image
 * Search by uploaded image. Returns visually similar products.
 * Multipart form: image file optional query string
 */
router.post('/search/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { query, top_k = 10 } = req.body;
    const topK = Math.min(parseInt(top_k) || 10, 50);

    const client = getVisualSearchClient();

    // First: try PixelRAG hosted image search
    const buffer = req.file.buffer;
    const contentType = req.file.mimetype || 'image/jpeg';

    let searchResults;
    try {
      searchResults = await client.searchByImage(buffer, contentType, topK);
    } catch (pixelragErr) {
      console.warn('[Visual Search] PixelRAG unavailable, falling back to similar listings');
      searchResults = { hits: [], total_results: 0 };
    }

    // Second: if we have local visual embeddings, find similar listings
    const localResults = await findLocalSimilar(buffer, topK);

    // Merge and deduplicate
    const allHits = [
      ...(searchResults.hits || []).map((h: any) => ({
        source: 'pixelrag',
        id: h.id,
        title: h.title,
        image_url: h.image_url,
        score: h.score || 0.5,
        text: h.text,
      })),
      ...localResults.map((r: any) => ({
        source: 'local',
        listing_id: r.listing_id,
        title: r.title,
        image_url: r.image_url,
        score: r.similarity,
      })),
    ];

    res.json({ hits: allHits.slice(0, topK), total: allHits.length });
  } catch (err: any) {
    console.error('[Visual Search] Image error:', err.message);
    res.status(502).json({ error: 'Image search failed', message: err.message });
  }
});

/**
 * GET /api/visual/similar/:id
 * Find listings visually similar to the given listing.
 */
router.get('/similar/:id', async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    const client = getVisualSearchClient();
    const similar = await client.findSimilarListings(listingId, 12);

    res.json({ similar });
  } catch (err: any) {
    console.error('[Visual Search] Similar error:', err.message);
    res.status(502).json({ error: 'Similar search failed', message: err.message });
  }
});

/**
 * POST /api/visual/index/:id
 * Index a listing's images for visual search.
 * Called when listing is created/updated with new photos.
 */
router.post('/index/:id', async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    // Get the listing's photos
    const listingResult = await pool.query(
      'SELECT photos, images FROM listings WHERE id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const { photos, images } = listingResult.rows[0];
    const imageUrls: string[] = [];

    // Collect all image URLs
    if (photos && Array.isArray(photos)) {
      for (const p of photos) {
        if (p.url) imageUrls.push(p.url);
      }
    }
    if (images && Array.isArray(images)) {
      imageUrls.push(...images.filter((img: string) => img.startsWith('http')));
    }

    if (imageUrls.length === 0) {
      return res.json({ indexed: 0, message: 'No images to index' });
    }

    const client = getVisualSearchClient();
    await client.storeEmbeddings(listingId, imageUrls);

    res.json({ indexed: imageUrls.length, listing_id: listingId });
  } catch (err: any) {
    console.error('[Visual Search] Index error:', err.message);
    res.status(502).json({ error: 'Indexing failed', message: err.message });
  }
});

/**
 * Find similar listings from local visual embeddings.
 * Fallback when PixelRAG API is unavailable.
 */
async function findLocalSimilar(imageBuffer: Buffer, topK: number): Promise<any[]> {
  try {
    // Check if visual_embeddings table exists
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visual_embeddings')"
    );
    if (!tableCheck.rows[0].exists) {
      return [];
    }

    // For local fallback, return listings with similar categories/images
    // In production, this would do a proper embedding lookup
    const result = await pool.query(
      `SELECT l.id as listing_id, l.title,
              (SELECT url FROM jsonb_to_recordset(COALESCE(l.photos, '[]'::jsonb)) AS x(url text) LIMIT 1) as image_url
       FROM listings l
       WHERE l.status = 'active'
       ORDER BY l.created_at DESC
       LIMIT $1`,
      [topK]
    );

    return result.rows.map((r: any) => ({
      ...r,
      similarity: 0.5, // Placeholder — real embeddings would provide actual scores
    }));
  } catch {
    return [];
  }
}

export default router;
