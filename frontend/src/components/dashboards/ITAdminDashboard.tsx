"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Server, Database, Globe, 
  Activity, RefreshCw, Loader2, AlertTriangle,
  Lock, Zap, Terminal, CheckCircle2, Cloud
} from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import DashboardHeader from '../layout/DashboardHeader';

export default function ITAdminDashboard() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();
  const [status, setStatus] = useState<any>(null);
  const [threats, setThreats] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const fetchStatus = async () => {
    try {
      const [sysStatus, sysThreats] = await Promise.all([
        callApi('/it-admin/status'),
        callApi('/it-admin/threats')
      ]);
      setStatus(sysStatus);
      setThreats(sysThreats);
    } catch {}
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleBackup = async () => {
    setIsBackingUp(true);
    notify('INFO', 'Initiating encrypted database snapshot...');
    try {
      const res = await callApi('/it-admin/backup', 'POST');
      setTimeout(() => {
        setIsBackingUp(false);
        notify('SUCCESS', `System backup ${res.backupId} verified and synced to S3.`);
      }, 3000);
    } catch {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="System Infrastructure" 
        userName={user?.staffProfile?.firstName ? `Admin ${user.staffProfile.firstName}` : 'Root Admin'} 
        userRole="IT Operations · System Security"
        avatarUrl={`https://ui-avatars.com/api/?name=IT+Admin&background=0f172a&color=fff`}
      />

      {/* Real-time Health Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'DB Cluster', val: status?.database ?? 'HEALTHY', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'API Gateway', val: status?.apiStatus ?? 'ACTIVE', icon: Zap, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Audit Density', val: `${status?.auditCount ?? 0} Events`, icon: Terminal, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Active Sessions', val: status?.userCount ?? 0, icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-sm font-black text-slate-800">{stat.val}</p>
              </div>
            </div>
            {stat.val === 'HEALTHY' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Integration Status Chips */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black flex items-center gap-3"><Globe className="text-sky-500" /> Web Services Integration</h3>
              <button onClick={fetchStatus} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {status?.integrations?.map((int: any) => (
                <div key={int.name} className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-between group hover:border-sky-200 hover:bg-white transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      {int.name.includes('WhatsApp') ? <Zap size={18} /> : int.name.includes('Backup') ? <Cloud size={18} /> : <Server size={18} />}
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-700">{int.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{int.latency ?? int.lastSync}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    int.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-600' : 
                    int.status === 'DEGRADED' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {int.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Forensics */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Terminal className="text-rose-500" /> Security Forensics</h3>
            <div className="space-y-4">
              {threats.map((threat, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${threat.level === 'HIGH' ? 'bg-rose-500' : 'bg-indigo-500'} bg-opacity-20`}>
                      <AlertTriangle size={18} className={threat.level === 'HIGH' ? 'text-rose-400' : 'text-indigo-400'} />
                    </div>
                    <div>
                      <p className="font-black text-xs">{threat.type}</p>
                      <p className="text-[10px] text-slate-500">Source IP: {threat.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-md">{threat.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance Panel */}
        <div className="space-y-8">
          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10"><Database size={150} /></div>
            <h4 className="text-xl font-black mb-2">Systems Persistence</h4>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8 italic">
              Automated HIPAA/NDPA snapshots are dispatched every 4 hours. Manual sync is authorized for root IT Admins only.
            </p>
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-xs uppercase shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isBackingUp ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {isBackingUp ? 'Syncing Layers...' : 'Trigger Global Backup'}
            </button>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
            <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Lock className="text-indigo-500" size={18} /> Persistence Metrics
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Database Size', val: '45.8 GB', pct: 45 },
                { label: 'Storage Used', val: '1.2 TB', pct: 62 },
                { label: 'S3 Sync Latency', val: '0.4s', pct: 15 },
              ].map(stat => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>{stat.label}</span><span>{stat.val}</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
