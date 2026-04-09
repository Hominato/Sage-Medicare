"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, Navigation, Siren, Phone, 
  Clock, CheckCircle2, AlertCircle, Send,
  Activity, X, ChevronRight, Loader2, MapPin
} from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import DashboardHeader from '../layout/DashboardHeader';

export default function ParamedicDashboard() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('QUEUE');

  const fetchEmergencies = async () => {
    try {
      const data = await callApi('/emergency/active');
      setEmergencies(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { fetchEmergencies(); }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await callApi(`/emergency/${id}/status`, 'PATCH', { status });
      notify('SUCCESS', `Case status updated to ${status}.`);
      fetchEmergencies();
    } catch {}
  };

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="Emergency Dispatch" 
        userName={user?.staffProfile?.firstName ? `Paramedic ${user.staffProfile.firstName}` : 'Emergency Responder'} 
        userRole="Critical Care · ALS Certified"
        avatarUrl={`https://ui-avatars.com/api/?name=Paramedic&background=e11d48&color=fff`}
      />

      {/* Responder KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Pending Dispatch', val: emergencies.filter(e => e.status === 'PENDING').length, icon: Siren, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Active In-Route', val: emergencies.filter(e => e.status === 'ACCEPTED').length, icon: Navigation, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Avg. Response', val: '4.2 min', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Fleet Status', val: '80% ACTIVE', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dispatch Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm relative min-h-[500px]">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-[3rem]">
                <Loader2 className="animate-spin text-rose-600" size={40} />
              </div>
            )}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3"><Siren className="text-rose-600" /> Active Dispatch Queue</h3>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                {['QUEUE', 'MAP'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === t ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'QUEUE' ? (
                <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {emergencies.length === 0 && (
                    <div className="py-20 text-center text-slate-400 italic font-bold">No active emergency requests. Standby. 🚑</div>
                  )}
                  {emergencies.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedCase(req)}
                      className={`p-6 rounded-[2.5rem] border cursor-pointer group transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                        selectedCase?.id === req.id ? 'bg-rose-600 text-white border-rose-600 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-rose-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
                          selectedCase?.id === req.id ? 'bg-white/20' : 'bg-white text-rose-600 border border-rose-100 shadow-sm'
                        }`}>
                          <Siren size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-lg">{req.patient?.firstName ?? req.anonymousName ?? 'Anonymous Victim'}</h4>
                          <p className={`text-sm font-bold ${selectedCase?.id === req.id ? 'text-white/70' : 'text-slate-500'}`}>{req.location}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            req.status === 'PENDING' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={selectedCase?.id === req.id ? 'text-white' : 'text-slate-300'} />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-[400px] bg-slate-900 rounded-[2.5rem] overflow-hidden group">
                   {/* Cinematic Map Integration Layer (Simulation) */}
                   <div className="absolute inset-0 opacity-40 bg-[url('https://maps.wikimedia.org/osm-intl/12/6.5244/3.3792.png')] bg-cover" />
                   <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-slate-900/50" />
                   
                   {/* Interactive Pings */}
                   {emergencies.map((e, i) => (
                     <div 
                      key={e.id}
                      className="absolute"
                      style={{ top: `${20 + (i * 15)}%`, left: `${30 + (i * 20)}%` }}
                     >
                       <div className="relative">
                         <div className="absolute -inset-4 bg-rose-500/30 rounded-full animate-ping" />
                         <div className="relative bg-rose-600 p-2 rounded-full border-2 border-white shadow-xl">
                            <MapPin size={14} className="text-white" />
                         </div>
                       </div>
                     </div>
                   ))}
                   
                   <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Live Fleet Telemetry</p>
                      <p className="text-xs text-white/80 font-medium">Lagos Central Zone · 3 Ambulances Dispatched · 1 Standby</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Case Detail Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedCase ? (
              <motion.div 
                key="case" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 opacity-5"><Siren size={150} /></div>
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-black">Case File</h4>
                  <button onClick={() => setSelectedCase(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Medical Description</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{selectedCase.description || 'No description provided by caller.'}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Patient History</p>
                      <p className="text-xs font-black">{selectedCase.patient ? 'Registered Member' : 'Guest Victim'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Insurance</p>
                      <p className="text-xs font-black text-emerald-600">{selectedCase.patient?.insuranceInfo ? 'VERIFIED' : 'NA'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedCase.status === 'PENDING' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedCase.id, 'ACCEPTED')}
                      className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3"
                    >
                      <Navigation size={18} /> Accept Case & Dispatch
                    </button>
                  )}
                  {selectedCase.status === 'ACCEPTED' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedCase.id, 'ON_SITE')}
                      className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3"
                    >
                      <Phone size={18} /> Arrived On-Site
                    </button>
                  )}
                  {selectedCase.status === 'ON_SITE' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedCase.id, 'TRANSPORTING')}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                    >
                      <Siren size={18} /> Begin Transport
                    </button>
                  )}
                  {selectedCase.status === 'TRANSPORTING' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedCase.id, 'COMPLETED')}
                      className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 size={18} /> Handover to ER
                    </button>
                  )}
                  <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase hover:text-rose-500 transition-all flex items-center justify-center gap-2">
                    <Phone size={14} /> Contact Dispatch
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-[500px] border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 group-hover:scale-110 transition-transform">
                  <Siren size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-400">Select Active Case</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium">Select a dispatch from the queue to view metadata and status controls.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
