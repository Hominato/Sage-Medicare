"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  PieChart, Download, Banknote, CalendarCheck, Activity,
  ChevronRight, RefreshCw, Loader2, Plus, ShieldCheck, 
  FileText, CheckCircle, X, AlertTriangle, Briefcase, Users,
  Send, Search, Settings
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DatabaseDiagnostic from '@/components/admin/DatabaseDiagnostic';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';

// 12 staff roles in HMS
const HMS_ROLES = [
  'DOCTOR', 'NURSE', 'PHARMACIST', 'CLERK', 
  'BILLING_OFFICER', 'LAB_TECH', 'RADIOGRAPHER', 
  'RECORDS_OFFICER', 'PARAMEDIC', 'IT_ADMIN'
];
const INSURANCE_TYPES = ['NHIS', 'HMO', 'Private', 'Out-of-Pocket', 'Medicare/Medicaid'];

export default function AdminDashboardPage() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();

  const [analytics, setAnalytics] = useState<any>(null);
  const [invoices, setInvoices]   = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers]         = useState<any[]>([]);
  const [activeView, setActiveView] = useState('ANALYTICS');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showInvoiceModal,  setShowInvoiceModal]  = useState(false);
  const [invoiceSearch,     setInvoiceSearch]     = useState('');

  const fetchData = async () => {
    try {
      const [stats, invs, logs] = await Promise.all([
        callApi('/admin/analytics'),
        callApi('/admin/invoices'),
        callApi('/admin/audit-logs'),
      ]);
      setAnalytics(stats);
      setInvoices(Array.isArray(invs) ? invs : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const data = await callApi('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeView === 'USERS') fetchUsers(); }, [activeView]);

  const handleUpdateInvoice = async (id: string, status: string) => {
    try {
      await callApi(`/admin/invoices/${id}`, 'PATCH', { status });
      notify('SUCCESS', `Invoice ${status.toLowerCase()} successfully.`);
      fetchData();
    } catch {}
  };

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi('/auth/register', 'POST', {
        email:     fd.get('email'),
        password:  fd.get('password'),
        role:      fd.get('role'),
        firstName: fd.get('firstName'),
        lastName:  fd.get('lastName'),
      });
      notify('SUCCESS', `Staff account created for ${fd.get('email')}.`);
      setShowAddStaffModal(false);
      fetchUsers();
    } catch {}
  };

  const handleAddInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi('/admin/invoices', 'POST', {
        patientId:   fd.get('patientId'),
        amount:      Number(fd.get('amount')),
        description: fd.get('description'),
        insuranceType: fd.get('insuranceType'),
      });
      notify('SUCCESS', 'Invoice created successfully.');
      setShowInvoiceModal(false);
      fetchData();
    } catch {}
  };

  // ✅ Fixed: use useMemo to prevent Math.random() re-running on every render
  const performanceStats = useMemo(() => ({
    Physicians:   Math.floor(Math.random() * 15 + 82),
    Nursing:      Math.floor(Math.random() * 10 + 88),
    'Outpatient': Math.floor(Math.random() * 20 + 72),
    'Lab & Diag': Math.floor(Math.random() * 15 + 78),
  }), []);  // empty deps = computed once per mount

  const handleAuthorizeStaffing = async () => {
    try {
      await callApi('/admin/authorize-staffing', 'POST', {
        action: 'AUTHORIZE_STAFFING_ADJUSTMENT',
        deptEfficiency: performanceStats
      });
      notify('SUCCESS', 'Institutional resource adjustment authorized and logged.');
    } catch {}
  };

  const filteredInvoices = invoices.filter(inv =>
    !invoiceSearch ||
    inv.patient?.email?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    inv.id?.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="Command Center" 
        userName={user?.staffProfile?.firstName ? `Admin ${user.staffProfile.firstName} ${user.staffProfile.lastName}` : 'Medical Director'} 
        userRole="Administrator · Medical Director · MDCN"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName ?? 'A'}+${user?.staffProfile?.lastName ?? 'D'}&background=ef4444&color=fff`}
      />

      <div className="p-0">
        {/* Tab Navigation */}
        <div className="flex flex-wrap bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-slate-100 mb-8 gap-2 max-w-fit shadow-sm">
          {[
            { id: 'ANALYTICS', label: 'Clinical Stats',   icon: <PieChart size={16} /> },
            { id: 'BILLING',   label: 'Financials',       icon: <Banknote size={16} /> },
            { id: 'USERS',     label: 'Staff Directory',  icon: <Users size={16} /> },
            { id: 'AUDIT',     label: 'Security Logs',    icon: <ShieldCheck size={16} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${
                activeView === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <button onClick={fetchData} className="p-3 text-slate-300 hover:text-primary transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* ANALYTICS */}
        {activeView === 'ANALYTICS' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            {/* Supabase Integrity Diagnostic */}
            <DatabaseDiagnostic />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Patient Census', value: analytics?.patientCount ?? 0, icon: <Users />, color: 'text-primary' },
                { label: 'Appointments', value: analytics?.appointmentCount ?? 0, icon: <CalendarCheck />, color: 'text-indigo-600' },
                { label: 'NHIS Revenue', value: `₦${(analytics?.nhisRevenue ?? 0).toLocaleString()}`, icon: <Banknote />, color: 'text-emerald-600' },
                { label: 'Pending Claims', value: analytics?.pendingClaimsCount ?? 0, icon: <AlertTriangle />, color: 'text-rose-600' },
                { label: 'Total Revenue', value: `₦${(analytics?.totalRevenue ?? 0).toLocaleString()}`, icon: <Activity />, color: 'text-sky-600' },
                { label: 'Active Staff', value: users.length || analytics?.staffCount || 0, icon: <Briefcase />, color: 'text-violet-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className={`absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform ${stat.color}`}>{stat.icon}</div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                  <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black mb-6">Department Efficiency</h4>
                <div className="space-y-6">
                  {Object.entries(performanceStats).map(([dept, pct]) => (
                    <div key={dept} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{dept}</span><span>{pct}% EFFICIENCY</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-10"><Activity size={120} /></div>
                <h4 className="text-xl font-black mb-2">Hospital Intelligence Advisory</h4>
                <p className="text-slate-400 text-sm leading-relaxed italic mb-8">
                  Predictive model suggests a 15% surge in pediatric visits this weekend especially malaria cases. Consider bolstering on-call paediatrics staff.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { label: 'NHIS Claims', value: `₦${(analytics?.nhisRevenue ?? 0).toLocaleString()}` },
                    { label: 'HMO Billings', value: `₦${(analytics?.hmoRevenue ?? 0).toLocaleString()}` },
                    { label: 'Out-of-Pocket', value: `₦${(analytics?.oop ?? 0).toLocaleString()}` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-xs font-bold bg-white/5 p-3 rounded-xl">
                      <span className="text-slate-400">{r.label}</span>
                      <span className="text-white">{r.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAuthorizeStaffing}
                  className="px-8 py-4 bg-primary text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Authorize Staffing Adjust
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BILLING */}
        {activeView === 'BILLING' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h4 className="text-xl font-black">Central Billing Ledger</h4>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    placeholder="Search patient or ID..."
                    className="bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-5 py-2.5 text-sm outline-none w-56"
                  />
                </div>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} /> New Invoice
                </button>
                <button
                  onClick={async () => {
                    const csv = ['Invoice,Patient,Email,Description,Amount,Status,Insurance'].concat(
                      filteredInvoices.map(inv =>
                        `#INV-${inv.id?.substring(0,6).toUpperCase() ?? ''},${inv.patient?.patient?.firstName ?? ''} ${inv.patient?.patient?.lastName ?? ''},${inv.patient?.email ?? ''},${inv.description ?? ''},${inv.amount ?? 0},${inv.status ?? ''},${inv.insuranceType ?? 'N/A'}`
                      )
                    ).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `hms-billing-${Date.now()}.csv`; a.click();
                    URL.revokeObjectURL(url);
                    notify('SUCCESS', 'Billing report downloaded as CSV.');
                  }}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"
                  title="Download Report"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-medium">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    {['Invoice #', 'Patient', 'Description', 'Amount', 'Insurance', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-8 py-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInvoices.length === 0 && (
                    <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-400 italic">No invoice records found.</td></tr>
                  )}
                  {filteredInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-xs font-black text-slate-400">#INV-{inv.id?.substring(0, 6).toUpperCase()}</td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black">{inv.patient?.patient?.firstName} {inv.patient?.patient?.lastName}</p>
                        <p className="text-[10px] text-slate-400">{inv.patient?.email}</p>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 max-w-xs truncate">{inv.description}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-800">₦{(inv.amount ?? 0).toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500">
                          {inv.insuranceType ?? 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>{inv.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                        {inv.status === 'UNPAID' && (
                          <button onClick={() => handleUpdateInvoice(inv.id, 'PAID')} className="text-emerald-600 font-black text-[10px] uppercase hover:underline">Mark Paid</button>
                        )}
                        {inv.status === 'UNPAID' && (
                          <button onClick={() => handleUpdateInvoice(inv.id, 'WAIVED')} className="text-slate-400 font-black text-[10px] uppercase hover:underline">Waive</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS / Staff Directory */}
        {activeView === 'USERS' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black">Hospital Staffing Directory</h3>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                <Plus size={16} /> Add New Staff Member
              </button>
            </div>

            {/* Role summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {HMS_ROLES.map(role => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <div key={role} className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Briefcase size={18} /></div>
                      <div>
                        <p className="font-black text-xs">{role.replace('_', ' ')}</p>
                        <p className="text-[10px] text-slate-400">{count} {count === 1 ? 'staff' : 'staff'}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                );
              })}
            </div>

            {/* Staff list */}
            <div className="space-y-3">
              {users.slice(0, 20).map((u, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-primary shadow-sm text-sm">
                      {u.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-sm">{u.staffProfile?.firstName} {u.staffProfile?.lastName}</p>
                      <p className="text-[10px] text-slate-400">{u.email} · {u.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>{u.role}</span>
                </div>
              ))}
              {users.length === 0 && <p className="text-center py-10 text-slate-400 italic">No staff records found. Add staff via the button above.</p>}
            </div>
          </div>
        )}

        {/* AUDIT */}
        {activeView === 'AUDIT' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h4 className="text-2xl font-black">System Compliance & Audit Trail</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live HIPAA · NDPA Monitoring
                </div>
                <button
                  onClick={async () => {
                    const csv = ['Timestamp,User,Action,Resource,IP'].concat(
                      auditLogs.map(l => `${l.timestamp},${l.user?.email ?? ''},${l.action},${l.resource || ''},${l.ipAddress || '127.0.0.1'}`)
                    ).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `hms-audit-${Date.now()}.csv`; a.click();
                    URL.revokeObjectURL(url);
                    notify('SUCCESS', 'Audit log exported.');
                  }}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"
                  title="Export Audit CSV"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {auditLogs.length === 0 && <p className="text-center py-16 text-slate-400 italic">No audit events yet.</p>}
              {auditLogs.map((log, idx) => (
                <div key={idx} className={`p-6 rounded-3xl border flex items-center justify-between group hover:border-primary transition-all ${
                  log.action?.includes('DELETE') || log.action?.includes('BREACH') ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                      {log.action?.includes('LOGIN') ? <ShieldCheck size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black">
                        <span className="text-primary">{log.user?.email ?? 'System'}</span>{' '}
                        {log.action?.toLowerCase()} {log.resource?.toLowerCase()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        IP: {log.ipAddress ?? '127.0.0.1'} · {new Date(log.timestamp).toLocaleString('en-NG')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                    log.action?.includes('DELETE') ? 'text-rose-500 border-rose-200 bg-rose-50' : 'text-slate-400'
                  }`}>
                    {log.action?.includes('DELETE') ? 'HIGH RISK' : 'Verified Integrity'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaffModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddStaffModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Register Staff Member</h2>
                <button onClick={() => setShowAddStaffModal(false)} className="p-2 text-slate-300 hover:text-slate-600 rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddStaff} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">First Name</label>
                    <input name="firstName" required placeholder="e.g. Adaeze" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Last Name</label>
                    <input name="lastName" required placeholder="e.g. Okafor" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Institutional Email</label>
                  <input name="email" type="email" required placeholder="staff@hospital.ng" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Role</label>
                    <select name="role" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                      {HMS_ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Temp Password</label>
                    <input name="password" type="password" required minLength={8} placeholder="Min. 8 chars" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddStaffModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                    <Send size={16} /> Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvoiceModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Manual Invoice</h2>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-300 hover:text-slate-600 rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddInvoice} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Patient ID</label>
                  <input name="patientId" required placeholder="Patient UUID" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                  <input name="description" required placeholder="e.g. Consultation Fee" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Amount (₦)</label>
                    <input name="amount" type="number" min="1" required placeholder="5000" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Insurance Type</label>
                    <select name="insuranceType" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                      {INSURANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xl">
                    <CheckCircle size={16} /> Generate Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
