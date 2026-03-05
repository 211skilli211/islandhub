# IslandHub Agent Integration Architecture

> Comprehensive integration plan for Vercel Agent Browser, ZeroClaw, and Libre Chat
> Infrastructure-flexible: Works with Docker, Railway, Neon, or Vercel deployments

---

## 1. Current IslandHub Architecture Analysis

### 1.1 Existing Stack
```
┌─────────────────────────────────────────────────────────────────┐
│                         ISLANDHUB PLATFORM                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 16+, React 19)                               │
│  ├── Port: 3000                                                 │
│  ├── Admin: /admin/*, /admin/dashboard, /admin/analytics       │
│  ├── Vendor: /dashboard/*                                       │
│  └── Customer: /browse, /cart, /checkout, /orders              │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Express.js, TypeScript)                          │
│  ├── Port: 5001                                                 │
│  ├── Auth: JWT-based (/auth/*)                                 │
│  ├── Admin API: /admin/* (requires JWT + admin role)           │
│  ├── Vendor API: /vendor/*                                     │
│  └── Public API: /products, /listings, /stores                 │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── PostgreSQL (main database)                                │
│  └── Redis (sessions, cache)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Controllers & Integration Points
- **AdminController**: Dashboard stats, user management, audit logs
- **VendorController**: Store management, product listings
- **OrderController**: Order processing, fulfillment
- **SearchController**: Product/search functionality
- **AnalyticsController**: Business intelligence data

### 1.3 Existing Security
- JWT authentication middleware
- Role-based access control (admin, vendor, customer, driver)
- Rate limiting with express-rate-limit
- Helmet.js for security headers

---

## 2. Integration Architecture Overview

### 2.1 High-Level Design
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ISLANDHUB WITH AI AGENTS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   Customer-Facing    │  │   Admin/Internal     │  │   Automation     │  │
│  │                      │  │                      │  │                  │  │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │  │  ┌────────────┐  │  │
│  │  │   Libre Chat   │  │  │  │  ZeroClaw      │  │  │  │  Agent     │  │  │
│  │  │   (Customer)   │  │  │  │  Agents        │  │  │  │  Browser   │  │  │
│  │  │   Port: 3080   │  │  │  │  Port: 3001    │  │  │  │  Audits    │  │  │
│  │  └───────┬────────┘  │  │  └───────┬────────┘  │  │  └─────┬──────┘  │  │
│  │          │           │  │          │           │  │        │         │  │
│  │          ▼           │  │          ▼           │  │        ▼         │  │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │  │  ┌────────────┐  │  │
│  │  │  Customer      │  │  │  │  Admin         │  │  │  │  Post-     │  │  │
│  │  │  Service Agent │◄─┼──┼──┤  Override      │  │  │  │  Deploy    │  │  │
│  │  │  (ZeroClaw)    │  │  │  │  Console       │  │  │  │  Testing   │  │  │
│  │  └────────────────┘  │  │  └────────────────┘  │  │  └────────────┘  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│           │                         │                      │                │
│           └─────────────────────────┼──────────────────────┘                │
│                                     ▼                                       │
│                         ┌─────────────────────┐                             │
│                         │   IslandHub API     │                             │
│                         │   Port: 5001        │                             │
│                         └─────────────────────┘                             │
│                                     │                                       │
│                    ┌────────────────┼────────────────┐                      │
│                    ▼                ▼                ▼                      │
│              ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│              │ Postgres │    │  Redis   │    │  WebSocket│                  │
│              │  (Neon)  │    │ (Upstash)│    │  Proxy    │                  │
│              └──────────┘    └──────────┘    └──────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ZeroClaw Configuration

### 3.1 Directory Structure
```
islandfund/
├── zeroclaw/
│   ├── config.toml                 # Main ZeroClaw configuration
│   ├── agents/
│   │   ├── directory-manager.json  # Vendor compliance agent
│   │   ├── admin-console.json      # Admin override agent
│   │   ├── vendor-helper.json      # Vendor onboarding agent
│   │   ├── marketplace-auditor.json # Fraud/price monitoring
│   │   └── customer-service.json   # Customer support agent
│   ├── tools/
│   │   ├── islandhub-api.sh        # API wrapper scripts
│   │   ├── db-queries.sql          # Safe DB operations
│   │   └── audit-scripts/          # Marketplace audit tools
│   └── logs/                       # Agent activity logs
```

### 3.2 ZeroClaw Config (config.toml)
```toml
# =============================================================================
# ZeroClaw Configuration for IslandHub
# =============================================================================

[server]
name = "islandhub-zeroclaw"
port = 3001
host = "127.0.0.1"
log_level = "info"

# =============================================================================
# Security Configuration
# =============================================================================

[security]
require_pairing = true
allow_public_bind = false
pairing_code_ttl = 3600  # 1 hour
max_failed_attempts = 3
lockout_duration = 300   # 5 minutes

[tools.shell]
# Only allow approved scripts - NO arbitrary command execution
allowed_commands = [
    "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
    "/opt/islandhub/zeroclaw/tools/audit-marketplace.sh",
    "/opt/islandhub/zeroclaw/tools/check-vendor-compliance.sh"
]

[channels.admin]
allowlist = [
    "admin@islandfund.com",
    "ops@islandfund.com"
]

[channels.vendor]
allowlist = [
    "vendors@islandfund.com"
]

# =============================================================================
# Agent Definitions
# =============================================================================

[[agents]]
id = "directory-manager"
name = "Directory Manager"
personality = "agents/directory-manager.json"
enabled = true
rate_limit = "100/hour"

[[agents]]
id = "admin-console"
name = "Admin Override Console"
personality = "agents/admin-console.json"
enabled = true
require_pairing = true
rate_limit = "20/hour"

[[agents]]
id = "vendor-helper"
name = "Vendor Integration Helper"
personality = "agents/vendor-helper.json"
enabled = true
rate_limit = "200/hour"

[[agents]]
id = "marketplace-auditor"
name = "Marketplace Auditor"
personality = "agents/marketplace-auditor.json"
enabled = true
rate_limit = "50/hour"

[[agents]]
id = "customer-service"
name = "IslandHub Assistant"
personality = "agents/customer-service.json"
enabled = true
rate_limit = "500/hour"

# =============================================================================
# Database Connection (for agent state)
# =============================================================================

[database]
type = "postgres"
url = "${DATABASE_URL}"  # From env var
pool_size = 10

[redis]
url = "${REDIS_URL}"  # From env var
```

### 3.3 Agent Personalities

#### Directory Manager Agent
```json
{
  "identity": {
    "name": "Directory Manager",
    "role": "Vendor compliance and marketplace curation",
    "bio": "I review vendor submissions, ensure compliance with marketplace standards, and maintain directory quality for IslandHub Caribbean marketplace"
  },
  "tools": {
    "review_vendor": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "GET",
      "endpoint": "/admin/vendor-verification/pending"
    },
    "approve_vendor": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "POST",
      "endpoint": "/admin/vendor-verification/{vendor_id}/approve"
    },
    "reject_vendor": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "POST",
      "endpoint": "/admin/vendor-verification/{vendor_id}/reject"
    },
    "check_compliance": {
      "command": "/opt/islandhub/zeroclaw/tools/check-vendor-compliance.sh",
      "args": ["{vendor_id}"]
    }
  },
  "policies": {
    "auto_approve_threshold": 0.85,
    "require_human_review": ["financial_services", "healthcare", "legal"],
    "checklist": [
      "Business registration valid",
      "KYB documents complete",
      "No fraud indicators",
      "Product category approved"
    ]
  }
}
```

#### Admin Override Console Agent
```json
{
  "identity": {
    "name": "Admin Override Console",
    "role": "Emergency admin operations with pairing code safety",
    "bio": "I provide secure administrative override capabilities with mandatory pairing code verification for sensitive IslandHub operations"
  },
  "tools": {
    "get_dashboard_stats": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "GET",
      "endpoint": "/admin/stats"
    },
    "suspend_vendor": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "POST",
      "endpoint": "/admin/vendor-verification/{vendor_id}/suspend",
      "requires_pairing": true
    },
    "emergency_refund": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "POST",
      "endpoint": "/admin/orders/{order_id}/refund",
      "requires_pairing": true
    },
    "view_audit_logs": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "GET",
      "endpoint": "/admin/audit-logs"
    }
  },
  "policies": {
    "all_actions_require_pairing": true,
    "pairing_code_length": 8,
    "audit_all_commands": true,
    "notify_on_override": ["admin@islandfund.com", "ops@islandfund.com"]
  }
}
```

#### Vendor Integration Helper
```json
{
  "identity": {
    "name": "Vendor Integration Helper",
    "role": "Vendor onboarding and technical support",
    "bio": "I help vendors onboard to IslandHub, configure webhooks, validate integrations, and troubleshoot technical issues"
  },
  "tools": {
    "validate_webhook": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "POST",
      "endpoint": "/vendor/webhooks/validate"
    },
    "get_store_status": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "GET",
      "endpoint": "/vendor/stores/{store_id}/status"
    },
    "check_inventory_sync": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "GET",
      "endpoint": "/vendor/inventory/sync-status"
    },
    "generate_api_key": {
      "command": "/opt/islandhub/zeroclaw/tools/islandhub-api.sh",
      "method": "POST",
      "endpoint": "/vendor/api-keys"
    }
  },
  "onboarding_flow": [
    "Verify business documents",
    "Create store profile",
    "Configure payment methods",
    "Set up inventory sync",
    "Test order webhook",
    "Go live checklist"
  ]
}
```

#### Marketplace Auditor Agent
```json
{
  "identity": {
    "name": "Marketplace Auditor",
    "role": "Continuous marketplace monitoring and fraud detection",
    "bio": "I perform daily scans of IslandHub marketplace to detect price anomalies, fraudulent listings, compliance violations, and data quality issues"
  },
  "tools": {
    "scan_listings": {
      "command": "/opt/islandhub/zeroclaw/tools/audit-marketplace.sh",
      "args": ["--type=listings"]
    },
    "check_price_anomalies": {
      "command": "/opt/islandhub/zeroclaw/tools/audit-marketplace.sh",
      "args": ["--type=prices"]
    },
    "detect_fraud_patterns": {
      "command": "/opt/islandhub/zeroclaw/tools/audit-marketplace.sh",
      "args": ["--type=fraud"]
    },
    "generate_report": {
      "command": "/opt/islandhub/zeroclaw/tools/audit-marketplace.sh",
      "args": ["--type=report", "--output=daily"]
    }
  },
  "schedule": {
    "daily_scan": "0 2 * * *",
    "fraud_check": "0 */6 * * *",
    "price_monitor": "0 */4 * * *"
  },
  "thresholds": {
    "price_variance": 0.30,
    "duplicate_listing_similarity": 0.85,
    "suspicious_activity_score": 0.75
  }
}
```

#### Customer Service Agent
```json
{
  "identity": {
    "names": {
      "first": "IslandHub Assistant"
    },
    "bio": "Expert in product discovery, order tracking, and IslandHub marketplace operations for the Caribbean market"
  },
  "tools": {
    "search_products": {
      "command": "curl -s -X GET",
      "endpoint": "http://localhost:5001/products?q={query}&limit=10"
    },
    "track_order": {
      "command": "curl -s -X GET",
      "endpoint": "http://localhost:5001/orders/{order_id}"
    },
    "check_inventory": {
      "command": "curl -s -X GET",
      "endpoint": "http://localhost:5001/products/{product_id}/inventory"
    },
    "get_store_info": {
      "command": "curl -s -X GET",
      "endpoint": "http://localhost:5001/stores/{store_id}"
    },
    "browse_category": {
      "command": "curl -s -X GET",
      "endpoint": "http://localhost:5001/products?category={category}&island={island}"
    }
  },
  "capabilities": [
    "Search products by name, category, or island",
    "Track order status and delivery",
    "Check product availability",
    "Find stores by location",
    "Answer questions about shipping to Caribbean islands",
    "Help with returns and refunds",
    "Recommend products based on preferences"
  ]
}
```

---

## 4. Vercel Agent Browser Integration

### 4.1 Integration Points

#### A. Post-Deployment Auditing (CI/CD Pipeline)
```yaml
# .github/workflows/deploy-and-audit.yml
name: Deploy and Audit

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Install Agent Browser
        run: npm install -g agent-browser
      
      - name: Run Post-Deploy Audit
        run: |
          agent-browser open $DEPLOY_URL && \
          agent-browser wait --load networkidle && \
          agent-browser snapshot -i > audit-results/homepage.json && \
          agent-browser screenshot --full audit-results/homepage.png
```

#### B. Natural Language Search Component
```typescript
// web/src/components/NaturalLanguageSearch.tsx
'use client';

import { useState } from 'react';

interface AgentBrowserClient {
  query: (instruction: string) => Promise<any>;
}

export function NaturalLanguageSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Call API route that uses agent-browser
      const response = await fetch('/api/agent-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="natural-language-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try: Show me products under $50 in St. Kitts"
        className="search-input"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {results && (
        <div className="results">
          {/* Render results */}
        </div>
      )}
    </div>
  );
}
```

#### C. API Route for Agent Browser
```typescript
// web/src/app/api/agent-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    // Parse natural language query
    const parsed = parseQuery(query);
    
    // Use agent-browser to execute search on the live site
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Build agent-browser command chain
    const commands = buildCommandChain(parsed, baseUrl);
    
    // Execute agent-browser
    const { stdout } = await execAsync(commands);
    const snapshot = JSON.parse(stdout);
    
    // Extract relevant data from snapshot
    const results = extractResults(snapshot, parsed);
    
    return NextResponse.json({
      success: true,
      query: parsed,
      results,
      snapshot
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

function parseQuery(query: string) {
  // Parse queries like:
  // "products under $50 in St. Kitts"
  // "tours available next weekend"
  // "vegan restaurants in Nevis"
  
  const patterns = {
    price: /under\s+\$?(\d+)/i,
    location: /in\s+([\w\s]+)/i,
    category: /(tours|products|restaurants|rentals)/i,
    date: /(today|tomorrow|this weekend|next week)/i
  };
  
  return {
    maxPrice: query.match(patterns.price)?.[1],
    location: query.match(patterns.location)?.[1]?.trim(),
    category: query.match(patterns.category)?.[1],
    date: query.match(patterns.date)?.[1]
  };
}

function buildCommandChain(parsed: any, baseUrl: string): string {
  // Build agent-browser command sequence
  const searchUrl = `${baseUrl}/search?q=${encodeURIComponent(parsed.category || '')}`;
  
  return `
    agent-browser open "${searchUrl}" && \
    agent-browser wait --load networkidle && \
    ${parsed.maxPrice ? `agent-browser fill "input[name='maxPrice']" "${parsed.maxPrice}" && \
    agent-browser press Enter && \
    agent-browser wait 1000 &&` : ''}
    agent-browser snapshot -i --json
  `;
}

function extractResults(snapshot: any, parsed: any) {
  // Extract products/listings from accessibility tree
  return snapshot.elements
    ?.filter((el: any) => el.role === 'link' && el.name?.includes('$'))
    ?.map((el: any) => ({
      name: el.name,
      price: extractPrice(el.name),
      ref: el.ref
    })) || [];
}

function extractPrice(text: string): number | null {
  const match = text.match(/\$([\d,]+\.?\d*)/);
  return match ? parseFloat(match[1].replace(',', '')) : null;
}
```

### 4.2 Agent Browser Configuration
```json
{
  "name": "IslandHub Agent Browser",
  "version": "1.0.0",
  "browser": {
    "headed": false,
    "viewport": { "width": 1920, "height": 1080 },
    "ignoreHTTPSErrors": true
  },
  "security": {
    "allowedDomains": [
      "localhost",
      "*.vercel.app",
      "islandfund.com",
      "*.islandfund.com"
    ],
    "actionPolicy": "./audit-action-policy.json"
  },
  "screenshots": {
    "path": "./audit-screenshots",
    "fullPage": true
  }
}
```

---

## 5. Libre Chat Integration

### 5.1 Docker Compose Addition
```yaml
# Add to docker-compose.yml

  librechat:
    image: ghcr.io/danny-avila/librechat:latest
    container_name: islandfund_librechat
    restart: always
    ports:
      - "3080:3080"
    environment:
      # Core
      HOST: "0.0.0.0"
      PORT: "3080"
      
      # MongoDB (for LibreChat state)
      MONGO_URI: "${LIBRECHAT_MONGO_URI:-mongodb://librechat-mongo:27017/LibreChat}"
      
      # Redis (shared with IslandHub)
      REDIS_URI: "redis://redis:6379"
      
      # ZeroClaw Integration
      ZEROCLAW_URL: "http://host.docker.internal:3001"
      ZEROCLAW_API_KEY: "${ZEROCLAW_API_KEY}"
      
      # OpenAI/Azure (for LLM)
      OPENAI_API_KEY: "${OPENAI_API_KEY}"
      
      # IslandHub Branding
      APP_TITLE: "IslandHub Support"
      CUSTOM_FOOTER: "Powered by IslandHub Caribbean Marketplace"
      
    volumes:
      - ./librechat/chat.yml:/app/librechat.yaml:ro
      - librechat_uploads:/app/uploads
    depends_on:
      - librechat-mongo
    networks:
      - islandfund_network
    extra_hosts:
      - "host.docker.internal:host-gateway"

  librechat-mongo:
    image: mongo:6
    container_name: islandfund_librechat_mongo
    restart: always
    volumes:
      - librechat_mongo_data:/data/db
    networks:
      - islandfund_network

volumes:
  librechat_uploads:
  librechat_mongo_data:
```

### 5.2 LibreChat Configuration (chat.yml)
```yaml
# LibreChat Configuration for IslandHub
version: 1.0.0

# Endpoints configuration
endpoints:
  custom:
    - name: "IslandHub Agents"
      apiKey: "${ZEROCLAW_API_KEY}"
      baseURL: "http://host.docker.internal:3001/v1"
      models:
        default: ["customer-service", "vendor-helper"]
        fetch: false
      titleConvo: true
      titleModel: "customer-service"
      summarize: false
      
    - name: "Admin Console"
      apiKey: "${ZEROCLAW_ADMIN_KEY}"
      baseURL: "http://host.docker.internal:3001/v1"
      models:
        default: ["admin-console", "directory-manager"]
      requireApproval: true

# Interface customization
interface:
  branding:
    appName: "IslandHub Support"
    appDescription: "Your Caribbean Marketplace Assistant"
    logo: "/assets/islandhub-logo.svg"
    
  welcomeMessage: |
    👋 Welcome to IslandHub!
    
    I'm your AI assistant for the Caribbean's premier marketplace. 
    I can help you:
    • Find products and services across islands
    • Track your orders
    • Discover local vendors
    • Answer questions about shipping
    
    What would you like to explore today?
    
  promptLibrary:
    - title: "Find Products"
      prompt: "Show me products under $50 in St. Kitts"
    - title: "Track Order"
      prompt: "Where is my order #12345?"
    - title: "Browse Tours"
      prompt: "What tours are available in Nevis this weekend?"
    - title: "Local Restaurants"
      prompt: "Find vegan restaurants near me"

# Security
registration:
  enabled: true
  socialLogin: true
  
# File uploads
fileConfig:
  endpoints:
    default: 10
  
# Rate limiting
rateLimits:
  fileUploads: 10
  conversations: 50
  
# Plugins
plugins:
  enabled: true
  available:
    - "web-search"
    - "islandhub-api"
```

---

## 6. FastAPI WebSocket Proxy

### 6.1 WebSocket Proxy Service
```python
# server/src/zeroclaw-proxy/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
from typing import Optional
import httpx

app = FastAPI(title="IslandHub ZeroClaw Proxy")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ZeroClaw connection manager
class ZeroClawManager:
    def __init__(self):
        self.zeroclaw_url = os.getenv("ZEROCLAW_URL", "http://localhost:3001")
        self.api_key = os.getenv("ZEROCLAW_API_KEY")
        
    async def send_command(self, agent_id: str, command: str, params: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.zeroclaw_url}/agents/{agent_id}/command",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"command": command, "params": params}
            )
            return response.json()

zeroclaw = ZeroClawManager()

# WebSocket endpoint for admin dashboard
@app.websocket("/ws/admin")
async def admin_websocket(websocket: WebSocket):
    await websocket.accept()
    
    # Verify JWT token
    token = websocket.query_params.get("token")
    if not verify_admin_token(token):
        await websocket.close(code=4001, reason="Unauthorized")
        return
    
    try:
        while True:
            # Receive message from admin dashboard
            data = await websocket.receive_text()
            message = json.loads(data)
            
            agent_id = message.get("agent")
            command = message.get("command")
            params = message.get("params", {})
            
            # Forward to ZeroClaw
            result = await zeroclaw.send_command(agent_id, command, params)
            
            # Send response back to dashboard
            await websocket.send_json({
                "status": "success",
                "agent": agent_id,
                "result": result
            })
            
    except WebSocketDisconnect:
        print("Admin disconnected")
    except Exception as e:
        await websocket.send_json({
            "status": "error",
            "error": str(e)
        })

# WebSocket for customer chat (via LibreChat)
@app.websocket("/ws/customer")
async def customer_websocket(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Route to customer-service agent
            result = await zeroclaw.send_command(
                "customer-service",
                "chat",
                {
                    "message": message.get("text"),
                    "session_id": message.get("session_id"),
                    "user_id": message.get("user_id")
                }
            )
            
            await websocket.send_json({
                "response": result.get("response"),
                "actions": result.get("actions", [])
            })
            
    except WebSocketDisconnect:
        pass

def verify_admin_token(token: Optional[str]) -> bool:
    # JWT verification logic
    # Return True if valid admin token
    return True  # Implement actual verification

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
```

### 6.2 Admin Dashboard WebSocket Component
```typescript
// web/src/components/admin/AgentControlPanel.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

interface AgentMessage {
  status: string;
  agent: string;
  result: any;
  timestamp: Date;
}

export function AgentControlPanel() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('directory-manager');
  const [command, setCommand] = useState('');

  useEffect(() => {
    // Get admin JWT token
    const token = localStorage.getItem('admin_token');
    
    // Connect to WebSocket proxy
    const wsUrl = `ws://localhost:5002/ws/admin?token=${token}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, { ...data, timestamp: new Date() }]);
    };
    
    setWs(socket);
    
    return () => socket.close();
  }, []);

  const sendCommand = useCallback(() => {
    if (ws && command) {
      ws.send(JSON.stringify({
        agent: selectedAgent,
        command: command,
        params: {}
      }));
      setCommand('');
    }
  }, [ws, command, selectedAgent]);

  return (
    <div className="agent-control-panel">
      <div className="connection-status">
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="agent-selector">
        <select 
          value={selectedAgent} 
          onChange={(e) => setSelectedAgent(e.target.value)}
        >
          <option value="directory-manager">Directory Manager</option>
          <option value="admin-console">Admin Console</option>
          <option value="marketplace-auditor">Marketplace Auditor</option>
          <option value="vendor-helper">Vendor Helper</option>
        </select>
      </div>
      
      <div className="command-input">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command..."
          onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
        />
        <button onClick={sendCommand} disabled={!connected}>
          Send
        </button>
      </div>
      
      <div className="message-log">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            <span className="timestamp">{msg.timestamp.toLocaleTimeString()}</span>
            <span className="agent">[{msg.agent}]</span>
            <span className={`status ${msg.status}`}>{msg.status}</span>
            <pre>{JSON.stringify(msg.result, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Audit Automation Scripts

### 7.1 Marketplace Audit Script
```bash
#!/bin/bash
# zeroclaw/tools/audit-marketplace.sh

set -e

API_BASE="${API_URL:-http://localhost:5001}"
AUDIT_TYPE="${1:---type=listings}"
OUTPUT_DIR="${OUTPUT_DIR:-./audit-results}"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$OUTPUT_DIR"

echo "Starting IslandHub Marketplace Audit..."
echo "Type: $AUDIT_TYPE"
echo "Date: $DATE"

# Run agent-browser audit
case $AUDIT_TYPE in
  --type=listings)
    echo "Checking listings quality..."
    agent-browser open "$API_BASE/admin/listings" \
      && agent-browser wait --load networkidle \
      && agent-browser snapshot -i > "$OUTPUT_DIR/listings_$DATE.json"
    ;;
    
  --type=prices)
    echo "Analyzing price anomalies..."
    curl -s "$API_BASE/admin/analytics/prices" \
      | jq '.' > "$OUTPUT_DIR/price_analysis_$DATE.json"
    ;;
    
  --type=fraud)
    echo "Running fraud detection..."
    curl -s "$API_BASE/admin/analytics/fraud-score" \
      | jq '.suspicious_activity[]' > "$OUTPUT_DIR/fraud_flags_$DATE.json"
    ;;
    
  --type=report)
    echo "Generating comprehensive report..."
    {
      echo "# IslandHub Daily Audit Report"
      echo "Date: $(date)"
      echo ""
      echo "## Listings Status"
      curl -s "$API_BASE/admin/stats" | jq '.listings'
      echo ""
      echo "## Vendor Compliance"
      curl -s "$API_BASE/admin/vendor-verification/pending" | jq '.count'
      echo ""
      echo "## Orders Today"
      curl -s "$API_BASE/admin/stats" | jq '.orders.today'
    } > "$OUTPUT_DIR/daily_report_$DATE.md"
    ;;
esac

echo "Audit complete. Results saved to $OUTPUT_DIR"
```

### 7.2 Cron Job Configuration
```bash
# Add to crontab for automated audits
# crontab -e

# Daily marketplace scan at 2 AM
0 2 * * * /opt/islandhub/zeroclaw/tools/audit-marketplace.sh --type=listings >> /var/log/islandhub/audit.log 2>&1

# Price monitoring every 4 hours
0 */4 * * * /opt/islandhub/zeroclaw/tools/audit-marketplace.sh --type=prices >> /var/log/islandhub/prices.log 2>&1

# Fraud check every 6 hours
0 */6 * * * /opt/islandhub/zeroclaw/tools/audit-marketplace.sh --type=fraud >> /var/log/islandhub/fraud.log 2>&1

# Daily report generation
30 23 * * * /opt/islandhub/zeroclaw/tools/audit-marketplace.sh --type=report >> /var/log/islandhub/reports.log 2>&1
```

---

## 8. Security Checklist

### 8.1 ZeroClaw Security
- [ ] Pairing codes required for all admin actions
- [ ] Shell access restricted to approved scripts only
- [ ] Agent allowlists configured per channel
- [ ] Rate limiting enabled on all agents
- [ ] Audit logging enabled for all commands
- [ ] Database connections use TLS
- [ ] Redis connections authenticated

### 8.2 Agent Browser Security
- [ ] Action policy restricts dangerous operations
- [ ] Allowed domains whitelist configured
- [ ] Screenshots stored securely
- [ ] No sensitive data in snapshots
- [ ] CI/CD secrets properly managed

### 8.3 LibreChat Security
- [ ] Admin endpoints require additional auth
- [ ] File uploads limited and scanned
- [ ] Rate limiting on chat endpoints
- [ ] WebSocket connections authenticated
- [ ] ZeroClaw API keys rotated regularly

### 8.4 Infrastructure Security
- [ ] Docker networks isolated
- [ ] No public exposure of ZeroClaw port
- [ ] LibreChat behind reverse proxy (nginx/traefik)
- [ ] SSL/TLS on all external endpoints
- [ ] Database credentials in secrets management

---

## 9. Deployment Instructions

### 9.1 Local Development
```bash
# 1. Install ZeroClaw
npm install -g zeroclaw

# 2. Install Agent Browser
npm install -g agent-browser
agent-browser install

# 3. Start services
docker-compose up -d postgres redis server web

# 4. Start ZeroClaw
zeroclaw --config ./zeroclaw/config.toml

# 5. Start WebSocket proxy
cd server/src/zeroclaw-proxy
pip install -r requirements.txt
python main.py

# 6. LibreChat (optional for local)
docker-compose up -d librechat
```

### 9.2 Railway Deployment
```yaml
# railway.yaml
services:
  - name: islandhub-api
    build: ./server
    port: 5001
    
  - name: islandhub-web
    build: ./web
    port: 3000
    
  - name: zeroclaw
    build: ./zeroclaw
    port: 3001
    private: true  # No public URL
    
  - name: librechat
    image: ghcr.io/danny-avila/librechat
    port: 3080
    
databases:
  - name: postgres
    type: postgresql
    
  - name: redis
    type: redis
```

### 9.3 Environment Variables
```bash
# .env.production
# IslandHub Core
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...

# ZeroClaw
ZEROCLAW_URL=http://zeroclaw:3001
ZEROCLAW_API_KEY=...
ZEROCLAW_ADMIN_KEY=...

# LibreChat
LIBRECHAT_MONGO_URI=mongodb://...
OPENAI_API_KEY=...

# Agent Browser
AGENT_BROWSER_HEADED=false
AGENT_BROWSER_ALLOWED_DOMAINS=localhost,islandfund.com
AGENT_BROWSER_ACTION_POLICY=./audit-action-policy.json
```

---

## 10. Integration Files to Create

### Immediate Implementation Files:
1. `zeroclaw/config.toml` - ZeroClaw main configuration
2. `zeroclaw/agents/*.json` - Agent personality files
3. `server/src/zeroclaw-proxy/main.py` - WebSocket proxy
4. `web/src/components/NaturalLanguageSearch.tsx` - NL search UI
5. `web/src/app/api/agent-search/route.ts` - Search API route
6. `web/src/components/admin/AgentControlPanel.tsx` - Admin panel
7. `docker-compose.librechat.yml` - LibreChat services
8. `.github/workflows/deploy-and-audit.yml` - CI/CD pipeline

### Tool Scripts:
9. `zeroclaw/tools/islandhub-api.sh` - API wrapper
10. `zeroclaw/tools/audit-marketplace.sh` - Audit automation
11. `zeroclaw/tools/check-vendor-compliance.sh` - Compliance checker

---

## Summary

This architecture provides:

1. **ZeroClaw** as the agent operating system for 5 specialized agents
2. **Vercel Agent Browser** for testing, audits, and natural language features
3. **LibreChat** for customer-facing and admin chat interfaces
4. **FastAPI WebSocket Proxy** for real-time admin dashboard integration
5. **Comprehensive security** with pairing codes, allowlists, and audit logging
6. **Flexible deployment** supporting Docker, Railway, Vercel, or traditional hosting

All components are designed to integrate seamlessly with the existing IslandHub Express.js backend and Next.js frontend without requiring rewrites of core functionality.
