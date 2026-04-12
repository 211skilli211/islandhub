import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import { securityConfig, securityHeaders, sqlInjectionPatterns, xssPatterns, suspiciousUserAgents } from '../config/security';

/**
 * Apply security headers using Helmet
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: securityConfig.csp.defaultSrc,
      scriptSrc: securityConfig.csp.scriptSrc,
      styleSrc: securityConfig.csp.styleSrc,
      imgSrc: securityConfig.csp.imgSrc,
      fontSrc: securityConfig.csp.fontSrc,
      connectSrc: securityConfig.csp.connectSrc,
      frameSrc: securityConfig.csp.frameSrc,
      objectSrc: securityConfig.csp.objectSrc,
      mediaSrc: securityConfig.csp.mediaSrc,
      childSrc: securityConfig.csp.childSrc,
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
});

/**
 * Custom security headers middleware
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Apply custom security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  next();
};

/**
 * CORS configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (securityConfig.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: securityConfig.cors.allowedMethods,
  allowedHeaders: securityConfig.cors.allowedHeaders,
  credentials: securityConfig.cors.credentials,
  maxAge: securityConfig.cors.maxAge,
});

/**
 * Rate limiting middleware factory
 */
export const createRateLimiter = (type: 'standard' | 'auth' | 'passwordReset' | 'webhook' = 'standard') => {
  const config = securityConfig.rateLimiting[type];
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
    // Skip rate limiting for trusted IPs (webhooks from payment providers)
    skip: (req) => {
      const trustedWebhookIps = [
        // Stripe webhook IPs
        '3.18.12.63',
        '3.130.192.231',
        '13.235.14.237',
        '13.235.122.149',
        '35.154.171.200',
        '52.15.183.38',
        '54.88.130.190',
        '54.187.174.169',
        '54.187.216.72',
        '54.241.31.99',
        '54.241.31.102',
        '54.241.34.107',
      ];
      return trustedWebhookIps.includes(req.ip || '');
    },
  });
};

/**
 * Prevent SQL Injection
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const checkForInjection = (value: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(value));
  };

  // Check query parameters
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string' && checkForInjection(value)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input detected',
        code: 'INVALID_INPUT',
      });
    }
  }

  // Check body (if string)
  if (typeof req.body === 'string' && checkForInjection(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
  }

  next();
};

/**
 * Prevent XSS attacks
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: string): string => {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  // Check for XSS patterns in request
  const checkForXss = (obj: any): boolean => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (xssPatterns.some(pattern => pattern.test(obj[key]))) {
          return true;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForXss(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForXss(req.body) || checkForXss(req.query)) {
    return res.status(400).json({
      success: false,
      error: 'Potentially malicious input detected',
      code: 'XSS_ATTEMPT_BLOCKED',
    });
  }

  next();
};

/**
 * MongoDB NoSQL injection prevention
 */
export const noSqlInjectionPrevention = mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key} from IP: ${req.ip}`);
  },
});

/**
 * HTTP Parameter Pollution prevention
 */
export const hppPrevention = hpp({
  whitelist: [
    'page',
    'limit',
    'sort',
    'order',
    'fields',
    'populate',
  ],
});

/**
 * Bot/Scanner detection
 */
export const botDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Check for suspicious user agents
  if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
    console.warn(`Suspicious user agent detected: ${userAgent} from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      code: 'ACCESS_DENIED',
    });
  }

  next();
};

/**
 * Request size limiter
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = parseInt(securityConfig.api.maxPayloadSize) * 1024 * 1024;

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: securityConfig.api.maxPayloadSize,
    });
  }

  next();
};

/**
 * IP whitelist/blacklist middleware
 */
export const ipFilter = (options: { whitelist?: string[]; blacklist?: string[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    // Check blacklist first
    if (options.blacklist?.includes(clientIp)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'IP_BLOCKED',
      });
    }

    // Check whitelist (if provided, only allow whitelisted IPs)
    if (options.whitelist && options.whitelist.length > 0) {
      if (!options.whitelist.includes(clientIp)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          code: 'IP_NOT_WHITELISTED',
        });
      }
    }

    next();
  };
};

/**
 * Audit logging middleware
 */
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
  };

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const duration = Date.now() - startTime;
    
    // Log sensitive operations
    if (securityConfig.logging.logDataAccess && 
        (req.method !== 'GET' || req.path.includes('/admin'))) {
      console.log('Audit Log:', {
        ...logData,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        response: body?.success ? 'success' : 'error',
      });
    }

    return originalJson(body);
  };

  next();
};

/**
 * Security middleware bundle
 * Apply all security middleware in correct order
 */
export const applySecurityMiddleware = (app: any) => {
  // 1. Security headers (Helmet)
  app.use(helmetMiddleware);
  app.use(customSecurityHeaders);
  
  // 2. CORS
  app.use(corsMiddleware);
  
  // 3. Request size limiting
  app.use(requestSizeLimiter);
  
  // 4. Bot detection
  app.use(botDetection);
  
  // 5. Rate limiting (general)
  app.use(createRateLimiter('standard'));
  
  // 6. NoSQL injection prevention
  app.use(noSqlInjectionPrevention);
  
  // 7. SQL injection protection
  app.use(sqlInjectionProtection);
  
  // 8. XSS protection
  app.use(xssProtection);
  
  // 9. HTTP Parameter Pollution prevention
  app.use(hppPrevention);
  
  // 10. Audit logging
  app.use(auditLogger);
};

// Specific rate limiters for different routes
export const authRateLimiter = createRateLimiter('auth');
export const passwordResetRateLimiter = createRateLimiter('passwordReset');
export const webhookRateLimiter = createRateLimiter('webhook');

export default {
  applySecurityMiddleware,
  helmetMiddleware,
  corsMiddleware,
  createRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
  webhookRateLimiter,
  sqlInjectionProtection,
  xssProtection,
  noSqlInjectionPrevention,
  hppPrevention,
  botDetection,
  requestSizeLimiter,
  ipFilter,
  auditLogger,
};
