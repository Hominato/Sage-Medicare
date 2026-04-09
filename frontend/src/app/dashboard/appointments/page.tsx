"use client";
import { useEffect, useState } from 'react';
import { CalendarPlus, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const { callApi, loading } = useHMSApi();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await callApi('/appointments');
        setAppointments(data);
      } catch (err) {
        // Error handled by useHMSApi
      }
    };
    fetchAppointments();
  }, []);


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-dash-navy tracking-tight">Appointments</h2>
        <button className="bg-dash-primary hover:bg-dash-secondary text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
          <CalendarPlus size={20} />
          New Appointment
        </button>
      </div>

      <div className="grid gap-4 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-dash-primary" size={40} />
          </div>
        )}
        
        {appointments.length === 0 && !loading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 font-medium">
             No appointments scheduled.
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group">
               <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {appt.patient?.patient?.firstName} {appt.patient?.patient?.lastName}
                  </h3>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Clock size={16} /> {new Date(appt.date).toLocaleDateString()} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with Dr. {appt.doctor?.staffProfile?.firstName} {appt.doctor?.staffProfile?.lastName}
                  </p>
               </div>
               <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${appt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {appt.status === 'COMPLETED' && <CheckCircle size={14} className="mr-1" />}
                    {appt.status}
                  </span>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
