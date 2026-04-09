"use client";
import { useEffect, useState } from 'react';
import { 
  Copy, Activity, Pill, Clock, Beaker, Users, Calendar, 
  TrendingUp, Loader2, ChevronRight, Search, FileText, 
  CheckCircle, X, Thermometer, HeartPulse, Plus, AlertCircle
} from 'lucide-react';
import AIDiagnosisTool from '../medical/AIDiagnosisTool';
import TelemedicineConsult from '../telemedicine/TelemedicineConsult';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import DashboardHeader from '../layout/DashboardHeader';

// Nigerian standard lab tests
const NIGERIAN_LAB_TESTS = [
  { code: 'FBC',   label: 'Full Blood Count' },
  { code: 'MP',    label: 'Malaria Parasite' },
  { code: 'Widal', label: 'Widal (Typhoid)' },
  { code: 'UA',    label: 'Urinalysis' },
  { code: 'LFT',   label: 'Liver Function Test' },
  { code: 'RFT',   label: 'Renal Function Test' },
  { code: 'HepB',  label: 'Hepatitis B Screen' },
  { code: 'HIV',   label: 'HIV Screening' },
];

export default function DoctorDashboard() {
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS(); // ✅ Single destructure — fixed double useHMS() bug

  const [stats, setStats] = useState({
    patientsToday: 0,
    appointments: 0,
    unreadLabs: 0,
    activeConsults: 0
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [patientLabs, setPatientLabs] = useState<any[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('HISTORY');

  const fetchStats = async () => {
    try {
      const [appts, labs] = await Promise.all([
        callApi('/appointments'),
        callApi('/lab/pending')
      ]);
      setStats({
        patientsToday: appts.length,
        appointments: appts.length,
        unreadLabs: labs.length,
        activeConsults: Math.max(0, Math.floor(appts.length / 3))
      });
    } catch {}
  };

  const fetchPatients = async () => {
    try {
      const data = await callApi('/patients');
      setPatients(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchPatientDetail = async (patientId: string) => {
    try {
      const [records, labs, appts] = await Promise.all([
        callApi(`/records/patient/${patientId}`),
        callApi(`/lab/patient/${patientId}`),
        callApi('/appointments')
      ]);
      setPatientHistory(Array.isArray(records) ? records : []);
      setPatientLabs(Array.isArray(labs) ? labs : []);
      setPatientAppointments((Array.isArray(appts) ? appts : []).filter((a: any) => a.patientId === patientId));
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetail(selectedPatient.userId);
    }
  }, [selectedPatient]);

  const handlePrescribe = async (drugName: string, dosage: string) => {
    if (!selectedPatient) return notify('ERROR', 'Please select a patient first.');
    try {
      await callApi('/pharmacy/prescription', 'POST', {
        patientId: selectedPatient.userId,
        doctorId: user?.id,
        drugId: drugName,
        dosage
      });
      notify('SUCCESS', `Prescription for ${drugName} transmitted to pharmacy.`);
      fetchPatientDetail(selectedPatient.userId);
    } catch {}
  };

  const handleOrderLab = async (testCode: string) => {
    if (!selectedPatient) return notify('ERROR', 'Please select a patient first.');
    try {
      await callApi('/lab/order', 'POST', {
        patientId: selectedPatient.userId,
        doctorId: user?.id,
        testType: testCode,
        priority: 'ROUTINE'
      });
      notify('SUCCESS', `${testCode} diagnostic request dispatched to lab.`);
      fetchPatientDetail(selectedPatient.userId);
    } catch {}
  };

  const handleAddNote = async (diagnosis: string, notes: string) => {
    if (!selectedPatient) return notify('ERROR', 'Please select a patient first.');
    if (!diagnosis.trim() || !notes.trim()) return notify('ERROR', 'Diagnosis and treatment plan are required.');
    try {
      await callApi('/records', 'POST', {
        patientId: selectedPatient.userId,
        doctorId: user?.id,
        diagnosis,
        notesEncrypted: notes
      });
      notify('SUCCESS', 'Clinical note committed to EHR.');
      fetchPatientDetail(selectedPatient.userId);
      setActiveWorkspaceTab('HISTORY');
    } catch {}
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      await callApi(`/appointments/${id}/status`, 'PATCH', { status });
      notify('SUCCESS', `Appointment marked as ${status}.`);
      if (selectedPatient) fetchPatientDetail(selectedPatient.userId);
      fetchStats();
    } catch {}
  };

  const filteredPatients = (Array.isArray(patients) ? patients : []).filter(p =>
    `${p.patient?.firstName ?? p.firstName ?? ''} ${p.patient?.lastName ?? p.lastName ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientName = (p: any) => ({
    first: p.patient?.firstName ?? p.firstName ?? '?',
    last: p.patient?.lastName ?? p.lastName ?? '',
  });

  return (
    <div className="font-body">
      <DashboardHeader 
        title="Clinical Workstation" 
        userName={user?.staffProfile?.firstName ? `Dr. ${user.staffProfile.firstName} ${user.staffProfile.lastName}` : "Doctor"}
        userRole="Physician In-Charge · MDCN Verified"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName}+${user?.staffProfile?.lastName}&background=4f46e5&color=fff`}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Queue Size', value: stats.patientsToday, color: 'text-slate-800', bg: 'bg-white', Icon: Users },
          { label: 'Scheduled', value: stats.appointments, color: 'text-indigo-600', bg: 'bg-white', Icon: Calendar },
          { label: 'Active Consult', value: stats.activeConsults, color: 'text-rose-600', bg: 'bg-white', Icon: Activity },
          { label: 'Pending Labs', value: stats.unreadLabs, color: 'text-white', bg: 'bg-slate-900', Icon: Beaker },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} className={`${bg} p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative`}>
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Icon size={100} />
            </div>
            <p className={`${bg === 'bg-slate-900' ? 'text-slate-500' : 'text-slate-400'} text-[10px] font-bold uppercase tracking-widest mb-1`}>{label}</p>
            <h3 className={`text-4xl font-black tracking-tight ${color}`}>{value}</h3>
            {label === 'Pending Labs' && (
              <button
                onClick={() => setActiveWorkspaceTab('LABS')}
                className="mt-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
              >
                Review <ChevronRight size={10} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient List */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col max-h-[420px]">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 shrink-0">
              <Users size={20} className="text-indigo-600" /> Patient List
            </h3>
            <div className="relative mb-4 shrink-0">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100 focus:border-indigo-200 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
            </div>
            <div className="overflow-y-auto space-y-2 flex-grow pr-1">
              {filteredPatients.length === 0 && !loading && (
                <p className="text-center py-8 text-slate-400 italic text-sm">No patients found.</p>
              )}
              {filteredPatients.map(patient => {
                const { first, last } = getPatientName(patient);
                const isSelected = selectedPatient?.id === patient.id;
                return (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all text-left ${
                      isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-indigo-600'}`}>
                      {first[0]?.toUpperCase()}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="font-bold text-sm truncate">{first} {last}</p>
                      <p className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>ID: {patient.id.substring(0, 8)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel */}
          {selectedPatient && (() => {
            const { first, last } = getPatientName(selectedPatient);
            return (
              <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                <h3 className="text-sm font-black mb-5 flex items-center gap-2 uppercase tracking-widest text-sky-400">
                  <Activity size={16} /> Actions for {first}
                </h3>

                <div className="space-y-5">
                  {/* Quick Note */}
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const fd = new FormData(form);
                    handleAddNote(fd.get('diag') as string, fd.get('notes') as string);
                    form.reset();
                  }} className="space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Clinical Note</p>
                    <input name="diag" required placeholder="Diagnosis" className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs font-bold outline-none placeholder:text-white/30" />
                    <textarea name="notes" required placeholder="Treatment plan..." rows={2} className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs outline-none resize-none placeholder:text-white/30" />
                    <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-colors">Commit Note</button>
                  </form>

                  <div className="h-px bg-white/10" />

                  {/* Lab Orders — Nigerian standard tests */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Lab Orders</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {NIGERIAN_LAB_TESTS.map(test => (
                        <button
                          key={test.code}
                          onClick={() => handleOrderLab(test.code)}
                          title={test.label}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black hover:bg-white/15 transition-all text-center truncate"
                        >
                          + {test.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Prescription */}
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const fd = new FormData(form);
                    handlePrescribe(fd.get('drug') as string, fd.get('dose') as string);
                    form.reset();
                  }} className="space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Prescription</p>
                    <select name="drug" className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-[10px] font-bold outline-none">
                      <option value="Amoxicillin">Amoxicillin</option>
                      <option value="Paracetamol">Paracetamol</option>
                      <option value="Ciprofloxacin">Ciprofloxacin</option>
                      <option value="Artemether-Lumefantrine">Artemether-Lumefantrine</option>
                      <option value="Metronidazole">Metronidazole</option>
                      <option value="Azithromycin">Azithromycin</option>
                      <option value="Ibuprofen">Ibuprofen</option>
                      <option value="Omeprazole">Omeprazole</option>
                      <option value="Lisinopril">Lisinopril</option>
                      <option value="Metformin">Metformin</option>
                    </select>
                    <input name="dose" required placeholder="Dosage e.g. 500mg TDS x 5 days" className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-[10px] outline-none placeholder:text-white/30" />
                    <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-colors">Send to Pharmacy</button>
                  </form>
                </div>
              </div>
            );
          })()}

          <div className="opacity-70 scale-95 origin-top">
            <AIDiagnosisTool />
            <TelemedicineConsult />
          </div>
        </div>

        {/* Central Workspace */}
        <div className="lg:col-span-3">
          {selectedPatient ? (() => {
            const { first, last } = getPatientName(selectedPatient);
            return (
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[700px]">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                      {first[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{first} {last}</h2>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <span className="text-slate-400 font-medium text-xs flex items-center gap-1.5"><Calendar size={12} /> Patient ID: {selectedPatient.id.substring(0,12)}</span>
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5"><CheckCircle size={12} /> EHR Active</span>
                        {selectedPatient.patient?.genotype && (
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">Genotype: {selectedPatient.patient.genotype}</span>
                        )}
                        {selectedPatient.patient?.bloodGroup && (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">Blood Group: {selectedPatient.patient.bloodGroup}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="flex p-4 border-b border-slate-100 gap-2">
                  {[
                    { id: 'HISTORY', label: 'Clinical History', icon: <FileText size={16} /> },
                    { id: 'LABS', label: 'Lab Results', icon: <Beaker size={16} /> },
                    { id: 'APPOINTMENTS', label: 'Appointments', icon: <Calendar size={16} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWorkspaceTab(tab.id)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${
                        activeWorkspaceTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-grow p-8 overflow-y-auto max-h-[600px]">
                  {activeWorkspaceTab === 'HISTORY' && (
                    <div className="space-y-6">
                      {/* Quick vitals strip */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Heart Rate', value: '72 bpm', icon: <HeartPulse size={16} />, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-100' },
                          { label: 'Temperature', value: '36.5 °C', icon: <Thermometer size={16} />, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
                          { label: 'Blood Pressure', value: '120/80', icon: <Activity size={16} />, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
                          { label: 'SpO₂', value: '98%', icon: <TrendingUp size={16} />, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
                        ].map(v => (
                          <div key={v.label} className={`p-4 rounded-2xl border ${v.bg} flex items-center gap-3`}>
                            <span className={v.color}>{v.icon}</span>
                            <div>
                              <p className={`text-lg font-black ${v.color}`}>{v.value}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{v.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical History</h4>
                        {patientHistory.length === 0 && (
                          <p className="text-center py-16 text-slate-400 italic">No historical records on file.</p>
                        )}
                        {patientHistory.map((rec, idx) => (
                          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-full" />
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(rec.createdAt).toLocaleDateString('en-NG')}</span>
                              {rec.isSensitive && <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Sensitive</span>}
                            </div>
                            <h5 className="font-black text-slate-800 text-base">{rec.diagnosis}</h5>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{rec.notesEncrypted}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeWorkspaceTab === 'LABS' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Laboratory Timeline</h4>
                      {patientLabs.length === 0 && <p className="text-center py-16 text-slate-400 italic">No lab orders on record.</p>}
                      {patientLabs.map((lab, i) => (
                        <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Beaker size={20} /></div>
                            <div>
                              <p className="font-black text-slate-800">{lab.testType}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(lab.createdAt).toLocaleDateString('en-NG')}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${lab.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : lab.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                            {lab.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeWorkspaceTab === 'APPOINTMENTS' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Scheduling Overview</h4>
                      {patientAppointments.length === 0 && <p className="text-center py-16 text-slate-400 italic">No appointments found.</p>}
                      {patientAppointments.map((appt, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-6">
                            <div className="p-3 bg-violet-50 rounded-xl text-violet-600"><Calendar size={24} /></div>
                            <div>
                              <p className="font-black text-slate-800 uppercase text-sm">{new Date(appt.date).toLocaleString('en-NG')}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1">
                                Status: <span className={appt.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}>{appt.status}</span>
                              </p>
                            </div>
                          </div>
                          {appt.status !== 'COMPLETED' && (
                            <button onClick={() => handleUpdateAppointmentStatus(appt.id, 'COMPLETED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                              Close Case
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center min-h-[700px]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-8">
                <Users size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Clinical Station Standby</h3>
              <p className="text-slate-500 font-medium max-w-sm">Select a patient from the list to begin a consultation session and review their EHR.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
