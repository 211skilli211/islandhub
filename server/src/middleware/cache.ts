import { Request, Response, NextFunction } from 'express';
import { cache } from '../services/cache';

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  tags?: string[];
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, keyGenerator } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not available
    if (!cache.isConnected()) {
      return next();
    }

    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : cache.generateKey('api', { 
          path: req.originalUrl, 
          user: req.user?.id || 'anonymous' 
        });

    try {
      // Try to get cached response
      const cached = await cache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache successful responses
      res.json = function(data: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, data, ttl);
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-Key', cacheKey);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.invalidatePattern(pattern);
      }
      return originalJson(data);
    };
    
    next();
  };
};

export const cacheTags = {
  LISTINGS: 'listings',
  SEARCH: 'search',
  USERS: 'users',
  STORES: 'stores',
  CAMPAIGNS: 'campaigns',
  ANALYTICS: 'analytics'
};
