import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool, runMigrations } from './config/db';
import { configureSecurityHeaders } from './middleware/security';
import { corsMiddleware } from './middleware/cors';
import { generalLimiter, authLimiter } from './middleware/rateLimit';
import { configureSanitization } from './middleware/sanitization';
import { setupSwagger } from './docs/swagger';
import './otel';
import { ExpressRequestMetricMiddleware } from './monitoring/metrics';
import { cacheMiddleware } from './middleware/cache';
import passport from 'passport';
import './config/passport';

import authRoutes from './routes/authRoutes';
import campaignRoutes from './routes/campaignRoutes';
import donationRoutes from './routes/donationRoutes';
import eventRoutes from './routes/eventRoutes';
import webhookRoutes from './routes/webhookRoutes';
import paypalRoutes from './routes/paypalRoutes';
import cryptoRoutes from './routes/cryptoRoutes';
import listingRoutes from './routes/listingRoutes';
import campaignUpdateRoutes from './routes/campaignUpdateRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import vendorRoutes from './routes/vendorRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import messageRoutes from './routes/messageRoutes';
import rentalRoutes from './routes/rentalRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import vendorSubscriptionRoutes from './routes/vendorSubscriptionRoutes';
import customerSubscriptionRoutes from './routes/customerSubscriptionRoutes';
import campaignCreatorSubscriptionRoutes from './routes/campaignCreatorSubscriptionRoutes';
import searchRoutes from './routes/searchRoutes';
import kycRoutes from './routes/kycRoutes';
import storeRoutes from './routes/storeRoutes';
import cartRoutes from './routes/cart';
import paymentRoutes from './routes/payments';
import postRoutes from './routes/postRoutes';
import marqueeRoutes from './routes/marqueeRoutes';
import promotionRoutes from './routes/promotionRoutes';
import revenueRoutes from './routes/revenueRoutes';
import menuRoutes from './routes/menuRoutes';
import serviceRoutes from './routes/serviceRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import advertisementRoutes from './routes/advertisementRoutes';
import homepageRoutes from './routes/homepageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import commentRoutes from './routes/commentRoutes';
import likeRoutes from './routes/likeRoutes';
import followerRoutes from './routes/followerRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import conversationRoutes from './routes/conversationRoutes';
import groupRoutes from './routes/groupRoutes';
import communityEventRoutes from './routes/communityEventRoutes';
import storyRoutes from './routes/storyRoutes';
import moderationRoutes from './routes/moderationRoutes';
import driverApplicationRoutes from './routes/driverApplicationRoutes';
import ratingRoutes from './routes/ratingRoutes';
import financialRoutes from './routes/financialRoutes';
import discoveryRoutes from './routes/discoveryRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import agentRoutes from './routes/agentRoutes';
import advancedRoutes from './routes/advancedRoutes';
import { initScheduler } from './services/subscriptionScheduler';

const PORT = process.env.PORT || 5001;

const app = express();

dotenv.config();

// Trust proxy for proper IP detection behind load balancers (Render, Vercel, etc.)
app.set('trust proxy', 1);

configureSecurityHeaders(app);
app.use(corsMiddleware);
app.use(generalLimiter);

configureSanitization(app);

// Body parsing middleware - CRITICAL for API endpoints
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use(passport.initialize());
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments/paypal', paypalRoutes);
app.use('/api/payments/crypto', cryptoRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/campaign-updates', campaignUpdateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/vendor-subscriptions', vendorSubscriptionRoutes);
app.use('/api/customer-subscriptions', customerSubscriptionRoutes);
app.use('/api/campaign-creator-subscriptions', campaignCreatorSubscriptionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/marquee', marqueeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/community-events', communityEventRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/driver-applications', driverApplicationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api', advancedRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('IslandFund API is running 🌴');
});

// DB Connection Check
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'OK', db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error', message: 'Database connection failed' });
  }
});

// 404 Handler with Detailed Logging
app.use((req, res) => {
  console.warn(`[404] NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  // Handle Multer errors specifically if needed
  if (err instanceof Error && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Also accessible via LAN IP (e.g., http://192.168.1.122:${PORT})`);
  runMigrations();
  initScheduler();
});
