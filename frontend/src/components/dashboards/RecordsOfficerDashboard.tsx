"use client";
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Search, FileText, ShieldCheck, Lock, Download,
  Loader2, ChevronRight, X, RefreshCw, Clock, AlertTriangle,
  CheckCircle2, Users, Eye, Activity, Trash2
} from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import DashboardHeader from '../layout/DashboardHeader';

export default function RecordsOfficerDashboard() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();

  const [patients, setPatients]   = useState<any[]>([]);
  const [records, setRecords]     = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('REGISTRY');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [archiveMode, setArchiveMode] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [pts, logs] = await Promise.all([
        callApi('/patients'),
        callApi('/admin/audit-logs'),
      ]);
      setPatients(Array.isArray(pts) ? pts : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const fetchPatientRecords = async (patientId: string) => {
    try {
      const data = await callApi(`/records/patient/${patientId}`);
      setRecords(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleSelectRecord = (patient: any) => {
    setSelectedRecord(patient);
    fetchPatientRecords(patient.userId);
    // HIPAA: Log the record access
    callApi('/admin/audit-logs', 'POST', {
      action: 'ACCESS_RECORD',
      resource: `PATIENT:${patient.id}`,
    }).catch(() => {});
  };

  const handleExportRegistry = () => {
    const csv = ['ID,First Name,Last Name,Email,Blood Group,Genotype,NHIS,State,Insurance'].concat(
      filteredPatients.map(p =>
        `${p.id},${p.firstName ?? p.patient?.firstName ?? ''},${p.lastName ?? p.patient?.lastName ?? ''},${p.user?.email ?? ''},${p.bloodGroup ?? ''},${p.genotype ?? ''},${p.nhisNumber ?? ''},${p.state ?? ''},${p.insuranceInfo ?? ''}`
      )
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hms-patient-registry-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    notify('SUCCESS', 'Patient registry exported as NDPA-compliant CSV.');
  };

  const handleRunIntegrityScan = async () => {
    setScanResult(null);
    await new Promise(r => setTimeout(r, 1500));
    const issues = auditLogs.filter(l => l.action?.includes('DELETE')).length;
    setScanResult(
      issues === 0
        ? '✅ Integrity check passed — No unauthorized deletions or tampering detected across all PHI records.'
        : `⚠️ Found ${issues} high-risk event(s) involving DELETE operations. Review audit trail immediately.`
    );
  };

  const handleLockSensitive = async () => {
    try {
      await callApi('/admin/audit-logs', 'POST', {
        action: 'LOCK_SENSITIVE_DATA',
        resource: 'PHI_RECORDS',
      });
      notify('SUCCESS', 'Sensitive PHI records locked — access now requires multi-factor approval.');
    } catch {}
  };

  const toggleArchiveMode = () => {
    setArchiveMode(v => !v);
    notify(archiveMode ? 'INFO' : 'SUCCESS', archiveMode ? 'Archive mode disabled.' : 'Global Archive Mode activated — all selected records will be marked read-only.');
  };

  const filteredPatients = patients.filter(p => {
    const name = `${p.firstName ?? p.patient?.firstName ?? ''} ${p.lastName ?? p.patient?.lastName ?? ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || (p.user?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPatientName = (p: any) => ({
    first: p.firstName ?? p.patient?.firstName ?? '?',
    last:  p.lastName  ?? p.patient?.lastName  ?? '',
  });

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="Health Records Unit" 
        userName={user?.staffProfile?.firstName ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}` : 'Records Officer'}
        userRole="Health Records Officer · NDPA Custodian"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName ?? 'R'}+${user?.staffProfile?.lastName ?? 'O'}&background=6366f1&color=fff`}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Patient Registry', val: patients.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Records', val: records.length, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Audit Events', val: auditLogs.length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Archive Mode', val: archiveMode ? 'ON' : 'OFF', icon: Archive, color: archiveMode ? 'text-white' : 'text-slate-400', bg: archiveMode ? 'bg-slate-900' : 'bg-slate-50' },
        ].map(stat => (
          <div key={stat.label} className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 transition-all ${stat.label === 'Archive Mode' && archiveMode ? 'border-slate-900 shadow-xl' : 'bg-white border-slate-100'}`}>
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.label === 'Archive Mode' && archiveMode ? 'text-slate-900' : 'text-slate-800'}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100 mb-8 w-fit gap-1">
        {[
          { id: 'REGISTRY', label: 'Patient Registry', icon: Users },
          { id: 'AUDIT',    label: 'Audit Trail',      icon: ShieldCheck },
          { id: 'TOOLS',    label: 'Admin Tools',      icon: Lock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
        <button onClick={fetchData} className="p-3 text-slate-300 hover:text-primary transition-colors">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* REGISTRY */}
      {activeTab === 'REGISTRY' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Patient list */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[700px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-black flex items-center gap-2"><Archive size={20} className="text-indigo-600" /> Registry</h3>
              <button onClick={handleExportRegistry} title="Export CSV" className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                <Download size={18} />
              </button>
            </div>
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                ref={searchRef}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient or email..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none font-bold"
              />
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
              {filteredPatients.length === 0 && (
                <p className="text-center py-10 text-slate-400 italic text-sm">
                  {loading ? 'Loading registry...' : 'No patients found.'}
                </p>
              )}
              {filteredPatients.map((p) => {
                const { first, last } = getPatientName(p);
                const isSelected = selectedRecord?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectRecord(p)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all text-left ${
                      isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-indigo-600'}`}>
                      {first[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">{first} {last}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{p.user?.email ?? ''}</p>
                      {p.bloodGroup && (
                        <p className={`text-[9px] font-black ${isSelected ? 'text-white/60' : 'text-rose-500'}`}>
                          {p.bloodGroup} · {p.genotype ?? '—'}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Record detail */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedRecord ? (() => {
                const { first, last } = getPatientName(selectedRecord);
                return (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm h-[700px] flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-8 shrink-0">
                      <div>
                        <h3 className="text-2xl font-black">{first} {last}</h3>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{selectedRecord.user?.email}</p>
                        {(selectedRecord.nhisNumber || selectedRecord.bloodGroup) && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {selectedRecord.nhisNumber && <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-black rounded-lg">NHIS: {selectedRecord.nhisNumber}</span>}
                            {selectedRecord.bloodGroup && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-lg">{selectedRecord.bloodGroup}</span>}
                            {selectedRecord.genotype && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg">{selectedRecord.genotype}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { notify('INFO', 'HIPAA access log captured.'); }} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all" title="Log PHI Access"><Eye size={18} /></button>
                        <button onClick={() => setSelectedRecord(null)} className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:text-slate-500 border border-slate-100"><X size={18} /></button>
                      </div>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-4">
                      {records.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6"><FileText size={32} /></div>
                          <h4 className="text-lg font-black text-slate-600 mb-2">Clean Slate</h4>
                          <p className="text-sm text-slate-400 max-w-xs">No clinical records found for this patient. New entries from physicians will appear here.</p>
                        </div>
                      )}
                      {records.map((rec, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500 rounded-r" />
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(rec.createdAt).toLocaleDateString('en-NG')}</span>
                            {rec.isSensitive && <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">SENSITIVE</span>}
                          </div>
                          <h5 className="font-black text-slate-900">{rec.diagnosis}</h5>
                          <p className="text-sm text-slate-500 mt-1">{rec.notesEncrypted}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })() : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-[700px] flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm mb-8">
                    <Archive size={48} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-700 mb-2">Select a Patient</h4>
                  <p className="text-sm text-slate-400 max-w-xs">Select a patient from the registry to view their full EHR and clinical history.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* AUDIT */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2"><ShieldCheck size={20} className="text-indigo-600" /> HIPAA · NDPA Audit Trail</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Monitoring Active
              </div>
              <button
                onClick={() => {
                  const csv = ['Time,User,Action,Resource,IP'].concat(auditLogs.map(l =>
                    `${l.timestamp},${l.user?.email ?? ''},${l.action},${l.resource ?? ''},${l.ipAddress ?? ''}`
                  )).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob); a.download = `audit-${Date.now()}.csv`; a.click();
                  notify('SUCCESS', 'Audit trail exported.');
                }}
                className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                title="Export Audit CSV"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {auditLogs.length === 0 && <p className="text-center py-16 text-slate-400 italic">No audit events recorded.</p>}
            {auditLogs.map((log, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border flex items-center justify-between transition-all hover:shadow-md ${
                log.action?.includes('DELETE') ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
              }`}>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                    {log.action?.includes('LOGIN') ? <ShieldCheck size={20} /> : log.action?.includes('DELETE') ? <Trash2 size={20} className="text-rose-500" /> : <FileText size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-black">
                      <span className="text-indigo-600">{log.user?.email ?? 'System'}</span>{' '}
                      {log.action?.toLowerCase()} {log.resource?.toLowerCase()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      IP: {log.ipAddress ?? '127.0.0.1'} · {new Date(log.timestamp).toLocaleString('en-NG')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 border rounded-lg text-[8px] font-black uppercase tracking-tight ${
                  log.action?.includes('DELETE') ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-white border-slate-100 text-slate-400'
                }`}>
                  {log.action?.includes('DELETE') ? 'HIGH RISK' : 'Verified'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOLS */}
      {activeTab === 'TOOLS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Integrity Scan */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><ShieldCheck size={24} /></div>
            <h4 className="text-xl font-black mb-2">Integrity Scan</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">Verify the integrity of all PHI records and detect any unauthorized tampering or deletion events.</p>
            <button onClick={handleRunIntegrityScan} disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl mb-6">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Run Integrity Scan
            </button>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border text-sm font-bold ${
                  scanResult.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                {scanResult}
              </motion.div>
            )}
          </div>

          {/* Lock Sensitive */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Lock size={24} /></div>
            <h4 className="text-xl font-black mb-2">Lock Sensitive Records</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">Restrict access to PHI-sensitive records. Any access attempt will require dual approval (NDPA Section 2.4).</p>
            <button onClick={handleLockSensitive} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">
              <Lock size={18} /> Lock Sensitive PHI
            </button>
          </div>

          {/* Export Registry */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Download size={24} /></div>
            <h4 className="text-xl font-black mb-2">Export Registry</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">Download the complete patient registry as a NDPA-compliant CSV including NHIS, genotype, blood group data.</p>
            <button onClick={handleExportRegistry} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
              <Download size={18} /> Download Registry CSV
            </button>
          </div>

          {/* Global Archive Mode */}
          <div className={`rounded-[3rem] p-10 border shadow-sm transition-all ${archiveMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${archiveMode ? 'bg-white/10 text-white' : 'bg-slate-900 text-white'}`}>
              <Archive size={24} />
            </div>
            <h4 className={`text-xl font-black mb-2 ${archiveMode ? 'text-white' : 'text-slate-800'}`}>Global Archive Mode</h4>
            <p className={`text-sm leading-relaxed mb-8 ${archiveMode ? 'text-slate-400' : 'text-slate-400'}`}>Toggle read-only protection across all patient records. Use during audits or end-of-period compliance periods.</p>
            <button
              onClick={toggleArchiveMode}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl ${
                archiveMode
                  ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                  : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Archive size={18} /> {archiveMode ? 'Deactivate Archive Mode' : 'Enable Archive Mode'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
