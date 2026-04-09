import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { WardsService } from './wards.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('wards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WardsController {
  constructor(private readonly wardsService: WardsService) {}

  @Get()
  @Roles(Role.NURSE, Role.ADMIN, Role.DOCTOR)
  getWards() {
    return this.wardsService.getWards();
  }

  @Post()
  @Roles(Role.ADMIN)
  createWard(@Body() body: { name: string; department: string }) {
    return this.wardsService.createWard(body.name, body.department);
  }

  @Post(':id/beds')
  @Roles(Role.ADMIN)
  addBed(@Param('id') wardId: string, @Body() body: { number: string }) {
    return this.wardsService.addBed(wardId, body.number);
  }

  @Post('admit')
  @Roles(Role.NURSE, Role.ADMIN)
  admitPatient(
    @Body() body: { patientId: string; bedId: string; notes?: string },
  ) {
    return this.wardsService.admitPatient(
      body.patientId,
      body.bedId,
      body.notes,
    );
  }

  @Post('discharge/:id')
  @Roles(Role.NURSE, Role.ADMIN)
  dischargePatient(@Param('id') admissionId: string) {
    return this.wardsService.dischargePatient(admissionId);
  }
}
