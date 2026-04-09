import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyStatus } from '@prisma/client';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  async createRequest(data: {
    patientId?: string;
    anonymousName?: string;
    location: string;
    description?: string;
  }) {
    return this.prisma.emergencyRequest.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  }

  async findAllActive() {
    return this.prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED', 'ON_SITE', 'TRANSPORTING'],
        },
      },
      include: {
        patient: true,
        paramedic: {
          select: {
            email: true,
            staffProfile: true,
          },
        },
        ambulance: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignToParamedic(requestId: string, paramedicId: string) {
    // 1. Find an available ambulance assigned to this paramedic
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { paramedicId },
    });

    return this.prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        paramedicId,
        ambulanceId: ambulance?.id || null,
        status: 'ACCEPTED',
      },
    });
  }

  async updateStatus(requestId: string, status: EmergencyStatus) {
    return this.prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }

  async updateLocation(ambulanceId: string, lat: number, lng: number) {
    return this.prisma.ambulance.update({
      where: { id: ambulanceId },
      data: {
        lat,
        lng,
        lastUpdate: new Date(),
        status: 'DISPATCHED',
      },
    });
  }

  async getAmbulances() {
    return this.prisma.ambulance.findMany({
      include: {
        paramedic: {
          select: {
            email: true,
            staffProfile: true,
          },
        },
      },
    });
  }
}
