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
import { EmergencyService } from './emergency.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, EmergencyStatus } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('request')
  @Roles(Role.PATIENT, Role.ADMIN, Role.CLERK, Role.PARAMEDIC)
  createRequest(@Body() body: {
    patientId?: string;
    anonymousName?: string;
    location: string;
    description?: string;
  }) {
    return this.emergencyService.createRequest(body);
  }

  @Get('active')
  @Roles(Role.ADMIN, Role.PARAMEDIC, Role.CLERK)
  findAllActive() {
    return this.emergencyService.findAllActive();
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.PARAMEDIC)
  assignToParamedic(
    @Param('id') id: string,
    @Body('paramedicId') paramedicId: string,
  ) {
    return this.emergencyService.assignToParamedic(id, paramedicId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.PARAMEDIC)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: EmergencyStatus,
  ) {
    return this.emergencyService.updateStatus(id, status);
  }

  @Patch('ambulance/:id/location')
  @Roles(Role.PARAMEDIC)
  updateLocation(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.emergencyService.updateLocation(id, body.lat, body.lng);
  }

  @Get('ambulances')
  @Roles(Role.ADMIN, Role.PARAMEDIC)
  getAmbulances() {
    return this.emergencyService.getAmbulances();
  }
}
