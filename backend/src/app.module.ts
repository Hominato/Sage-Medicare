import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AuditModule } from './audit/audit.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { RecordsModule } from './records/records.module';
import { ClaimsModule } from './claims/claims.module';
import { AdminModule } from './admin/admin.module';
import { LabModule } from './lab/lab.module';
import { WardsModule } from './wards/wards.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { QueueModule } from './queue/queue.module';
import { ImagingModule } from './imaging/imaging.module';
import { EmergencyModule } from './emergency/emergency.module';
import { ItAdminModule } from './it-admin/it-admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    AuditModule,
    AppointmentsModule,
    RecordsModule,
    ClaimsModule,
    AdminModule,
    LabModule,
    WardsModule,
    PharmacyModule,
    QueueModule,
    ImagingModule,
    EmergencyModule,
    ItAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
