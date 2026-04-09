'use client';

import React, { useEffect, useState } from 'react';
import { Database, Cloud, CheckCircle, AlertTriangle, Shield, Table, Users } from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';

export default function DatabaseDiagnostic() {
  const { callApi } = useHMSApi();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await callApi('/admin/db-status', 'GET');
        setStatus(data);
      } catch (err) {
        setError('Failed to reach institutional diagnostic endpoint');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-48 bg-white/10 rounded mb-4"></div>
      <div className="h-32 bg-white/5 rounded"></div>
    </div>
  );

  if (error || !status) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-rose-300 flex items-start gap-4 text-xs font-mono">
      <AlertTriangle size={16} className="shrink-0" />
      <div>
        <h4 className="font-black uppercase tracking-widest mb-1 text-[10px]">Infrastructure Desync Alert</h4>
        <p>{error || 'Database is currently unreachable or desynced.'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="bg-white/[0.03] border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Cloud size={18} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-[11px] text-white">Live Cloud Status</h3>
            <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 uppercase tracking-tighter">
              <CheckCircle size={10} /> Fully Synchronized to Supabase
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/40 uppercase">Project:</span>
          <span className="text-[9px] font-mono text-white/80 bg-white/10 px-2 py-0.5 rounded">{status.projectRef}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Enums */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Shield size={14} className="text-sky-400" />
            <h4 className="text-[10px] uppercase font-black tracking-widest">PostgreSQL Identity Registry</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
            {status.roles.map((role: string) => (
              <span 
                key={role} 
                className={`px-2 py-0.5 rounded border ${
                  ['BILLING_OFFICER', 'PARAMEDIC', 'IT_ADMIN'].includes(role) 
                  ? 'bg-sky-500/20 border-sky-500/30 text-sky-300' 
                  : 'bg-white/10 border-white/10 text-white/60'
                }`}
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Table size={14} className="text-purple-400" />
            <h4 className="text-[10px] uppercase font-black tracking-widest">Medical Logic Tables</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
            {status.tables.map((table: string) => (
              <span 
                key={table} 
                className={`px-2 py-0.5 rounded border ${
                  ['Ambulance', 'EmergencyRequest'].includes(table) 
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' 
                  : 'bg-white/10 border-white/10 text-white/60'
                }`}
              >
                {table}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between font-mono text-[8px] text-white/30 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Database size={10} /> {status.host}</span>
          <span className="flex items-center gap-1"><Users size={10} /> Active Indices: {status.totalUsers}</span>
        </div>
        <span>Latent Last Check: {new Date(status.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
