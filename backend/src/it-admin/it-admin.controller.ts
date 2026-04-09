import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ItAdminService } from './it-admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('it-admin')
export class ItAdminController {
  constructor(private readonly itAdminService: ItAdminService) {}

  @Get('status')
  @Roles(Role.ADMIN, Role.IT_ADMIN)
  getSystemStatus() {
    return this.itAdminService.getSystemStatus();
  }

  @Post('backup')
  @Roles(Role.IT_ADMIN)
  runBackup() {
    return this.itAdminService.runBackup();
  }

  @Get('threats')
  @Roles(Role.IT_ADMIN)
  getSecurityThreats() {
    return this.itAdminService.getSecurityThreats();
  }
}
