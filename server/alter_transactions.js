const { pool } = require('./src/config/db');

async function alter() {
    try {
        console.log('Altering transactions table...');
        await pool.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS listing_id INT REFERENCES listings(id) ON DELETE CASCADE;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) CHECK (payment_provider IN ('wipay', 'paypal', 'kyrrex', 'dodopay')) DEFAULT 'wipay';
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS crypto_currency VARCHAR(10);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_donation BOOLEAN DEFAULT FALSE;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12,2);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
        console.log('Transactions table altered.');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

alter();