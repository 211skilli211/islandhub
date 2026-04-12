const { pool } = require('./src/config/db');

async function alter() {
    try {
        console.log('Altering campaign_updates table...');
        await pool.query(`
      ALTER TABLE campaign_updates ADD COLUMN IF NOT EXISTS listing_id INT REFERENCES listings(id) ON DELETE CASCADE NOT NULL;
      ALTER TABLE campaign_updates DROP COLUMN IF EXISTS campaign_id;
      ALTER TABLE campaign_updates RENAME COLUMN user_id TO creator_id;
    `);
        console.log('campaign_updates table altered.');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

alter();