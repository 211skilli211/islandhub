import request from 'supertest';
import express from 'express';
import { configureSecurityHeaders } from '../middleware/security';
import { corsMiddleware } from '../middleware/cors';
import { generalLimiter, authLimiter } from '../middleware/rateLimit';
import { configureSanitization } from '../middleware/sanitization';
import authRoutes from '../routes/authRoutes';

const createTestApp = () => {
  const app = express();
  
  configureSecurityHeaders(app);
  app.use(corsMiddleware);
  app.use(generalLimiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  configureSanitization(app);
  
  app.use('/api/auth', authLimiter, authRoutes);
  
  return app;
};

export { createTestApp };
export default createTestApp;
