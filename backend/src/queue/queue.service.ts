import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async issueToken(
    department: string,
    patientName?: string,
    patientId?: string,
  ) {
    return this.prisma.queueToken.create({
      data: {
        department,
        patientName,
        patientId,
        status: TokenStatus.WAITING,
      },
    });
  }

  async getRecentTokens(department?: string) {
    return this.prisma.queueToken.findMany({
      where: department ? { department } : {},
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async updateTokenStatus(id: string, status: TokenStatus) {
    return this.prisma.queueToken.update({
      where: { id },
      data: { status },
    });
  }
}
