import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, runMigrations } from './config/db';
import { configureSecurityHeaders } from './middleware/security';
import { corsMiddleware } from './middleware/cors';
import { generalLimiter, authLimiter } from './middleware/rateLimit';
import { configureSanitization } from './middleware/sanitization';
import { setupSwagger } from './docs/swagger';
import './otel';
import { ExpressRequestMetricMiddleware } from './monitoring/metrics';
import { cacheMiddleware } from './middleware/cache';

dotenv.config();

// Trust proxy for proper IP detection behind load balancers (Render, Vercel, etc.)
app.set('trust proxy', 1);

configureSanitization(app);

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
