import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Role } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsappService,
  ) {}

  async findAll(user: any) {
    const where: any = {};
    if (user.role === Role.PATIENT) {
      where.patientId = user.userId;
    } else if (user.role === Role.DOCTOR) {
      where.doctorId = user.userId;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { email: true, patient: true } },
        doctor: { select: { email: true, staffProfile: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: {
    patientId: string;
    doctorId: string;
    date: string | Date;
  }) {
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        status: 'SCHEDULED',
      },
      include: {
        patient: {
          select: {
            email: true,
            patient: { select: { firstName: true, lastName: true } },
          },
        },
        doctor: { select: { email: true, staffProfile: true } },
      },
    });

    // Advanced Feature: Automated WhatsApp Notification
    await this.whatsapp.sendAppointmentReminder(
      appointment.patient.email, // Mocking phone as email for this demo
      appointment.date.toLocaleString(),
      appointment.doctor.email,
    );

    return appointment;
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  async getDoctors() {
    return this.prisma.user.findMany({
      where: { role: Role.DOCTOR },
      include: { staffProfile: true },
    });
  }
}
