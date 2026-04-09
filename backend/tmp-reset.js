const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { parse } = require('pg-connection-string');

require('dotenv/config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function run() {
    const config = parse(process.env.DATABASE_URL);
    config.ssl = { rejectUnauthorized: false };
    const pool = new Pool(config);
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.updateMany({
        data: { passwordHash }
    });
    console.log("All passwords reset to password123!");
    await prisma.$disconnect();
    process.exit(0);
}
run();
