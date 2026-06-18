import Redis from 'ioredis';

class CacheService {
  private redis: Redis | null = null;
  private defaultTTL = 300; // 5 minutes in seconds

  constructor() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        enableReadyCheck: true,
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
      });
    } catch (error) {
      console.warn('⚠️  Redis not available, caching disabled');
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.redis) return;
    try {
      const serializedValue = JSON.stringify(value);
      const expireTime = ttl || this.defaultTTL;
      await this.redis.setex(key, expireTime, serializedValue);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`🗑️  Invalidated ${keys.length} cache keys matching ${pattern}`);
      }
    } catch (error) {
      console.error('Redis invalidate pattern error:', error);
    }
  }

  async invalidateListings(): Promise<void> {
    await this.invalidatePattern('listings:*');
    await this.invalidatePattern('search:*');
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}:*`);
  }

  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  isConnected(): boolean {
    return this.redis?.status === 'ready' || false;
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const cache = new CacheService();
export default cache;
