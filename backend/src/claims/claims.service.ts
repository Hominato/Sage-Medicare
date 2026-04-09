import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.claim.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async findByPatient(patientProfileId: string) {
    return this.prisma.claim.findMany({
      where: { patientProfileId },
    });
  }

  async create(data: any) {
    return this.prisma.claim.create({
      data: {
        patientProfileId: data.patientProfileId,
        amount: data.amount,
        type: data.type, // 'Medicare' | 'Medicaid'
        status: 'PENDING',
        notes: data.notes || null,
      },
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.claim.update({
      where: { id },
      data: { status },
    });
  }
}
