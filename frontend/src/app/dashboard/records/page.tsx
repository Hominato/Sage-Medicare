"use client";
import { useHMS } from '@/context/HMSContext';
import RecordsOfficerDashboard from '@/components/dashboards/RecordsOfficerDashboard';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import NurseDashboard from '@/components/dashboards/NurseDashboard';
import ClerkDashboard from '@/components/dashboards/ClerkDashboard';
import { Loader2 } from 'lucide-react';

export default function RecordsPage() {
const { role } = useHMS() as { role: string | null };
  
  if (!role) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-[10px]">Verifying Security Clearance...</p>
      </div>
    );
  }

  // DISPATCHER LOGIC:
  // 1. Records Officer and Admin get the full Registry & Audit power tools.
  if (role === 'RECORDS_OFFICER' || role === 'ADMIN') {
    return <RecordsOfficerDashboard />;
  }

  // 2. Patients get their personal medical portal view.
  if (role === 'PATIENT') {
    return <PatientDashboard />;
  }

  // 3. Clinical Staff (Doctors/Nurses) get their workstation view.
  // Both Dashboards are designed to start in a "Select Patient" standby mode
  // allowing them to search and view EHR for their assigned cases.
  if (role === 'DOCTOR') {
    return <DoctorDashboard />;
  }
  
  if (role === 'NURSE') {
    return <NurseDashboard />;
  }

  // 4. Clerks get the registration & queue management dashboard.
  if (role === 'CLERK') {
    return <ClerkDashboard />;
  }

  return (
    <div className="p-12 text-center">
      <h3 className="text-2xl font-black text-slate-800">Security Restriction</h3>
      <p className="text-slate-500 mt-2">Your role ({role}) does not have clinical registry permissions.</p>
    </div>
  );
}
