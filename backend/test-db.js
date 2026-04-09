const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Connection timed out after 10s')), 10000)
  );

  try {
    console.log('Testing connection to Supabase...');
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as connected`,
      timeoutPromise
    ]);
    console.log('Success:', result);
  } catch (e) {
    console.error('Connection Failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
