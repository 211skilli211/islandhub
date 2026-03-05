# IslandHub Agent Infrastructure Deployment Guide

Complete deployment guide for ZeroClaw, LibreChat, and Agent Browser integration.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Deployment Options](#deployment-options)
5. [Security Checklist](#security-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ISLANDHUB PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Frontend (Next.js)          Backend (Express)          Database            │
│   ├── Port: 3000              ├── Port: 5001           ├── PostgreSQL      │
│   └── /admin/agent-panel      └── /admin/*             └── Redis            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           AGENT INFRASTRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ZeroClaw Gateway           WebSocket Proxy            LibreChat            │
│   ├── Port: 3001             ├── Port: 5002            ├── Port: 3080      │
│   └── ~/.zeroclaw/           └── FastAPI               └── MongoDB         │
│                                                                              │
│   Agent Browser (CLI)                                                        │
│   └── Automated audits via cron                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Software

- **Docker** 24.0+ and Docker Compose
- **Node.js** 18+ (for agent-browser CLI)
- **Git** for cloning repositories

### API Keys Required

1. **OpenRouter API Key** (for LLM access)
   - Sign up at: https://openrouter.ai
   - Required for ZeroClaw agents

2. **ZeroClaw API Key** (generate during setup)
   ```bash
   openssl rand -hex 32
   ```

---

## Environment Variables

Create `.env.agents` file:

```bash
# ── Core API Keys ───────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-v1-...
ZEROCLAW_API_KEY=your_generated_key
ZEROCLAW_ADMIN_KEY=your_admin_key

# ── IslandHub Integration ──────────────────────────────────────
API_URL=http://localhost:5001
WEB_URL=http://localhost:3000
ADMIN_TOKEN=your_jwt_admin_token
JWT_SECRET=your_jwt_secret

# ── Database (for LibreChat) ───────────────────────────────────
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure_password

# ── Security ───────────────────────────────────────────────────
ZEROCLAW_ENCRYPTION_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001
```

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Development)

```bash
# 1. Start core IslandHub services
docker-compose up -d postgres redis server web

# 2. Start agent infrastructure
docker-compose -f docker-compose.agents.yml up -d

# 3. Verify services
./scripts/check-agents.sh
```

### Option 2: Railway Deployment (Production)

```yaml
# railway.yaml
services:
  zeroclaw:
    image: ghcr.io/zeroclaw-labs/zeroclaw:latest
    port: 3001
    env:
      OPENROUTER_API_KEY: ${{ OPENROUTER_API_KEY }}
      ZEROCLAW_CONFIG: /app/config/config.toml
    volumes:
      - zeroclaw/config.toml:/app/config/config.toml

  librechat:
    image: ghcr.io/danny-avila/librechat:latest
    port: 3080
    env:
      MONGO_URI: ${{ MongoDB.MONGO_URI }}
      ZEROCLAW_URL: http://zeroclaw:3001

  websocket-proxy:
    build: ./server/src/zeroclaw-proxy
    port: 5002
    env:
      ZEROCLAW_URL: http://zeroclaw:3001
      API_URL: http://server:5001
```

Deploy:
```bash
railway login
railway link
railway up
```

### Option 3: Manual Installation

#### ZeroClaw Installation

```bash
# Install ZeroClaw (Rust binary)
curl -fsSL https://zeroclawlabs.ai/install.sh | bash

# Or build from source
git clone https://github.com/zeroclaw-labs/zeroclaw
cd zeroclaw
cargo build --release

# Copy binary to PATH
sudo cp target/release/zeroclaw /usr/local/bin/

# Create config directory
mkdir -p ~/.zeroclaw
cp zeroclaw/config.toml ~/.zeroclaw/

# Start ZeroClaw
zeroclaw --config ~/.zeroclaw/config.toml
```

#### LibreChat Installation

```bash
# Clone LibreChat
git clone https://github.com/danny-avila/LibreChat
cd LibreChat

# Copy config
cp ../librechat/chat.yml ./librechat.yaml

# Start with Docker
docker-compose up -d
```

#### Agent Browser Installation

```bash
# Install globally
npm install -g agent-browser

# Install browser binaries
agent-browser install

# Verify installation
agent-browser --version
```

---

## Security Checklist

### ZeroClaw Security

- [ ] Pairing codes required for admin operations
- [ ] Shell commands restricted to approved scripts
- [ ] API keys rotated every 90 days
- [ ] Encryption enabled for memory storage
- [ ] Gateway bound to 127.0.0.1 (not 0.0.0.0)
- [ ] Rate limiting enabled

### LibreChat Security

- [ ] Admin endpoints require additional auth
- [ ] File uploads scanned for malware
- [ ] WebSocket connections authenticated
- [ ] MongoDB authentication enabled
- [ ] HTTPS enforced in production

### Agent Browser Security

- [ ] Action policy restricts dangerous operations
- [ ] Allowed domains whitelist configured
- [ ] Screenshots stored securely
- [ ] No sensitive data in snapshots
- [ ] CI/CD secrets in GitHub Secrets (not repo)

### Network Security

- [ ] Docker networks isolated
- [ ] ZeroClaw not exposed publicly
- [ ] LibreChat behind reverse proxy
- [ ] SSL/TLS on all external endpoints
- [ ] Firewall rules configured

---

## Cron Jobs for Automated Audits

Add to crontab (`crontab -e`):

```bash
# Daily marketplace scan at 2 AM
0 2 * * * cd /opt/islandhub && ./zeroclaw/tools/audit-marketplace.sh --type=all >> /var/log/islandhub/audit.log 2>&1

# Price monitoring every 4 hours
0 */4 * * * cd /opt/islandhub && ./zeroclaw/tools/audit-marketplace.sh --type=prices >> /var/log/islandhub/prices.log 2>&1

# Fraud check every 6 hours
0 */6 * * * cd /opt/islandhub && ./zeroclaw/tools/audit-marketplace.sh --type=fraud >> /var/log/islandhub/fraud.log 2>&1

# Clean old audit logs weekly (keep 30 days)
0 3 * * 0 find /var/log/islandhub -name "*.log" -mtime +30 -delete
```

---

## Troubleshooting

### ZeroClaw Connection Issues

```bash
# Check if ZeroClaw is running
curl http://localhost:3001/health

# View logs
docker logs islandfund_zeroclaw

# Restart service
docker-compose -f docker-compose.agents.yml restart zeroclaw
```

### WebSocket Proxy Issues

```bash
# Test WebSocket connection
wscat -c "ws://localhost:5002/ws/admin?token=YOUR_TOKEN"

# Check proxy health
curl http://localhost:5002/health
```

### LibreChat Issues

```bash
# Check LibreChat logs
docker logs islandfund_librechat

# Verify MongoDB connection
docker exec islandfund_librechat_mongo mongosh --eval "db.adminCommand('ping')"
```

### Agent Browser Issues

```bash
# Verify installation
agent-browser --version

# Test connectivity
agent-browser open http://localhost:3000

# Debug mode
agent-browser --debug open http://localhost:3000
```

---

## Integration Verification

Run the verification script:

```bash
./scripts/verify-agents.sh
```

Expected output:
```
✅ ZeroClaw Gateway: Connected (port 3001)
✅ WebSocket Proxy: Connected (port 5002)
✅ LibreChat: Connected (port 3080)
✅ Agent Browser: Installed (v0.15.3)
✅ IslandHub API: Connected (port 5001)

All systems operational! 🎉
```

---

## Next Steps

1. Access admin panel at: `http://localhost:3000/admin/agent-panel`
2. Access LibreChat at: `http://localhost:3080`
3. View audit results in: `./audit-results/`
4. Check agent logs in: `./zeroclaw/logs/`

---

## Support

- **ZeroClaw Docs**: https://docs.zeroclawlabs.ai
- **LibreChat Docs**: https://docs.librechat.ai
- **Agent Browser**: https://github.com/vercel-labs/agent-browser
- **IslandHub Issues**: https://github.com/211skilli211/islandhub/issues
