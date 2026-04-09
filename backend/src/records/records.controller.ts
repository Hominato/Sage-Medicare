import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.CLERK, Role.RECORDS_OFFICER)
  findAll(@Req() req: any) {
    return this.recordsService.findAll(req.user);
  }

  @Get('patient/:id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.CLERK, Role.RECORDS_OFFICER)
  findByPatient(@Param('id') id: string, @Req() req: any) {
    return this.recordsService.findByPatient(id, req.user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.CLERK, Role.RECORDS_OFFICER)
  create(@Body() body: any, @Req() req: any) {
    return this.recordsService.create(body, req.user);
  }

  @Post('vitals')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  createVitals(@Body() body: any, @Req() req: any) {
    return this.recordsService.createVitals(body, req.user);
  }

  @Get('vitals/patient/:id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.CLERK, Role.RECORDS_OFFICER)
  findVitals(@Param('id') id: string, @Req() req: any) {
    return this.recordsService.findVitalsByPatient(id, req.user);
  }

  @Post('nursing-notes')
  @Roles(Role.ADMIN, Role.NURSE)
  createNursingNote(@Body() body: any, @Req() req: any) {
    return this.recordsService.createNursingNote(body, req.user);
  }

  @Get('nursing-notes/patient/:id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECORDS_OFFICER)
  findNursingNotes(@Param('id') id: string, @Req() req: any) {
    return this.recordsService.findNursingNotesByPatient(id, req.user);
  }

  // Medical Records Officer Endpoints
  @Post(':id/archive')
  @Roles(Role.ADMIN, Role.RECORDS_OFFICER)
  archiveRecord(@Param('id') id: string) {
    return this.recordsService.archiveRecord(id);
  }

  @Post(':id/sensitivity')
  @Roles(Role.ADMIN, Role.RECORDS_OFFICER)
  toggleSensitivity(@Param('id') id: string, @Body('isSensitive') isSensitive: boolean) {
    return this.recordsService.toggleSensitivity(id, isSensitive);
  }

  @Get('archived')
  @Roles(Role.ADMIN, Role.RECORDS_OFFICER)
  findAllArchived() {
    return this.recordsService.findAllArchived();
  }

  @Get('audit-trail/:patientId')
  @Roles(Role.ADMIN, Role.RECORDS_OFFICER)
  getAuditTrail(@Param('patientId') patientId: string) {
    return this.recordsService.getPatientAuditTrail(patientId);
  }
}
