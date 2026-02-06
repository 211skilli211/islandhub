import { createTestApp, makeRequest, generateValidData, generateInvalidData } from '../test/utils';
import { schemas } from '../validation/schemas';

const app = createTestApp();
const request = makeRequest(app);

describe('Comprehensive Validation Tests', () => {
  describe('Auth Validation', () => {
    describe('POST /test/auth/register', () => {
      it('should accept valid registration data', async () => {
        const data = generateValidData.auth.register();
        const response = await request.post('/test/auth/register', data);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(data);
      });

      it('should reject missing email', async () => {
        const response = await request.post('/test/auth/register', generateInvalidData.auth.register.missingEmail);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should reject invalid email format', async () => {
        const response = await request.post('/test/auth/register', generateInvalidData.auth.register.invalidEmail);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject weak password', async () => {
        const response = await request.post('/test/auth/register', generateInvalidData.auth.register.weakPassword);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject short name', async () => {
        const response = await request.post('/test/auth/register', generateInvalidData.auth.register.shortName);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject invalid role', async () => {
        const response = await request.post('/test/auth/register', generateInvalidData.auth.register.invalidRole);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /test/auth/login', () => {
      it('should accept valid login data', async () => {
        const data = generateValidData.auth.login();
        const response = await request.post('/test/auth/login', data);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should reject invalid email', async () => {
        const response = await request.post('/test/auth/login', {
          email: 'invalid-email',
          password: 'password123'
        });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Listing Validation', () => {
    describe('POST /test/listings', () => {
      it('should accept valid listing data', async () => {
        const data = generateValidData.listing.create();
        const response = await request.post('/test/listings', data);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should reject short title', async () => {
        const response = await request.post('/test/listings', generateInvalidData.listing.shortTitle);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject short description', async () => {
        const response = await request.post('/test/listings', generateInvalidData.listing.shortDescription);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject negative price', async () => {
        const response = await request.post('/test/listings', generateInvalidData.listing.negativePrice);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject too many images', async () => {
        const response = await request.post('/test/listings', generateInvalidData.listing.tooManyImages);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Order Validation', () => {
    describe('POST /test/orders', () => {
      it('should accept valid order data', async () => {
        const data = generateValidData.order.create();
        const response = await request.post('/test/orders', data);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should reject order without items', async () => {
        const response = await request.post('/test/orders', {
          items: [],
          shipping_address: generateValidData.order.create().shipping_address,
          payment_method: 'stripe',
        });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject order with invalid payment method', async () => {
        const data = {
          ...generateValidData.order.create(),
          payment_method: 'invalid_method',
        };
        const response = await request.post('/test/orders', data);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Campaign Validation', () => {
    describe('POST /test/campaigns', () => {
      it('should accept valid campaign data', async () => {
        const data = generateValidData.campaign.create();
        const response = await request.post('/test/campaigns', data);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should reject campaign with short description', async () => {
        const response = await request.post('/test/campaigns', {
          title: 'Test Campaign',
          description: 'Short',
          goal_amount: 10000,
          category: 'technology',
          featured_image: 'https://example.com/image.png',
          location: 'Test',
        });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Review Validation', () => {
    describe('POST /test/reviews', () => {
      it('should accept valid review data', async () => {
        const data = generateValidData.review.create();
        const response = await request.post('/test/reviews', data);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should reject review with invalid rating', async () => {
        const response = await request.post('/test/reviews', {
          listing_id: '550e8400-e29b-41d4-a716-446655440000',
          rating: 6,
          content: 'Great product!',
        });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Schema Direct Tests', () => {
    it('should validate email format correctly', () => {
      const validEmails = ['test@example.com', 'user+tag@domain.co.uk', 'first.last@company.com'];
      const invalidEmails = ['invalid', '@example.com', 'test@', 'test@.com'];
      
      validEmails.forEach(email => {
        expect(schemas.common.email.safeParse(email).success).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(schemas.common.email.safeParse(email).success).toBe(false);
      });
    });

    it('should validate password strength correctly', () => {
      const validPasswords = ['SecurePass123!', 'MyP@ssw0rd', 'C0mplex!Pass'];
      const invalidPasswords = ['weak', 'password', '12345678', 'NoSpecial123'];
      
      validPasswords.forEach(password => {
        expect(schemas.common.password.safeParse(password).success).toBe(true);
      });
      
      invalidPasswords.forEach(password => {
        expect(schemas.common.password.safeParse(password).success).toBe(false);
      });
    });

    it('should validate UUID format correctly', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const invalidUuid = 'not-a-uuid';
      
      expect(schemas.common.id.safeParse(validUuid).success).toBe(true);
      expect(schemas.common.id.safeParse(invalidUuid).success).toBe(false);
    });

    it('should validate price correctly', () => {
      expect(schemas.common.price.safeParse(99.99).success).toBe(true);
      expect(schemas.common.price.safeParse(-10).success).toBe(false);
      expect(schemas.common.price.safeParse(0).success).toBe(false);
    });
  });
});
