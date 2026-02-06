# Account Setup Guide for Deployment

## Step 1: Create Neon Account (PostgreSQL Database)

1. **Go to**: https://neon.tech
2. **Click**: "Sign Up" (use GitHub or email)
3. **Create Project**:
   - Name: `islandfund-prod`
   - Select closest region to your users
4. **Get Connection String**:
   - Go to "Connection Details"
   - Copy the connection string: `postgres://user:password@ep-xxx.neon.tech/dbname?sslmode=require`
   - Save this - you'll need it later

## Step 2: Create Redis Cloud Account

1. **Go to**: https://redis.com/cloud
2. **Click**: "Start Free" or "Sign Up"
3. **Create Database**:
   - Click "Create Database"
   - Name: `islandfund-cache`
   - Select free plan
4. **Get Credentials**:
   - Look for "Connection Details"
   - Note: Host, Port (usually 6379), and Password

## Step 3: Create Vercel Account (Frontend)

1. **Go to**: https://vercel.com
2. **Click**: "Sign Up"
3. **Choose**: "Continue with GitHub" (easiest)
4. **Authorize**: Vercel to access your GitHub
5. **Import Project**:
   - Click "Add New Project"
   - Select your `islandfund` repository
   - Set "Root Directory" to `web`

## Step 4: Create Railway Account (Backend - Easiest Option)

> **Note**: Railway is simpler than DigitalOcean for Express.js

1. **Go to**: https://railway.app
2. **Click**: "Sign Up"
3. **Choose**: "Continue with GitHub"
4. **Authorize**: Railway to access your GitHub

## Step 5: Connect Everything

After creating accounts, you'll have:
- ✅ Neon: Database connection string
- ✅ Redis: Host, port, password
- ✅ Vercel: Frontend deployed
- ✅ Railway: Backend deployed

## Quick Checklist

- [ ] Neon account created ✓
- [ ] Redis Cloud account created ✓
- [ ] Vercel account created ✓
- [ ] Railway account created ✓
- [ ] All credentials saved securely

## Next Steps After Account Setup

Once you have all accounts created, come back and I'll help you:
1. Configure environment variables
2. Set up database migrations
3. Deploy frontend to Vercel
4. Deploy backend to Railway
5. Configure domain and DNS
