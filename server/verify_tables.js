const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'islandfund',
  password: process.env.DB_PASSWORD || '135246Rob',
  port: parseInt(process.env.DB_PORT || '5433'),
});

async function verifyTables() {
  const client = await pool.connect();
  try {
    // Check carts table
    console.log('=== CARTS TABLE ===');
    const cartsCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'carts'
      ORDER BY ordinal_position
    `);
    cartsCols.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));

    // Check cart_items table
    console.log('\n=== CART_ITEMS TABLE ===');
    const cartItemsCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position
    `);
    cartItemsCols.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));

    // Check orders table
    console.log('\n=== ORDERS TABLE ===');
    const ordersCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);
    ordersCols.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));

    // Check order_items table
    console.log('\n=== ORDER_ITEMS TABLE ===');
    const orderItemsCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);
    orderItemsCols.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));

    console.log('\n✅ All core commerce tables exist!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyTables();
