import { Controller, Post, Get, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { LabService } from './lab.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('lab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('order')
  @Roles(Role.DOCTOR)
  createOrder(
    @Body() body: { doctorId: string; patientId: string; testType: string },
  ) {
    return this.labService.createOrder(
      body.doctorId,
      body.patientId,
      body.testType,
    );
  }

  @Post(':id/result')
  @Roles(Role.NURSE, Role.ADMIN) // Assuming Nurses or Admin can input results if no Lab Tech role
  addResult(
    @Param('id') orderId: string,
    @Body() body: { findings: string; attachments?: string },
  ) {
    return this.labService.addResult(orderId, body.findings, body.attachments);
  }

  @Get('pending')
  @Roles(Role.NURSE, Role.DOCTOR, Role.ADMIN)
  getPendingOrders() {
    return this.labService.getPendingOrders();
  }

  @Get('patient/:patientId')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.NURSE, Role.LAB_TECH)
  getPatientResults(@Param('patientId') patientId: string) {
    return this.labService.getPatientResults(patientId);
  }

  @Get('all')
  @Roles(Role.LAB_TECH, Role.ADMIN, Role.DOCTOR)
  getAllOrders() {
    return this.labService.getAllOrders();
  }

  @Patch(':id/in-progress')
  @Roles(Role.LAB_TECH, Role.ADMIN)
  markInProgress(@Param('id') id: string) {
    return this.labService.markInProgress(id);
  }
}
