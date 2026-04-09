const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { parse } = require('pg-connection-string');

require('dotenv/config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function run() {
    const config = parse(process.env.DATABASE_URL);
    config.ssl = { rejectUnauthorized: false };
    const pool = new Pool(config);

    const passwordHash = await bcrypt.hash('password123', 10);
    const result = await pool.query('UPDATE "User" SET "passwordHash" = $1', [passwordHash]);
    console.log("Passwords reset natively!", result.rowCount);
    await pool.end();
}
run().catch(console.error);
