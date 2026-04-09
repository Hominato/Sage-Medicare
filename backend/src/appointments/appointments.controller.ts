import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.CLERK, Role.PATIENT)
  findAll(@Request() req: any) {
    return this.appointmentsService.findAll(req.user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.CLERK, Role.PATIENT)
  create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  @Put(':id/status')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.CLERK)
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Get('doctors')
  @Roles(Role.PATIENT, Role.ADMIN, Role.CLERK)
  getDoctors() {
    return this.appointmentsService.getDoctors();
  }
}
