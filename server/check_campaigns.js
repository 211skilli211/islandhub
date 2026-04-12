const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'islandfund',
  password: process.env.DB_PASSWORD || '135246Rob',
  port: parseInt(process.env.DB_PORT || '5433'),
});

async function checkTables() {
  const client = await pool.connect();
  try {
    // Check campaigns table columns
    const campaignsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'campaigns'
      ORDER BY ordinal_position
    `);
    console.log('Campaigns table columns:');
    campaignsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if there are any foreign keys referencing campaigns
    const fkResult = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND ccu.table_name = 'campaigns'
    `);
    console.log('\nTables referencing campaigns:');
    fkResult.rows.forEach(fk => {
      console.log(`  - ${fk.table_name}.${fk.column_name} -> campaigns.${fk.foreign_column_name}`);
    });
    
    // Simple delete without worrying about foreign keys
    console.log('\nAttempting to delete campaigns...');
    await client.query('BEGIN');
    const result = await client.query('DELETE FROM campaigns WHERE campaign_id IN (2, 3) RETURNING campaign_id, title');
    await client.query('COMMIT');
    console.log('Deleted:', result.rows);
    
    // Verify
    const checkResult = await client.query('SELECT COUNT(*) as count FROM campaigns');
    console.log('Remaining campaigns:', checkResult.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
    await client.query('ROLLBACK').catch(() => {});
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables();
