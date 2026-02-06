#!/usr/bin/env node
/**
 * Database Cleanup Script
 * Removes all stores and all users except admin (skilli211beng@gmail.com)
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'islandfund',
    password: process.env.DB_PASSWORD || '135246Rob',
    port: parseInt(process.env.DB_PORT || '5433'),
});

async function cleanupDatabase() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🗄️  Starting database cleanup...\n');
        
        // 1. Get count of stores before deletion
        const storesBefore = await client.query('SELECT COUNT(*) as count FROM stores');
        console.log(`📊 Stores before cleanup: ${storesBefore.rows[0].count}`);
        
        // 2. Get count of users before deletion
        const usersBefore = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`📊 Users before cleanup: ${usersBefore.rows[0].count}`);
        
        // 2b. Get count of campaigns before deletion
        const campaignsBefore = await client.query('SELECT COUNT(*) as count FROM campaigns');
        console.log(`📊 Campaigns before cleanup: ${campaignsBefore.rows[0].count}`);
        
        // 3. Delete related data first (listings, orders, etc.)
        console.log('\n🗑️  Cleaning up related data...');
        
        // Delete menu items first (they reference listings and sections)
        const deleteMenuItems = await client.query('DELETE FROM menu_items RETURNING item_id');
        console.log(`   ✓ Deleted ${deleteMenuItems.rowCount} menu items`);
        
        // Delete menu sections
        const deleteMenuSections = await client.query('DELETE FROM menu_sections RETURNING section_id');
        console.log(`   ✓ Deleted ${deleteMenuSections.rowCount} menu sections`);
        
        // Delete cart items
        const deleteCartItems = await client.query('DELETE FROM cart_items RETURNING item_id');
        console.log(`   ✓ Deleted ${deleteCartItems.rowCount} cart items`);
        
        // Delete carts
        const deleteCarts = await client.query('DELETE FROM carts RETURNING cart_id');
        console.log(`   ✓ Deleted ${deleteCarts.rowCount} carts`);
        
        // Delete listings (they reference stores)
        const deleteListings = await client.query('DELETE FROM listings RETURNING id');
        console.log(`   ✓ Deleted ${deleteListings.rowCount} listings`);
        
        // Delete reviews
        const deleteReviews = await client.query('DELETE FROM reviews RETURNING review_id');
        console.log(`   ✓ Deleted ${deleteReviews.rowCount} reviews`);
        
        // Delete orders
        const deleteOrders = await client.query('DELETE FROM orders RETURNING order_id');
        console.log(`   ✓ Deleted ${deleteOrders.rowCount} orders`);
        
        // Delete campaign-related data
        console.log('\n🗑️  Cleaning up campaigns...');
        
        // Delete donations first (they reference campaigns)
        const deleteDonations = await client.query('DELETE FROM donations RETURNING donation_id');
        console.log(`   ✓ Deleted ${deleteDonations.rowCount} donations`);
        
        // Delete transactions that reference campaigns
        const deleteTransactions = await client.query('DELETE FROM transactions WHERE campaign_id IS NOT NULL RETURNING transaction_id');
        console.log(`   ✓ Deleted ${deleteTransactions.rowCount} campaign transactions`);
        
        // Delete campaign updates
        const deleteCampaignUpdates = await client.query('DELETE FROM campaign_updates RETURNING update_id');
        console.log(`   ✓ Deleted ${deleteCampaignUpdates.rowCount} campaign updates`);
        
        // Delete campaigns
        const deleteCampaigns = await client.query('DELETE FROM campaigns RETURNING campaign_id, title');
        console.log(`   ✓ Deleted ${deleteCampaigns.rowCount} campaigns`);
        
        if (deleteCampaigns.rows.length > 0) {
            deleteCampaigns.rows.forEach(campaign => {
                console.log(`     - ${campaign.title} (ID: ${campaign.campaign_id})`);
            });
        }
        
        // 4. Delete all stores
        console.log('\n🗑️  Deleting all stores...');
        const deleteStores = await client.query('DELETE FROM stores RETURNING store_id, name');
        console.log(`   ✓ Deleted ${deleteStores.rowCount} stores`);
        
        if (deleteStores.rows.length > 0) {
            deleteStores.rows.forEach(store => {
                console.log(`     - ${store.name} (ID: ${store.store_id})`);
            });
        }
        
        // 5. Delete all users except admin
        console.log('\n🗑️  Deleting all users except admin (skilli211beng@gmail.com)...');
        
        // First, find the admin user
        const adminResult = await client.query(
            "SELECT user_id, email FROM users WHERE email = 'skilli211beng@gmail.com'"
        );
        
        if (adminResult.rows.length === 0) {
            console.log('   ⚠️  Warning: Admin user not found!');
        } else {
            const admin = adminResult.rows[0];
            console.log(`   ℹ️  Preserving admin user: ${admin.email} (ID: ${admin.user_id})`);
        }
        
        // Delete all users except the admin
        const deleteUsers = await client.query(
            "DELETE FROM users WHERE email != 'skilli211beng@gmail.com' RETURNING user_id, email, name"
        );
        console.log(`   ✓ Deleted ${deleteUsers.rowCount} users`);
        
        if (deleteUsers.rows.length > 0) {
            deleteUsers.rows.forEach(user => {
                console.log(`     - ${user.name || 'Unknown'} (${user.email}) (ID: ${user.user_id})`);
            });
        }
        
        // 5. Verify cleanup
        const storesAfter = await client.query('SELECT COUNT(*) as count FROM stores');
        const usersAfter = await client.query('SELECT COUNT(*) as count FROM users');
        const campaignsAfter = await client.query('SELECT COUNT(*) as count FROM campaigns');
        
        console.log('\n📊 Cleanup Summary:');
        console.log(`   Stores: ${storesBefore.rows[0].count} → ${storesAfter.rows[0].count}`);
        console.log(`   Users: ${usersBefore.rows[0].count} → ${usersAfter.rows[0].count}`);
        console.log(`   Campaigns: ${campaignsBefore.rows[0].count} → ${campaignsAfter.rows[0].count}`);
        
        await client.query('COMMIT');
        
        console.log('\n✅ Database cleanup completed successfully!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Error during cleanup:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run cleanup
cleanupDatabase();
