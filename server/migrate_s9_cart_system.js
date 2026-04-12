const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function migrateCartSystem() {
    try {
        console.log('🚀 Starting Sprint 9 Cart System Migration...\n');

        // 1. Create carts table
        console.log('Creating carts table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS carts (
                cart_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(user_id),
                session_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Carts table created\n');

        // 2. Create cart_items table with category-specific fields
        console.log('Creating cart_items table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                item_id SERIAL PRIMARY KEY,
                cart_id INTEGER REFERENCES carts(cart_id) ON DELETE CASCADE,
                listing_id INTEGER REFERENCES listings(id),
                quantity INTEGER DEFAULT 1,
                
                -- Rental-specific
                rental_start_date DATE,
                rental_end_date DATE,
                rental_duration_days INTEGER,
                
                -- Service-specific
                service_package VARCHAR(100),
                appointment_slot TIMESTAMP,
                
                -- Product-specific
                selected_variant JSONB,
                
                price_snapshot NUMERIC(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Cart items table created\n');

        // 3. Create orders table
        console.log('Creating orders table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(user_id),
                order_number VARCHAR(50) UNIQUE,
                status VARCHAR(50) DEFAULT 'pending',
                
                subtotal NUMERIC(10,2),
                tax NUMERIC(10,2),
                service_fee NUMERIC(10,2),
                total NUMERIC(10,2),
                
                payment_method VARCHAR(50),
                payment_status VARCHAR(50) DEFAULT 'pending',
                payment_intent_id VARCHAR(255),
                
                shipping_address JSONB,
                billing_address JSONB,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Orders table created\n');

        // 4. Create order_items table
        console.log('Creating order_items table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                order_item_id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(order_id),
                listing_id INTEGER REFERENCES listings(id),
                vendor_id INTEGER REFERENCES vendors(id),
                
                item_type VARCHAR(50),
                quantity INTEGER,
                unit_price NUMERIC(10,2),
                total_price NUMERIC(10,2),
                
                rental_dates JSONB,
                service_details JSONB,
                product_variant JSONB,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Order items table created\n');

        // 5. Create transactions table
        console.log('Creating transactions table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(order_id),
                vendor_id INTEGER REFERENCES vendors(id),
                
                type VARCHAR(50),
                amount NUMERIC(10,2),
                currency VARCHAR(3) DEFAULT 'XCD',
                
                gateway VARCHAR(50),
                gateway_transaction_id VARCHAR(255),
                
                status VARCHAR(50),
                metadata JSONB,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Transactions table created\n');

        // 6. Create payouts table
        console.log('Creating payouts table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payouts (
                payout_id SERIAL PRIMARY KEY,
                vendor_id INTEGER REFERENCES vendors(id),
                
                amount NUMERIC(10,2),
                currency VARCHAR(3) DEFAULT 'XCD',
                status VARCHAR(50) DEFAULT 'pending',
                
                payout_method VARCHAR(50),
                payout_reference VARCHAR(255),
                
                period_start DATE,
                period_end DATE,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP
            );
        `);
        console.log('✅ Payouts table created\n');

        // 7. Add balance column to vendors if not exists
        console.log('Adding balance column to vendors...');
        await pool.query(`
            ALTER TABLE vendors 
            ADD COLUMN IF NOT EXISTS balance NUMERIC(10,2) DEFAULT 0.00;
        `);
        console.log('✅ Vendor balance column added\n');

        // 8. Create indexes for performance
        console.log('Creating indexes...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
            CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
            CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
            CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
            CREATE INDEX IF NOT EXISTS idx_payouts_vendor_id ON payouts(vendor_id);
        `);
        console.log('✅ Indexes created\n');

        console.log('🎉 Cart System Migration Complete!\n');
        console.log('Tables created:');
        console.log('  - carts');
        console.log('  - cart_items');
        console.log('  - orders');
        console.log('  - order_items');
        console.log('  - transactions');
        console.log('  - payouts');
        console.log('\nVendors table updated with balance column');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrateCartSystem();
