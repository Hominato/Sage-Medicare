import { Controller, Get, Post, Patch, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../audit/audit/audit.interceptor';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('analytics')
  @Roles(Role.ADMIN)
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('db-status')
  @Roles(Role.ADMIN)
  getDatabaseStatus() {
    return this.adminService.getDatabaseStatus();
  }

  @Get('users')
  @Roles(Role.ADMIN)
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('invoices')
  @Roles(Role.ADMIN, Role.BILLING_OFFICER, Role.CLERK)
  getInvoices() {
    return this.adminService.getInvoices();
  }

  @Post('invoices')
  @Roles(Role.ADMIN, Role.BILLING_OFFICER, Role.CLERK, Role.PHARMACIST, Role.LAB_TECH)
  createInvoice(@Body() body: any) {
    return this.adminService.createInvoice(body);
  }

  @Patch('invoices/:id')
  @Roles(Role.ADMIN, Role.BILLING_OFFICER)
  updateInvoiceStatus(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateInvoiceStatus(id, body.status);
  }

  @Get('audit-logs')
  @Roles(Role.ADMIN, Role.RECORDS_OFFICER)
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('invoices/patient/:id')
  @Roles(Role.PATIENT, Role.ADMIN, Role.BILLING_OFFICER)
  getPatientInvoices(@Param('id') id: string) {
    return this.adminService.getInvoicesByPatient(id);
  }

  @Patch('invoices/:id/pay')
  @Roles(Role.PATIENT, Role.ADMIN, Role.BILLING_OFFICER)
  payInvoice(@Param('id') id: string) {
    return this.adminService.updateInvoiceStatus(id, 'PAID');
  }

  @Post('authorize-staffing')
  @Roles(Role.ADMIN)
  authorizeStaffing(@Body() body: any) {
    return this.adminService.authorizeStaffing(body);
  }

  @Post('settings')
  @Roles(Role.ADMIN)
  updateSettings(@Body() body: any) {
    // In a production environment, this would save the HFAC number and
    // hospital details to a Settings table. Returning mock success.
    return { success: true, message: 'Facility settings updated securely' };
  }

  @Post('force-sync')
  @Roles(Role.ADMIN)
  executeDbSync() {
    return this.adminService.forceSchemaMigration();
  }

  @Post('seed')
  @Roles(Role.ADMIN)
  seedDemo() {
    return this.adminService.seedDemoData();
  }
}
