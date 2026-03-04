# Agent-Browser Configuration Plan for Island Fund

## 1. Summary of Agent-Browser Configuration Requirements

### What is Agent-Browser?
Agent-browser is a headless browser automation CLI for AI agents built by Vercel Labs. It features:
- Fast Rust implementation with Node.js fallback
- Semantic locators and accessibility tree snapshots
- Screenshot capabilities with annotations
- Session management and persistent profiles
- Security features (domain allowlisting, action policies)

### Configuration Sources (Priority Order)
1. Command-line flags (highest priority)
2. Environment variables (`AGENT_BROWSER_*`)
3. Project-level config: `./agent-browser.json`
4. User-level config: `~/.agent-browser/config.json` (lowest priority)

### Key Configuration Options

| Option | CLI Flag | JSON Key | Description |
|--------|----------|----------|-------------|
| Headed Mode | `--headed` | `headed` | Show browser window (not headless) |
| Proxy | `--proxy` | `proxy` | Proxy server URL |
| Profile | `--profile` | `profile` | Persistent browser profile directory |
| Session | `--session-name` | `sessionName` | Auto-save/restore session state |
| State | `--state` | `state` | Load storage state from JSON |
| Headers | `--headers` | `headers` | HTTP headers scoped to origin |
| Device | `--device` | `device` | iOS device emulation |
| Output Format | `--json` | `json` | JSON output for scripting |
| Screenshots | `--full`, `-f` | `full` | Full page screenshot |
| Annotations | `--annotate` | `annotate` | Annotated screenshots |
| Security | `--allowed-domains` | `allowedDomains` | Domain allowlist |
| Action Policy | `--action-policy` | `actionPolicy` | Path to policy JSON |

---

## 2. Island Fund Application Structure Analysis

### Frontend (Next.js) - `/web/src/app`

#### Public Pages (No Authentication)
- `/` - Homepage with marketplace hero, recommendations
- `/about` - About Island Fund
- `/contact` - Contact page
- `/how-it-works` - How the platform works
- `/browse` - Browse listings
- `/search` - Search functionality
- `/shop` - Shop page
- `/products` - Products listing
- `/food` - Food category
- `/services` - Services category
- `/fund` - Fundraising/campaigns
- `/rent` - Rentals landing
- `/tours` - Tours marketplace
- `/stores` - Store directory
- `/vendors` - Vendor directory
- `/community` - Community page
- `/pricing` - Pricing plans
- `/brands` - Brand showcase

#### Authentication Pages
- `/login` - User login (email/password)
- `/register` - User registration
- `/verify-email` - Email verification

#### User Dashboard (Authenticated)
- `/dashboard` - Main user dashboard
- `/dashboard/analytics` - User analytics
- `/dashboard/orders` - Order history
- `/dashboard/messages` - Messages
- `/settings` - Account settings
- `/notifications` - Notifications
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/checkout/[id]` - Specific checkout
- `/orders/[id]` - Order details
- `/orders/[id]/confirmation` - Order confirmation

#### Vendor Features (Vendor Role)
- `/become-vendor` - Vendor onboarding
- `/create` - Create listings/products
- `/listings` - Manage listings
- `/listings/[id]/edit` - Edit listing
- `/dashboard/vendor/analytics` - Vendor analytics

#### Rental Hub (Rental Features)
- `/rental-hub` - Rental hub main
- `/rental-hub/stays` - Accommodation rentals
- `/rental-hub/equipment-tools` - Equipment rentals
- `/rental-hub/land-rentals` - Land rentals
- `/rental-hub/sea-rentals` - Watercraft rentals
- `/rentals` - Rentals listing
- `/rentals/[id]` - Rental details
- `/rentals/providers` - Rental providers

#### Tour/Campaign Features
- `/tours` - Tours marketplace
- `/tours/[category]` - Tour categories
- `/tour/[id]` - Tour details
- `/campaigns` - Campaigns listing
- `/campaigns/[id]` - Campaign details
- `/campaigns/new` - Create campaign
- `/book` - Booking page

#### Logistics/Driver Features
- `/driver-hub` - Driver hub
- `/driver/dashboard` - Driver dashboard
- `/request-ride` - Ride request
- `/dispatch` - Dispatch interface

#### Admin Features (Admin Role)
- `/admin` - Admin main
- `/admin/dashboard` - Admin dashboard
- `/admin/analytics` - Platform analytics
- `/admin/users/[id]` - User management
- `/admin/listings/[id]` - Listing management
- `/admin/campaigns/pending` - Campaign approval
- `/admin/dispatch` - Logistics dispatch
- `/admin/kyb-verification` - Business verification

#### Storefront Pages
- `/store/[slug]` - Individual store pages

#### User Profiles
- `/users/[id]` - Public user profiles

### Backend API (Express) - `/server/src/routes`

#### Core API Routes
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/listings/*` - Listings CRUD
- `/api/stores/*` - Store management
- `/api/orders/*` - Order processing
- `/api/cart/*` - Shopping cart
- `/api/payments/*` - Payment processing
- `/api/rentals/*` - Rental management
- `/api/campaigns/*` - Campaign management
- `/api/tours/*` - Tour bookings
- `/api/logistics/*` - Logistics/delivery
- `/api/notifications/*` - Notifications
- `/api/analytics/*` - Analytics data
- `/api/admin/*` - Admin operations
- `/api/search/*` - Search functionality
- `/api/upload/*` - File uploads

---

## 3. Recommended Configuration Structure

### Project-Level Configuration: `agent-browser.json`

```json
{
  "name": "Island Fund Audit Configuration",
  "version": "1.0.0",
  "description": "Agent-browser configuration for auditing Island Fund application",
  
  "browser": {
    "headed": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "userAgent": "IslandFund-Audit-Agent/1.0",
    "ignoreHTTPSErrors": true,
    "colorScheme": "light"
  },
  
  "security": {
    "allowedDomains": [
      "localhost",
      "*.localhost",
      "islandfund.com",
      "*.islandfund.com",
      "api.islandfund.com"
    ],
    "contentBoundaries": true,
    "maxOutput": 50000,
    "actionPolicy": "./audit-action-policy.json"
  },
  
  "sessions": {
    "path": "./agent-browser-sessions",
    "persist": true
  },
  
  "screenshots": {
    "path": "./audit-screenshots",
    "fullPage": true,
    "annotate": true
  },
  
  "environments": {
    "local": {
      "baseUrl": "http://localhost:3000",
      "apiUrl": "http://localhost:5001",
      "sessionName": "islandfund-local"
    },
    "staging": {
      "baseUrl": "https://staging.islandfund.com",
      "apiUrl": "https://api-staging.islandfund.com",
      "sessionName": "islandfund-staging"
    },
    "production": {
      "baseUrl": "https://islandfund.com",
      "apiUrl": "https://api.islandfund.com",
      "sessionName": "islandfund-prod"
    }
  },
  
  "tasks": [
    {
      "id": "public-pages",
      "name": "Public Pages Audit",
      "description": "Audit all publicly accessible pages",
      "priority": "high",
      "flows": [
        {
          "name": "Homepage Load",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/" },
            { "action": "snapshot", "selector": "main" },
            { "action": "screenshot" }
          ]
        },
        {
          "name": "Marketplace Browse",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/browse" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Search Functionality",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/search" },
            { "action": "type", "selector": "input[type='search']", "value": "jamaica tours" },
            { "action": "press", "key": "Enter" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "authentication",
      "name": "Authentication Flows",
      "description": "Test login, registration, and password flows",
      "priority": "critical",
      "credentials": {
        "customer": {
          "email": "{{CUSTOMER_EMAIL}}",
          "password": "{{CUSTOMER_PASSWORD}}"
        },
        "vendor": {
          "email": "{{VENDOR_EMAIL}}",
          "password": "{{VENDOR_PASSWORD}}"
        },
        "admin": {
          "email": "{{ADMIN_EMAIL}}",
          "password": "{{ADMIN_PASSWORD}}"
        },
        "driver": {
          "email": "{{DRIVER_EMAIL}}",
          "password": "{{DRIVER_PASSWORD}}"
        }
      },
      "flows": [
        {
          "name": "Customer Login",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/login" },
            { "action": "type", "selector": "input[type='email']", "value": "{{customer.email}}" },
            { "action": "type", "selector": "input[type='password']", "value": "{{customer.password}}" },
            { "action": "click", "selector": "button[type='submit']" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" },
            { "action": "saveSession", "name": "customer-session" }
          ]
        },
        {
          "name": "Vendor Login",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/login" },
            { "action": "type", "selector": "input[type='email']", "value": "{{vendor.email}}" },
            { "action": "type", "selector": "input[type='password']", "value": "{{vendor.password}}" },
            { "action": "click", "selector": "button[type='submit']" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" },
            { "action": "saveSession", "name": "vendor-session" }
          ]
        },
        {
          "name": "Registration Flow",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/register" },
            { "action": "snapshot" },
            { "action": "type", "selector": "input[name='firstName']", "value": "Test" },
            { "action": "type", "selector": "input[name='lastName']", "value": "User" },
            { "action": "type", "selector": "input[type='email']", "value": "test-{{timestamp}}@example.com" },
            { "action": "type", "selector": "input[type='password']", "value": "TestPassword123!" },
            { "action": "snapshot", "name": "registration-filled" }
          ]
        }
      ]
    },
    {
      "id": "ecommerce",
      "name": "E-Commerce Flows",
      "description": "Test shopping, cart, and checkout functionality",
      "priority": "high",
      "requires": ["customer-session"],
      "flows": [
        {
          "name": "Browse Products",
          "steps": [
            { "action": "loadSession", "name": "customer-session" },
            { "action": "open", "url": "{{baseUrl}}/products" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Add to Cart",
          "steps": [
            { "action": "loadSession", "name": "customer-session" },
            { "action": "open", "url": "{{baseUrl}}/products" },
            { "action": "click", "selector": "[data-testid='add-to-cart']", "timeout": 5000 },
            { "action": "wait", "timeout": 1000 },
            { "action": "open", "url": "{{baseUrl}}/cart" },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Checkout Flow",
          "steps": [
            { "action": "loadSession", "name": "customer-session" },
            { "action": "open", "url": "{{baseUrl}}/cart" },
            { "action": "click", "selector": "button:has-text('Checkout')" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "rentals",
      "name": "Rental Hub Flows",
      "description": "Test rental search and booking functionality",
      "priority": "medium",
      "flows": [
        {
          "name": "Rental Hub Navigation",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/rental-hub" },
            { "action": "snapshot" },
            { "action": "click", "selector": "a[href='/rental-hub/stays']" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Equipment Rentals",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/rental-hub/equipment-tools" },
            { "action": "snapshot" },
            { "action": "click", "selector": ".rental-card:first-child" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "vendor-features",
      "name": "Vendor Features",
      "description": "Test vendor dashboard and listing management",
      "priority": "medium",
      "requires": ["vendor-session"],
      "flows": [
        {
          "name": "Vendor Dashboard",
          "steps": [
            { "action": "loadSession", "name": "vendor-session" },
            { "action": "open", "url": "{{baseUrl}}/dashboard" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Create Listing",
          "steps": [
            { "action": "loadSession", "name": "vendor-session" },
            { "action": "open", "url": "{{baseUrl}}/create" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" },
            { "action": "type", "selector": "input[name='title']", "value": "Test Listing {{timestamp}}" },
            { "action": "type", "selector": "textarea[name='description']", "value": "This is a test listing created by agent-browser" },
            { "action": "snapshot", "name": "create-listing-filled" }
          ]
        },
        {
          "name": "Vendor Analytics",
          "steps": [
            { "action": "loadSession", "name": "vendor-session" },
            { "action": "open", "url": "{{baseUrl}}/dashboard/analytics" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "tours-campaigns",
      "name": "Tours and Campaigns",
      "description": "Test tour booking and campaign features",
      "priority": "medium",
      "flows": [
        {
          "name": "Tours Marketplace",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/tours" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Campaigns Listing",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/campaigns" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "admin-features",
      "name": "Admin Features",
      "description": "Test admin dashboard and management features",
      "priority": "high",
      "requires": ["admin-session"],
      "flows": [
        {
          "name": "Admin Dashboard",
          "steps": [
            { "action": "loadSession", "name": "admin-session" },
            { "action": "open", "url": "{{baseUrl}}/admin" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "User Management",
          "steps": [
            { "action": "loadSession", "name": "admin-session" },
            { "action": "open", "url": "{{baseUrl}}/admin/users/1" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "KYB Verification",
          "steps": [
            { "action": "loadSession", "name": "admin-session" },
            { "action": "open", "url": "{{baseUrl}}/admin/kyb-verification" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Analytics Overview",
          "steps": [
            { "action": "loadSession", "name": "admin-session" },
            { "action": "open", "url": "{{baseUrl}}/admin/analytics" },
            { "action": "wait", "timeout": 3000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "driver-logistics",
      "name": "Driver and Logistics",
      "description": "Test driver portal and logistics features",
      "priority": "low",
      "requires": ["driver-session"],
      "flows": [
        {
          "name": "Driver Dashboard",
          "steps": [
            { "action": "loadSession", "name": "driver-session" },
            { "action": "open", "url": "{{baseUrl}}/driver/dashboard" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Request Ride",
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/request-ride" },
            { "action": "wait", "timeout": 2000 },
            { "action": "snapshot" }
          ]
        }
      ]
    },
    {
      "id": "responsive-design",
      "name": "Responsive Design Check",
      "description": "Test application on different viewport sizes",
      "priority": "medium",
      "flows": [
        {
          "name": "Mobile Viewport",
          "viewport": { "width": 375, "height": 812 },
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/" },
            { "action": "snapshot" }
          ]
        },
        {
          "name": "Tablet Viewport",
          "viewport": { "width": 768, "height": 1024 },
          "steps": [
            { "action": "open", "url": "{{baseUrl}}/browse" },
            { "action": "snapshot" }
          ]
        }
      ]
    }
  ]
}
```

### Action Policy Configuration: `audit-action-policy.json`

```json
{
  "default": "allow",
  "deny": [
    "download",
    "eval"
  ],
  "allow": [
    "navigate",
    "snapshot",
    "click",
    "type",
    "press",
    "wait",
    "screenshot",
    "get",
    "find",
    "scroll"
  ],
  "confirm": [
    "submit",
    "delete"
  ]
}
```

---

## 4. Environment Variable Requirements

### Core Environment File: `.env.agent-browser`

```bash
# =============================================================================
# Agent-Browser Environment Configuration
# Copy this file to .env.agent-browser.local and fill in actual values
# =============================================================================

# =============================================================================
# Target Environment
# =============================================================================
AGENT_BROWSER_ENV=local
# Options: local, staging, production

# =============================================================================
# Base URLs (per environment)
# =============================================================================
# Local Development
LOCAL_BASE_URL=http://localhost:3000
LOCAL_API_URL=http://localhost:5001

# Staging
STAGING_BASE_URL=https://staging.islandfund.com
STAGING_API_URL=https://api-staging.islandfund.com

# Production
PRODUCTION_BASE_URL=https://islandfund.com
PRODUCTION_API_URL=https://api.islandfund.com

# =============================================================================
# Test Account Credentials
# =============================================================================
# Customer Account (regular user)
CUSTOMER_EMAIL=test.customer@example.com
CUSTOMER_PASSWORD=TestPassword123!

# Vendor Account (business account)
VENDOR_EMAIL=test.vendor@example.com
VENDOR_PASSWORD=VendorPass123!

# Admin Account (platform administrator)
ADMIN_EMAIL=admin@islandfund.com
ADMIN_PASSWORD=AdminSecure456!

# Driver Account (logistics driver)
DRIVER_EMAIL=test.driver@example.com
DRIVER_PASSWORD=DriverPass789!

# =============================================================================
# Browser Configuration
# =============================================================================
AGENT_BROWSER_HEADED=false
AGENT_BROWSER_VIEWPORT_WIDTH=1920
AGENT_BROWSER_VIEWPORT_HEIGHT=1080
AGENT_BROWSER_IGNORE_HTTPS_ERRORS=true

# =============================================================================
# Security Settings
# =============================================================================
AGENT_BROWSER_ALLOWED_DOMAINS="localhost,*.localhost,islandfund.com,*.islandfund.com,api.islandfund.com"
AGENT_BROWSER_CONTENT_BOUNDARIES=true
AGENT_BROWSER_MAX_OUTPUT=50000

# =============================================================================
# Session & Storage
# =============================================================================
AGENT_BROWSER_SESSION_PATH=./agent-browser-sessions
AGENT_BROWSER_SCREENSHOT_PATH=./audit-screenshots

# =============================================================================
# Optional: Third-party Browser Providers
# =============================================================================
# Uncomment to use Browserbase instead of local Chrome
# AGENT_BROWSER_PROVIDER=browserbase
# BROWSERBASE_API_KEY=your_browserbase_api_key
# BROWSERBASE_PROJECT_ID=your_project_id
```

### Environment Loading Script: `load-env.js`

```javascript
/**
 * Environment loader for agent-browser configuration
 * Loads variables from .env.agent-browser files
 */

const fs = require('fs');
const path = require('path');

function loadEnv(envFile = '.env.agent-browser.local') {
  const envPath = path.resolve(process.cwd(), envFile);
  
  if (!fs.existsSync(envPath)) {
    console.warn(`Environment file not found: ${envPath}`);
    console.warn('Using .env.agent-browser as fallback');
    return loadEnv('.env.agent-browser');
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
      process.env[key] = value;
    }
  });
  
  return env;
}

module.exports = { loadEnv };
```

---

## 5. Setup Prerequisites and Dependencies

### Required Software

1. **Node.js 18+** (for running the application)
2. **Chrome/Chromium** (agent-browser will use system Chrome or download Chromium)
3. **agent-browser CLI** (already installed globally per user)

### Optional Dependencies

```json
{
  "devDependencies": {
    "@vercel/agent-browser": "^latest",
    "playwright": "^1.40.0",
    "dotenv": "^16.3.0"
  }
}
```

### Directory Structure

```
island_fund/
├── agent-browser.json              # Main configuration
├── audit-action-policy.json        # Security policy
├── .env.agent-browser              # Environment template
├── .env.agent-browser.local        # Local environment (gitignored)
├── agent-browser-sessions/         # Session storage
│   ├── customer-session/
│   ├── vendor-session/
│   ├── admin-session/
│   └── driver-session/
├── audit-screenshots/              # Screenshot outputs
│   ├── YYYY-MM-DD/
│   │   ├── homepage-{timestamp}.png
│   │   └── ...
├── scripts/
│   ├── run-audit.js               # Audit runner script
│   └── load-env.js                # Environment loader
└── plans/
    └── agent-browser-configuration.md  # This document
```

### Installation Steps

1. **Create configuration files:**
   ```bash
   # Copy environment template
   cp .env.agent-browser .env.agent-browser.local
   
   # Edit with actual credentials
   nano .env.agent-browser.local
   ```

2. **Create directories:**
   ```bash
   mkdir -p agent-browser-sessions
   mkdir -p audit-screenshots
   ```

3. **Verify agent-browser installation:**
   ```bash
   agent-browser --version
   ```

4. **Test basic connectivity:**
   ```bash
   agent-browser open http://localhost:3000
   ```

---

## 6. Audit Task Categories Summary

| Category | Priority | Pages/Flows | Authentication |
|----------|----------|-------------|----------------|
| Public Pages | High | 15+ pages | None |
| Authentication | Critical | Login, Register, Verify | Test accounts |
| E-Commerce | High | Cart, Checkout, Orders | Customer |
| Vendor Features | Medium | Dashboard, Listings, Analytics | Vendor |
| Rentals | Medium | Hub, Stays, Equipment | Optional |
| Tours/Campaigns | Medium | Tours, Campaigns, Bookings | Optional |
| Admin Features | High | Dashboard, Users, KYB | Admin |
| Driver/Logistics | Low | Driver portal, Ride request | Driver |
| Responsive | Medium | Mobile, Tablet viewports | None |

---

## 7. Execution Commands

### Run All Audits
```bash
agent-browser --config ./agent-browser.json run --all
```

### Run Specific Task
```bash
agent-browser --config ./agent-browser.json run --task public-pages
```

### Run with Environment
```bash
AGENT_BROWSER_ENV=staging agent-browser --config ./agent-browser.json run
```

### Run in Headed Mode (for debugging)
```bash
agent-browser --headed --config ./agent-browser.json run --task authentication
```

### Generate Report
```bash
agent-browser --config ./agent-browser.json run --all --output-format json > audit-report.json
```

---

## 8. Security Considerations

1. **Never commit `.env.agent-browser.local`** - Contains test credentials
2. **Use test accounts only** - Never use production credentials
3. **Domain allowlisting** - Restrict to known domains only
4. **Action policies** - Limit dangerous actions (eval, download)
5. **Content boundaries** - Enable for LLM safety
6. **Output limits** - Prevent context flooding
7. **Session isolation** - Separate sessions per user role

---

## 9. Maintenance and Updates

### When to Update Configuration
- New pages/features added to application
- URL structure changes
- New user roles added
- Authentication flow changes
- New environment (e.g., new staging URL)

### Version Control Strategy
- Commit `agent-browser.json` with placeholder values
- Commit `.env.agent-browser` (template only)
- Ignore `.env.agent-browser.local` (actual secrets)
- Version the configuration alongside app releases
