# IslandHub Marketplace Expansion Plan

## Overview
Expanding IslandFund from donation-focused platform to full IslandHub marketplace supporting campaigns, rentals, products, and services.

## Environment
- **Database**: Local Docker Postgres (islandfund_db)
- **Authentication**: JWT-based (not Supabase auth.uid())
- **RLS**: Implemented via middleware ownership checks
- **Migrations**: Applied via docker exec psql

## Schema Extensions

### New Tables

#### listings
```sql
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('campaign', 'rental', 'product', 'service')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2), -- NULL for donations/campaigns
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50),
    goal_amount DECIMAL(12,2), -- For campaigns
    current_amount DECIMAL(12,2) DEFAULT 0, -- For campaigns
    currency VARCHAR(10) DEFAULT 'XCD',
    status VARCHAR(20) CHECK (status IN ('draft','active','completed','cancelled','sold')) DEFAULT 'draft',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Platform commission %
    subscription_tier VARCHAR(20), -- For premium listings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### transactions (updated)
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XCD',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(20) CHECK (payment_provider IN ('wipay', 'paypal', 'kyrrex', 'dodopay')) DEFAULT 'wipay',
    external_id VARCHAR(255), -- Gateway transaction ID
    crypto_currency VARCHAR(10), -- BTC, ETH, etc.
    status VARCHAR(20) CHECK (status IN ('pending','completed','failed','refunded')) DEFAULT 'pending',
    is_donation BOOLEAN DEFAULT FALSE, -- For hybrid flows
    commission_amount DECIMAL(12,2), -- Platform cut
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### campaign_updates
```sql
CREATE TABLE campaign_updates (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Ownership Enforcement
- **Middleware Checks**: All controllers validate user ownership via JWT
- **Database Constraints**: Foreign keys ensure data integrity
- **Audit Logging**: Transaction changes logged for compliance
- **Admin Access**: Audit logs accessible via role-based checks

### Foreign Key Constraints
- All child tables use `ON DELETE CASCADE`
- Ensures referential integrity
- order_items → orders
- payments → orders
- refund_items → refund_requests
- etc.

### Middleware Architecture

#### Listings Controller
- CRUD operations with ownership checks
- Category filtering
- Featured listing management
- Compliance verification

#### Transactions Service
- Unified payment processing
- Multi-provider support (WiPay, PayPal, Kyrrex, Dodopay)
- Commission calculation
- Audit logging

#### Campaign Updates Controller
- Public/private updates
- Linked to listings
- Rich content support

### Compliance & Ownership Rules

#### Legal Compliance
- All transactions logged in audit_logs
- Transparent commission disclosure
- Charity regulation adherence
- Tax compliance tracking

#### Ownership Enforcement
- All operations check `auth.uid()`
- RLS prevents unauthorized access
- Middleware validates ownership
- Cascading deletes protect data integrity

#### Community Trust
- Verified listings
- Transparent pricing
- Donor/sponsor visibility
- Audit trails for accountability

### Migration Steps
1. Create new tables in Docker Postgres
2. Add foreign key constraints with CASCADE
3. Create audit triggers
4. Migrate existing campaigns data
5. Update application code to use pool.query
6. Test ownership checks and compliance logging

### Docker Migration Commands
```bash
# Copy migration script to container
docker cp islandhub_migration.sql islandfund_db:/tmp/

# Run migration
docker exec -i islandfund_db psql -U postgres -d islandfund < /tmp/islandhub_migration.sql

# Verify tables
docker exec -it islandfund_db psql -U postgres -d islandfund -c "\dt"
```

## Middleware Stubs

### Listings Controller (`server/src/controllers/listingController.ts`)
```typescript
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createListing = async (req: Request, res: Response) => {
    try {
        const { type, title, description, price, category, goal_amount } = req.body;
        const userId = (req as any).user?.id;

        const result = await pool.query(
            `INSERT INTO listings (type, title, description, price, category, goal_amount, creator_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [type, title, description, price, category, goal_amount, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getListings = async (req: Request, res: Response) => {
    try {
        const { type, category, status } = req.query;
        let query = 'SELECT * FROM listings WHERE 1=1';
        const params = [];

        if (type) {
            query += ' AND type = 

### Transactions Service (`server/src/services/transactionService.ts`)
```typescript
import { WiPayService } from './wipayService';
import { PayPalService } from './paypalService';
import { KyrrexService } from './kyrrexService';
import { supabase } from '../config/supabase';

export class TransactionService {
    static async processPayment(listingId: string, amount: number, provider: string, userId: string) {
        let externalId: string;
        let status: string;

        switch (provider) {
            case 'wipay':
                const wipayResult = await WiPayService.createPayment(amount, 'XCD', `txn_${Date.now()}`, userId, callbackUrl);
                externalId = wipayResult.transactionId;
                status = 'pending';
                break;
            case 'paypal':
                const paypalResult = await PayPalService.createOrder(amount, 'XCD', listingId);
                externalId = paypalResult.orderId;
                status = 'pending';
                break;
            case 'kyrrex':
                const kyrrexResult = await KyrrexService.createCharge(amount, 'XCD', listingId);
                externalId = kyrrexResult.chargeId;
                status = 'pending';
                break;
        }

        // Record transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                user_id: userId,
                amount,
                payment_provider: provider,
                external_id: externalId,
                status
            })
            .select()
            .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'PAYMENT_INITIATED',
            table_name: 'transactions',
            record_id: data.id,
            new_values: data
        });

        return data;
    }

    static async calculateCommission(listingId: string, amount: number) {
        const { data: listing } = await supabase
            .from('listings')
            .select('commission_rate')
            .eq('id', listingId)
            .single();

        return amount * (listing.commission_rate / 100);
    }
}
```

### Campaign Updates Controller (`server/src/controllers/campaignUpdateController.ts`)
```typescript
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createUpdate = async (req: Request, res: Response) => {
    const { listing_id, content, is_public } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const { data: listing } = await supabase
        .from('listings')
        .select('creator_id')
        .eq('id', listing_id)
        .single();

    if (listing.creator_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
        .from('campaign_updates')
        .insert({
            listing_id,
            creator_id: userId,
            content,
            is_public
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

export const getUpdates = async (req: Request, res: Response) => {
    const { listing_id } = req.params;

    const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('listing_id', listing_id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};
```

## Compliance Documentation

### Ownership Rules
- All operations validate `auth.uid()` matches record owner
- RLS policies enforce row-level security
- Middleware checks prevent unauthorized access
- Cascading deletes maintain data integrity

### Audit & Transparency
- All transactions logged in `audit_logs`
- Commission rates disclosed to users
- Public access to campaign updates
- Admin-only audit log access

### Legal Compliance
- Charity regulations for campaign listings
- E-commerce laws for product/service sales
- Tax compliance tracking via transactions
- Refund policies enforced via refund_requests table + (params.length + 1);
            params.push(type);
        }
        if (category) {
            query += ' AND category = 

### Transactions Service (`server/src/services/transactionService.ts`)
```typescript
import { WiPayService } from './wipayService';
import { PayPalService } from './paypalService';
import { KyrrexService } from './kyrrexService';
import { supabase } from '../config/supabase';

export class TransactionService {
    static async processPayment(listingId: string, amount: number, provider: string, userId: string) {
        let externalId: string;
        let status: string;

        switch (provider) {
            case 'wipay':
                const wipayResult = await WiPayService.createPayment(amount, 'XCD', `txn_${Date.now()}`, userId, callbackUrl);
                externalId = wipayResult.transactionId;
                status = 'pending';
                break;
            case 'paypal':
                const paypalResult = await PayPalService.createOrder(amount, 'XCD', listingId);
                externalId = paypalResult.orderId;
                status = 'pending';
                break;
            case 'kyrrex':
                const kyrrexResult = await KyrrexService.createCharge(amount, 'XCD', listingId);
                externalId = kyrrexResult.chargeId;
                status = 'pending';
                break;
        }

        // Record transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                user_id: userId,
                amount,
                payment_provider: provider,
                external_id: externalId,
                status
            })
            .select()
            .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'PAYMENT_INITIATED',
            table_name: 'transactions',
            record_id: data.id,
            new_values: data
        });

        return data;
    }

    static async calculateCommission(listingId: string, amount: number) {
        const { data: listing } = await supabase
            .from('listings')
            .select('commission_rate')
            .eq('id', listingId)
            .single();

        return amount * (listing.commission_rate / 100);
    }
}
```

### Campaign Updates Controller (`server/src/controllers/campaignUpdateController.ts`)
```typescript
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createUpdate = async (req: Request, res: Response) => {
    const { listing_id, content, is_public } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const { data: listing } = await supabase
        .from('listings')
        .select('creator_id')
        .eq('id', listing_id)
        .single();

    if (listing.creator_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
        .from('campaign_updates')
        .insert({
            listing_id,
            creator_id: userId,
            content,
            is_public
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

export const getUpdates = async (req: Request, res: Response) => {
    const { listing_id } = req.params;

    const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('listing_id', listing_id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};
```

## Compliance Documentation

### Ownership Rules
- All operations validate `auth.uid()` matches record owner
- RLS policies enforce row-level security
- Middleware checks prevent unauthorized access
- Cascading deletes maintain data integrity

### Audit & Transparency
- All transactions logged in `audit_logs`
- Commission rates disclosed to users
- Public access to campaign updates
- Admin-only audit log access

### Legal Compliance
- Charity regulations for campaign listings
- E-commerce laws for product/service sales
- Tax compliance tracking via transactions
- Refund policies enforced via refund_requests table + (params.length + 1);
            params.push(category);
        }
        if (status) {
            query += ' AND status = 

### Transactions Service (`server/src/services/transactionService.ts`)
```typescript
import { WiPayService } from './wipayService';
import { PayPalService } from './paypalService';
import { KyrrexService } from './kyrrexService';
import { supabase } from '../config/supabase';

export class TransactionService {
    static async processPayment(listingId: string, amount: number, provider: string, userId: string) {
        let externalId: string;
        let status: string;

        switch (provider) {
            case 'wipay':
                const wipayResult = await WiPayService.createPayment(amount, 'XCD', `txn_${Date.now()}`, userId, callbackUrl);
                externalId = wipayResult.transactionId;
                status = 'pending';
                break;
            case 'paypal':
                const paypalResult = await PayPalService.createOrder(amount, 'XCD', listingId);
                externalId = paypalResult.orderId;
                status = 'pending';
                break;
            case 'kyrrex':
                const kyrrexResult = await KyrrexService.createCharge(amount, 'XCD', listingId);
                externalId = kyrrexResult.chargeId;
                status = 'pending';
                break;
        }

        // Record transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                user_id: userId,
                amount,
                payment_provider: provider,
                external_id: externalId,
                status
            })
            .select()
            .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'PAYMENT_INITIATED',
            table_name: 'transactions',
            record_id: data.id,
            new_values: data
        });

        return data;
    }

    static async calculateCommission(listingId: string, amount: number) {
        const { data: listing } = await supabase
            .from('listings')
            .select('commission_rate')
            .eq('id', listingId)
            .single();

        return amount * (listing.commission_rate / 100);
    }
}
```

### Campaign Updates Controller (`server/src/controllers/campaignUpdateController.ts`)
```typescript
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createUpdate = async (req: Request, res: Response) => {
    const { listing_id, content, is_public } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const { data: listing } = await supabase
        .from('listings')
        .select('creator_id')
        .eq('id', listing_id)
        .single();

    if (listing.creator_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
        .from('campaign_updates')
        .insert({
            listing_id,
            creator_id: userId,
            content,
            is_public
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

export const getUpdates = async (req: Request, res: Response) => {
    const { listing_id } = req.params;

    const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('listing_id', listing_id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};
```

## Compliance Documentation

### Ownership Rules
- All operations validate `auth.uid()` matches record owner
- RLS policies enforce row-level security
- Middleware checks prevent unauthorized access
- Cascading deletes maintain data integrity

### Audit & Transparency
- All transactions logged in `audit_logs`
- Commission rates disclosed to users
- Public access to campaign updates
- Admin-only audit log access

### Legal Compliance
- Charity regulations for campaign listings
- E-commerce laws for product/service sales
- Tax compliance tracking via transactions
- Refund policies enforced via refund_requests table + (params.length + 1);
            params.push(status);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateListing = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = (req as any).user?.id;

        // Build dynamic update query
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = ${i + 1}`).join(', ');
        values.push(userId, id);

        const result = await pool.query(
            `UPDATE listings SET ${setClause} WHERE id = ${values.length - 1} AND creator_id = ${values.length} RETURNING *`,
            values
        );

        if (result.rows.length === 0) return res.status(403).json({ message: 'Not authorized' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

### Transactions Service (`server/src/services/transactionService.ts`)
```typescript
import { WiPayService } from './wipayService';
import { PayPalService } from './paypalService';
import { KyrrexService } from './kyrrexService';
import { supabase } from '../config/supabase';

export class TransactionService {
    static async processPayment(listingId: string, amount: number, provider: string, userId: string) {
        let externalId: string;
        let status: string;

        switch (provider) {
            case 'wipay':
                const wipayResult = await WiPayService.createPayment(amount, 'XCD', `txn_${Date.now()}`, userId, callbackUrl);
                externalId = wipayResult.transactionId;
                status = 'pending';
                break;
            case 'paypal':
                const paypalResult = await PayPalService.createOrder(amount, 'XCD', listingId);
                externalId = paypalResult.orderId;
                status = 'pending';
                break;
            case 'kyrrex':
                const kyrrexResult = await KyrrexService.createCharge(amount, 'XCD', listingId);
                externalId = kyrrexResult.chargeId;
                status = 'pending';
                break;
        }

        // Record transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                user_id: userId,
                amount,
                payment_provider: provider,
                external_id: externalId,
                status
            })
            .select()
            .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'PAYMENT_INITIATED',
            table_name: 'transactions',
            record_id: data.id,
            new_values: data
        });

        return data;
    }

    static async calculateCommission(listingId: string, amount: number) {
        const { data: listing } = await supabase
            .from('listings')
            .select('commission_rate')
            .eq('id', listingId)
            .single();

        return amount * (listing.commission_rate / 100);
    }
}
```

### Campaign Updates Controller (`server/src/controllers/campaignUpdateController.ts`)
```typescript
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createUpdate = async (req: Request, res: Response) => {
    const { listing_id, content, is_public } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const { data: listing } = await supabase
        .from('listings')
        .select('creator_id')
        .eq('id', listing_id)
        .single();

    if (listing.creator_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
        .from('campaign_updates')
        .insert({
            listing_id,
            creator_id: userId,
            content,
            is_public
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

export const getUpdates = async (req: Request, res: Response) => {
    const { listing_id } = req.params;

    const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('listing_id', listing_id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};
```

## Compliance Documentation

### Ownership Rules
- All operations validate `auth.uid()` matches record owner
- RLS policies enforce row-level security
- Middleware checks prevent unauthorized access
- Cascading deletes maintain data integrity

### Audit & Transparency
- All transactions logged in `audit_logs`
- Commission rates disclosed to users
- Public access to campaign updates
- Admin-only audit log access

### Legal Compliance
- Charity regulations for campaign listings
- E-commerce laws for product/service sales
- Tax compliance tracking via transactions
- Refund policies enforced via refund_requests table