import { Request, Response, NextFunction } from 'express';
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('islandfund-api');

// Create custom metrics
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

const requestDuration = meter.createHistogram('http_request_duration_seconds', {
  description: 'HTTP request duration in seconds',
  unit: 's',
});

const activeConnections = meter.createUpDownCounter('active_connections', {
  description: 'Number of active connections',
});

const databaseQueryDuration = meter.createHistogram('db_query_duration_seconds', {
  description: 'Database query duration in seconds',
  unit: 's',
});

export const ExpressRequestMetricMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Count active connection
  activeConnections.add(1);
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    
    // Record request metrics
    requestCounter.add(1, {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
    });
    
    requestDuration.record(duration, {
      method: req.method,
      route: req.route?.path || req.path,
    });
    
    // Log slow requests (>1s)
    if (duration > 1) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}s`);
    }
    
    // Decrement active connection
    activeConnections.add(-1);
  });
  
  next();
};

export const recordDatabaseQuery = (duration: number, query: string) => {
  databaseQueryDuration.record(duration, {
    query_type: query.trim().split(' ')[0].toUpperCase(),
  });
};

export { requestCounter, requestDuration, activeConnections, databaseQueryDuration };
