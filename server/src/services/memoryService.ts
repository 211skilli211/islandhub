/**
 * Memory Service - L1-L4 Memory Orchestration
 * 
 * L1: Working Memory (In-memory, current session)
 * L2: Short-term (SQLite cache, 7-30 days)
 * L3: Long-term (Neon PostgreSQL + pgvector)
 * L4: Episodic (Key events, decisions, patterns)
 */

import { pool } from '../config/db';
import { generateEmbedding, toPgVector, createVectorSearchQuery } from './embeddingService';

interface MemoryEntry {
    id?: number;
    user_id: number;
    memory_type: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

interface EpisodicEvent {
    id?: number;
    event_type: string;
    entity_type: string;
    entity_id: number;
    summary: string;
    embedding?: number[];
    outcome: string;
    details?: Record<string, any>;
    created_at?: Date;
}

interface RecallOptions {
    query: string;
    user_id?: number;
    memory_types?: string[];
    threshold?: number;
    limit?: number;
}

// L1: In-memory working memory (session-based)
const workingMemory = new Map<string, MemoryEntry[]>();

/**
 * L1: Working Memory - Current session context
 */
export class WorkingMemory {
    private static sessionStore = new Map<string, {
        data: Map<string, any>;
        expires: number;
    }>();

    static set(sessionId: string, key: string, value: any, ttlMs: number = 3600000): void {
        const session = this.getOrCreateSession(sessionId);
        session.data.set(key, value);
        session.expires = Date.now() + ttlMs;
    }

    static get(sessionId: string, key: string): any | null {
        const session = this.sessionStore.get(sessionId);
        if (!session) return null;
        if (Date.now() > session.expires) {
            this.sessionStore.delete(sessionId);
            return null;
        }
        return session.data.get(key) ?? null;
    }

    static getAll(sessionId: string): Record<string, any> {
        const session = this.sessionStore.get(sessionId);
        if (!session || Date.now() > session.expires) return {};
        return Object.fromEntries(session.data);
    }

    static clear(sessionId: string): void {
        this.sessionStore.delete(sessionId);
    }

    static clearExpired(): void {
        const now = Date.now();
        for (const [id, session] of this.sessionStore) {
            if (now > session.expires) this.sessionStore.delete(id);
        }
    }

    private static getOrCreateSession(sessionId: string) {
        let session = this.sessionStore.get(sessionId);
        if (!session) {
            session = { data: new Map(), expires: Date.now() + 3600000 };
            this.sessionStore.set(sessionId, session);
        }
        return session;
    }
}

/**
 * L2: Short-term Memory - Recent interactions cache
 */
export class ShortTermMemory {
    static async set(key: string, value: any, ttlDays: number = 7): Promise<void> {
        const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
        
        await pool.query(
            `INSERT INTO short_term_cache (key, value, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (key) DO UPDATE SET value = $2, expires_at = $3`,
            [key, JSON.stringify(value), expiresAt]
        );
    }

    static async get(key: string): Promise<any | null> {
        const result = await pool.query(
            `SELECT value FROM short_term_cache 
             WHERE key = $1 AND expires_at > NOW()`,
            [key]
        );
        
        if (result.rows.length === 0) return null;
        return JSON.parse(result.rows[0].value);
    }

    static async getPattern(query: string, limit: number = 5): Promise<any[]> {
        const embedding = await generateEmbedding(query);
        if (!embedding) return [];

        const vectorStr = toPgVector(embedding.embedding);
        
        const result = await pool.query(
            `SELECT key, value, 1 - (embedding <=> $1::vector) as similarity
             FROM short_term_cache
             WHERE embedding <=> $1::vector < 0.3 AND expires_at > NOW()
             ORDER BY embedding <=> $1::vector
             LIMIT $2`,
            [vectorStr, limit]
        );

        return result.rows.map(r => ({
            key: r.key,
            value: JSON.parse(r.value),
            similarity: r.similarity
        }));
    }

    static async cleanup(): Promise<number> {
        const result = await pool.query(
            `DELETE FROM short_term_cache WHERE expires_at <= NOW()`
        );
        return result.rowCount || 0;
    }
}

/**
 * L3: Long-term Memory - Persistent storage with pgvector
 */
export class LongTermMemory {
    static async store(memory: Omit<MemoryEntry, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
        let embedding = memory.embedding;
        
        if (!embedding) {
            const embResult = await generateEmbedding(memory.content);
            embedding = embResult?.embedding || [];
        }

        const vectorStr = toPgVector(embedding);
        
        const result = await pool.query(
            `INSERT INTO agent_memories (user_id, memory_type, content, embedding, metadata)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [memory.user_id, memory.memory_type, memory.content, vectorStr, JSON.stringify(memory.metadata || {})]
        );

        return result.rows[0].id;
    }

    static async recall(options: RecallOptions): Promise<any[]> {
        const { query, user_id, memory_types, threshold = 0.7, limit = 5 } = options;
        
        const embedding = await generateEmbedding(query);
        if (!embedding) return [];

        const vectorStr = toPgVector(embedding.embedding);
        
        let typeFilter = '';
        const params: any[] = [vectorStr, 1 - threshold, limit];
        
        if (memory_types && memory_types.length > 0) {
            typeFilter = `AND memory_type = ANY($${params.length + 1})`;
            params.push(memory_types);
        }
        
        if (user_id) {
            typeFilter += ` AND user_id = $${params.length + 1}`;
            params.push(user_id);
        }

        const result = await pool.query(
            `SELECT id, user_id, memory_type, content, metadata, created_at,
                   1 - (embedding <=> $1::vector) as similarity
            FROM agent_memories
            WHERE embedding <=> $1::vector < $2 ${typeFilter}
            ORDER BY embedding <=> $1::vector
            LIMIT $3`,
            params
        );

        return result.rows.map(r => ({
            id: r.id,
            user_id: r.user_id,
            memory_type: r.memory_type,
            content: r.content,
            metadata: r.metadata,
            created_at: r.created_at,
            similarity: r.similarity
        }));
    }

    static async getUserMemories(userId: number, memoryType?: string, limit: number = 20): Promise<any[]> {
        let query = `
            SELECT id, memory_type, content, metadata, created_at
            FROM agent_memories
            WHERE user_id = $1
        `;
        
        const params: any[] = [userId];
        
        if (memoryType) {
            query += ` AND memory_type = $2`;
            params.push(memoryType);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async update(id: number, content: string, metadata?: Record<string, any>): Promise<void> {
        const embResult = await generateEmbedding(content);
        const vectorStr = toPgVector(embResult?.embedding || []);
        
        await pool.query(
            `UPDATE agent_memories 
             SET content = $1, embedding = $2, metadata = $3, updated_at = NOW()
             WHERE id = $4`,
            [content, vectorStr, JSON.stringify(metadata || {}), id]
        );
    }

    static async delete(id: number): Promise<void> {
        await pool.query(`DELETE FROM agent_memories WHERE id = $1`, [id]);
    }
}

/**
 * L4: Episodic Memory - Key events and decisions
 */
export class EpisodicMemory {
    static async storeEvent(event: Omit<EpisodicEvent, 'id' | 'created_at'>): Promise<number> {
        let embedding = event.embedding;
        
        if (!embedding) {
            const embResult = await generateEmbedding(event.summary);
            embedding = embResult?.embedding || [];
        }

        const vectorStr = toPgVector(embedding);
        
        const result = await pool.query(
            `INSERT INTO episodic_events 
             (event_type, entity_type, entity_id, summary, embedding, outcome, details)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                event.event_type,
                event.entity_type,
                event.entity_id,
                event.summary,
                vectorStr,
                event.outcome,
                JSON.stringify(event.details || {})
            ]
        );

        return result.rows[0].id;
    }

    static async getSimilar(query: string, entityType?: string, limit: number = 10): Promise<any[]> {
        const embedding = await generateEmbedding(query);
        if (!embedding) return [];

        const vectorStr = toPgVector(embedding.embedding);
        
        let typeFilter = '';
        const params: any[] = [vectorStr, limit];
        
        if (entityType) {
            typeFilter = `AND entity_type = $${params.length + 1}`;
            params.push(entityType);
        }

        const result = await pool.query(
            `SELECT id, event_type, entity_type, entity_id, summary, outcome, details, created_at,
                   1 - (embedding <=> $1::vector) as similarity
            FROM episodic_events
            WHERE embedding <=> $1::vector < 0.3 ${typeFilter}
            ORDER BY embedding <=> $1::vector
            LIMIT $2`,
            params
        );

        return result.rows.map(r => ({
            id: r.id,
            event_type: r.event_type,
            entity_type: r.entity_type,
            entity_id: r.entity_id,
            summary: r.summary,
            outcome: r.outcome,
            details: r.details,
            created_at: r.created_at,
            similarity: r.similarity
        }));
    }

    static async getEntityEvents(entityType: string, entityId: number): Promise<any[]> {
        const result = await pool.query(
            `SELECT id, event_type, summary, outcome, details, created_at
             FROM episodic_events
             WHERE entity_type = $1 AND entity_id = $2
             ORDER BY created_at DESC`,
            [entityType, entityId]
        );
        return result.rows;
    }

    static async getOutcomeStats(outcome: string, days: number = 30): Promise<any> {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE outcome = 'success') as successes,
                COUNT(*) FILTER (WHERE outcome = 'failure') as failures,
                COUNT(*) FILTER (WHERE outcome = 'escalated') as escalated
             FROM episodic_events
             WHERE outcome = $1 AND created_at > NOW() - INTERVAL '${days} days'`,
            [outcome]
        );
        return result.rows[0];
    }
}

/**
 * High-level memory interface
 */
export const MemoryService = {
    // Store new memory
    async remember(userId: number, memoryType: string, content: string, metadata?: Record<string, any>): Promise<number> {
        return LongTermMemory.store({ user_id: userId, memory_type: memoryType, content, metadata });
    },

    // Recall similar memories
    async recall(query: string, options: Partial<RecallOptions> = {}): Promise<any[]> {
        return LongTermMemory.recall({ query, ...options });
    },

    // Store episodic event
    async recordEvent(
        eventType: string,
        entityType: string,
        entityId: number,
        summary: string,
        outcome: 'success' | 'failure' | 'escalated' | 'resolved',
        details?: Record<string, any>
    ): Promise<number> {
        return EpisodicMemory.storeEvent({
            event_type: eventType,
            entity_type: entityType,
            entity_id: entityId,
            summary,
            outcome,
            details
        });
    },

    // Get similar past events
    async getSimilarEvents(query: string, entityType?: string): Promise<any[]> {
        return EpisodicMemory.getSimilar(query, entityType);
    },

    // Get all memories for a user
    async getUserMemories(userId: number, memoryType?: string): Promise<any[]> {
        return LongTermMemory.getUserMemories(userId, memoryType);
    },

    // Working memory shortcuts
    working: {
        set: WorkingMemory.set,
        get: WorkingMemory.get,
        getAll: WorkingMemory.getAll,
        clear: WorkingMemory.clear
    },

    // Short-term memory shortcuts
    cache: {
        set: ShortTermMemory.set,
        get: ShortTermMemory.get,
        getPattern: ShortTermMemory.getPattern,
        cleanup: ShortTermMemory.cleanup
    }
};

export default MemoryService;