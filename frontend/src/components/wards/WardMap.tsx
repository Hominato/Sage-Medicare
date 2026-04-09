"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Bed as BedIcon, User, Calendar, ExternalLink, Activity } from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';

const MOCK_WARDS = [
  { 
    id: "ward-1", 
    name: "General Medical A", 
    department: "Medicine",
    beds: [
      { id: "101", number: "101", isOccupied: true, patient: "John Doe", admittedAt: "2024-03-20" },
      { id: "102", number: "102", isOccupied: false },
      { id: "103", number: "103", isOccupied: true, patient: "Jane Smith", admittedAt: "2024-03-21" },
      { id: "104", number: "104", isOccupied: false },
      { id: "105", number: "105", isOccupied: true, patient: "Robert Brown", admittedAt: "2024-03-22" },
      { id: "106", number: "106", isOccupied: false },
    ]
  },
  { 
    id: "ward-2", 
    name: "Intensive Care Unit (ICU)", 
    department: "Critical Care",
    beds: [
      { id: "201", number: "ICU-01", isOccupied: true, patient: "Alice Cooper", admittedAt: "2024-03-18", status: "CRITICAL" },
      { id: "202", number: "ICU-02", isOccupied: true, patient: "Bob Marley", admittedAt: "2024-03-19", status: "STABLE" },
    ]
  }
];

interface BedInfo { id: string; number: string; isOccupied: boolean; patient?: string; admittedAt?: string; status?: string; }

export default function WardMap() {
  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null);
  const { callApi, loading } = useHMSApi();
  const { notify } = useHMS();

  const handleWardAction = async () => {
    if (!selectedBed) return;
    try {
      const endpoint = selectedBed.isOccupied 
        ? `/wards/discharge/${selectedBed.id}` 
        : '/wards/admit';
      const method = selectedBed.isOccupied ? 'DELETE' : 'POST';
      const body = selectedBed.isOccupied ? undefined : { 
        bedId: selectedBed.number, // MOCK bed ID from number
        patientId: 'MOCK-PATIENT-ADMIT-01',
        wardId: 'MOCK-WARD-01'
      };

      await callApi(endpoint, method, body);
      notify('SUCCESS', selectedBed.isOccupied 
        ? `Patient from Bed ${selectedBed.number} has been discharged.` 
        : `Patient successfully admitted to Bed ${selectedBed.number}.`);
      setSelectedBed(null);
    } catch (e) {
      // Error handled by useHMSApi
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-3xl border border-indigo-100 rounded-[3rem] p-10 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg ring-8 ring-indigo-50">
               <LayoutGrid className="text-white" size={24} />
            </div>
            Hospital Ward Map
          </h3>
          <p className="text-slate-500 font-medium mt-1 pl-16 italic">Live floor plan and bed occupancy tracking</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100/50 self-end md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1">
               <span className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-indigo-700 uppercase">Available</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1">
               <span className="w-3 h-3 bg-slate-200 rounded-full" />
               <span className="text-[10px] font-black text-slate-500 uppercase">Occupied</span>
            </div>
        </div>
      </div>

      <div className="space-y-12">
        {MOCK_WARDS.map((ward) => (
          <div key={ward.id} className="relative">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-100" />
               <h4 className="text-sm font-black text-indigo-900 uppercase tracking-[0.25em] bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100">
                 {ward.name}
               </h4>
               <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-100" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {ward.beds.map((bed) => (
                <motion.button
                  key={bed.id}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBed(bed)}
                  className={`relative p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group overflow-hidden ${
                    bed.isOccupied 
                    ? 'bg-white border-slate-100 shadow-sm' 
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 shadow-xl shadow-indigo-200/50'
                  }`}
                >
                  {/* Bed Icon Background */}
                  <div className={`absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center`}>
                     <BedIcon size={120} className={bed.isOccupied ? 'text-slate-900' : 'text-white'} />
                  </div>
                  
                  <div className={`p-4 rounded-2xl ${bed.isOccupied ? 'bg-slate-100 text-slate-400' : 'bg-white/20 text-white backdrop-blur-md'}`}>
                    <BedIcon size={24} />
                  </div>
                  <span className={`font-black text-lg ${bed.isOccupied ? 'text-slate-400' : 'text-white'}`}>
                    {bed.number}
                  </span>
                  
                  {bed.isOccupied && (
                    <div className="absolute top-4 right-4">
                       <span className="w-2.5 h-2.5 bg-rose-500 rounded-full border-4 border-white shadow-sm" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bed Detail Drawer / Modal - Sophisticated Mock */}
      {selectedBed && (
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-0 right-0 w-[400px] h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-50 p-12 border-l border-indigo-50 flex flex-col backdrop-blur-xl bg-white/95"
        >
          <button 
            onClick={() => setSelectedBed(null)}
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 p-2 rounded-xl"
          >
            <ExternalLink className="rotate-180" size={20} />
          </button>

          <div className="mt-16 flex flex-col items-center text-center">
             <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl ring-8 ring-indigo-50 ${
               selectedBed.isOccupied ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
             }`}>
                {selectedBed.isOccupied ? <User size={48} /> : <BedIcon size={48} />}
             </div>
             <h3 className="text-3xl font-black text-slate-800 mb-2">Bed {selectedBed.number}</h3>
             <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest ${
               selectedBed.isOccupied ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
             }`}>
               {selectedBed.isOccupied ? 'OCCUPIED' : 'READY FOR ADMISSION'}
             </span>
          </div>

          <div className="mt-12 space-y-8 flex-1">
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase mb-3">
                   <User size={14} /> Current Patient
                </div>
                <div className="text-xl font-black text-slate-800">{selectedBed.patient || 'None'}</div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase mb-3">
                       <Calendar size={14} /> Admitted
                    </div>
                    <div className="text-sm font-black text-slate-800">{selectedBed.admittedAt || 'N/A'}</div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase mb-3">
                       <Activity size={14} /> Priority
                    </div>
                    <div className="text-sm font-black text-rose-600">{selectedBed.status || 'Standard'}</div>
                 </div>
             </div>

             {selectedBed.isOccupied && (
               <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                  <p className="text-xs text-indigo-700 font-bold leading-relaxed italic">
                    &quot;Patient requires vital check every 4 hours. No known allergies recorded.&quot;
                  </p>
               </div>
             )}
          </div>

          <div className="pt-8 border-t border-slate-100 mt-auto">
             <button 
                onClick={handleWardAction}
                disabled={loading}
                className={`w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:shadow-xl transition-all shadow-slate-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {loading ? 'Processing...' : (selectedBed.isOccupied ? 'Discharge Patient' : 'Confirm Admission')}
             </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
