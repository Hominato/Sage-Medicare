import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LabStatus } from '@prisma/client';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  async createOrder(doctorId: string, patientId: string, testType: string) {
    return this.prisma.labOrder.create({
      data: {
        doctorId,
        patientId,
        testType,
        status: LabStatus.PENDING,
      },
    });
  }

  async addResult(orderId: string, findings: string, attachments?: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.labResult.create({
        data: {
          orderId,
          findings,
          attachments,
        },
      });

      await tx.labOrder.update({
        where: { id: orderId },
        data: { status: LabStatus.COMPLETED },
      });

      return result;
    });
  }

  async getPendingOrders() {
    return this.prisma.labOrder.findMany({
      where: { status: LabStatus.PENDING },
      include: {
        patient: { select: { email: true, patient: true } },
        doctor: { select: { email: true, staffProfile: true } },
      },
    });
  }

  async getPatientResults(patientId: string) {
    return this.prisma.labResult.findMany({
      where: { order: { patientId } },
      include: { order: true },
    });
  }

  async markInProgress(orderId: string) {
    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: { status: LabStatus.IN_PROGRESS },
    });
  }

  async getAllOrders() {
    return this.prisma.labOrder.findMany({
      include: {
        patient: { select: { email: true, patient: true } },
        doctor: { select: { email: true, staffProfile: true } },
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
