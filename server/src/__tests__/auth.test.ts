import request from 'supertest';
import express from 'express';
import { validate } from '../middleware/validation';
import { authSchemas } from '../validation/schemas';

// Create a simple test app with just validation
const createValidationTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Test routes with validation
  app.post('/test/register', validate(authSchemas.register), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/login', validate(authSchemas.login), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  app.post('/test/verify-email', validate(authSchemas.verifyEmail), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  
  return app;
};

const app = createValidationTestApp();

describe('Authentication Validation Tests', () => {
  describe('POST /test/register validation', () => {
    it('should accept valid registration data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'buyer'
      };

      const response = await request(app)
        .post('/test/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual(userData);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'SecurePass123!',
        role: 'buyer'
      };

      const response = await request(app)
        .post('/test/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' })
        ])
      );
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        role: 'buyer'
      };

      const response = await request(app)
        .post('/test/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' })
        ])
      );
    });

    it('should reject registration with missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/test/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject registration with invalid role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'invalid_role'
      };

      const response = await request(app)
        .post('/test/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject registration with short name', async () => {
      const userData = {
        name: 'T',
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'buyer'
      };

      const response = await request(app)
        .post('/test/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' })
        ])
      );
    });
  });

  describe('POST /test/login validation', () => {
    it('should accept valid login data', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/test/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual(loginData);
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/test/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject login with empty password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: ''
      };

      const response = await request(app)
        .post('/test/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /test/verify-email validation', () => {
    it('should accept valid token', async () => {
      const data = {
        token: 'valid-verification-token-12345'
      };

      const response = await request(app)
        .post('/test/verify-email')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .post('/test/verify-email')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject empty token', async () => {
      const response = await request(app)
        .post('/test/verify-email')
        .send({ token: '' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });
});
