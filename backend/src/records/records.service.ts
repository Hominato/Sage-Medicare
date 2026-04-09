import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any) {
    let whereClause: any = {};

    if (user.role === 'PATIENT') {
      whereClause = { patientId: user.userId };
    } else if (user.role === 'DOCTOR') {
      whereClause = {
        patient: { patientAppointments: { some: { doctorId: user.userId } } },
      };
    } else if (user.role === 'NURSE') {
      whereClause = {
        patient: { patient: { assignedNurses: { some: { id: user.userId } } } },
      };
    }

    return this.prisma.medicalRecord.findMany({
      where: { ...whereClause, isArchived: false },
      include: {
        patient: {
          select: {
            email: true,
            patient: { select: { firstName: true, lastName: true, isArchived: true } },
          },
        },
        doctor: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: string, user: any) {
    if (user.role === 'PATIENT' && patientId !== user.userId) {
      throw new ForbiddenException("HIPAA Violation: You cannot view records belonging to other patients.");
    }

    let whereClause: any = { patientId };

    if (user.role === 'DOCTOR') {
      whereClause = {
        ...whereClause,
        patient: { patientAppointments: { some: { doctorId: user.userId } } },
      };
    } else if (user.role === 'NURSE') {
      whereClause = {
        ...whereClause,
        patient: { patient: { assignedNurses: { some: { id: user.userId } } } },
      };
    }

    return this.prisma.medicalRecord.findMany({
      where: whereClause,
      include: { doctor: { select: { email: true } } },
    });
  }

  async verifyEditAccess(patientId: string, user: any) {
    if (user.role === 'DOCTOR') {
      const isAssigned = await this.prisma.appointment.findFirst({
        where: { patientId, doctorId: user.userId },
      });
      if (!isAssigned) throw new ForbiddenException("You can only edit medical records of patients assigned to your appointments.");
    } else if (user.role === 'NURSE') {
      const isAssigned = await this.prisma.patientProfile.findFirst({
        where: { userId: patientId, assignedNurses: { some: { id: user.userId } } },
      });
      if (!isAssigned) throw new ForbiddenException("You can only edit medical records of patients assigned to your ward.");
    }
  }

  async create(data: any, user: any) {
    await this.verifyEditAccess(data.patientId, user);

    if (user.role === 'CLERK' && data.diagnosis) {
      throw new ForbiddenException("Clerks have heavily restricted access and cannot submit medical diagnostic data.");
    }

    return this.prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis || 'Administrative Entry ONLY',
        notesEncrypted: data.notesEncrypted || 'default_encryption_mock',
        attachments: data.attachments || null,
      },
    });
  }

  async createVitals(data: any, user: any) {
    await this.verifyEditAccess(data.patientId, user);
    return this.prisma.vitalSign.create({
      data: {
        patientId: data.patientId,
        staffId: data.staffId,
        bloodPressure: data.bloodPressure,
        temperature: parseFloat(data.temperature),
        heartRate: parseInt(data.heartRate),
        respiratoryRate: parseInt(data.respiratoryRate),
        spO2: parseInt(data.spO2),
        weight: parseFloat(data.weight),
      },
    });
  }

  async findVitalsByPatient(patientId: string, user: any) {
    if (user.role === 'PATIENT' && patientId !== user.userId) {
      throw new ForbiddenException("HIPAA Violation: You cannot view non-assigned vitals.");
    }
    return this.prisma.vitalSign.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async createNursingNote(data: any, user: any) {
    await this.verifyEditAccess(data.patientId, user);
    return this.prisma.nursingNote.create({
      data: {
        patientId: data.patientId,
        nurseId: data.nurseId,
        note: data.note,
      },
    });
  }

  async findNursingNotesByPatient(patientId: string, user: any) {
    if (user.role === 'PATIENT' && patientId !== user.userId) {
      throw new ForbiddenException("HIPAA Violation: You cannot view nursing notes dynamically.");
    }
    return this.prisma.nursingNote.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: { nurse: { select: { email: true } } },
    });
  }

  // Medical Records Officer Features
  async archiveRecord(id: string) {
    return this.prisma.medicalRecord.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async toggleSensitivity(id: string, isSensitive: boolean) {
    return this.prisma.medicalRecord.update({
      where: { id },
      data: { isSensitive },
    });
  }

  async findAllArchived() {
    return this.prisma.medicalRecord.findMany({
      where: { isArchived: true },
      include: {
        patient: { select: { staffProfile: true, email: true } },
        doctor: { select: { email: true } },
      },
    });
  }

  async getPatientAuditTrail(patientId: string) {
    return this.prisma.auditLog.findMany({
      where: { resource: { contains: patientId } },
      include: { user: { select: { email: true, role: true } } },
      orderBy: { timestamp: 'desc' },
    });
  }
}
