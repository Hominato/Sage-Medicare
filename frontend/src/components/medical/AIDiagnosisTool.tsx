"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, AlertCircle, Brain } from 'lucide-react';

const MOCK_DIAGNOSES = [
  { 
    condition: "Acute Hypernatremia", 
    probability: 0.89, 
    recommendation: "Immediate fluid balance monitoring and electrolyte correction.",
    urgency: "HIGH"
  },
  { 
    condition: "Primary Hypertension", 
    probability: 0.65, 
    recommendation: "Begin DASH diet and 5mg Amlodipine daily.",
    urgency: "MEDIUM"
  }
];

export default function AIDiagnosisTool() {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<typeof MOCK_DIAGNOSES | null>(null);

  const startScan = () => {
    setIsScanning(true);
    setResults(null);
    setTimeout(() => {
      setIsScanning(false);
      setResults(MOCK_DIAGNOSES);
    }, 3000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Clinical AI Assistant</h3>
            <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">Atelier OS v2.4</p>
          </div>
        </div>
        <ShieldCheck className="text-emerald-500" size={24} />
      </div>

      <div className="space-y-6 relative z-10">
        <p className="text-slate-500 font-medium leading-relaxed">
          The AI engine analyzes the patient&apos;s vitals, medical history, and clinical notes to provide real-time diagnostic suggestions.
        </p>

        <button 
          onClick={startScan}
          disabled={isScanning}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
            isScanning 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-200 hover:-translate-y-1'
          }`}
        >
          {isScanning ? (
             <>
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               >
                 <Activity size={20} />
               </motion.div>
               Analyzing Clinical Data...
             </>
          ) : (
            <>
              <Sparkles size={20} />
              Run AI Diagnostic Scan
            </>
          )}
        </button>

        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative py-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent"
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="flex flex-col items-center justify-center gap-3 text-indigo-600 font-bold italic">
                <Brain size={48} className="opacity-20 translate-y-2" />
                <span>Scanning Electronic Health Records...</span>
              </div>
            </motion.div>
          )}

          {results && !isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4"
            >
              <div className="flex items-center gap-2 text-indigo-900 font-black text-sm uppercase tracking-wider mb-2">
                <AlertCircle size={16} /> Results Detected
              </div>
              {results.map((res, index) => (
                <div key={index} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl group hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-lg text-slate-800">{res.condition}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                      res.urgency === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {res.urgency} URGENCY
                    </span>
                  </div>
                  <div className="flex items-end gap-4 mb-4">
                     <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${res.probability * 100}%` }}
                          className="bg-indigo-600 h-full"
                        />
                     </div>
                     <span className="text-xs font-black text-indigo-600">{(res.probability * 100).toFixed(0)}% Match</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-4">
                    &quot;{res.recommendation}&quot;
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
