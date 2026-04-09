import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WardsService {
  constructor(private prisma: PrismaService) {}

  async getWards() {
    return this.prisma.ward.findMany({
      include: {
        beds: {
          include: {
            admissions: {
              where: { dischargedAt: null },
              include: {
                patient: {
                  include: {
                    patient: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async createWard(name: string, department: string) {
    return this.prisma.ward.create({
      data: { name, department },
    });
  }

  async addBed(wardId: string, number: string) {
    return this.prisma.bed.create({
      data: { wardId, number },
    });
  }

  async admitPatient(patientId: string, bedId: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check if bed is occupied
      const bed = await tx.bed.findUnique({ where: { id: bedId } });
      if (!bed) throw new Error('Bed not found');
      if (bed.isOccupied) throw new Error('Bed is already occupied');

      const admission = await tx.inpatientAdmission.create({
        data: { patientId, bedId, notes },
      });

      await tx.bed.update({
        where: { id: bedId },
        data: { isOccupied: true },
      });

      return admission;
    });
  }

  async dischargePatient(admissionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const admission = await tx.inpatientAdmission.findUnique({
        where: { id: admissionId },
      });
      if (!admission) throw new Error('Admission not found');

      await tx.inpatientAdmission.update({
        where: { id: admissionId },
        data: { dischargedAt: new Date() },
      });

      await tx.bed.update({
        where: { id: admission.bedId },
        data: { isOccupied: false },
      });

      return { status: 'DISCHARGED' };
    });
  }
}
