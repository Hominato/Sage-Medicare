import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionStatus } from '@prisma/client';

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async getInventory() {
    return this.prisma.drugInventory.findMany();
  }

  async getPendingPrescriptions() {
    return this.prisma.prescription.findMany({
      where: { status: PrescriptionStatus.ISSUED },
      include: {
        patient: { select: { patient: true, email: true } },
        doctor: { select: { email: true, staffProfile: true } },
        drug: true,
      },
    });
  }

  async createPrescription(data: {
    patientId: string;
    doctorId: string;
    drugId: string;
    dosage: string;
  }) {
    return this.prisma.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        drugId: data.drugId,
        dosage: data.dosage,
        status: PrescriptionStatus.ISSUED,
      },
      include: {
        patient: { select: { email: true } },
        drug: true,
      },
    });
  }

  async dispensePrescription(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const prescription = await tx.prescription.findUnique({
        where: { id },
        include: { drug: true },
      });

      if (!prescription) throw new Error('Prescription not found');
      if (prescription.status === PrescriptionStatus.DISPENSED)
        throw new Error('Already dispensed');

      // Update inventory
      await tx.drugInventory.update({
        where: { id: prescription.drugId },
        data: { stock: { decrement: 1 } },
      });

      // Update status
      return tx.prescription.update({
        where: { id },
        data: { status: PrescriptionStatus.DISPENSED },
      });
    });
  }

  async getByPatient(patientId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: { select: { staffProfile: true, email: true } },
        drug: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
