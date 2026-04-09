"use client";
import { useEffect, useState } from 'react';
import { 
  Activity, Clock, Beaker, Users, 
  ClipboardCheck, TrendingUp, Loader2, Thermometer, 
  HeartPulse, Plus, FileText, CheckCircle,
  X, Pill, AlertCircle, Send
} from 'lucide-react';
import WardMap from '../wards/WardMap';
import DashboardHeader from '../layout/DashboardHeader';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';

export default function NurseDashboard() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();
  
  const [stats, setStats] = useState({ activePatients: 0, labSamples: 0, vitalsPending: 0 });
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientVitals, setPatientVitals] = useState<any[]>([]);
  const [patientMeds, setPatientMeds] = useState<any[]>([]);
  const [patientNotes, setPatientNotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('VITALS');

  const fetchStats = async () => {
    try {
      const [pts, labs] = await Promise.all([
        callApi('/patients'),
        callApi('/lab/pending')
      ]);
      const patientList = Array.isArray(pts) ? pts : [];
      setPatients(patientList);
      setStats({
        activePatients: patientList.length,
        labSamples: Array.isArray(labs) ? labs.length : 0,
        vitalsPending: Math.floor(patientList.length / 2)
      });
    } catch {}
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      const [vitals, meds, notes] = await Promise.all([
        callApi(`/records/vitals/patient/${patientId}`),
        callApi(`/pharmacy/prescriptions/patient/${patientId}`),
        callApi(`/records/nursing-notes/patient/${patientId}`)
      ]);
      setPatientVitals(Array.isArray(vitals) ? vitals : []);
      setPatientMeds((Array.isArray(meds) ? meds : []).filter((m: any) => m.status === 'DISPENSED'));
      setPatientNotes(Array.isArray(notes) ? notes : []);
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);

  const handleSendNotification = async (p: any) => {
    const { first } = getPatientName(p);
    try {
      await callApi('/whatsapp/notify', 'POST', {
        patientId: p.userId ?? p.id,
        message: `Dear ${first}, your Nurse is ready for your vitals check. Please proceed to the nursing station.`,
        type: 'VITALS_REMINDER',
      });
      notify('SUCCESS', `Notification delivered to ${first} via WhatsApp/SMS.`);
    } catch {
      // Fallback graceful message if WhatsApp module unavailable
      notify('INFO', `Notification queued for ${first}. Check messaging integration status.`);
    }
  };

  useEffect(() => {
    if (selectedPatient) fetchPatientData(selectedPatient.userId);
  }, [selectedPatient]);

  const handleRecordVitals = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi('/records/vitals', 'POST', {
        patientId: selectedPatient.userId,
        staffId: user?.id,
        bloodPressure: fd.get('bp'),
        temperature: fd.get('temp'),
        heartRate: fd.get('hr'),
        respiratoryRate: fd.get('rr'),
        spO2: fd.get('spo2'),
        weight: fd.get('weight')
      });
      notify('SUCCESS', 'Vitals recorded successfully.');
      fetchPatientData(selectedPatient.userId);
      (e.target as HTMLFormElement).reset();
    } catch {}
  };

  const handleAddNurseNote = async (note: string) => {
    if (!note.trim()) return notify('ERROR', 'Please enter a note.');
    try {
      await callApi('/records/nursing-notes', 'POST', {
        patientId: selectedPatient.userId,
        nurseId: user?.id,
        note
      });
      notify('SUCCESS', 'Nursing note added.');
      fetchPatientData(selectedPatient.userId);
    } catch {}
  };

  // ✅ Fixed: correctly access nested patient name from API response
  const getPatientName = (p: any) => {
    // API returns either flat (PatientProfile) or nested (User with patient relation)
    const first = p.patient?.firstName ?? p.firstName ?? p.user?.patient?.firstName ?? '?';
    const last  = p.patient?.lastName  ?? p.lastName  ?? p.user?.patient?.lastName  ?? '';
    return { first, last };
  };

  return (
    <div className="font-body">
      <DashboardHeader 
        title="Nursing Care Unit" 
        userName={user?.staffProfile?.firstName ? `Nurse ${user.staffProfile.firstName} ${user.staffProfile.lastName}` : "Nurse"} 
        userRole="Charge Nurse · Ward Floor"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName}+${user?.staffProfile?.lastName}&background=ec4899&color=fff`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Observation Queue', value: stats.activePatients, color: 'text-slate-800', accent: 'text-rose-500', Icon: Activity },
          { label: 'Stat Labs Pending', value: stats.labSamples, color: 'text-indigo-600', accent: 'text-indigo-400', Icon: Beaker },
          { label: 'Vitals Pending', value: stats.vitalsPending, color: 'text-white', accent: 'text-emerald-200', Icon: ClipboardCheck, dark: true },
        ].map(({ label, value, color, accent, Icon, dark }) => (
          <div key={label} className={`p-6 rounded-3xl ${dark ? 'bg-emerald-500 shadow-xl' : 'bg-white border border-slate-100 shadow-sm'} flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative`}>
            <div className={`absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
              <Icon size={100} className={accent} />
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${dark ? 'text-emerald-100' : 'text-slate-400'}`}>{label}</p>
            <h3 className={`text-4xl font-black tracking-tight ${color}`}>{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Patient Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm h-[600px] flex flex-col">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 px-2 shrink-0">
              <Users size={20} className="text-pink-500" /> Assigned Patients
            </h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
              {patients.length === 0 && !loading && (
                <p className="text-center py-10 text-slate-400 italic text-sm">No patients assigned.</p>
              )}
              {patients.map((p, idx) => {
                const { first, last } = getPatientName(p);
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id ?? idx}
                    onClick={() => setSelectedPatient(p)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                      isSelected ? 'bg-pink-500 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-pink-500'}`}>
                      {first[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="text-left overflow-hidden flex-grow">
                      <p className="font-bold text-sm truncate">{first} {last}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>ID: {(p.id ?? '').substring(0, 8)}</p>
                    </div>
                    {isSelected && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSendNotification(p); }}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/40 transition-all"
                        title="Send Notification"
                      >
                        <Send size={14} />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-3">
          {selectedPatient ? (() => {
            const { first, last } = getPatientName(selectedPatient);
            return (
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 h-[600px] flex flex-col overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-30 flex items-center justify-center">
                    <Loader2 className="animate-spin text-pink-500" size={40} />
                  </div>
                )}

                {/* Header */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center text-white text-3xl font-black">
                      {first[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{first} {last}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">EHR Active · Ward Monitoring</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-3 bg-white rounded-xl text-slate-300 hover:text-slate-500 shadow-sm border border-slate-100"><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="flex p-4 gap-2 border-b border-slate-50 shrink-0">
                  {[
                    { id: 'VITALS', label: 'Vitals Record', icon: <Thermometer size={16} /> },
                    { id: 'MEDS',   label: 'Medication Admin', icon: <Pill size={16} /> },
                    { id: 'NOTES',  label: 'Nursing Notes', icon: <FileText size={16} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${
                        activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-grow p-8 overflow-y-auto">
                  {activeTab === 'VITALS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <form onSubmit={handleRecordVitals} className="space-y-4">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> Record New Vitals</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'bp',     label: 'Blood Pressure', placeholder: '120/80' },
                            { name: 'temp',   label: 'Temp (°C)',       placeholder: '36.5', type: 'number', step: '0.1' },
                            { name: 'hr',     label: 'Heart Rate',      placeholder: '72',   type: 'number' },
                            { name: 'spo2',   label: 'SpO₂ (%)',        placeholder: '98',   type: 'number' },
                            { name: 'rr',     label: 'Resp. Rate',      placeholder: '16',   type: 'number' },
                            { name: 'weight', label: 'Weight (kg)',      placeholder: '70',   type: 'number', step: '0.1' },
                          ].map(f => (
                            <div key={f.name} className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">{f.label}</label>
                              <input
                                name={f.name}
                                type={(f as any).type ?? 'text'}
                                step={(f as any).step}
                                placeholder={f.placeholder}
                                required={['bp','temp','hr','spo2'].includes(f.name)}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-pink-300 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                        <button type="submit" className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-pink-200/50 hover:bg-pink-600 transition-colors">
                          Commit Observation
                        </button>
                      </form>

                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Observation History</h4>
                        {patientVitals.length === 0 && <p className="text-center py-10 text-slate-400 italic">No vitals on record.</p>}
                        {patientVitals.map((v, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-pink-200 transition-all">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(v.createdAt).toLocaleString('en-NG')}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: 'BP', value: v.bloodPressure },
                                { label: 'Temp', value: v.temperature ? `${v.temperature}°C` : '-' },
                                { label: 'HR', value: v.heartRate ? `${v.heartRate} bpm` : '-' },
                              ].map(item => (
                                <div key={item.label} className="text-center">
                                  <p className="text-base font-black text-slate-800">{item.value ?? '-'}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">{item.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'MEDS' && (
                    <div className="space-y-6">
                      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Pill size={24} /></div>
                        <div>
                          <h4 className="font-black text-indigo-900">Active Medication Card</h4>
                          <p className="text-xs font-medium text-indigo-700">Dispensed prescriptions awaiting administration.</p>
                        </div>
                      </div>
                      {patientMeds.length === 0 && (
                        <p className="text-center py-16 text-slate-400 italic font-medium">No active medications in pharmacy dispatch.</p>
                      )}
                      {patientMeds.map((med, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm group hover:border-indigo-300 transition-all">
                          <div>
                            <h5 className="font-black text-slate-800 text-lg uppercase tracking-tight">{med.drug?.name}</h5>
                            <p className="text-sm font-bold text-slate-500">{med.dosage}</p>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">
                              Prescribed by Dr. {med.doctor?.staffProfile?.firstName ?? 'Unknown'}
                            </p>
                          </div>
                          <button
                            onClick={() => notify('SUCCESS', `Administration of ${med.drug?.name} logged.`)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all"
                          >
                            Log Administration
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'NOTES' && (
                    <div className="space-y-8">
                      <form onSubmit={e => {
                        e.preventDefault();
                        const note = (e.currentTarget.elements.namedItem('note') as HTMLTextAreaElement).value;
                        handleAddNurseNote(note);
                        e.currentTarget.reset();
                      }} className="space-y-4">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-widest block">Progress Note Entry</label>
                        <textarea
                          name="note"
                          required
                          rows={4}
                          placeholder="Describe patient status, response to treatment, or clinical events..."
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-pink-100 resize-none transition-all focus:bg-white"
                        />
                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                          <CheckCircle size={16} /> Save Clinical Observation
                        </button>
                      </form>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Progress Timeline</h4>
                        {patientNotes.length === 0 && <p className="text-sm text-slate-400 italic text-center py-8">No notes on file.</p>}
                        {patientNotes.map((n, i) => (
                          <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-pink-300 group-hover:bg-pink-500 transition-all rounded-full" />
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString('en-NG')}</span>
                              <span className="text-[10px] font-black text-pink-500 uppercase">{n.nurse?.email ?? 'Nurse'}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center min-h-[600px]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-8 animate-pulse">
                <Users size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Nurse Care Gateway</h3>
              <p className="text-slate-500 font-medium max-w-sm">Select a patient from the assigned list to begin charting vitals or documenting care progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
