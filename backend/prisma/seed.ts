import 'dotenv/config';
import { PrismaClient, Role, AppointmentStatus, LabStatus, TokenStatus } from '@prisma/client';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import * as bcrypt from 'bcrypt';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'pg-connection-string';

const config = parse(process.env.DATABASE_URL as string);
if (!config.ssl || config.ssl === true || typeof config.ssl === 'string') {
  config.ssl = { rejectUnauthorized: false };
}
const pool = new Pool(config as any);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('🌱 Starting seed...');

  // 1. Create Staff Members
  const staffData = [
    { email: 'admin@hms.com', role: Role.ADMIN, first: 'Hakeem', last: 'Balogun' },
    { email: 'doctor1@hms.com', role: Role.DOCTOR, first: 'Abubakar', last: 'Musa', spec: 'Cardiology' },
    { email: 'doctor2@hms.com', role: Role.DOCTOR, first: 'Chinelo', last: 'Okoro', spec: 'General Medicine' },
    { email: 'doctor3@hms.com', role: Role.DOCTOR, first: 'Olapade', last: 'Adeyemi', spec: 'Surgery' },
    { email: 'nurse1@hms.com', role: Role.NURSE, first: 'Fatima', last: 'Ibrahim' },
    { email: 'nurse2@hms.com', role: Role.NURSE, first: 'Zainab', last: 'Bello' },
    { email: 'clerk1@hms.com', role: Role.CLERK, first: 'Samuel', last: 'Ojo' },
    { email: 'pharmacist@hms.com', role: Role.PHARMACIST, first: 'Emeka', last: 'Nwachukwu' },
    { email: 'labtech@hms.com', role: Role.LAB_TECH, first: 'Yusuf', last: 'Abdullahi' },
    { email: 'rad1@hms.com', role: Role.RADIOGRAPHER, first: 'Mark', last: 'Adetiba' },
    { email: 'records@hms.com', role: Role.RECORDS_OFFICER, first: 'Marcus', last: 'Thorne' },
  ];

  const staff = [];
  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash,
        role: s.role,
      },
    });
    
    await prisma.staffProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: s.first,
        lastName: s.last,
        specialization: s.spec || 'Staff',
      }
    });

    staff.push(user);
  }

  // 2. Create Patients
  const patients: any[] = [];
  const firstNames = ['Chinelo', 'Abubakar', 'Olapade', 'Fatima', 'Zainab', 'Emeka', 'Tunde', 'Grace', 'Samuel', 'Amaka', 'Chidi', 'Ngozi', 'Bayo', 'Kemi', 'Yusuf', 'Aisha', 'Chima', 'Uche', 'Bola', 'Sola', 'Damilola', 'Funke', 'Ken', 'Bisi', 'Femi'];
  const lastNames = ['Okoro', 'Musa', 'Adeyemi', 'Ibrahim', 'Bello', 'Nwachukwu', 'Bakare', 'Eze', 'Ojo', 'Umeh', 'Okafor', 'Balogun', 'Abiola', 'Lawal', 'Njoku', 'Nwosu', 'Kalu', 'Adewale', 'Ogunleye', 'Adejumo'];

  const patientNames = [];
  for (let i = 0; i < 25; i++) {
    patientNames.push({
      first: firstNames[i % firstNames.length],
      last: lastNames[i % lastNames.length],
      dob: `${1960 + (i % 40)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`
    });
  }

  for (let i = 0; i < patientNames.length; i++) {
    const email = `patient${i + 1}@hms.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: Role.PATIENT,
      },
    });

    const profile = await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: patientNames[i].first,
        lastName: patientNames[i].last,
        dateOfBirth: new Date(patientNames[i].dob),
        ssnEncrypted: `SSN-${Math.random().toString(36).substring(7).toUpperCase()}`,
        insuranceInfo: 'Medicare-Plus-Standard-Plan',
      },
    });
    patients.push(profile);
  }

  // 3. Clinical Data (Appointments, Labs, Imaging, Vitals, Invoices)
  const dr1 = staff.find(s => s.email === 'doctor1@hms.com');
  const nurse1 = staff.find(s => s.email === 'nurse1@hms.com');
  
  if (dr1 && nurse1) {
    for (let i = 0; i < patients.length; i++) {
        await prisma.appointment.create({
            data: {
                patientId: patients[i].userId,
                doctorId: dr1.id,
                date: new Date(Date.now() + (i % 30) * 86400000), 
                status: AppointmentStatus.SCHEDULED,
            }
        });

        await prisma.labOrder.create({
            data: {
                patientId: patients[i].userId,
                doctorId: dr1.id,
                testType: i % 2 === 0 ? 'Full Blood Count' : 'Urinalysis',
                status: LabStatus.PENDING,
            }
        });

        await prisma.imagingOrder.create({
            data: {
                patientId: patients[i].userId,
                doctorId: dr1.id,
                imagingType: i % 2 === 0 ? 'Chest X-Ray' : 'Abdominal Ultrasound',
                status: LabStatus.PENDING,
            }
        });

        await prisma.vitalSign.create({
            data: {
                patientId: patients[i].userId,
                staffId: nurse1.id,
                bloodPressure: '120/80',
                temperature: 36.5 + (Math.random() * 2),
                heartRate: 70 + Math.floor(Math.random() * 20),
                spO2: 95 + Math.floor(Math.random() * 5),
            }
        });

        await prisma.invoice.create({
            data: {
                userId: patients[i].userId,
                amount: 5000 + (Math.random() * 10000),
                description: 'General Consultation & Routine Checkup',
                status: i % 3 === 0 ? 'PAID' : 'UNPAID',
            }
        });
    }
  }

  // 4. Create Wards & Beds
  const wards = [
    { name: 'General Ward A', dept: 'Internal Medicine' },
    { name: 'Surgical Ward', dept: 'Surgery' },
    { name: 'ICU', dept: 'Emergency' },
  ];

  for (const w of wards) {
    await prisma.ward.create({
      data: {
        name: w.name,
        department: w.dept,
        beds: {
          create: Array.from({ length: 5 }).map((_, i) => ({
            number: `${w.name.charAt(0)}${i + 1}`,
            isOccupied: false,
          })),
        },
      },
    });
  }

  // 5. Pharmacy Inventory
  const drugs = [
    { name: 'Amoxicillin 500mg', stock: 500, threshold: 50 },
    { name: 'Paracetamol 500mg', stock: 1000, threshold: 100 },
    { name: 'Omeprazole 20mg', stock: 300, threshold: 30 },
    { name: 'Metformin 500mg', stock: 450, threshold: 50 },
    { name: 'Lisinopril 10mg', stock: 200, threshold: 25 },
  ];

  for (const d of drugs) {
    await prisma.drugInventory.create({
      data: {
        name: d.name,
        stock: d.stock,
        threshold: d.threshold,
        expiryDate: new Date('2026-12-31'),
      },
    });
  }

  // 6. Queue Tokens
  const tokens = [
    { name: 'John Doe', dept: 'GOPD' },
    { name: 'Mary Smith', dept: 'Pediatrics' },
    { name: 'Isaac Newton', dept: 'Cardiology' },
  ];

  for (const t of tokens) {
    await prisma.queueToken.create({
      data: {
        patientName: t.name,
        department: t.dept,
        status: TokenStatus.WAITING,
      },
    });
  }

  console.log('✅ Seed successful!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
