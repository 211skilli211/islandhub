const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function run() {
    try {
        const client = await pool.connect();

        // 1. Get a user
        const userRes = await client.query("SELECT user_id, role FROM users LIMIT 1");
        if (userRes.rows.length === 0) {
            console.log("No users found");
            return;
        }
        const user = userRes.rows[0];
        console.log("Found user:", user);

        // 2. Try the UPDATE query exactly as in controller
        // const { name, email, role, is_active } = req.body;
        // req.body = { role: 'admin' } -> others are undefined.
        // params = [name, email, role, is_active, userId]
        // [undefined, undefined, 'admin', undefined, user.user_id]

        const userId = user.user_id;
        const name = undefined;
        const email = undefined;
        const role = 'admin';
        const is_active = undefined;

        console.log("Executing UPDATE with params:", [name, email, role, is_active, userId]);

        try {
            const result = await client.query(
                `UPDATE users 
             SET name = COALESCE($1, name), 
                 email = COALESCE($2, email), 
                 role = COALESCE($3, role), 
                 is_active = COALESCE($4, is_active),
                 updated_at = NOW()
             WHERE user_id = $5 RETURNING user_id, name, email, role, is_active`,
                [name, email, role, is_active, userId]
            );
            console.log("Update success:", result.rows[0]);
        } catch (e) {
            console.error("Update FAILED:", e);
        }

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

run();
