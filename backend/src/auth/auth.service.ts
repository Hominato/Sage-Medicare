import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Fetch full profile for UI
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { staffProfile: true, patient: true },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        staffProfile: fullUser?.staffProfile || null,
        patientProfile: fullUser?.patient || null,
      },
    };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role || 'PATIENT',
      },
    });

    if (user.role === 'PATIENT') {
      await this.prisma.patientProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          dateOfBirth: data.dob ? new Date(data.dob) : new Date(),
          ssnEncrypted: data.ssn || 'mock-encrypted-ssn',
          insuranceInfo: data.insurance || 'None',
        },
      });
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}
