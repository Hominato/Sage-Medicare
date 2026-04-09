"use client";
import { useEffect, useState } from 'react';
import { 
  DollarSign, TrendingUp, CheckCircle, Clock, 
  Download, RefreshCw, ChevronRight, Loader2,
  AlertCircle, Send, Filter, Search
} from 'lucide-react';
import DashboardHeader from '../layout/DashboardHeader';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';

const STATUS_COLORS: Record<string, string> = {
  PAID:    'bg-emerald-100 text-emerald-700',
  UNPAID:  'bg-amber-100 text-amber-700',
  WAIVED:  'bg-slate-100 text-slate-500',
};

export default function BillingDashboard() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [claims, setClaims]     = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeView, setActiveView] = useState('INVOICES');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    try {
      const [invData, clmData, statsData] = await Promise.all([
        callApi('/admin/invoices'),
        callApi('/claims'),
        callApi('/admin/analytics'),
      ]);
      setInvoices(Array.isArray(invData) ? invData : []);
      setClaims(Array.isArray(clmData) ? clmData : []);
      setAnalytics(statsData);
      setPage(1);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkPaid = async (id: string) => {
    try {
      await callApi(`/admin/invoices/${id}`, 'PATCH', { status: 'PAID' });
      notify('SUCCESS', 'Invoice marked as paid.');
      fetchData();
    } catch {}
  };

  const handleProcessClaim = async (id: string) => {
    try {
      await callApi(`/claims/${id}/status`, 'PUT', { status: 'APPROVED' });
      notify('SUCCESS', 'NHIS/Insurance claim approved and forwarded to payer.');
      fetchData();
    } catch {}
  };

  const handleDownloadAgingReport = () => {
    const now = new Date();
    const rows = filteredInvoices
      .filter(inv => inv.status === 'UNPAID')
      .map(inv => {
        const days = Math.floor((now.getTime() - new Date(inv.createdAt ?? now).getTime()) / (1000 * 86400));
        return `#INV-${inv.id?.substring(0,6).toUpperCase()},${inv.patient?.patient?.firstName ?? ''} ${inv.patient?.patient?.lastName ?? ''},${inv.description ?? ''},₦${inv.amount ?? 0},${days} days`;
      });
    const csv = ['Invoice,Patient,Description,Amount,Days Outstanding', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aging-report-${Date.now()}.csv`;
    a.click();
    notify('SUCCESS', 'AR Aging Report downloaded.');
  };

  const filteredInvoices = invoices.filter(inv => {
    const name = `${inv.patient?.patient?.firstName ?? ''} ${inv.patient?.patient?.lastName ?? ''}`.toLowerCase();
    const matchSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || (inv.id ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedInvoices = filteredInvoices.slice(0, page * PAGE_SIZE);
  const hasMore = paginatedInvoices.length < filteredInvoices.length;

  const totalRevenue   = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalOutstanding = invoices.filter(i => i.status === 'UNPAID').reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader
        title="Billing & Revenue"
        userName={user?.staffProfile?.firstName ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}` : 'Billing Officer'}
        userRole="Billing Officer · Claims Management"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName ?? 'B'}+${user?.staffProfile?.lastName ?? 'O'}&background=f59e0b&color=fff`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Invoices', val: invoices.length, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Revenue Realized', val: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Outstanding (AR)', val: `₦${totalOutstanding.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending Claims', val: claims.filter(c => c.status === 'PENDING').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-[2rem] p-1.5 shadow-sm border border-slate-100 mb-8 w-fit gap-1">
        {['INVOICES', 'CLAIMS'].map(v => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
              activeView === v ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {v === 'INVOICES' ? 'Invoice Ledger' : 'NHIS / Insurance Claims'}
          </button>
        ))}
      </div>

      {/* INVOICES */}
      {activeView === 'INVOICES' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h4 className="text-xl font-black">Central Invoice Ledger</h4>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Search patient..." className="bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none font-bold w-48" />
              </div>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="WAIVED">Waived</option>
              </select>
              <button onClick={handleDownloadAgingReport} title="Download AR Aging Report" className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all">
                <Download size={18} />
              </button>
              <button onClick={fetchData} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-primary" size={30} />
              </div>
            )}
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  {['Invoice #', 'Patient', 'Description', 'Amount', 'Insurance', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-8 py-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedInvoices.length === 0 && (
                  <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-400 italic">No invoices match your filter.</td></tr>
                )}
                {paginatedInvoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-xs font-black text-slate-400">#INV-{inv.id?.substring(0, 6).toUpperCase()}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black">{inv.patient?.patient?.firstName} {inv.patient?.patient?.lastName}</p>
                      <p className="text-[10px] text-slate-400">{inv.patient?.email}</p>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 max-w-xs truncate">{inv.description}</td>
                    <td className="px-8 py-5 text-sm font-black">₦{(inv.amount ?? 0).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">{inv.insuranceType ?? 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>{inv.status}</span>
                    </td>
                    <td className="px-8 py-5">
                      {inv.status === 'UNPAID' && (
                        <button onClick={() => handleMarkPaid(inv.id)} className="text-emerald-600 font-black text-[10px] uppercase hover:underline flex items-center gap-1">
                          <CheckCircle size={12} /> Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-6 border-t border-slate-50 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                Load More <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CLAIMS */}
      {activeView === 'CLAIMS' && (
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black">NHIS / Insurance Claims Processing</h4>
            <button onClick={fetchData} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-primary"><RefreshCw size={18} /></button>
          </div>
          <div className="space-y-4">
            {claims.length === 0 && <p className="text-center py-16 text-slate-400 italic">No claims on file.</p>}
            {claims.map((claim, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-primary transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-primary shadow-sm border border-slate-100 text-xs">
                    {(claim.claimType ?? 'NHS').substring(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{claim.patient?.patient?.firstName} {claim.patient?.patient?.lastName}</h4>
                    <p className="text-sm font-bold text-slate-500">{claim.claimType ?? 'NHIS'} · Amount: ₦{(claim.amount ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{claim.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                    claim.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{claim.status ?? 'PENDING'}</span>
                  {(!claim.status || claim.status === 'PENDING') && (
                    <button onClick={() => handleProcessClaim(claim.id)} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                      <Send size={14} /> Approve Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
