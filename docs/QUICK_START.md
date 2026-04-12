# Quick Start: Production Deployment

## Prerequisites

1. **GitHub Account** with repository access
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Neon Account** (PostgreSQL) - Sign up at [neon.tech](https://neon.tech)
4. **Redis Cloud Account** - Sign up at [redis.com/cloud](https://redis.com/cloud)
5. **DigitalOcean Account** (for backend) - Sign up at [digitalocean.com](https://digitalocean.com)
6. **Cloudflare Account** - Already have it

## Step 1: Clone and Prepare

```bash
# Clone repository
git clone https://github.com/yourusername/islandfund.git
cd islandfund

# Make scripts executable
chmod +x deploy.sh scripts/setup-database.sh
```

## Step 2: Set Up Database (Neon)

1. Create account at [Neon.tech](https://neon.tech)
2. Create new project
3. Note the connection string: `postgres://user:password@ep-xxx.neon.tech/dbname?sslmode=require`
4. Run migrations:
```bash
./scripts/setup-database.sh "your_neon_connection_string"
```

## Step 3: Set Up Redis

1. Create account at [Redis Cloud](https://redis.com/cloud)
2. Create free database
3. Note connection details (host, port, password)

## Step 4: Configure Environment Variables

### Frontend
```bash
cd web
cp .env.production.example .env.production
# Edit .env.production with your values
```

### Backend
```bash
cd server
cp .env.production.example .env.production
# Edit .env.production with:
# - Neon PostgreSQL connection string
# - Redis Cloud connection string
# - Strong JWT secret (32+ characters)
```

## Step 5: Deploy Frontend to Vercel

1. Import project in Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Select your GitHub repository
   - Set root directory: `web`

2. Add environment variables in Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. Deploy

## Step 6: Deploy Backend to DigitalOcean

1. Create Ubuntu 22.04 Droplet ($4/month)
2. SSH into server and install Docker:
```bash
ssh root@your_server_ip
apt update
apt install -y docker.io docker-compose
systemctl start docker
```

3. Clone repository and deploy:
```bash
git clone https://github.com/yourusername/islandfund.git
cd islandfund
cp server/.env.production.example server/.env.production
# Edit with actual values
./deploy.sh production
```

## Step 7: Configure Cloudflare

1. Add domain in Cloudflare
2. Update DNS records:
   ```
   A       @       <DigitalOcean_Server_IP>
   A       api     <DigitalOcean_Server_IP>
   CNAME    www     cname.vercel-dns.com
   ```

3. Enable SSL/TLS:
   - SSL/TLS Overview → Full mode
   - Always Use HTTPS → Enabled

## Step 8: Configure GitHub Secrets

Add these in GitHub → Settings → Secrets:

| Secret Name | Description |
|-------------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `DO_HOST` | DigitalOcean server IP |
| `DO_SSH_KEY` | SSH private key |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `DB_HOST` | Neon PostgreSQL host |
| `DB_PORT` | Neon PostgreSQL port (5432) |
| `DB_NAME` | Neon database name |
| `DB_USER` | Neon database user |
| `DB_PASSWORD` | Neon database password |
| `REDIS_HOST` | Redis Cloud host |
| `REDIS_PORT` | Redis Cloud port (6379) |
| `REDIS_PASSWORD` | Redis Cloud password |
| `JWT_SECRET` | Strong JWT secret |
| `ALLOWED_ORIGINS` | Allowed CORS origins |

## Step 9: Deploy!

```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

This triggers the CI/CD pipeline which will:
1. Run tests
2. Deploy frontend to Vercel
3. Deploy backend to DigitalOcean

## Verification

After deployment, check:
- ✅ Frontend: https://yourdomain.com
- ✅ API: https://api.yourdomain.com/health
- ✅ Health check returns `{ "status": "ok" }`

## Troubleshooting

### Frontend not loading
- Check Vercel deployment logs
- Verify environment variables are set

### API not responding
- Check DigitalOcean server logs: `docker-compose logs server`
- Verify database connection string
- Check Redis is accessible

### CORS errors
- Verify `ALLOWED_ORIGINS` includes your frontend domain
- Check Cloudflare CORS settings

## Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | ✅ | $20+/mo |
| Neon PostgreSQL | ✅ | $19+/mo |
| Redis Cloud | ✅ | $7+/mo |
| DigitalOcean | ❌ | $4+/mo |
| Cloudflare | ✅ | Free |

**Total: ~$4-10/month (with free tiers)**
