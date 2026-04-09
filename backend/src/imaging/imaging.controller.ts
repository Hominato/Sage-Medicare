import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImagingService } from './imaging.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('imaging')
export class ImagingController {
  constructor(private readonly imagingService: ImagingService) {}

  @Get('pending')
  @Roles(Role.ADMIN, Role.RADIOGRAPHER)
  findAllPending() {
    return this.imagingService.findAllPending();
  }

  @Patch(':id/in-progress')
  @Roles(Role.ADMIN, Role.RADIOGRAPHER)
  markInProgress(@Param('id') id: string) {
    return this.imagingService.markInProgress(id);
  }

  @Patch(':id/result')
  @Roles(Role.ADMIN, Role.RADIOGRAPHER)
  updateResult(
    @Param('id') id: string,
    @Body() body: { findings: string; attachments?: string },
  ) {
    return this.imagingService.updateResult(id, body);
  }

  @Get('patient/:id')
  @Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR)
  findByPatient(@Param('id') id: string) {
    return this.imagingService.findByPatient(id);
  }
}
