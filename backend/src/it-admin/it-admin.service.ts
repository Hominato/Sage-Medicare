import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItAdminService {
  constructor(private prisma: PrismaService) {}

  async getSystemStatus() {
    const [auditCount, userCount, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.user.count(),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { email: true, role: true } } }
      })
    ]);

    return {
      database: 'HEALTHY',
      apiStatus: 'OPERATIONAL',
      auditCount,
      userCount,
      recentAlerts: logs.filter(l => l.action.includes('DELETE') || l.action.includes('FAILED')),
      integrations: [
        { name: 'WhatsApp Gateway', status: 'CONNECTED', latency: '45ms' },
        { name: 'SMS Hub (Nigeria)', status: 'CONNECTED', latency: '120ms' },
        { name: 'Stripe Payments', status: 'DEGRADED', latency: '1.2s' },
        { name: 'Backup Engine', status: 'IDLE', lastSync: new Date().toISOString() },
      ]
    };
  }

  async runBackup() {
    // Simulate a multi-stage backup process for the IT Admin dashboard
    return {
      success: true,
      backupId: `BK-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      size: '2.4GB',
      storage: 'Encrypted S3 Bucket (EU-West-1)',
    };
  }

  async getSecurityThreats() {
    // Mocking some security threat analysis for the high-fidelity dashboard
    return [
      { level: 'LOW', type: 'Brute Force Attempt', ip: '192.168.1.45', status: 'BLOCKED' },
      { level: 'MEDIUM', type: 'Anomalous Export', ip: '102.89.34.12', status: 'INVESTIGATING' },
    ];
  }
}
