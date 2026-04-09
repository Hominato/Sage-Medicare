import { Module } from '@nestjs/common';
import { ImagingService } from './imaging.service';
import { ImagingController } from './imaging.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [ImagingService],
  controllers: [ImagingController]
})
export class ImagingModule {}
