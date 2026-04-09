import { Module } from '@nestjs/common';
import { ItAdminController } from './it-admin.controller';
import { ItAdminService } from './it-admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ItAdminController],
  providers: [ItAdminService],
  exports: [ItAdminService],
})
export class ItAdminModule {}
