import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'pg-connection-string';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const config = parse(process.env.DATABASE_URL as string);
    config.ssl = { rejectUnauthorized: false };
    const pool = new Pool(config as any);
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    } as any);
  }

  async onModuleInit() {
    console.log(
      '✅ MedCare Database Layer Initialized (Supabase connection ready)',
    );
  }
}
