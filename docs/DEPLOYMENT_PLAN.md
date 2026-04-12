# Production Deployment Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Cloudflare CDN                              │
│                    (DNS, WAF, DDoS, Caching)                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌─────────────────────┐         ┌─────────────────────┐
        │     Vercel          │         │   Backend Server    │
        │   (Next.js Front)  │         │  (Express.js API)   │
        │                     │         │                     │
        │  - Automatic SSL    │         │  - Docker Container │
        │  - Edge Network     │         │  - PM2/Node.js     │
        │  - Preview Deploys  │         │  - Auto-restart    │
        └─────────────────────┘         └─────────────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
        ┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
        │  PostgreSQL        │         │   Redis             │         │   File Storage      │
        │  (Neon/Supabase/   │         │  (Redis Cloud/      │         │   (AWS S3/          │
        │   DigitalOcean)     │         │   DigitalOcean)     │         │   Cloudflare R2)    │
        └─────────────────────┘         └─────────────────────┘         └─────────────────────┘
```

## Infrastructure Choices

### Frontend: Vercel
- **Why**: Best Next.js support, automatic optimizations, edge network, free tier
- **Cost**: Free tier available, paid plans start at $20/month
- **Features**: Preview deployments, analytics, SSL

### Backend: DigitalOcean/AWS/Railway
- **Why**: Full control over Express.js application, Docker support, production-grade
- **Recommendation**: DigitalOcean Droplet ($4/month) or Railway ($5/month)
- **Alternative**: Railway offers simpler setup with Docker support

### Database: Neon/Supabase
- **Why**: Serverless PostgreSQL, automatic scaling, good free tier
- **Neon Free Tier**: 10 branches, 10 GB storage
- **Alternative**: DigitalOcean Managed PostgreSQL ($15/month)

### Redis: Redis Cloud
- **Why**: Fully managed, good free tier (30 MB)
- **Alternative**: DigitalOcean Managed Redis ($15/month)

### CDN/Security: Cloudflare
- **Already Installed**: Use as DNS, WAF, DDoS protection
- **Benefits**: Free SSL, caching, security rules

## Step-by-Step Deployment Plan

### Phase 1: Environment Configuration

#### 1.1 Create Environment Files
Create `.env.production` files for both web and server:

**web/.env.production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

**server/.env.production:**
```env
NODE_ENV=production
PORT=5001
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_super_secure_jwt_secret
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

#### 1.2 Update Next.js Configuration
Ensure `web/next.config.ts` handles production:
```typescript
const nextConfig: NextConfig = {
  // ... existing config
  images: {
    ...existing,
    remotePatterns: [
      ...existing,
      {
        protocol: 'https',
        hostname: 'your-bucket.s3.amazonaws.com',
      },
    ],
  },
};
```

### Phase 2: Database Setup

#### 2.1 Create Neon/Supabase Account
1. Sign up at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com)
2. Create new project
3. Note connection string: `postgres://user:password@ep-xxx.region.neon.tech/dbname`

#### 2.2 Run Database Migrations
```bash
# Using psql or directly in Neon console
psql "postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require" -f islandhub_migration.sql
```

### Phase 3: Redis Setup

#### 3.1 Create Redis Cloud Account
1. Sign up at [Redis Cloud](https://redis.com/cloud/)
2. Create free database
3. Note connection details (host, port, password)

### Phase 4: Backend Deployment

#### 4.1 Option A: Deploy to DigitalOcean

**Create Droplet:**
1. Create DigitalOcean account
2. Create new Droplet (Ubuntu 22.04, $4/month)
3. Add SSH key
4. Note IP address

**Configure Server:**
```bash
# SSH into server
ssh root@your_server_ip

# Install Docker
apt update
apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker

# Clone repository
git clone https://github.com/yourusername/islandfund.git
cd islandfund

# Create .env file
nano server/.env.production

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d
```

**Create Production Docker Compose:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    # Note: Use managed PostgreSQL instead of container
    # For production, use Neon/Supabase

  redis:
    image: redis:7-alpine
    # Note: Use managed Redis for production
    # For production, use Redis Cloud

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: islandfund_api
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5001
      DB_HOST: ${DB_HOST}
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: ${REDIS_HOST}
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    ports:
      - "5001:5001"
    networks:
      - islandfund_network

networks:
  islandfund_network:
    driver: bridge
```

**Create Backend Dockerfile:**
```dockerfile
# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5001

CMD ["node", "dist/index.js"]
```

#### 4.2 Option B: Deploy to Railway

1. Sign up at [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Create new service for backend
4. Set environment variables
5. Deploy with `railway up`

### Phase 5: Frontend Deployment (Vercel)

#### 5.1 Deploy to Vercel
1. Sign up at [Vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure project:
   - Framework: Next.js
   - Root Directory: web
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 5.2 Add Environment Variables
In Vercel dashboard, add:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 5.3 Configure Domain
1. In Vercel: Settings → Domains
2. Add your domain
3. Update DNS in Cloudflare

### Phase 6: Cloudflare Configuration

#### 6.1 Add Domain to Cloudflare
1. Already have Cloudflare installed
2. Add domain in Cloudflare dashboard
3. Update nameservers at registrar

#### 6.2 Configure DNS Records
```
Type    Name    Content                 Proxy
A       @       <DigitalOcean IP>       Proxied
A       api     <DigitalOcean IP>       Proxied
CNAME   www     cname.vercel-dns.com   Proxied
```

#### 6.3 Create SSL/TLS Certificate
1. Cloudflare → SSL/TLS → Overview
2. Set to "Full" mode
3. Enable "Always Use HTTPS"

#### 6.4 Configure Caching Rules
Create page rules for:
- `/api/*` - Cache Level: Bypass
- `/static/*` - Cache Level: Cache Everything
- `/*` - Always Use HTTPS

### Phase 7: CI/CD Pipeline

#### 7.1 GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd web && npm ci
          cd ../server && npm ci
      
      - name: Run tests
        run: |
          cd web && npm test
          cd ../server && npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to DigitalOcean
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DO_HOST }}
          username: root
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /root/islandfund
            git pull
            docker-compose -f docker-compose.prod.yml up -d --build
```

### Phase 8: Monitoring & Logging

#### 8.1 Set Up Monitoring
- **Uptime**: Use Cloudflare Workers or DigitalOcean Monitoring
- **Logs**: Set up centralized logging with Logtail or Datadog
- **Errors**: Integrate Sentry for error tracking

#### 8.2 Configure Health Checks
Backend endpoint: `GET /health`
```typescript
// Add to server/src/index.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Checklist Summary

- [ ] Create production environment files
- [ ] Set up Neon/Supabase PostgreSQL database
- [ ] Set up Redis Cloud account
- [ ] Deploy backend to DigitalOcean/Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure Cloudflare DNS and SSL
- [ ] Set up CI/CD pipeline with GitHub Actions
- [ ] Configure monitoring and logging
- [ ] Test deployment in staging
- [ ] Update production DNS
- [ ] Verify all features work

## Estimated Costs

### Monthly Costs (Production)
- **Frontend (Vercel)**: Free (if under limits)
- **Backend (DigitalOcean)**: $4-24/month
- **Database (Neon)**: Free tier available
- **Redis (Redis Cloud)**: Free tier available
- **Domain + SSL**: Included with Cloudflare
- **CDN/Caching**: Free with Cloudflare

### Total: $4-24/month (can be free with generous free tiers)

## Rollback Plan

If deployment fails:
1. Revert to previous Docker image: `docker-compose -f docker-compose.prod.yml up -d previous_image`
2. Point DNS back to previous server
3. Restore from backup: `pg_dump` for database
4. Check logs: `docker-compose logs`

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use SSL connections, rotate credentials regularly
3. **API**: Rate limiting, input validation, helmet.js
4. **HTTPS**: Always use TLS/SSL
5. **Backup**: Daily automated backups for database
