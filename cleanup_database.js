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
        
        // 3. Delete all stores (this will cascade to related data)
        console.log('\n🗑️  Deleting all stores...');
        const deleteStores = await client.query('DELETE FROM stores RETURNING store_id, business_name');
        console.log(`   ✓ Deleted ${deleteStores.rowCount} stores`);
        
        if (deleteStores.rows.length > 0) {
            deleteStores.rows.forEach(store => {
                console.log(`     - ${store.business_name} (ID: ${store.store_id})`);
            });
        }
        
        // 4. Delete all users except admin
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
            "DELETE FROM users WHERE email != 'skilli211beng@gmail.com' RETURNING user_id, email, full_name"
        );
        console.log(`   ✓ Deleted ${deleteUsers.rowCount} users`);
        
        if (deleteUsers.rows.length > 0) {
            deleteUsers.rows.forEach(user => {
                console.log(`     - ${user.full_name || 'Unknown'} (${user.email}) (ID: ${user.user_id})`);
            });
        }
        
        // 5. Delete all campaigns
        console.log('\n🗑️  Deleting all campaigns...');
        const campaignsBefore = await client.query('SELECT COUNT(*) as count FROM campaigns');
        const deleteCampaigns = await client.query('DELETE FROM campaigns RETURNING campaign_id, title');
        console.log(`   ✓ Deleted ${deleteCampaigns.rowCount} campaigns`);
        
        if (deleteCampaigns.rows.length > 0) {
            deleteCampaigns.rows.forEach(campaign => {
                console.log(`     - ${campaign.title} (ID: ${campaign.campaign_id})`);
            });
        }
        
        // 6. Verify cleanup
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
