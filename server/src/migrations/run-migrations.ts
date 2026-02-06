#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs all pending migrations in order
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'islandfund',
  password: process.env.DB_PASSWORD || '135246Rob',
  port: parseInt(process.env.DB_PORT || '5433'),
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migrations...\n');
    
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of executed migrations
    const executedResult = await client.query('SELECT filename FROM migrations');
    const executedMigrations = new Set(executedResult.rows.map((r: { filename: string }) => r.filename));
    
    // Read all migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    let executedCount = 0;
    
    for (const filename of migrationFiles) {
      if (executedMigrations.has(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }
      
      console.log(`🔄 Executing ${filename}...`);
      
      const filePath = path.join(migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query('BEGIN');
      
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        await client.query('COMMIT');
        
        console.log(`✅ ${filename} executed successfully`);
        executedCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error executing ${filename}:`, (error as Error).message);
        throw error;
      }
    }
    
    console.log(`\n🎉 Migrations complete! Executed ${executedCount} new migrations.`);
    
  } catch (error) {
    console.error('\n💥 Migration failed:', (error as Error).message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
