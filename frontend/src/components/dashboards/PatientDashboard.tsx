"use client";
import { useState, useEffect, useContext } from 'react';
import { 
  Calendar, Clock, CreditCard, FileText, 
  Activity, Pill, X, Check, Loader2, 
  Plus, ChevronRight, AlertCircle, Info,
  MapPin, Stethoscope, ArrowRight, User,
  HeartPulse, Thermometer
} from 'lucide-react';
import DashboardHeader from '../layout/DashboardHeader';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientDashboard() {
  const { callApi, loading } = useHMSApi();
  const { user, notify } = useHMS();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '' });

  useEffect(() => {
    if (user?.id) {
       fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [appts, meds, bills, vit, labs, docs] = await Promise.all([
        callApi('/appointments', 'GET'),
        callApi(`/pharmacy/patient/${user?.id}`, 'GET'),
        callApi(`/admin/invoices/patient/${user?.id}`, 'GET'),
        callApi(`/records/vitals/patient/${user?.id}`, 'GET'),
        callApi(`/lab/patient/${user?.id}`, 'GET'),
        callApi('/appointments/doctors', 'GET')
      ]);
      setAppointments(appts || []);
      setPrescriptions(meds || []);
      setInvoices(bills || []);
      setVitals(vit || []);
      setLabResults(labs || []);
      setDoctors(docs || []);
    } catch (err) {
      console.error('Failed to fetch patient data', err);
    }
  };

  const handleBookAppointment = async () => {
    if (!bookingData.doctorId || !bookingData.date) {
      notify('ERROR', 'Please select a doctor and date.');
      return;
    }
    try {
      await callApi('/appointments', 'POST', {
        patientId: user?.id,
        doctorId: bookingData.doctorId,
        date: bookingData.date
      });
      notify('SUCCESS', 'Appointment booked successfully!');
      setShowBookingModal(false);
      fetchData();
    } catch (err) {}
  };

  const handlePayInvoice = async (id: string) => {
    try {
      await callApi(`/admin/invoices/${id}/pay`, 'PATCH');
      notify('SUCCESS', 'Payment processed successfully!');
      fetchData();
    } catch (err) {}
  };

  const nextAppointment = appointments.find(a => a.status === 'SCHEDULED');
  const pendingBills = invoices.filter(i => i.status === 'UNPAID');
  const latestVitals = vitals[0];

  return (
    <div className="font-body bg-[#fcfcfd] min-h-screen">
      <DashboardHeader 
        title="MedCare Portal" 
        userName={`${user?.patientProfile?.firstName || user?.staffProfile?.firstName || 'Patient'} ${user?.patientProfile?.lastName || user?.staffProfile?.lastName || ''}`} 
        userRole="Patient Portal — NHIS Verified"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.patientProfile?.firstName || user?.staffProfile?.firstName || 'P'}+${user?.patientProfile?.lastName || user?.staffProfile?.lastName || ''}&background=6366f1&color=fff`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Quick Tabs */}
        <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-slate-100 w-fit">
          {['overview', 'records', 'billing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-[1.2rem] text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-8">
               {/* Welcome Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl"
               >
                  <div className="absolute right-0 top-0 p-10 opacity-10"><Activity size={180} /></div>
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black italic mb-2 tracking-tight">Your Health, Optimized.</h2>
                    <p className="text-white/80 font-medium text-lg max-w-lg mb-8 leading-relaxed">
                      All your clinical data, appointments, and prescriptions in one secure terminal.
                    </p>
                    <button 
                      onClick={() => setShowBookingModal(true)}
                      className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
                    >
                      <Plus size={20} /> New Appointment
                    </button>
                  </div>
               </motion.div>

               {/* Upcoming Appointment */}
               <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <Calendar className="text-indigo-600" /> Next Visit
                    </h3>
                  </div>
                  {nextAppointment ? (
                    <div className="flex items-center gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <div className="w-20 h-20 bg-indigo-100 rounded-[1.5rem] flex flex-col items-center justify-center text-indigo-600">
                        <span className="text-xs font-black uppercase">{new Date(nextAppointment.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black">{new Date(nextAppointment.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-slate-900">Dr. {nextAppointment.doctor?.staffProfile?.firstName} {nextAppointment.doctor?.staffProfile?.lastName}</h4>
                        <p className="text-indigo-600 font-bold text-sm">{nextAppointment.doctor?.staffProfile?.specialization || 'Attending Physician'}</p>
                        <div className="flex items-center gap-4 mt-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><Clock size={14} /> {new Date(nextAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1"><MapPin size={14} /> Main Clinical Wing</span>
                        </div>
                      </div>
                      <button className="p-4 bg-white rounded-2xl text-slate-300 hover:text-indigo-600 transition-colors shadow-sm">
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 italic text-slate-400 font-bold">No upcoming appointments scheduled</div>
                  )}
               </div>

               {/* Recent Vitals — ✅ Fixed: each uses the correct icon */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Blood Pressure', value: latestVitals?.bloodPressure ?? '--', Icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Heart Rate',     value: latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : '--', Icon: HeartPulse, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Temperature',    value: latestVitals?.temperature ? `${latestVitals.temperature}°C` : '--', Icon: Thermometer, color: 'text-amber-500', bg: 'bg-amber-50' },
                  ].map(({ label, value, Icon, color, bg }) => (
                    <div key={label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                        <Icon className={color} size={22} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
               {/* Financial Quick View */}
               <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={80} /></div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Financial State</h4>
                  <p className="text-4xl font-black mb-10 tracking-tighter">₦{pendingBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString()}</p>
                  
                  {pendingBills.length > 0 ? (
                    <div className="space-y-4">
                      {pendingBills.slice(0, 2).map((bill) => (
                        <div key={bill.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-white/60 truncate w-32">{bill.description}</p>
                            <p className="font-black text-sm">₦{bill.amount.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => handlePayInvoice(bill.id)}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all"
                          >
                            Pay
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <Check size={16} /> Account in Good Standing
                    </p>
                  )}
               </div>

               {/* Recent Prescriptions */}
               <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Pill className="text-indigo-600" /> Active Meds
                  </h3>
                  <div className="space-y-6">
                    {prescriptions.length > 0 ? prescriptions.slice(0, 3).map((presc) => (
                      <div key={presc.id} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                          <Pill size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 truncate text-sm">{presc.drug?.name}</p>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">{presc.dosage}</p>
                        </div>
                        <Info size={16} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 font-bold italic">No active prescriptions</p>
                    )}
                  </div>
                  <button onClick={() => setActiveTab('records')} className="w-full mt-10 py-4 bg-slate-50 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-colors">
                    View Registry
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Activity className="text-indigo-600" /> Clinical History
                  </h3>
                  <div className="space-y-4">
                    {vitals.map((v) => (
                      <div key={v.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</p>
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">Verified</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">BP</p>
                              <p className="font-black text-indigo-900">{v.bloodPressure}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Temp</p>
                              <p className="font-black text-indigo-900">{v.temperature}°C</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">HR</p>
                              <p className="font-black text-indigo-900">{v.heartRate}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <FileText className="text-indigo-600" /> Lab & Imaging
                  </h3>
                  <div className="space-y-4">
                    {labResults.map((lab) => (
                      <div key={lab.id} className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 text-sm">{lab.testType}</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase">{new Date(lab.createdAt).toDateString()}</p>
                        </div>
                        {lab.status === 'COMPLETED' ? (
                          <div className="text-right">
                             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Released</span>
                             <p className="text-[10px] font-bold text-indigo-600 mt-1">Review</p>
                          </div>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic">Processing</span>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-10">Ledger & Invoices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="pb-6">Description</th>
                      <th className="pb-6">Date</th>
                      <th className="pb-6">Amount</th>
                      <th className="pb-6">Status</th>
                      <th className="pb-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="group">
                        <td className="py-6 font-black text-slate-900 text-sm">{inv.description}</td>
                        <td className="py-6 text-slate-400 text-sm font-medium">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="py-6 font-black text-slate-900 text-sm">₦{inv.amount.toLocaleString()}</td>
                        <td className="py-6">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                             inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'
                           }`}>
                             {inv.status}
                           </span>
                        </td>
                        <td className="py-6 text-right">
                           {inv.status === 'UNPAID' && (
                             <button 
                               onClick={() => handlePayInvoice(inv.id)}
                               className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-110 transition-all"
                             >
                               Pay Now
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute right-0 top-0 p-8"><Calendar size={120} className="text-indigo-50 opacity-20" /></div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight italic mb-2">Book a Session</h2>
              <p className="text-slate-400 text-sm font-medium mb-10">Select your specialist and preferred clinic date.</p>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Doctor</label>
                    <select 
                      value={bookingData.doctorId}
                      onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none"
                    >
                      <option value="">Choose physician...</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.staffProfile?.firstName} {d.staffProfile?.lastName} - {d.staffProfile?.specialization}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Preferred Date</label>
                    <input 
                      type="datetime-local"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none" 
                    />
                 </div>
              </div>

              <div className="flex gap-4 mt-12">
                 <button onClick={() => setShowBookingModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Cancel</button>
                 <button onClick={handleBookAppointment} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 hover:scale-105 transition-all">Confirm Booking</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
