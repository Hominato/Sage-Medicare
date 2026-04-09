import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.patientProfile.findMany({
      include: { user: { select: { email: true, role: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, id: true } },
        claims: true,
      },
    });
  }

  async create(data: any) {
    // HIPAA / NDPA: generate a random temporary password and hash it properly
    // — never store plaintext or dummy strings
    const tempPassword = Math.random().toString(36).slice(-10) + 'Hms@1';
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,          // ✅ bcrypt hashed, not dummy string
        role: 'PATIENT',
      },
    });

    const profile = await this.prisma.patientProfile.create({
      data: {
        userId:        user.id,
        firstName:     data.firstName      ?? '',
        lastName:      data.lastName       ?? '',
        dateOfBirth:   data.dateOfBirth    ? new Date(data.dateOfBirth) : new Date(),
        ssnEncrypted:  data.ssn            ?? 'PENDING',
        insuranceInfo: data.insuranceInfo  ?? data.payerType ?? 'None',
        // Nigerian standards fields
        ...(data.phone          && { phone: data.phone }),
        ...(data.gender         && { gender: data.gender }),
        ...(data.bloodGroup     && { bloodGroup: data.bloodGroup }),
        ...(data.genotype       && { genotype: data.genotype }),
        ...(data.nhisNumber     && { nhisNumber: data.nhisNumber }),
        ...(data.state          && { state: data.state }),
        ...(data.lga            && { lga: data.lga }),
        ...(data.nextOfKinName  && { nextOfKinName: data.nextOfKinName }),
        ...(data.nextOfKinPhone && { nextOfKinPhone: data.nextOfKinPhone }),
      },
    });

    // Return the temp password in response so clerk can communicate it to the patient
    // In production, this should be sent via SMS (Twilio/Termii) or secure channel
    return {
      ...profile,
      _temporaryPassword: tempPassword, // show once — never stored in plaintext
    };
  }

  async update(id: string, data: any) {
    return this.prisma.patientProfile.update({
      where: { id },
      data: {
        ...(data.firstName     !== undefined && { firstName: data.firstName }),
        ...(data.lastName      !== undefined && { lastName: data.lastName }),
        ...(data.insuranceInfo !== undefined && { insuranceInfo: data.insuranceInfo }),
        ...(data.phone         !== undefined && { phone: data.phone }),
        ...(data.bloodGroup    !== undefined && { bloodGroup: data.bloodGroup }),
        ...(data.genotype      !== undefined && { genotype: data.genotype }),
        ...(data.nhisNumber    !== undefined && { nhisNumber: data.nhisNumber }),
        ...(data.state         !== undefined && { state: data.state }),
        ...(data.lga           !== undefined && { lga: data.lga }),
        ...(data.nextOfKinName !== undefined && { nextOfKinName: data.nextOfKinName }),
        ...(data.nextOfKinPhone!== undefined && { nextOfKinPhone: data.nextOfKinPhone }),
      },
    });
  }
}
