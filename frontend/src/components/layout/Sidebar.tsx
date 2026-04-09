"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Calendar, Activity, Pill, Settings, LogOut, 
  DollarSign, Stethoscope, Briefcase, Beaker, Camera, 
  Archive, FileText, Building2, Siren, Terminal
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHMS } from '@/context/HMSContext';

const getNavItems = (role: string) => {
  const allItems = [
    { name: 'Dashboard',     href: '/dashboard',              icon: Home,      roles: ['ADMIN','DOCTOR','NURSE','CLERK','BILLING_OFFICER','PATIENT','PHARMACIST','LAB_TECH','RADIOGRAPHER','RECORDS_OFFICER','PARAMEDIC','IT_ADMIN'] },
    { name: 'Patients',      href: '/dashboard/patients',     icon: Users,     roles: ['ADMIN','DOCTOR','NURSE','CLERK'] },
    { name: 'Appointments',  href: '/dashboard/appointments', icon: Calendar,  roles: ['DOCTOR','NURSE','CLERK','PATIENT'] },
    { name: 'Records (EHR)', href: '/dashboard/records',      icon: Activity,  roles: ['DOCTOR','NURSE','PATIENT','RECORDS_OFFICER'] },
    { name: 'Laboratory',    href: '/dashboard/lab',          icon: Beaker,    roles: ['DOCTOR','NURSE','LAB_TECH'] },
    { name: 'Imaging',       href: '/dashboard/imaging',      icon: Camera,    roles: ['DOCTOR','RADIOGRAPHER'] },
    { name: 'Pharmacy',      href: '/dashboard/pharmacy',     icon: Pill,      roles: ['PHARMACIST','NURSE'] },
    { name: 'Claims',        href: '/dashboard/claims',       icon: DollarSign,roles: ['BILLING_OFFICER','CLERK','PATIENT', 'ADMIN'] },
    { name: 'Wards',         href: '/dashboard/wards',        icon: Building2, roles: ['NURSE','RECORDS_OFFICER','ADMIN'] },
    { name: 'Emergencies',   href: '/dashboard/emergency',    icon: Siren,     roles: ['ADMIN','PARAMEDIC','CLERK'] },
    { name: 'Registry',      href: '/dashboard/records',      icon: Archive,   roles: ['RECORDS_OFFICER'] },
    { name: 'System Admin',  href: '/dashboard/admin',        icon: Settings,  roles: ['ADMIN'] },
    { name: 'IT Center',     href: '/dashboard/it-admin',     icon: Terminal,  roles: ['IT_ADMIN','ADMIN'] },
  ];
  // De-duplicate by href for roles that match multiple entries
  const filtered = allItems.filter(item => item.roles.includes(role));
  const seen = new Set<string>();
  return filtered.filter(item => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
};

const ROLE_COLORS: Record<string, string> = {
  DOCTOR:         'text-sky-300',
  NURSE:          'text-pink-300',
  PHARMACIST:     'text-emerald-300',
  BILLING_OFFICER:'text-amber-300',
  ADMIN:          'text-red-300',
  PATIENT:        'text-blue-300',
  LAB_TECH:       'text-violet-300',
  RADIOGRAPHER:   'text-cyan-300',
  RECORDS_OFFICER:'text-indigo-300',
  CLERK:          'text-orange-300',
  PARAMEDIC:      'text-rose-400',
  IT_ADMIN:       'text-slate-400',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  DOCTOR:         <Stethoscope size={15} />,
  NURSE:          <Activity size={15} />,
  PHARMACIST:     <Pill size={15} />,
  BILLING_OFFICER:<DollarSign size={15} />,
  ADMIN:          <Settings size={15} />,
  PATIENT:        <Users size={15} />,
  LAB_TECH:       <Beaker size={15} />,
  RADIOGRAPHER:   <Camera size={15} />,
  RECORDS_OFFICER:<Archive size={15} />,
  CLERK:          <Briefcase size={15} />,
  PARAMEDIC:      <Siren size={15} />,
  IT_ADMIN:       <Terminal size={15} />,
};

export default function Sidebar({ activeRole }: { activeRole: string }) {
  const pathname = usePathname();
  const navItems = getNavItems(activeRole);
  const { logout, user } = useHMS();

  const displayName = user?.staffProfile
    ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
    : user?.patientProfile
    ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}`
    : user?.email?.split('@')[0] ?? activeRole;

  const roleColor = ROLE_COLORS[activeRole] ?? 'text-indigo-300';
  const roleIcon  = ROLE_ICONS[activeRole]  ?? <Briefcase size={15} />;

  return (
    <div className="w-64 h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50 border-r border-slate-800/50" style={{ backgroundColor: '#0f172a', color: 'white' }}>
      {/* Brand */}
      <div className="p-6 pb-4 border-b border-slate-800/60">
        <h1 className="text-lg font-black tracking-wide flex items-center gap-2 mb-4">
          <Activity className="text-sky-400" size={22} />
          <span className="text-white">MedCare<span className="text-sky-400"> Plus</span></span>
        </h1>

        {/* User identity card */}
        <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
          <p className="text-[11px] font-black text-white/90 truncate leading-tight">{displayName}</p>
          <div className={`flex items-center gap-1.5 mt-1 ${roleColor}`}>
            {roleIcon}
            <span className="text-[9px] font-black uppercase tracking-widest">{activeRole.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={twMerge(clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                isActive
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white font-medium border border-transparent"
              ))}
            >
              <item.icon size={17} className={twMerge(clsx(
                "transition-colors shrink-0",
                isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-white'
              ))} />
              <span>{item.name}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* HIPAA compliance badge */}
      <div className="px-4 py-2">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">HIPAA · NDPA Compliant</span>
        </div>
      </div>

      {/* Logout — calls proper logout(), clears all tokens */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 w-full rounded-xl transition-all duration-200 group text-sm font-bold border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={17} className="group-hover:text-rose-400 transition-colors shrink-0" />
          <span>Secure Logout</span>
        </button>
      </div>
    </div>
  );
}
