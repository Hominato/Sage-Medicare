const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT 1 as result`;
    console.log("DB CONNECTION SUCCESS:", res);
    
    // Add columns manually if they don't exist
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "phone" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "gender" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "bloodGroup" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "genotype" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "nhisNumber" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "state" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "lga" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "nextOfKinName" text;`;
    await prisma.$executeRaw`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "nextOfKinPhone" text;`;
    
    console.log("ALTER TABLE COMMANDS EXECUTED");
  } catch (e) {
    console.error("DB CONNECTION FAILED:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
