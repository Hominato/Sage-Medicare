import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminService } from '../src/admin/admin.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🔍 HMS [PROBE]: Introspecting Supabase Production Instance...');
  try {
    const status = await adminService.getDatabaseStatus();
    const outputPath = path.resolve(__dirname, '../../artifacts/supabase_status.json');
    
    // Ensure artifacts directory exists (handled by system, but being safe)
    fs.writeFileSync(outputPath, JSON.stringify(status, null, 2));
    
    console.log('✅ Probe Complete. Results saved to artifacts/supabase_status.json');
  } catch (err) {
    console.error('❌ Probe Failed:', err.message);
  }

  await app.close();
}

bootstrap();
