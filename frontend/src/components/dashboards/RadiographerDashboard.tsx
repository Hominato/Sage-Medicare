"use client";
import { useEffect, useState, useRef } from 'react';
import { 
  Camera, ClipboardList, CheckCircle2, 
  Clock, FileText, ChevronRight, TrendingUp, 
  Loader2, X, Upload, Send, AlertCircle, ImageIcon
} from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import DashboardHeader from '../layout/DashboardHeader';
import { motion, AnimatePresence } from 'framer-motion';

export default function RadiographerDashboard() {
  const [filter, setFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async () => {
    try {
      const data = await callApi('/imaging/pending');
      setOrders(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleMarkInProgress = async (orderId: string) => {
    try {
      await callApi(`/imaging/${orderId}/in-progress`, 'PATCH');
      notify('SUCCESS', 'Order marked IN PROGRESS — patient notified.');
      fetchOrders();
    } catch {}
  };

  const handleUploadResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const findings = formData.get('findings') as string;
    if (!findings.trim()) {
      notify('ERROR', 'Findings cannot be empty.');
      return;
    }

    try {
      let attachmentUrl = '';
      if (attachedFile) {
        // TODO: in production, upload to storage (Supabase/S3) and use the returned URL
        attachmentUrl = `file://${attachedFile.name}`;
      }

      // 1. Post imaging findings
      await callApi(`/imaging/${selectedOrder.id}/result`, 'PATCH', {
        findings,
        attachments: attachmentUrl || null,
        completedAt: new Date().toISOString(),
      });

      // 2. Auto-generate billing invoice (radiology: ₦15,000 standard)
      await callApi('/admin/invoices', 'POST', {
        patientId: selectedOrder.patientId,
        amount: 15000,
        description: `Radiology Report Completed: ${selectedOrder.imagingType} — Dr. ${selectedOrder.doctor?.staffProfile?.firstName ?? 'N/A'}`,
        insuranceType: 'NHIS',
      });

      notify('SUCCESS', `Imaging report filed. ₦15,000 invoice auto-generated for ${selectedOrder.imagingType}.`);
      setSelectedOrder(null);
      setAttachedFile(null);
      fetchOrders();
    } catch {}
  };

  // Filter orders by imaging type
  const filteredOrders = orders.filter(o =>
    filter === 'ALL' || (o.imagingType?.toUpperCase() === filter)
  );

  const pendingCount     = orders.filter(o => o.status === 'PENDING').length;
  const inProgressCount  = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const completedToday   = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="Radiology Unit" 
        userName={user?.staffProfile?.firstName ? `Rad. ${user.staffProfile.firstName} ${user.staffProfile.lastName}` : 'Chief Radiographer'} 
        userRole="Imaging Specialist · RRBN Certified"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName ?? 'R'}+${user?.staffProfile?.lastName ?? 'X'}&background=8b5cf6&color=fff`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Queue', value: pendingCount, icon: Camera, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed Today', value: completedToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Radiology Revenue', value: `₦${(completedToday * 15000).toLocaleString()}`, icon: TrendingUp, color: 'text-white', bg: 'bg-slate-900', dark: true },
        ].map(stat => (
          <div key={stat.label} className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 ${stat.dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${stat.dark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
              <p className={`text-2xl font-black ${stat.dark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Imaging queue */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm relative min-h-[480px]">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[3rem]">
                <Loader2 className="animate-spin text-violet-600" size={40} />
              </div>
            )}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <ImageIcon className="text-violet-600" /> Imaging Queue
              </h3>
              <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl">
                {['ALL', 'X-RAY', 'MRI', 'CT', 'ULTRASOUND'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all ${
                      filter === f ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 && !loading && (
                <div className="p-16 text-center text-slate-400 italic flex flex-col items-center gap-4">
                  <Camera size={48} className="text-slate-100" />
                  <div>
                    <p className="font-black text-slate-600">Queue Clear</p>
                    <p className="text-sm font-medium">No imaging requests pending for this modality.</p>
                  </div>
                </div>
              )}
              {filteredOrders.map((order, idx) => {
                const firstName = order.patient?.patient?.firstName ?? order.patient?.firstName ?? '?';
                const lastName  = order.patient?.patient?.lastName  ?? order.patient?.lastName  ?? '';
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xl shadow-violet-200' 
                        : 'bg-slate-50/50 border-slate-100 hover:border-violet-200 hover:bg-white'
                    }`}
                  >
                    {/* Patient info */}
                    <div 
                      className="flex items-center gap-5 flex-1"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm ${
                        isSelected ? 'bg-white/20' : 'bg-white text-violet-600 shadow-sm border border-violet-100'
                      }`}>
                        {(order.imagingType ?? 'SCAN').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-lg leading-tight">{firstName} {lastName}</h4>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                          {order.imagingType} — Dr. {order.doctor?.staffProfile?.firstName ?? 'Unknown'}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          order.status === 'IN_PROGRESS' ? (isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700') :
                          order.status === 'PENDING'     ? (isSelected ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700') :
                          (isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700')
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleMarkInProgress(order.id); }}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                            isSelected ? 'bg-white text-violet-700 hover:bg-violet-50' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                          }`}
                          title="Start processing this scan"
                        >
                          Start
                        </button>
                      )}
                      <ChevronRight size={18} className={isSelected ? 'text-white' : 'text-slate-300'} onClick={() => setSelectedOrder(order)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Report Panel */}
        <div>
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-black">Scan Report Entry</h4>
                  <button onClick={() => { setSelectedOrder(null); setAttachedFile(null); }} className="p-2 text-slate-300 hover:text-slate-600 rounded-xl">
                    <X size={20} />
                  </button>
                </div>

                {/* Patient/order context */}
                <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl mb-6">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">Current Order</p>
                  <p className="text-sm font-black text-slate-800">
                    {selectedOrder.patient?.patient?.firstName ?? '?'} {selectedOrder.patient?.patient?.lastName ?? ''} · {selectedOrder.imagingType}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
                    Ordered by Dr. {selectedOrder.doctor?.staffProfile?.firstName} {selectedOrder.doctor?.staffProfile?.lastName}
                  </p>
                </div>

                <form onSubmit={handleUploadResult} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Radiological Findings *</label>
                    <textarea
                      name="findings"
                      required
                      rows={5}
                      placeholder="Document abnormalities, bone structures, organ dimensions, contrast enhancement, or findings relative to clinical indication..."
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-violet-100 resize-none transition-all focus:bg-white"
                    />
                  </div>

                  {/* ✅ Fixed: real file input */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      attachedFile ? 'border-violet-300 bg-violet-50' : 'border-slate-100 hover:border-violet-200 hover:bg-violet-50/30'
                    }`}
                  >
                    <Upload size={24} className={`mb-2 ${attachedFile ? 'text-violet-500' : 'text-slate-300'}`} />
                    {attachedFile ? (
                      <div className="text-center">
                        <p className="text-[10px] font-black text-violet-700 uppercase">{attachedFile.name}</p>
                        <p className="text-[9px] text-slate-400">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Attach DICOM / JPEG / PDF
                      </p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".dcm,.dicom,.jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setAttachedFile(f);
                          notify('INFO', `Attached: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
                        }
                      }}
                    />
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} /> Auto-Billing Enabled
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      ₦15,000 invoice will auto-generate on report submission.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <Send size={16} /> Certify & Dispatch Report
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 text-center h-[480px] flex flex-col items-center justify-center"
              >
                <div className="p-6 bg-white rounded-full shadow-sm text-slate-200 mb-6 animate-pulse">
                  <Camera size={40} />
                </div>
                <h4 className="text-lg font-black text-slate-700 mb-2">Awaiting Selection</h4>
                <p className="text-xs text-slate-400 font-medium max-w-[200px]">
                  Select a scan order from the queue to begin composing the radiological report.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
