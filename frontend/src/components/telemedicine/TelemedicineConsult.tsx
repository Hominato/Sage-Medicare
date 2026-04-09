"use client";
import React, { useState } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, MessageSquare, PlusCircle, Shield, Activity } from 'lucide-react';

export default function TelemedicineConsult() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [inCall, setInCall] = useState(false);

  const toggleCall = () => setInCall(!inCall);

  if (!inCall) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center gap-6 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="bg-white/10 p-5 rounded-full backdrop-blur-md mb-4 ring-8 ring-white/5">
           <Video size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Virtual Patient Care</h2>
        <p className="text-indigo-100 max-w-sm font-medium leading-relaxed">
          High-definition, HIPAA-compliant video consultations for remote patient assessment and follow-ups.
        </p>
        <button 
          onClick={toggleCall}
          className="mt-4 bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-5 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
        >
          Initiate Consultation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-slate-800">
      {/* Video Feed Mock */}
      <div className="aspect-video bg-gradient-to-tr from-slate-800 to-indigo-900 relative">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img 
           src="https://images.unsplash.com/photo-1576091160550-217359f42f8c?q=80&w=2070&auto=format&fit=crop" 
           alt="Patient" 
           className="w-full h-full object-cover opacity-60 grayscale-[0.3]"
         />
         <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest border border-white/10">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            Live Consult: Patient Sarah Jones
         </div>

         {/* Dr Preview */}
         <div className="absolute bottom-24 right-8 w-48 aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop" 
              alt="Doctor" 
              className="w-full h-full object-cover grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
         </div>

         {/* Control Bar */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-2xl px-8 py-5 rounded-3xl border border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button className="bg-white/10 text-white hover:bg-white/20 p-4 rounded-xl">
               <MessageSquare size={24} />
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 p-4 rounded-xl">
               <PlusCircle size={24} />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button 
              onClick={toggleCall}
              className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-rose-900/40 flex items-center gap-2 group transition-all"
            >
              <Phone size={20} className="rotate-[135deg]" />
              End Consultation
            </button>
         </div>

         {/* Vitals Sidebar Concept */}
         <div className="absolute top-8 right-8 flex flex-col gap-3">
             <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/20 px-4 py-4 rounded-2xl flex flex-col items-center">
                <Shield className="text-emerald-400 mb-1" size={16} />
                <span className="text-[10px] font-black text-emerald-400 uppercase">Secure</span>
             </div>
             <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col justify-center gap-1 min-w-[120px]">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase">
                   <Activity size={12} /> Heart Rate
                </div>
                <div className="text-2xl font-black text-white">78<span className="text-[10px] ml-1 text-slate-400">bpm</span></div>
             </div>
         </div>
      </div>
    </div>
  );
}
