# DodoPayments Multi-Tier Subscription System: Technical Walkthrough

This document outlines the implementation details of the subscription system for **IslandFund**, enabling tiered access for vendors, customers, and campaign creators.

## 📖 System Overview

The subscription system is designed to provide dynamic feature access and automated reward/commission management. By integrating with **DodoPayments**, we handle automated recurring billing and lifecycle events via secure webhooks.

### Key Capabilities:
- **Feature Enforcement**: Hard limits on stores, listings, and campaigns.
- **Dynamic Pricing**: Tier-based commission rates for vendors and platform fees for creators.
- **Customer Rewards**: VIP multipliers and checkout discounts.
- **Secure Integration**: Idempotent webhook handling with signature verification.

---

## 🛠️ Infrastructure & Stability Fixes

Before the implementation, we resolved critical environment conflicts to ensure production-level stability:

- **Database Port Conflict**: Switched Docker mapping to **5433** to avoid collision with the host's native PostgreSQL service.
- **Server Port Conflict**: Moved the backend API to **5001** (avoiding Windows system service reservation of port 5000).
- **Communication Flow**: Updated frontend API client (`api.ts`) to target the new port and successfully resolved "Network Error" during login.

---

## 🏗️ Database Architecture

We implemented three specialized subscription tables to manage the separate business logic for each user role:

### Tables:
1. `vendor_subscriptions`: Tracks tiers (`basic`, `premium`, `enterprise`), commission rates (2%-5%), and store/listing limits.
2. `customer_subscriptions`: Tracks `vip` status, discount rates (10%), and rewards multipliers (2x).
3. `campaign_creator_subscriptions`: Tracks campaign limits and platform fees (0%-5%).

### Migrations:
- `006_vendor_subscriptions.sql`
- `007_customer_subscriptions.sql`
- `008_campaign_creator_subscriptions.sql`

---

## 🔒 Webhook Security & Idempotency

The webhook endpoint is the heartbeat of the subscription lifecycle.

- **Signature Verification**: Uses `dodo-signature` with raw request body parsing via `express.raw()` to ensure authenticity.
- **Idempotency**: Every event is checked against existing `dodo_subscription_id` records across all subscription tables to prevent duplicate processing.
- **Event Handling**: 
  - `subscription.created`: Populates the appropriate role table.
  - `subscription.updated`: Upgrades/downgrades tier and recalculates limits/rates.
  - `subscription.cancelled`: Sets `cancel_at_period_end` flag.

---

## 📜 Audit Logging

Every subscription change is recorded in the `audit_logs` table for compliance and admin oversight.

- **Captured Data**: `user_id`, `action` (CREATED/UPGRADED/CANCELLED), `old_values`, `new_values`, `ip_address`, and `user_agent`.
- **Implementation**: Centralized via `logSubscriptionAudit()` helper in `paymentController.ts`.

---

## 🛡️ Middleware Enforcement

We implemented a suite of "Limiters" to ensure the subscription tiers are strictly respected:

| Middleware | Target Route | Enforcement |
| :--- | :--- | :--- |
| `vendorLimitsMiddleware` | `POST /api/stores`, `POST /api/listings` | Rejects if max stores or listings per store reached. |
| `customerVipMiddleware` | `POST /api/orders` | Injects 10% discount and 2x rewards into request context. |
| `campaignCreatorLimits` | `POST /api/campaigns` | Rejects if campaign limit reached; applies platform fee. |

---

## 🎨 UI & Frontend Polish

- **Pricing Page**: Created `/pricing` with detailed role-based tier comparisons.
- **Homepage Teaser**: Added high-impact banners to drive VIP and Vendor conversions.
- **Dynamic Routing**: Updated `BecomeVendorPage` to support tier pre-selection via query strings.

---

## ✅ Success Criteria & Verification
- [x] **Connection**: Server and DB responding on new ports.
- [x] **Security**: Webhooks reject unsigned requests.
- [x] **Enforcement**: Middleware successfully blocks actions exceeding limits.
- [x] **Transparency**: Every action logged to Audit Logs.

## 🚀 Next Steps
1. **Downgrade Scheduler**: Implementing a daily cron job to finalize cancellations at period end.
2. **Production Keys**: Swap mock transaction logic for production DodoPayments IDs.
