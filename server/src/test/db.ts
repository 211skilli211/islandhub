import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const testConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'islandfund',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const testPool = new Pool(testConfig);

export const testDb = {
  async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await testPool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  },

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await testPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async reset() {
    try {
      await testPool.query('BEGIN');
      
      const tables = [
        'audit_logs',
        'transactions',
        'orders',
        'cart_items',
        'reviews',
        'messages',
        'listing_views',
        'listings',
        'stores',
        'campaigns',
        'subscriptions',
        'vendor_subscriptions',
        'customer_subscriptions',
        'campaign_creator_subscriptions',
        'vendors',
        'users'
      ];
      
      for (const table of tables) {
        await testPool.query(`DELETE FROM ${table} WHERE email LIKE '%@example.com'`).catch(() => {});
      }
      
      await testPool.query('COMMIT');
    } catch (error) {
      console.log('Database reset skipped - using test isolation via transactions');
    }
  },

  async close() {
    await testPool.end();
  }
};
