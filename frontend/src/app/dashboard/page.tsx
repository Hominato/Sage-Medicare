"use client";
import { useContext } from 'react';
import { RoleContext } from '@/components/layout/DashboardLayout';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import NurseDashboard from '@/components/dashboards/NurseDashboard';
import ClerkDashboard from '@/components/dashboards/ClerkDashboard';
import PharmacyDashboard from '@/components/dashboards/PharmacyDashboard';
import LabManagementDashboard from '@/components/dashboards/LabManagementDashboard';
import BillingDashboard from '@/components/dashboards/BillingDashboard';
import RadiographerDashboard from '@/components/dashboards/RadiographerDashboard';
import RecordsOfficerDashboard from '@/components/dashboards/RecordsOfficerDashboard';
import AdminDashboardPage from './admin/page';
import ITAdminDashboard from '@/components/dashboards/ITAdminDashboard';
import ParamedicDashboard from '@/components/dashboards/ParamedicDashboard';

export default function DashboardDispatcher() {
  const { role } = useContext(RoleContext);

  if (role === 'PATIENT') return <PatientDashboard />;
  if (role === 'DOCTOR') return <DoctorDashboard />;
  if (role === 'NURSE') return <NurseDashboard />;
  if (role === 'CLERK') return <ClerkDashboard />;
  if (role === 'PHARMACIST') return <PharmacyDashboard />;
  if (role === 'LAB_TECH') return <LabManagementDashboard />;
  if (role === 'RADIOGRAPHER') return <RadiographerDashboard />;
  if (role === 'RECORDS_OFFICER') return <RecordsOfficerDashboard />;
  if (role === 'BILLING_OFFICER') return <BillingDashboard />;
  if (role === 'ADMIN') return <AdminDashboardPage />;
  if (role === 'IT_ADMIN') return <ITAdminDashboard />;
  if (role === 'PARAMEDIC') return <ParamedicDashboard />;

  return null;
}
