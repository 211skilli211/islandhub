const { pool } = require('./src/config/db');
(async () => {
  try {
    const r = await pool.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'hero_assets'::regclass AND contype = 'c'");
    console.log('=== hero_assets constraints ===');
    console.log(JSON.stringify(r.rows, null, 2));
  } catch(e) { console.error('Constraint error:', e.message); }
  try {
    const m = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'media' ORDER BY ordinal_position");
    console.log('=== media columns ===');
    console.log(JSON.stringify(m.rows, null, 2));
  } catch(e) { console.error('Media error:', e.message); }
  try {
    const h = await pool.query("SELECT page_key, asset_type FROM hero_assets WHERE page_key = 'ibt-home'");
    console.log('=== ibt-home hero ===');
    console.log(JSON.stringify(h.rows, null, 2));
  } catch(e) { console.error('Hero error:', e.message); }
  await pool.end();
})();
