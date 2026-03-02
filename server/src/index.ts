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

// Temporarily disabled until type conflicts resolved
// import passport from 'passport';
// import './config/passport'; // Ensure config is loaded
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
import advancedRoutes from './routes/advancedRoutes';
import searchRoutes from './routes/searchRoutes';
import kycRoutes from './routes/kycRoutes';
import storeRoutes from './routes/storeRoutes';
import cartRoutes from './routes/cart';
import paymentRoutes from './routes/payments';
import postRoutes from './routes/postRoutes';
import marqueeRoutes from './routes/marqueeRoutes';
import revenueRoutes from './routes/revenueRoutes';
// Roadmap Routes
import analyticsRoutes from './routes/analyticsRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import vendorSubscriptionRoutes from './routes/vendorSubscriptionRoutes';
import customerSubscriptionRoutes from './routes/customerSubscriptionRoutes';
import campaignCreatorSubscriptionRoutes from './routes/campaignCreatorSubscriptionRoutes';
import promotionRoutes from './routes/promotionRoutes';
import menuRoutes from './routes/menuRoutes';
import serviceRoutes from './routes/serviceRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import advertisementRoutes from './routes/advertisementRoutes';
import homepageRoutes from './routes/homepageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import driverApplicationRoutes from './routes/driverApplicationRoutes';
import ratingRoutes from './routes/ratingRoutes';
import financialRoutes from './routes/financialRoutes';
import discoveryRoutes from './routes/discoveryRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import path from 'path';
import { initScheduler } from './services/subscriptionScheduler';

const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

// Security middleware
configureSecurityHeaders(app);
app.use(corsMiddleware);
app.use(generalLimiter);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Webhook routes need raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// All other routes use JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
configureSanitization(app);

// Serve static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
// app.use(passport.initialize()); // Temporarily disabled
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
app.use('/api/driver-applications', driverApplicationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/recommendations', recommendationRoutes);
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

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Also accessible via LAN IP (e.g., http://192.168.1.122:${PORT})`);
  runMigrations();
  initScheduler();
});
