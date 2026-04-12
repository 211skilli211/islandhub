/**
 * Security Configuration for IslandFund
 * Centralized security settings and constants
 */

export const securityConfig = {
  // JWT Configuration
  jwt: {
    accessTokenExpiry: '15m',        // Short-lived access tokens
    refreshTokenExpiry: '7d',        // Longer-lived refresh tokens
    algorithm: 'HS256' as const,     // Secure algorithm
    issuer: 'islandfund-api',        // Token issuer
    audience: 'islandfund-client',   // Token audience
  },

  // Password Policy
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '@$!%*?&',
    maxAttempts: 5,                  // Max failed attempts before lockout
    lockoutDurationMinutes: 30,      // Account lockout duration
  },

  // Rate Limiting
  rateLimiting: {
    // General API rate limits
    standard: {
      windowMs: 15 * 60 * 1000,      // 15 minutes
      maxRequests: 100,              // 100 requests per window
    },
    // Authentication endpoints (stricter)
    auth: {
      windowMs: 15 * 60 * 1000,      // 15 minutes
      maxRequests: 10,               // 10 login attempts per window
    },
    // Password reset (very strict)
    passwordReset: {
      windowMs: 60 * 60 * 1000,      // 1 hour
      maxRequests: 3,                // 3 reset attempts per hour
    },
    // Webhook endpoints (higher limit)
    webhook: {
      windowMs: 1 * 60 * 1000,       // 1 minute
      maxRequests: 1000,             // 1000 webhook calls per minute
    },
  },

  // CORS Configuration
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:5001',
      'https://islandfund.com',
      'https://www.islandfund.com',
      'https://app.islandfund.com',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
    ],
    credentials: true,
    maxAge: 86400,                   // 24 hours
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",              // Required for Next.js
      "'unsafe-eval'",                // Required for Next.js
      'https://js.stripe.com',
      'https://www.paypal.com',
      'https://www.googletagmanager.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",              // Required for styled-components/tailwind
      'https://fonts.googleapis.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'http:',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    connectSrc: [
      "'self'",
      'https://api.islandfund.com',
      'https://api.stripe.com',
      'https://www.paypal.com',
      'wss:',                          // WebSocket
    ],
    frameSrc: [
      "'self'",
      'https://js.stripe.com',
      'https://www.paypal.com',
    ],
    objectSrc: ["'none'"],           // Disallow flash/applets
    mediaSrc: ["'self'", 'https:', 'http:'],
    childSrc: ["'self'"],
  },

  // Session/Cookie Security
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000,     // 24 hours
  },

  // Encryption
  encryption: {
    bcryptRounds: 12,                // For password hashing
    aesKeySize: 256,                 // For data encryption
    ivLength: 16,                    // Initialization vector length
  },

  // API Security
  api: {
    maxPayloadSize: '10mb',          // Max request body size
    maxQueryDepth: 5,                // For GraphQL (if used)
    maxQueryComplexity: 1000,        // For GraphQL (if used)
  },

  // File Upload Security
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024,   // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'],
  },

  // Logging
  logging: {
    logFailedLogins: true,
    logSuspiciousActivity: true,
    logDataAccess: true,
    retentionDays: 90,               // Keep logs for 90 days
  },

  // 2FA Configuration
  twoFactor: {
    issuer: 'IslandFund',
    algorithm: 'SHA256',
    digits: 6,
    period: 30,                      // TOTP period in seconds
    backupCodesCount: 10,            // Number of backup codes
  },
};

// Security headers configuration
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS Protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self https://js.stripe.com https://www.paypal.com)',
  ].join(', '),
  
  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cache Control for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// SQL Injection patterns to block
export const sqlInjectionPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /UNION\s+SELECT/i,
  /INSERT\s+INTO/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
];

// XSS patterns to block
export const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

// Suspicious user agents
export const suspiciousUserAgents = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /burp/i,
  /wfuzz/i,
];

export default securityConfig;
