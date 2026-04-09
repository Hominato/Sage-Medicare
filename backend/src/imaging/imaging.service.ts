import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagingService {
  constructor(private prisma: PrismaService) {}

  // ✅ Fixed: return both PENDING and IN_PROGRESS so Radiographer can see their active queue
  async findAllPending() {
    return this.prisma.imagingOrder.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: {
        patient: {
          select: {
            email: true,
            patient: { select: { firstName: true, lastName: true } },
          },
        },
        doctor: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.imagingOrder.findMany({
      include: {
        patient: {
          select: {
            email: true,
            patient: { select: { firstName: true, lastName: true } },
          },
        },
        doctor: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markInProgress(id: string) {
    return this.prisma.imagingOrder.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }

  async updateResult(id: string, data: { findings: string; attachments?: string }) {
    return this.prisma.imagingOrder.update({
      where: { id },
      data: {
        findings: data.findings,
        attachments: data.attachments,
        status: 'COMPLETED',
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.imagingOrder.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
