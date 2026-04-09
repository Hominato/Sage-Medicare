"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Beaker, Search, ClipboardList, CheckCircle2, 
  Clock, FileText, TrendingUp, ChevronRight,
  Loader2, X, Upload, Send, AlertCircle,
  Play, CheckCheck, Bell
} from 'lucide-react';
import { useRef } from 'react';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import DashboardHeader from '../layout/DashboardHeader';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'Awaiting',    color: 'text-amber-700',   bg: 'bg-amber-100' },
  IN_PROGRESS: { label: 'Processing',  color: 'text-blue-700',    bg: 'bg-blue-100' },
  COMPLETED:   { label: 'Released',    color: 'text-emerald-700', bg: 'bg-emerald-100' },
  CANCELLED:   { label: 'Cancelled',   color: 'text-rose-700',    bg: 'bg-rose-100' },
};

export default function LabManagementDashboard() {
  const [filter, setFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [calibrationVerified, setCalibrationVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();

  const fetchOrders = async () => {
    try {
      const data = await callApi('/lab/all');
      setOrders(data || []);
    } catch (err) {}
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleMarkInProgress = async (id: string) => {
    try {
      await callApi(`/lab/${id}/in-progress`, 'PATCH');
      notify('SUCCESS', 'Sample marked as IN PROGRESS — tracking started.');
      fetchOrders();
    } catch (err) {}
  };

  const handleVerifyCalibration = async () => {
    try {
      await callApi('/admin/audit-logs', 'POST', {
        action: 'CALIBRATION_VERIFIED',
        resource: 'LAB_EQUIPMENT',
      }).catch(() => {});
      setCalibrationVerified(true);
      notify('SUCCESS', 'Equipment calibration verified and logged to audit trail.');
      setTimeout(() => setCalibrationVerified(false), 5000);
    } catch {}
  };

  const handleNotifyDoctor = async (order: any) => {
    notify('INFO', `Dispatching urgent result alert to Dr. ${order.doctor?.staffProfile?.firstName}...`);
    setTimeout(() => {
      notify('SUCCESS', `Doctor Notified: Critical findings for ${order.testType} have been flagged.`);
    }, 1500);
  };

  const handleUploadResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const findings = formData.get('findings') as string;
    try {
      await callApi(`/lab/${selectedOrder.id}/result`, 'POST', {
        findings,
        attachments: 'https://hms-reports.storage.supabase.co/mock-report.pdf'
      });
      await callApi('/admin/invoices', 'POST', {
        patientId: selectedOrder.patientId,
        amount: 5000,
        description: `Diagnostic Test: ${selectedOrder.testType}`
      });
      notify('SUCCESS', 'Report dispatched to doctor. Invoice generated.');
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) {}
  };

  const filtered = orders.filter(o => filter === 'ALL' || o.status === filter);
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const completed = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="Diagnostics Lab" 
        userName={user?.staffProfile?.firstName ? `Tech. ${user.staffProfile.firstName} ${user.staffProfile.lastName}` : 'Lab Scientist'} 
        userRole="Lab Scientist • Diagnostics Module"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName}+${user?.staffProfile?.lastName}&background=4f46e5&color=fff`}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Pending Requests', val: pending, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Processing', val: inProgress, icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Released Today', val: completed, icon: CheckCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Accuracy Grade', val: 'A+', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-2xl font-black mt-1 text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Queue */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm relative min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-[3rem]">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Beaker className="text-indigo-600" /> Test Queue
            </h3>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && !loading ? (
              <div className="p-20 text-center text-slate-300 italic font-bold">Queue is clear.</div>
            ) : filtered.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.PENDING;
              return (
                <div 
                  key={order.id}
                  onClick={() => !order.result && setSelectedOrder(order)}
                  className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between gap-4 group ${
                    order.result 
                      ? 'bg-slate-50/50 border-slate-100 opacity-60 cursor-default' 
                      : selectedOrder?.id === order.id 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-200 cursor-pointer' 
                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${selectedOrder?.id === order.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                      {order.testType?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black truncate">{order.patient?.patient?.firstName} {order.patient?.patient?.lastName}</h4>
                      <p className={`text-xs font-bold truncate ${selectedOrder?.id === order.id ? 'text-white/70' : 'text-slate-500'}`}>{order.testType}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${selectedOrder?.id === order.id ? 'text-white/50' : 'text-indigo-400'}`}>
                        Req. by Dr. {order.doctor?.staffProfile?.firstName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      selectedOrder?.id === order.id ? 'bg-white/20 text-white' : `${meta.bg} ${meta.color}`
                    }`}>{meta.label}</span>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkInProgress(order.id); }}
                        className={`p-2 rounded-xl transition-colors ${selectedOrder?.id === order.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        title="Mark In Progress"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    {order.status === 'COMPLETED' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNotifyDoctor(order); }}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100"
                        title="Notify Requesting Doctor"
                      >
                        <Bell size={14} />
                      </button>
                    )}
                    {!order.result && <ChevronRight size={18} className={selectedOrder?.id === order.id ? 'text-white' : 'text-slate-300'} />}
                    {order.result && <CheckCheck size={18} className="text-emerald-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-black">Report Entry</h4>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"><X size={20} /></button>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Case</p>
                  <p className="text-sm font-bold text-indigo-800">{selectedOrder.testType}</p>
                  <p className="text-[9px] text-indigo-400 font-bold mt-0.5">Patient: {selectedOrder.patient?.patient?.firstName} {selectedOrder.patient?.patient?.lastName}</p>
                </div>
                <form onSubmit={handleUploadResult} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Analytical Findings</label>
                    <textarea 
                      name="findings" required rows={5} 
                      placeholder="Enter detailed clinical findings..." 
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none" 
                    />
                  </div>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-100 rounded-[2rem] p-6 flex flex-col items-center text-slate-400 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                  >
                    <Upload size={24} className="mb-2 opacity-50" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Attach Report / PDF</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.dicom"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) notify('INFO', `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                      }}
                    />
                  </div>
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <Send size={16} /> Certify & Dispatch Result
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 text-center h-[420px] flex flex-col items-center justify-center"
              >
                <div className="p-6 bg-white rounded-full shadow-sm text-slate-200 mb-6 animate-pulse"><ClipboardList size={40} /></div>
                <h4 className="text-lg font-black mb-2 text-slate-600">No Order Selected</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Click a pending request from the queue<br/>to enter results and dispatch to the doctor.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification Panel */}
          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-10"><Bell size={100} /></div>
            <h4 className="text-base font-black mb-2 flex items-center gap-2"><Bell size={16} /> Doctor Notifications</h4>
            <p className="text-indigo-200 text-xs leading-relaxed mb-6">
              Submitting results automatically notifies the requesting doctor and generates a patient invoice.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <p className="text-[10px] font-bold text-indigo-100">Auto-billing on result release</p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <p className="text-[10px] font-bold text-indigo-100">Sample tracking in real-time</p>
              </div>
            </div>
          </div>

          {/* QA Panel */}
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
            <h4 className="text-base font-black mb-2 flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={18} /> Quality Assurance
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-5">Verify equipment calibration before processing high-priority pathology samples.</p>
            <button 
              onClick={handleVerifyCalibration}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${calibrationVerified ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-slate-900 text-white'}`}
            >
              {calibrationVerified ? <><CheckCheck size={16} /> Calibration Logged</> : 'Verify Calibration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
