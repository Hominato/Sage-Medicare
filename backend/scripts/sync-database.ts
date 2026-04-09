import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminService } from '../src/admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Synchronizing HMS Institutional Schema...');
  try {
    const syncRes = await adminService.forceSchemaMigration();
    console.log('✅ Schema Sync:', syncRes.message);
  } catch (err) {
    console.error('❌ Schema Sync Failed:', err.message);
  }

  console.log('🌱 Broadcasting Clinical Demo Records...');
  try {
    const seedRes = await adminService.seedDemoData();
    console.log('✅ Seeding Status:', seedRes.message);
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
  }

  await app.close();
  console.log('🏁 Synchronization Complete.');
}

bootstrap();
