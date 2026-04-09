"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';
import { 
  Users, Ticket, Search, PlusCircle, ArrowUpRight, 
  Banknote, History, MessageSquare, Clock, MoreVertical, 
  ChevronRight, TrendingUp, CreditCard, CheckCircle, 
  Loader2, Calendar, LayoutDashboard, RefreshCw
} from 'lucide-react';
import DashboardHeader from '../layout/DashboardHeader';

export default function ClerkDashboard() {
  const router = useRouter();
  const { callApi, loading } = useHMSApi();
  const { notify, user } = useHMS();
  
  const [stats, setStats] = useState({
    patients: 0,
    queue: 0,
    revenue: 0,
    appointments: 0
  });
  
  const [tokens, setTokens] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [pts, tkns, appts, analytics] = await Promise.all([
        callApi('/patients'),
        callApi('/queue/recent'),
        callApi('/appointments'),
        callApi('/admin/analytics')
      ]);
      setTokens(tkns);
      setAppointments(appts.slice(0, 5));
      setStats({
        patients: pts.length,
        queue: tkns.length,
        revenue: analytics.totalRevenue,
        appointments: appts.length
      });
    } catch (err) {}
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleIssueToken = async (dept: string = 'General Practice') => {
    try {
      await callApi('/queue/token/issue', 'POST', { department: dept });
      notify('SUCCESS', `Token Issued for ${dept}.`);
      fetchDashboardData();
    } catch (e) {}
  };

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader 
        title="Admin Reception" 
        userName={user?.staffProfile?.firstName ? `Clerk ${user.staffProfile.firstName}` : "Sarah Adesanmi"} 
        userRole="Front Desk Coordinator"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName ?? 'C'}+${user?.staffProfile?.lastName ?? 'L'}&background=f97316&color=fff`}
      />

      <div className="p-8 space-y-8">
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
           <div className="space-y-1">
             <h2 className="text-3xl font-black tracking-tight font-headline italic">Front Desk Operations</h2>
             <p className="text-slate-500 font-medium">Lagos Medical Hub • Registry Terminal A</p>
           </div>
           <div className="flex gap-4 w-full lg:w-auto">
             <button 
               onClick={() => router.push('/dashboard/patients/new')}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
             >
               <PlusCircle size={20} />
               Register Patient
             </button>
             <button 
               onClick={() => handleIssueToken()}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-colors"
             >
               <Ticket size={20} />
               New Token
             </button>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Registered', value: stats.patients, icon: <Users />, color: 'text-primary' },
             { label: 'In-Queue', value: stats.queue, icon: <Clock />, color: 'text-indigo-600' },
             { label: 'Collections', value: `₦${stats.revenue.toLocaleString()}`, icon: <Banknote />, color: 'text-emerald-600' },
             { label: 'Booked', value: stats.appointments, icon: <Calendar />, color: 'text-orange-600' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className={`absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform ${stat.color}`}>
                   {stat.icon}
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
             </div>
           ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm relative min-h-[400px]">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[3rem]"><Loader2 className="animate-spin text-primary" size={40} /></div>}
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black flex items-center gap-2"><LayoutDashboard className="text-primary" /> Active Queue Live Feed</h3>
                 <button onClick={fetchDashboardData} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"><RefreshCw size={18} /></button>
              </div>
              <div className="space-y-4">
                 {tokens.map((token, idx) => (
                   <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-primary transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center font-black text-primary shadow-sm border border-slate-100">
                            <span className="text-[8px] opacity-60">TK</span>
                            <span>{token.number}</span>
                         </div>
                         <div>
                            <p className="text-sm font-black">{token.patientName || 'Clinical Walk-in'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{token.department} • {token.status}</p>
                         </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-all" />
                   </div>
                 ))}
                 {tokens.length === 0 && <p className="text-center py-20 text-slate-400 italic">No patients in the active queue.</p>}
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Clock size={100} /></div>
                 <h4 className="text-xl font-black mb-1">Clinic Pulse</h4>
                 <p className="text-indigo-100 text-sm mb-8 font-medium italic">Average wait time is currently <span className="text-white font-black">12 minutes</span>.</p>
                 <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                       <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest"><span>General Practice</span> <span>75%</span></div>
                       <div className="h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{width: '75%'}} /></div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                       <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest"><span>Dental Care</span> <span>20%</span></div>
                       <div className="h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{width: '20%'}} /></div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Recent Bookings</h4>
                 <div className="space-y-4">
                    {appointments.map((app, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs">{app.patientId.substring(0, 2)}</div>
                         <div>
                            <p className="text-xs font-black">{app.patient?.email}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{new Date(app.date).toLocaleDateString()} @ {new Date(app.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
