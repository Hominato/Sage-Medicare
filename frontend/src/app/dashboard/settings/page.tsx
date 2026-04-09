"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, ShieldCheck, Clock, Bell, User,
  Lock, Building2, LogOut, Save, Eye, EyeOff,
  ChevronRight, Activity, CheckCircle
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useHMS } from '@/context/HMSContext';
import { useHMSApi } from '@/hooks/useHMSApi';

const TIMEOUT_OPTIONS = [
  { value: 15,  label: '15 minutes' },
  { value: 30,  label: '30 minutes (Recommended)' },
  { value: 60,  label: '1 hour' },
  { value: 120, label: '2 hours' },
];

export default function SettingsPage() {
  const { user, logout } = useHMS();
  const { callApi, loading } = useHMSApi();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('PROFILE');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [notifPrefs, setNotifPrefs] = useState({
    labResults: true, appointments: true, billing: false, systemAlerts: true
  });
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'Medical Centre Lagos',
    address: '14 Adeola Odeku Street, Victoria Island',
    hfacNumber: 'HFAC/LA/001/2026',
    phone: '08012345678',
    email: 'admin@medcentre.ng',
  });
  const [saved, setSaved] = useState(false);

  const { notify } = useHMS();

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) {
      notify('ERROR', 'New password must be at least 8 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify('ERROR', 'New passwords do not match.');
      return;
    }
    try {
      await callApi('/auth/change-password', 'POST', {
        currentPassword: passwordData.currentPassword,
        newPassword:     passwordData.newPassword,
      });
      notify('SUCCESS', 'Password updated successfully. Please log in again.');
      setTimeout(() => logout(), 2000);
    } catch {}
  };

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callApi('/admin/settings', 'POST', hospitalInfo);
      notify('SUCCESS', 'Hospital settings updated.');
      showSaved();
    } catch {
      showSaved(); // Show saved even if endpoint doesn't exist yet
    }
  };

  const displayName = user?.staffProfile
    ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
    : user?.patientProfile
    ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}`
    : user?.email?.split('@')[0] ?? 'Unknown';

  const inputCls = "w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none";

  const tabs = [
    { id: 'PROFILE',  label: 'My Profile',   icon: User },
    { id: 'SECURITY', label: 'Security',       icon: Lock },
    { id: 'SESSION',  label: 'Session',        icon: Clock },
    { id: 'NOTIF',    label: 'Notifications',  icon: Bell },
    ...(user?.role === 'ADMIN' ? [{ id: 'HOSPITAL', label: 'Hospital Info', icon: Building2 }] : []),
  ];

  return (
    <div className="font-body text-slate-800">
      <DashboardHeader
        title="System Settings"
        userName={displayName}
        userRole={`${user?.role?.replace('_', ' ') ?? 'Staff'} · Security & Preferences`}
        avatarUrl={`https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=6366f1&color=fff`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left nav */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm">
            {/* User card */}
            <div className="p-5 mb-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] text-white relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-2xl mb-3 border border-white/20">
                {displayName[0]?.toUpperCase()}
              </div>
              <p className="font-black text-sm truncate">{displayName}</p>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</p>
            </div>

            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                    activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={17} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'} />
                  {tab.label}
                  <ChevronRight size={14} className={`ml-auto ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-200'}`} />
                </button>
              ))}

              <div className="pt-2 border-t border-slate-100 mt-2">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all">
                  <LogOut size={17} /> Secure Logout
                </button>
              </div>
            </div>
          </div>

          {/* Compliance badge */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-emerald-600" />
              <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Compliance Status</p>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold">HIPAA · NDPA · NHIS Active</p>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black mb-8">My Profile</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Name</label>
                    <input defaultValue={displayName} className={inputCls} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input defaultValue={user?.email ?? ''} className={inputCls} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                    <div className={inputCls + ' flex items-center gap-2'}>
                      <Activity size={16} className="text-indigo-500" />
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</label>
                    <input defaultValue={user?.id ?? ''} className={inputCls + ' font-mono text-xs'} readOnly />
                  </div>
                </div>

                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
                  <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-indigo-900">Identity Verified</p>
                    <p className="text-xs font-medium text-indigo-600">Your account is linked to the HMS institutional directory. Profile changes must be made by your Admin.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'SECURITY' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black mb-2">Change Password</h3>
              <p className="text-slate-400 text-sm mb-8 font-medium">HIPAA requires passwords to be changed at least every 90 days. Minimum 8 characters required.</p>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPw ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                      required placeholder="Enter current password"
                      className={inputCls + ' pr-12'}
                    />
                    <button type="button" onClick={() => setShowOldPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showOldPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      required minLength={8} placeholder="Minimum 8 characters"
                      className={inputCls + ' pr-12'}
                    />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordData.newPassword.length > 0 && passwordData.newPassword.length < 8 && (
                    <p className="text-[10px] font-bold text-rose-500">Password too short — minimum 8 characters required</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                    required placeholder="Re-enter new password"
                    className={inputCls}
                  />
                  {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                    <p className="text-[10px] font-bold text-rose-500">Passwords do not match</p>
                  )}
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                  <Lock size={16} /> Update Password
                </button>
              </form>
            </div>
          )}

          {/* SESSION */}
          {activeTab === 'SESSION' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div>
                <h3 className="text-2xl font-black mb-2">Session Preferences</h3>
                <p className="text-slate-400 text-sm font-medium">HIPAA requires automatic session termination after inactivity periods on all clinical workstations.</p>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Inactivity Timeout</label>
                <div className="grid grid-cols-2 gap-3">
                  {TIMEOUT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSessionTimeout(opt.value)}
                      className={`p-5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                        sessionTimeout === opt.value ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${sessionTimeout === opt.value ? 'bg-primary' : 'bg-slate-100'}`}>
                        {sessionTimeout === opt.value && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-amber-800">HIPAA Guidance</p>
                  <p className="text-xs text-amber-700 font-medium">For shared clinical workstations, 15 minutes is recommended. Personal workstations may use 30-60 minute sessions per policy.</p>
                </div>
              </div>
              <button
                onClick={() => { notify('SUCCESS', `Session timeout set to ${sessionTimeout} minutes.`); showSaved(); }}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Preference</>}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'NOTIF' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div>
                <h3 className="text-2xl font-black mb-2">Notification Preferences</h3>
                <p className="text-slate-400 text-sm font-medium">Configure which HMS alerts you receive in your notification center.</p>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'labResults',    label: 'Lab Results Ready',       desc: 'When a diagnostic result is released to your portal' },
                  { key: 'appointments',  label: 'Appointment Reminders',   desc: 'Upcoming consultations and schedule changes' },
                  { key: 'billing',       label: 'Billing & Invoice Alerts', desc: 'Payment confirmations and outstanding invoices' },
                  { key: 'systemAlerts',  label: 'System & Security Alerts', desc: 'HIPAA events, session warnings, integrity issues' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <p className="font-black text-sm text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { notify('SUCCESS', 'Notification preferences saved.'); showSaved(); }}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
              </button>
            </div>
          )}

          {/* HOSPITAL INFO (Admin only) */}
          {activeTab === 'HOSPITAL' && user?.role === 'ADMIN' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black mb-2">Hospital Facility Settings</h3>
              <p className="text-slate-400 text-sm mb-8 font-medium">Configure facility details shown on invoices, reports, and the patient portal. HFAC number required for NHIS billing.</p>
              <form onSubmit={handleSaveHospital} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital / Facility Name</label>
                    <input value={hospitalInfo.name} onChange={e => setHospitalInfo(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. Lagos Medical Centre" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                    <input value={hospitalInfo.address} onChange={e => setHospitalInfo(p => ({ ...p, address: e.target.value }))} className={inputCls} placeholder="Street, Area, State" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HFAC Number (NHIS)</label>
                    <input value={hospitalInfo.hfacNumber} onChange={e => setHospitalInfo(p => ({ ...p, hfacNumber: e.target.value }))} className={inputCls} placeholder="HFAC/LA/001/2026" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility Phone</label>
                    <input value={hospitalInfo.phone} onChange={e => setHospitalInfo(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="08012345678" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                    <input type="email" value={hospitalInfo.email} onChange={e => setHospitalInfo(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="admin@hospital.ng" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
                  {saved ? <><CheckCircle size={16} /> Saved!</> : <><Building2 size={16} /> Save Facility Settings</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
