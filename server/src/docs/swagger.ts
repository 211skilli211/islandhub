import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IslandFund API',
      version: '1.0.0',
      description: 'Multi-vendor marketplace and crowdfunding platform API',
      contact: {
        name: 'API Support',
        email: 'api@islandfund.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'https://api.islandfund.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['buyer', 'vendor', 'sponsor', 'admin', 'creator', 'donor', 'driver', 'rider'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Listing: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', minLength: 3, maxLength: 200 },
            description: { type: 'string', minLength: 10, maxLength: 5000 },
            price: { type: 'number', minimum: 0 },
            category: { type: 'string' },
            condition: { type: 'string', enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
            location: { type: 'string' },
            images: { type: 'array', items: { type: 'string', format: 'uri' } },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            order_id: { type: 'string', format: 'uuid' },
            listing_id: { type: 'string', format: 'uuid' },
            buyer_id: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1 },
            total_price: { type: 'number', minimum: 0 },
            status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Listings', description: 'Marketplace listings CRUD' },
      { name: 'Stores', description: 'Vendor store management' },
      { name: 'Orders', description: 'Order processing and management' },
      { name: 'Campaigns', description: 'Crowdfunding campaigns' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Search', description: 'Full-text search and filtering' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'IslandFund API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));

  // Serve OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: http://localhost:5001/api-docs');
};

export default specs;
