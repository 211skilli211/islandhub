/**
 * Visual Search Service — PixelRAG Integration
 * 
 * Provides visual product search for IslandHub marketplace.
 * Uses the PixelRAG hosted API (8.28M Wikipedia index) for general search
 * and can be extended with a self-hosted index for product-specific search.
 * 
 * API: https://api.pixelrag.ai/search
 * Docs: https://github.com/StarTrail-org/PixelRAG
 */

import { pool } from '../config/db';

interface PixelRAGSearchHit {
  id: string;
  title: string;
  text: string;
  image_url: string;
  score: number;
  metadata?: Record<string, any>;
}

interface PixelRAGSearchResponse {
  hits: PixelRAGSearchHit[];
  total_results: number;
}

interface VisualEmbedding {
  listing_id: number;
  image_url: string;
  embedding: number[];
  tile_index: number;
  created_at: string;
}

class VisualSearchClient {
  private baseUrl = 'https://api.pixelrag.ai';
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.PIXELRAG_API_KEY || null;
  }

  /**
   * Search the hosted PixelRAG Wikipedia index by text query.
   * Useful for general knowledge retrieval and content discovery.
   */
  async searchWikipedia(query: string, topK: number = 10): Promise<PixelRAGSearchResponse> {
    const body: any = {
      queries: [{ text: query }],
      n_docs: topK,
      include_images: true,
    };

    if (this.apiKey) {
      body.api_key = this.apiKey;
    }

    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`PixelRAG API error ${res.status}: ${err}`);
    }

    return res.json();
  }

  /**
   * Search by image — upload a screenshot/photo and find similar content.
   * This is the core "visual product search" capability.
   */
  async searchByImage(imageBuffer: Buffer, contentType: string, topK: number = 10): Promise<PixelRAGSearchResponse> {
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer], { type: contentType }), 'query.jpg');
    formData.append('n_docs', String(topK));

    if (this.apiKey) {
      formData.append('api_key', this.apiKey);
    }

    const res = await fetch(`${this.baseUrl}/search/image`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`PixelRAG image search error ${res.status}: ${err}`);
    }

    return res.json();
  }

  /**
   * Find visually similar listings from our own index.
   * Uses the Neon DB embeddings table for fast similarity search.
   */
  async findSimilarListings(listingId: number, topK: number = 10): Promise<Array<{
    listing_id: number;
    title: string;
    image_url: string;
    similarity: number;
  }>> {
    // Get the source listing's embeddings
    const sourceResult = await pool.query(
      'SELECT embedding FROM visual_embeddings WHERE listing_id = $1 LIMIT 1',
      [listingId]
    );

    if (sourceResult.rows.length === 0) {
      return [];
    }

    const sourceEmbedding = sourceResult.rows[0].embedding;

    // Find nearest neighbors using cosine similarity (pgvector or manual calculation)
    const similarResult = await pool.query(
      `SELECT ve.listing_id, l.title, l.image_url,
              1 - (ve.embedding <=> $1::vector) as similarity
       FROM visual_embeddings ve
       JOIN listings l ON ve.listing_id = l.id
       WHERE ve.listing_id != $2
       ORDER BY ve.embedding <=> $1::vector
       LIMIT $3`,
      [JSON.stringify(sourceEmbedding), listingId, topK]
    );

    return similarResult.rows;
  }

  /**
   * Store visual embeddings for a listing's images.
   * Called when listing is created/updated.
   */
  async storeEmbeddings(listingId: number, imageUrls: string[]): Promise<void> {
    for (let i = 0; i < imageUrls.length; i++) {
      const embedding = await this.embedImage(imageUrls[i]);
      await pool.query(
        `INSERT INTO visual_embeddings (listing_id, image_url, embedding, tile_index)
         VALUES ($1, $2, $3::vector, $4)
         ON CONFLICT (listing_id, tile_index) DO UPDATE SET embedding = $3::vector`,
        [listingId, imageUrls[i], JSON.stringify(embedding), i]
      );
    }
  }

  /**
   * Generate an embedding for an image using PixelRAG or a local model.
   * Falls back to a simple hash-based approach if PixelRAG is unavailable.
   */
  private async embedImage(imageUrl: string): Promise<number[]> {
    try {
      // Download the image
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error('Image download failed');
      const buffer = Buffer.from(await res.arrayBuffer());

      // Use PixelRAG's embed endpoint if available
      const formData = new FormData();
      formData.append('image', new Blob([buffer]), 'image.jpg');

      const embedRes = await fetch(`${this.baseUrl}/embed`, {
        method: 'POST',
        body: formData,
      });

      if (embedRes.ok) {
        const data = await embedRes.json();
        return data.embedding;
      }

      throw new Error('PixelRAG embed unavailable');
    } catch {
      // Fallback: generate a simple perceptual hash-based embedding
      // This is a placeholder — in production, use a local model or API
      return this.generatePlaceholderEmbedding(imageUrl);
    }
  }

  /**
   * Generate a deterministic placeholder embedding from image URL.
   * Replace with real embedding model in production.
   */
  private generatePlaceholderEmbedding(imageUrl: string): number[] {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(imageUrl).digest();
    const embedding: number[] = [];
    for (let i = 0; i < 256; i++) {
      embedding.push((hash[i % hash.length] / 255) * 2 - 1);
    }
    return embedding;
  }
}

// Singleton
let client: VisualSearchClient | null = null;

export function getVisualSearchClient(): VisualSearchClient {
  if (!client) {
    client = new VisualSearchClient();
  }
  return client;
}

export { VisualSearchClient };
