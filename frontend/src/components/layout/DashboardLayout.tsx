"use client";
import { useState, createContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export const RoleContext = createContext<{ role: string, setRole: (role: string) => void }>({ role: '', setRole: () => {} });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const savedRole = localStorage.getItem('hms_user_role');
    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'CLERK', 'PHARMACIST', 'BILLING', 'PATIENT', 'RADIOGRAPHER', 'LAB_TECH', 'RECORDS_OFFICER'];
    if (savedRole && validRoles.includes(savedRole)) {
      setRole(savedRole);
    } else {
      // Invalid or missing role — force re-login
      router.replace('/login');
    }
  }, []);

  if (!role) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-slate-400 font-bold animate-pulse">Authenticating session…</div></div>;

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <div className="flex min-h-screen bg-dash-bg">
        <Sidebar activeRole={role} />
        <div className="flex-1 ml-64 flex flex-col">
          {/* Main Dashboard Content */}
          <div className="p-8">
            <div className="glass-panel rounded-3xl min-h-[calc(100vh-8rem)] p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </RoleContext.Provider>
  );
}
