import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5001',
  'https://islandfund.com',
  'https://www.islandfund.com'
];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(`[CORS] Origin: ${origin}`);

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Allow ANY localhost port (e.g. localhost:3000, 3001, 3002, 3003...)
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }

    // Allow ANY 127.0.0.1 port
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }

    // Allow local network IPs for development/mobile testing
    // Matches: http://192.168.x.x:port, http://10.x.x.x:port, http://172.16-31.x.x:port
    const localNetworkPattern = /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

    if (localNetworkPattern.test(origin)) {
      console.log(`[CORS] Allowing local network IP: ${origin}`);
      callback(null, true);
      return;
    }

    // Allow ALL Vercel deployments (vercel.app and vercel.sh)
    // This covers: production, preview, and dev deployments
    const vercelPattern = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.(app|sh)$/;
    if (vercelPattern.test(origin)) {
      console.log(`[CORS] Allowing Vercel deployment: ${origin}`);
      callback(null, true);
      return;
    }

    // Allow all islandhub-related Vercel projects (flexible pattern)
    const islandhubVercelPattern = /^https:\/\/islandhub(-[a-zA-Z0-9]+)?-[\w-]+\.vercel\.(app|sh)$/;
    if (islandhubVercelPattern.test(origin)) {
      console.log(`[CORS] Allowing IslandHub Vercel: ${origin}`);
      callback(null, true);
      return;
    }

    console.warn(`[CORS] Blocked Origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-session-id',
    'dodo-signature'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400
};

export const corsMiddleware = cors(corsOptions);
