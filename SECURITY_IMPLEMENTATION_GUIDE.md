# IslandFund Security Implementation Guide

## 🔐 **Security Features Implemented**

### 1. **Authentication Security**
- ✅ JWT tokens with configurable expiry
- ✅ Refresh token system ready
- ✅ bcrypt password hashing (configurable rounds)
- ✅ Failed login attempt tracking
- ✅ Account lockout after 5 failed attempts
- ✅ 2FA (TOTP) support with backup codes
- ✅ Password history tracking
- ✅ Email verification

### 2. **Authorization & RBAC**
- ✅ Role-based access control (8 roles)
- ✅ Route-level permission checks
- ✅ Resource ownership validation
- ✅ Admin privilege protection

### 3. **Input Validation**
- ✅ Zod schema validation for all endpoints
- ✅ SQL injection prevention
- ✅ XSS protection middleware
- ✅ NoSQL injection prevention (mongo-sanitize)
- ✅ HTTP Parameter Pollution prevention
- ✅ Request size limiting

### 4. **Rate Limiting**
- ✅ Standard API rate limiting (100 req/15min)
- ✅ Auth endpoint limiting (10 req/15min)
- ✅ Password reset limiting (3 req/hour)
- ✅ Webhook endpoint handling
- ✅ IP-based tracking

### 5. **Security Headers**
- ✅ Helmet.js integration
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options (clickjacking protection)
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 6. **Data Protection**
- ✅ Password hashing with bcrypt
- ✅ Prepared SQL statements (parameterized queries)
- ✅ Input sanitization
- ✅ Output encoding
- ✅ Sensitive data logging

### 7. **Monitoring & Logging**
- ✅ Security audit log table
- ✅ Failed login tracking
- ✅ Password change logging
- ✅ IP address tracking
- ✅ User agent tracking

---

## 🚀 **Starting the Development Servers**

### **Step 1: Start the Database**
Make sure PostgreSQL is running on port 5433:
```bash
# If using Docker
docker-compose up postgres redis

# Or if PostgreSQL is installed locally
# Ensure it's running as a service
```

### **Step 2: Run Database Migrations**
```bash
cd server
npx ts-node src/migrations/run-migrations.ts
```

### **Step 3: Start the Backend Server**
```bash
cd server
npm run dev
# Server will start on http://localhost:5001
```

### **Step 4: Start the Frontend**
```bash
cd web
npm run dev
# Frontend will start on http://localhost:3000
```

### **Step 5: Verify Connection**
Open browser and navigate to:
- Frontend: http://localhost:3000
- API Health Check: http://localhost:5001/health

---

## 🛠️ **Security Configuration**

### **Environment Variables**
Create `.env` files with these security settings:

**Server (.env):**
```env
# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 2FA
TOTP_ISSUER=IslandFund
TOTP_ALGORITHM=SHA256

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key
```

**Web (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

---

## 🔒 **Security Best Practices**

### **For Developers:**

1. **Always use parameterized queries:**
   ```typescript
   // Good
   await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
   
   // Bad - Never do this
   await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
   ```

2. **Validate all input:**
   ```typescript
   import { validate } from '../middleware/validation';
   import { schemas } from '../validation/schemas';
   
   router.post('/endpoint', validate(schemas.auth.login), handler);
   ```

3. **Use security middleware:**
   ```typescript
   import { applySecurityMiddleware } from '../middleware/securityMiddleware';
   applySecurityMiddleware(app);
   ```

4. **Log security events:**
   ```typescript
   await logSecurityEvent(userId, 'sensitive_action', 'resource', details);
   ```

### **For Production:**

1. **Enable HTTPS only** (HSTS)
2. **Use secure cookies** (httpOnly, secure, SameSite)
3. **Implement WAF** (Web Application Firewall)
4. **Regular security scans** (npm audit, Snyk)
5. **Penetration testing** (quarterly)
6. **Monitor logs** for suspicious activity

---

## 📋 **Security Checklist Before Launch**

- [x] All dependencies updated (npm audit)
- [x] Security middleware applied
- [x] Input validation on all endpoints
- [x] Rate limiting configured
- [x] CORS properly configured
- [x] Security headers enabled
- [x] 2FA implemented (optional for users, required for admins)
- [x] Account lockout enabled
- [x] Audit logging active
- [x] HTTPS configured
- [x] Secure cookie settings
- [ ] WAF enabled (CloudFlare/AWS WAF)
- [ ] Penetration test completed
- [ ] Security documentation reviewed

---

## 🆘 **Troubleshooting**

### **"localhost refused to connect"**
1. Check if servers are running (`npm run dev`)
2. Check ports (3000 for web, 5001 for server)
3. Check firewall settings
4. Ensure database is running

### **CORS errors**
1. Verify `ALLOWED_ORIGINS` in server .env
2. Check that frontend URL matches

### **Rate limiting blocking legitimate requests**
1. Check if you're using the correct rate limiter
2. Verify IP isn't accidentally blacklisted
3. Adjust limits in `securityConfig.ts`

---

## 📞 **Security Contacts**

**For Security Issues:**
- Email: security@islandfund.com
- PGP Key: [Link to PGP key]

**Emergency Response:**
- 24/7 Hotline: [Phone number]

---

**Last Updated:** February 2, 2026  
**Version:** 1.0  
**Classification:** Internal Use
