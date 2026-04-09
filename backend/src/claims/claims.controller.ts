import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('claims')
export class ClaimsController {
  constructor(private claimsService: ClaimsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.BILLING_OFFICER)
  findAll() {
    return this.claimsService.findAll();
  }

  @Get('patient/:profileId')
  @Roles(Role.ADMIN, Role.BILLING_OFFICER, Role.PATIENT)
  findByPatient(@Param('profileId') profileId: string) {
    return this.claimsService.findByPatient(profileId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.BILLING_OFFICER, Role.DOCTOR, Role.CLERK)
  create(@Body() body: any) {
    return this.claimsService.create(body);
  }

  @Put(':id/status')
  @Roles(Role.ADMIN, Role.BILLING_OFFICER)
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.claimsService.updateStatus(id, status);
  }
}
