#!/usr/bin/env node
/**
 * Initialize Database Script
 * Runs init.sql and then all migrations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Use DATABASE_URL from .env
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
};

const pool = new Pool(poolConfig);

async function initDatabase() {
    const client = await pool.connect();

    try {
        console.log('🚀 Initializing database...\n');

        // Run init.sql
        const initSqlPath = path.join(__dirname, 'src/config/init.sql');
        console.log('📄 Running init.sql...');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await client.query(initSql);
        console.log('✅ init.sql executed successfully\n');

        // Run migrate_stores.ts (stores table)
        console.log('📄 Running migrate_stores.ts...');
        const migrateStoresPath = path.join(__dirname, 'src/migrations/migrate_stores.ts');
        if (fs.existsSync(migrateStoresPath)) {
            const migrateStores = require(migrateStoresPath).default;
            await migrateStores();
            console.log('✅ migrate_stores.ts executed successfully\n');
        } else {
            // Run inline SQL for stores
            await client.query(`
        CREATE TABLE IF NOT EXISTS stores (
          store_id SERIAL PRIMARY KEY,
          vendor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          category VARCHAR(100),
          subscription_type VARCHAR(20) DEFAULT 'basic',
          status VARCHAR(20) DEFAULT 'active',
          logo_url VARCHAR(500),
          banner_url VARCHAR(500),
          branding_color VARCHAR(20) DEFAULT '#14b8a6',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log('✅ stores table created\n');
        }

        // Run migrate_vendors.js inline
        console.log('📄 Creating vendors table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
        business_name VARCHAR(255) NOT NULL,
        description TEXT,
        logo_url VARCHAR(500),
        banner_url VARCHAR(500),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        location VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        admin_rating DECIMAL(3,2) DEFAULT 0,
        badges JSONB DEFAULT '[]',
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ vendors table created\n');

        // Create listings table
        console.log('📄 Creating listings table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2),
        type VARCHAR(50) DEFAULT 'product',
        category VARCHAR(100),
        sub_category VARCHAR(100),
        images JSONB DEFAULT '[]',
        photos JSONB DEFAULT '[]',
        status VARCHAR(30) DEFAULT 'active',
        creator_id INTEGER REFERENCES users(user_id),
        store_id INTEGER REFERENCES stores(store_id),
        featured BOOLEAN DEFAULT FALSE,
        is_promoted BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ listings table created\n');

        // Create text_marquee table
        console.log('📄 Creating text_marquee table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS text_marquee (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        background_color VARCHAR(20) DEFAULT '#000000',
        text_color VARCHAR(20) DEFAULT '#FFFFFF',
        speed INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ text_marquee table created\n');

        // Create hero_assets table
        console.log('📄 Creating hero_assets table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS hero_assets (
        id SERIAL PRIMARY KEY,
        page_key VARCHAR(100) UNIQUE NOT NULL,
        asset_url TEXT,
        asset_type VARCHAR(50) DEFAULT 'image',
        overlay_color VARCHAR(20) DEFAULT '#000000',
        overlay_opacity DECIMAL(3,2) DEFAULT 0.4,
        title VARCHAR(255),
        subtitle TEXT,
        cta_text VARCHAR(100),
        cta_link VARCHAR(500),
        cta2_text VARCHAR(100),
        cta2_link VARCHAR(500),
        icon_url TEXT,
        typography JSONB DEFAULT '{}',
        layout_template VARCHAR(50) DEFAULT 'standard',
        style_config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ hero_assets table created\n');

        // Create promotional_banners table
        console.log('📄 Creating promotional_banners table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS promotional_banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        subtitle TEXT,
        media_url TEXT,
        media_type VARCHAR(50) DEFAULT 'image',
        location VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        display_order INTEGER DEFAULT 0,
        background_color VARCHAR(20),
        text_color VARCHAR(20),
        cta_text VARCHAR(100),
        cta_link VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ promotional_banners table created\n');

        // Create carts table
        console.log('📄 Creating carts table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS carts (
        cart_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        session_id VARCHAR(255),
        delivery_type VARCHAR(50),
        delivery_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ carts table created\n');

        // Create cart_items table
        console.log('📄 Creating cart_items table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(cart_id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id),
        quantity INTEGER DEFAULT 1,
        price_snapshot DECIMAL(12,2),
        rental_start_date TIMESTAMP,
        rental_end_date TIMESTAMP,
        rental_duration_days INTEGER,
        service_package TEXT,
        appointment_slot TIMESTAMP,
        selected_variant JSONB,
        selected_addons JSONB,
        selected_sides JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ cart_items table created\n');

        // Create advertisements table
        console.log('📄 Creating advertisements table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS advertisements (
        ad_id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        advertiser_type VARCHAR(50),
        advertiser_id INTEGER,
        advertiser_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        media_type VARCHAR(50),
        media_url TEXT,
        media_urls JSONB DEFAULT '[]',
        thumbnail_url TEXT,
        ad_space_id INTEGER,
        placement_priority INTEGER DEFAULT 0,
        target_pages JSONB DEFAULT '[]',
        target_categories JSONB DEFAULT '[]',
        target_locations JSONB DEFAULT '[]',
        click_action VARCHAR(50),
        target_url TEXT,
        target_store_id INTEGER,
        target_listing_id INTEGER,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        is_active BOOLEAN DEFAULT FALSE,
        created_by INTEGER,
        style_config JSONB DEFAULT '{}',
        layout_template VARCHAR(50) DEFAULT 'standard',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ advertisements table created\n');

        // Create site_sections table
        console.log('📄 Creating site_sections table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS site_sections (
        id SERIAL PRIMARY KEY,
        store_id INTEGER REFERENCES stores(store_id),
        name VARCHAR(100) NOT NULL,
        section_type VARCHAR(50) DEFAULT 'standard',
        title VARCHAR(255),
        body TEXT,
        cta_text VARCHAR(100),
        cta_link VARCHAR(500),
        image_url TEXT,
        list_items JSONB DEFAULT '[]',
        style_config JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ site_sections table created\n');

        console.log('🎉 Database initialization complete!');

    } catch (error) {
        console.error('\n💥 Database initialization failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

initDatabase().catch(err => {
    console.error(err);
    process.exit(1);
});
