import request from 'supertest';
import express, { Express } from 'express';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { schemas } from '../validation/schemas';

/**
 * Create a test Express app with validation middleware
 */
export const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  
  // Test routes for all schemas
  
  // Auth routes
  app.post('/test/auth/register', validate(schemas.auth.register), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/auth/login', validate(schemas.auth.login), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/auth/verify-email', validate(schemas.auth.verifyEmail), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/auth/forgot-password', validate(schemas.auth.forgotPassword), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/auth/reset-password', validate(schemas.auth.resetPassword), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // User routes
  app.patch('/test/users/profile', validate(schemas.user.updateProfile), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/users/change-password', validate(schemas.user.changePassword), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Store routes
  app.post('/test/stores', validate(schemas.store.create), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.patch('/test/stores/:id', validate(schemas.store.update), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Listing routes
  app.post('/test/listings', validate(schemas.listing.create), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.patch('/test/listings/:id', validate(schemas.listing.update), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.get('/test/listings/search', validateQuery(schemas.listing.search), (req, res) => {
    res.status(200).json({ success: true, query: req.query });
  });
  
  // Order routes
  app.post('/test/orders', validate(schemas.order.create), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.patch('/test/orders/:id/status', validate(schemas.order.updateStatus), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/orders/:id/cancel', validate(schemas.order.cancel), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Campaign routes
  app.post('/test/campaigns', validate(schemas.campaign.create), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.patch('/test/campaigns/:id', validate(schemas.campaign.update), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/campaigns/:id/donate', validate(schemas.campaign.donate), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Review routes
  app.post('/test/reviews', validate(schemas.review.create), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.patch('/test/reviews/:id', validate(schemas.review.update), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/reviews/:id/reply', validate(schemas.review.reply), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Cart routes
  app.post('/test/cart/items', validate(schemas.cart.addItem), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.patch('/test/cart/items/:id', validate(schemas.cart.updateItem), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Admin routes
  app.post('/test/admin/moderate', validate(schemas.admin.moderateContent), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/admin/announcements', validate(schemas.admin.createAnnouncement), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  // Search routes
  app.get('/test/search', validateQuery(schemas.search.global), (req, res) => {
    res.status(200).json({ success: true, query: req.query });
  });
  
  return app;
};

/**
 * Helper to make requests to test app
 */
export const makeRequest = (app: Express) => {
  return {
    post: (path: string, data: any) => request(app).post(path).send(data),
    get: (path: string, query?: any) => request(app).get(path).query(query || {}),
    patch: (path: string, data: any) => request(app).patch(path).send(data),
    delete: (path: string) => request(app).delete(path),
  };
};

/**
 * Generate valid test data for different entities
 */
export const generateValidData = {
  auth: {
    register: () => ({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'SecurePass123!',
      role: 'buyer',
    }),
    login: () => ({
      email: 'test@example.com',
      password: 'SecurePass123!',
    }),
  },
  
  store: {
    create: () => ({
      name: 'Test Store',
      slug: `test-store-${Date.now()}`,
      description: 'A test store for validation',
      category: 'electronics',
      logo_url: 'https://example.com/logo.png',
    }),
  },
  
  listing: {
    create: () => ({
      title: 'Test Product',
      description: 'A detailed description of the test product that is at least 10 characters',
      price: 99.99,
      type: 'product',
      category: 'electronics',
      images: ['https://example.com/image1.png'],
    }),
  },
  
  order: {
    create: () => ({
      items: [
        {
          listing_id: '550e8400-e29b-41d4-a716-446655440000',
          quantity: 2,
        },
      ],
      shipping_address: {
        name: 'John Doe',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country',
        phone: '+1234567890',
      },
      payment_method: 'stripe',
    }),
  },
  
  campaign: {
    create: () => ({
      title: 'Test Campaign',
      description: 'A'.repeat(50), // Ensure minimum 50 characters
      goal_amount: 10000,
      category: 'technology',
      featured_image: 'https://example.com/campaign.png',
      location: 'Test Location',
    }),
  },
  
  review: {
    create: () => ({
      listing_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
      content: 'This is a great product! Highly recommended.',
    }),
  },
};

/**
 * Generate invalid test data for edge cases
 */
export const generateInvalidData = {
  auth: {
    register: {
      missingEmail: { name: 'Test', password: 'SecurePass123!', role: 'buyer' },
      invalidEmail: { name: 'Test', email: 'invalid', password: 'SecurePass123!', role: 'buyer' },
      weakPassword: { name: 'Test', email: 'test@example.com', password: 'weak', role: 'buyer' },
      shortName: { name: 'T', email: 'test@example.com', password: 'SecurePass123!', role: 'buyer' },
      invalidRole: { name: 'Test', email: 'test@example.com', password: 'SecurePass123!', role: 'superuser' },
    },
  },
  
  listing: {
    shortTitle: { title: 'T', description: 'A'.repeat(50), price: 99.99, category: 'test' },
    shortDescription: { title: 'Test Product', description: 'Short', price: 99.99, category: 'test' },
    negativePrice: { title: 'Test', description: 'A'.repeat(50), price: -10, category: 'test' },
    tooManyImages: { 
      title: 'Test', 
      description: 'A'.repeat(50), 
      price: 99.99, 
      category: 'test',
      images: Array(15).fill('https://example.com/image.png'),
    },
  },
};

export default {
  createTestApp,
  makeRequest,
  generateValidData,
  generateInvalidData,
};
