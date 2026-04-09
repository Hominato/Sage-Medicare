import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('inventory')
  @Roles(Role.PHARMACIST, Role.ADMIN, Role.DOCTOR)
  getInventory() {
    return this.pharmacyService.getInventory();
  }

  @Get('prescriptions/pending')
  @Roles(Role.PHARMACIST, Role.ADMIN, Role.DOCTOR)
  getPendingPrescriptions() {
    return this.pharmacyService.getPendingPrescriptions();
  }

  @Post('prescription')
  @Roles(Role.DOCTOR, Role.ADMIN)
  createPrescription(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      drugId: string;
      dosage: string;
    },
  ) {
    return this.pharmacyService.createPrescription(body);
  }

  @Patch('prescription/:id/dispense')
  @Roles(Role.PHARMACIST, Role.ADMIN)
  dispensePrescription(@Param('id') id: string) {
    return this.pharmacyService.dispensePrescription(id);
  }

  @Get('patient/:id')
  @Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR)
  getByPatient(@Param('id') id: string) {
    return this.pharmacyService.getByPatient(id);
  }
}
