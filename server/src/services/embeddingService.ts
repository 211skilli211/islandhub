/**
 * Embedding Service - Generate and query vector embeddings
 * Uses OpenAI ada-002 or similar models for semantic search
 */

import { pool } from '../config/db';

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;

interface EmbeddingResult {
    embedding: number[];
    tokens: number;
}

/**
 * Get API credentials for embedding generation
 */
async function getEmbeddingCredentials(): Promise<{ apiKey: string; baseUrl: string }> {
    try {
        const result = await pool.query(
            `SELECT provider_name, api_key_encrypted, api_base_url 
             FROM agent_provider_credentials 
             WHERE is_active = TRUE 
             ORDER BY provider_name 
             LIMIT 1`
        );

        if (result.rows.length > 0 && result.rows[0].api_key_encrypted) {
            return {
                apiKey: result.rows[0].api_key_encrypted,
                baseUrl: result.rows[0].api_base_url || 'https://openrouter.ai/api/v1',
            };
        }
    } catch (err) {
        console.warn('Could not fetch provider credentials from DB:', err);
    }

    return {
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseUrl: 'https://openrouter.ai/api/v1',
    };
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult | null> {
    if (!text || text.trim().length === 0) {
        return null;
    }

    const creds = await getEmbeddingCredentials();
    if (!creds.apiKey) {
        console.warn('No API key available for embeddings');
        return null;
    }

    try {
        const response = await fetch(`${creds.baseUrl}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${creds.apiKey}`,
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'IslandHub Agent System',
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: text.substring(0, 8000), // Max tokens handling
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Embedding API error (${response.status}):`, errorText);
            return null;
        }

        const data = await response.json();
        const embedding = data.data?.[0]?.embedding;
        
        if (!embedding) {
            console.error('No embedding returned from API');
            return null;
        }

        return {
            embedding,
            tokens: data.usage?.prompt_tokens || 0,
        };
    } catch (error) {
        console.error('Failed to generate embedding:', error);
        return null;
    }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    const creds = await getEmbeddingCredentials();
    if (!creds.apiKey) {
        return texts.map(() => null);
    }

    try {
        const response = await fetch(`${creds.baseUrl}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${creds.apiKey}`,
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'IslandHub Agent System',
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: texts.map(t => t.substring(0, 8000)),
            }),
        });

        if (!response.ok) {
            console.error(`Embedding batch API error (${response.status})`);
            return texts.map(() => null);
        }

        const data = await response.json();
        return data.data?.map((item: any) => item.embedding) || texts.map(() => null);
    } catch (error) {
        console.error('Failed to generate batch embeddings:', error);
        return texts.map(() => null);
    }
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Convert embedding array to pgvector format string
 */
export function toPgVector(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
}

/**
 * Parse pgvector format string to array
 */
export function fromPgVector(str: string): number[] {
    // Remove brackets and split
    const clean = str.replace(/[\[\]]/g, '');
    return clean.split(',').map(Number);
}

/**
 * Create a search query for pgvector
 */
export function createVectorSearchQuery(
    embedding: number[],
    threshold: number = 0.7,
    limit: number = 5
): { query: string; params: any[] } {
    const vectorStr = toPgVector(embedding);
    
    return {
        query: `
            SELECT id, user_id, memory_type, content, metadata, created_at,
                   1 - (embedding <=> $1::vector) as similarity
            FROM agent_memories
            WHERE embedding <=> $1::vector < $2
            ORDER BY embedding <=> $1::vector
            LIMIT $3
        `,
        params: [vectorStr, 1 - threshold, limit],
    };
}

export default {
    generateEmbedding,
    generateEmbeddings,
    cosineSimilarity,
    toPgVector,
    fromPgVector,
    createVectorSearchQuery,
};