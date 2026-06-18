# IslandFund Rebranding Plan

## Overview

This document outlines the complete rebranding strategy for IslandFund to a new domain name. The current brand "IslandFund" appears in **199 locations** across the codebase, including repository names, Docker configurations, database names, environment variables, API documentation, email domains, and UI text.

---

## 1. Domain Name Suggestions

Based on the Caribbean/tropical island theme and the marketplace offerings (Tours, Rentals, Food/Stores, Dispatch, Vendor Portal), here are **35 domain name options** for consideration, including new suggestions from brainstorming:

### Theme A: Link & Connection (NEW from brainstorming)

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 1 | **LinkPrime** | linkprime.io | Professional, "prime" = premium quality, marketplace leader. |
| 2 | **IslandLink** | islandlink.io | Direct connection to island commerce. Simple, memorable. |
| 3 | **GetLinks** | getlinks.io | Action-oriented. Users get connected to vendors. |
| 4 | **LinkPot** | linkpot.io | Connection + community (pot). Warm, inviting marketplace. |
| 5 | **Hustlr** | hustlr.io | Modern entrepreneur feel. "Hustle" = business activity. |

### Theme B: Ocean & Water

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 6 | **HustleReef** | hustlereef.com | Dynamic business + Caribbean reef imagery. |
| 7 | **CaribBay** | caribbay.com | Safe harbor for commerce. Bay = protected marketplace. |
| 8 | **IslandReef** | islandreef.com | Vibrant ecosystem like coral reef. Community feel. |
| 9 | **CaribCurrent** | caribcurrent.com | Constant flow of transactions. Energy and movement. |
| 10 | **IslandSail** | islandsail.com | Adventure, travel, journey. Sails = progress. |

### Theme C: Tropical Flora & Fruit

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 11 | **Palm** | palm.io | Simple, iconic. Palm tree = tropical escape. |
| 12 | **Papaya** | papaya.io | Tropical fruit. Unique, memorable, short. |
| 13 | **CaribPalm** | caribpalm.com | Direct Caribbean + tropical imagery. |
| 14 | **IslandFern** | islandfern.io | Lush vegetation. Green, natural, eco-friendly. |
| 15 | **Flora** | flora.io | Plants/flowers for food marketplace. Elegant. |

### Theme D: Community & Connection

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 16 | **IslandHive** | islandhive.com | Bees = busy marketplace activity. Community. |
| 17 | **CaribGather** | caribgather.com | Bringing people together. Vendor gathering. |
| 18 | **IslandCircle** | islandcircle.com | Community, unity, inclusivity. |
| 19 | **CaribSquare** | caribsquare.com | Marketplace square. Meeting place. |
| 20 | **IslandGlow** | islandglow.com | Warmth, light, positivity. Caribbean sunshine. |

### Theme E: Commerce & Marketplace

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 21 | **CaribMarket** | caribmarket.com | Clear marketplace concept. Professional. |
| 22 | **TropicTrade** | tropictrade.com | Commerce emphasis. B2B feel. |
| 23 | **IslandShop** | islandshop.io | Simple, direct. Shopping experience. |
| 24 | **CaribCart** | caribcart.com | Shopping cart for marketplace. |
| 25 | **IslandCart** | islandcart.io | Same as above. |

### Theme F: Travel & Exploration

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 26 | **IslandHop** | islandhop.io | Island hopping = tours, travel, exploration. |
| 27 | **CaribGo** | caribgo.com | Go = action, booking, activity. |
| 28 | **IslandVista** | islandvista.com | Beautiful views, tours, rentals. |
| 29 | **CaribTrek** | caribtrek.com | Adventure, tours, exploration. |
| 30 | **IslandCompass** | islandcompass.com | Direction, guidance, navigation. |

### Theme G: Unique & Creative

| # | Name | Domain | Explanation |
|---|------|--------|-------------|
| 31 | **Pelican** | pelican.io | Caribbean bird. Memorable, unique. |
| 32 | **Coconet** | coconet.io | Coconut + network. Tropical tech feel. |
| 33 | **SeaBreeze** | seabreeze.io | Fresh, clean, tropical atmosphere. |
| 34 | **IslandPulse** | islandpulse.com | Modern, energetic, dynamic. |
| 35 | **CaribLife** | cariblife.com | Lifestyle, living, experience. |

---

## 2. Domain Availability Check Approach

### Step 1: Bulk Availability Check

Use the following methods to check domain availability:

```bash
# Using WHOIS lookup (manual check)
whois [domain-name].com

# Using Node.js npm package (install first)
npm install -g namecheap
namecheap domains check [domain-name].com [domain-name].io

# Using Python script
pip install python-whois
python3 check_domains.py
```

### Step 2: Multi-TLD Verification

Check the following TLDs for each candidate:
- `.com` - Primary (most professional)
- `.io` - Tech/startup appeal
- `.app` - Mobile-friendly
- `.dev` - Developer-focused
- `.co` - Short, modern alternative

### Step 3: Trademark Search

Before finalizing, search for trademark conflicts:
- USPTO TESS (uspto.gov)
- Local Caribbean trademark databases
- WIPO Global Brand Database

**Note: "LinkPrime" may have trademark issues with Amazon Prime. Recommend checking before proceeding.**

### Step 4: Social Media Handle Check

Verify availability across:
- @LinkPrimeApp (Twitter/X)
- @HustleReef (Instagram)
- @IslandLinkApp (Facebook)
- @linkpot (TikTok)

---

## 3. Codebase Find/Replace Strategy

### Phase 1: File-Level Renames

These directories/files must be renamed:

| Current Path | New Path |
|--------------|----------|
| `islandfund-agent/` | `{new-name}-agent/` |
| `islandhub_migration.sql` | `{new-name}_migration.sql` |

### Phase 2: String Replacements (Case-Sensitive)

| Pattern | Replace With | Locations |
|---------|--------------|-----------|
| `islandfund` | `{new-name-lowercase}` | ~175 occurrences |
| `IslandFund` | `{new-name-titlecase}` | ~20 occurrences |
| `ISLANDFUND` | `{new-name-uppercase}` | ~4 occurrences |

### Phase 3: Environment Variables

Update these variables in all `.env` files:

```bash
# Before
DB_NAME=islandfund
DB_NAME=islandfund_test
DOCKERHUB_USERNAME=yourusername/islandfund-api

# After
DB_NAME={new-name}
DB_NAME={new-name}_test
DOCKERHUB_USERNAME=yourusername/{new-name}-api
```

### Phase 4: Docker Configuration

Update in `docker-compose.yml` and `docker-compose.prod.yml`:

```yaml
# Before
container_name: islandfund_api
container_name: islandfund_web
container_name: islandfund_db
container_name: islandfund_redis
networks:
  islandfund_network:

# After
container_name: {new-name}_api
container_name: {new-name}_web
container_name: {new-name}_db
container_name: {new-name}_redis
networks:
  {new-name}_network:
```

### Phase 5: API Documentation

Update in `server/src/docs/swagger.ts`:

```typescript
// Before
title: 'IslandFund API'
email: 'api@islandfund.com'
url: 'https://api.islandfund.com'

// After
title: '{New Name} API'
email: 'api@{new-domain}.com'
url: 'https://api.{new-domain}.com'
```

### Phase 6: Email Service Configuration

Update in `server/src/services/emailService.ts`:

```typescript
// Before
from: '"IslandFund" <no-reply@islandfund.com>'
from: '"IslandFund" <payments@islandfund.com>'
from: '"IslandFund" <auth@islandfund.com>'

// After
from: '"NewName" <no-reply@{new-domain}.com>'
from: '"NewName" <payments@{new-domain}.com>'
from: '"NewName" <auth@{new-domain}.com>'
```

### Phase 7: CORS and Security Configuration

Update in `server/src/config/security.ts`:

```typescript
// Before
cors_origins: [
  'https://islandfund.com',
  'https://www.islandfund.com',
  'https://app.islandfund.com',
]

// After
cors_origins: [
  'https://{new-domain}.com',
  'https://www.{new-domain}.com',
  'https://app.{new-domain}.com',
]
```

### Phase 8: Frontend UI Strings

Update in `web/src/components/dashboard/BecomeDriver.tsx`:

```typescript
// Before
'Join thousands of drivers earning flexible income delivering with IslandFund.'

// After
'Join thousands of drivers earning flexible income delivering with {NewName}.'
```

### Phase 9: Page Titles

Update in `web/e2e/auth.spec.ts`:

```typescript
// Before
await expect(page).toHaveTitle(/IslandFund/);

// After
await expect(page).toHaveTitle(/{NewName}/);
```

### Phase 10: Mobile App

Update in `mobile/app/(auth)/login.tsx`:

```typescript
// Before
<Text style={styles.title}>IslandFund 🌴</Text>

// After
<Text style={styles.title}>{NewName} 🌴</Text>
```

---

## 4. Detailed Find/Replace Execution Plan

### Step 1: Pre-Flight Checklist

```bash
# 1. Create backup branch
git checkout -b backup-before-rebrand
git commit -am "Backup before rebranding"
git push origin backup-before-rebrand

# 2. Create rebrand branch
git checkout -b rebrand-to-{new-name}

# 3. Document all current occurrences
grep -r "islandfund" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.yml" --include="*.md" . | wc -l
```

### Step 2: Use IDE Multi-File Replace

Recommended tools:
- **VSCode**: Multi-file find/replace with regex support
- **JetBrains IDEs**: Structural replace with scope
- **sed**: Command-line bulk replace

### Step 3: Execute Replacements (in order)

```bash
# Find all files containing the brand name (excluding .git and .next)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" -o -name "*.sql" \) -not -path "./.git/*" -not -path "./.next/*" -exec grep -l "islandfund\|IslandFund" {} \;
```

### Step 4: Manual Review Required

These files need manual review after automated replacement:

| File | Reason |
|------|--------|
| `docker-compose.prod.yml` | Container naming |
| `docker-compose.yml` | Container + network naming |
| `.github/workflows/*.yml` | CI/CD pipeline names |
| `server/.env.example` | Environment variable names |
| `web/.env.example` | Environment variable names |
| `docs/DEPLOYMENT_PLAN.md` | Documentation references |
| `docs/QUICK_START.md` | Documentation references |
| `mobile/app/(auth)/login.tsx` | Login screen title |

---

## 5. Updated Deployment Documentation

### New Repository Commands

```bash
# Clone with new name
git clone https://github.com/yourusername/{new-name}.git
cd {new-name}
```

### New Docker Commands

```bash
# Build and run
docker-compose up -d

# View logs
docker logs {new-name}_api
docker logs {new-name}_web

# Stop services
docker-compose down
```

### New Environment Setup

```bash
# Backend
cp server/.env.production.example server/.env.production
# Update DB_NAME={new-name}

# Frontend  
cp web/.env.example web/.env
# Update NEXT_PUBLIC_API_URL=https://api.{new-domain}.com
```

### New CI/CD Tags

```yaml
# GitHub Actions
tags: ${{ secrets.DOCKERHUB_USERNAME }}/{new-name}-api:${{ github.sha }}
```

---

## 6. Rollback Plan

If issues arise during rebranding:

```bash
# 1. Revert to backup branch
git checkout backup-before-rebrand
git branch -D rebrand-to-{new-name}
git push origin :rebrand-to-{new-name}

# 2. Restore from backup
git checkout backup-before-rebranch
git checkout -b restore-backup
```

---

## 7. Estimated Scope

| Category | Count |
|----------|-------|
| Total occurrences | 199 |
| Files affected | ~85 |
| Directories to rename | 1 |
| Environment variables | 6 |
| Docker containers | 4 |
| Email addresses | 8 |
| API endpoints | 2 |

---

## 8. Next Steps

1. [ ] **Select final domain name** from the 35 suggestions
2. [ ] **Verify domain availability** using the check approach
3. [ ] **Check social media handles** availability
4. [ ] **Update todo list** with specific replacement tasks
5. [ ] **Execute rebrand** in Code mode
6. [ ] **Test all functionality** after changes
7. [ ] **Update DNS records** for new domain
8. [ ] **Deploy to staging** for final validation
9. [ ] **Go live** with new brand

---

*Document generated for IslandFund rebranding project*
